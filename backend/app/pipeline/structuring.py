"""Structuring agent — turns sourced findings into a consistent per-field schema
with per-field confidence + source URL. Replaces the evaluator role from the
generic build-vs-buy pipeline."""
import json
import re
from typing import Dict, Any, Optional
from ..llm import ask_llm
from .state import PipelineState


STRUCTURE_SYSTEM = """You convert sourced findings about a PE/VC fund manager into a strict structured profile.

Return STRICT JSON with exactly this shape:
{
  "firm_name": {"value": "string", "confidence": "verified|inferred|unknown", "source": "url or empty"},
  "headquarters": {"value": "string", "confidence": "...", "source": "url"},
  "geography_focus": {"value": "string", "confidence": "...", "source": "url"},
  "aum": {"value": "string like $1.2B or empty", "confidence": "...", "source": "url"},
  "fund_vintages": {"value": ["2019", "2022", ...], "confidence": "...", "source": "url"},
  "sectors": {"value": ["fintech", "..."], "confidence": "...", "source": "url"},
  "stages": {"value": ["seed", "series-a", ...], "confidence": "...", "source": "url"},
  "notable_portfolio": [{"name": "Company", "note": "one line", "source": "url"}],
  "leadership": [{"name": "Person", "role": "Title", "source": "url"}],
  "recent_activity": [{"item": "one-line event", "date": "YYYY or YYYY-MM or empty", "source": "url"}],
  "what_to_watch": "one-sentence forward-looking note"
}

RULES:
- Only use facts present in the findings; every non-empty field must cite a source URL from the findings.
- If a field is not supported: value="" (or []) and confidence="unknown". NEVER guess.
- confidence="verified" only if two or more findings agree; otherwise "inferred".
- Deduplicate portfolio and leadership entries.
No prose outside JSON."""


def _extract_json(text: str) -> dict:
    m = re.search(r"\{.*\}", text, re.S)
    if not m: return {}
    try: return json.loads(m.group(0))
    except Exception: return {}


def _parse_aum_usd_m(aum_display: str) -> Optional[float]:
    if not aum_display: return None
    s = aum_display.upper().replace(",", "").replace("USD", "").replace("$", "").strip()
    m = re.search(r"([\d.]+)\s*([BMK])?", s)
    if not m: return None
    try:
        num = float(m.group(1))
    except ValueError:
        return None
    unit = (m.group(2) or "M").upper()
    return num * 1000 if unit == "B" else num * 0.001 if unit == "K" else num


def run_structuring(state: PipelineState, emit) -> PipelineState:
    emit({"type": "phase", "phase": "structure", "status": "Structuring profile…"})
    firm = state["firm_name"]
    findings = state.get("findings", [])
    findings_block = "\n".join(
        f"- [{f['topic']}] {f['fact']}  <src:{f['source_url']}>" for f in findings
    ) or "(no findings)"

    user = f"FIRM: {firm}\n\nFINDINGS:\n{findings_block}"
    raw = ask_llm(STRUCTURE_SYSTEM, [{"role": "user", "content": user}],
                  max_tokens=2000, temperature=0.15)
    data = _extract_json(raw)

    # Baseline shape so downstream code never KeyErrors
    def _f(value="", conf="unknown", source=""):
        return {"value": value, "confidence": conf, "source": source}

    profile: Dict[str, Any] = {
        "firm_name": _f(firm, "verified" if firm else "unknown", ""),
        "headquarters": _f(),
        "geography_focus": _f(),
        "aum": _f(),
        "fund_vintages": _f([]),
        "sectors": _f([]),
        "stages": _f([]),
        "notable_portfolio": [],
        "leadership": [],
        "recent_activity": [],
        "what_to_watch": "",
    }
    for k, v in (data or {}).items():
        if k in profile:
            profile[k] = v

    # Derived numeric AUM for sortability
    aum_display = ""
    aum_field = profile.get("aum") or {}
    if isinstance(aum_field, dict):
        aum_display = str(aum_field.get("value") or "")
    profile["_aum_usd_m"] = _parse_aum_usd_m(aum_display)

    state["profile"] = profile
    emit({"type": "profile", "profile": profile})
    return state
