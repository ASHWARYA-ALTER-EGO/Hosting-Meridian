"""Structuring agent — turns sourced findings into strict per-field schema
with confidence flags + an investment_thesis distillation."""
import json
import re
import time
from typing import Dict, Any, Optional
from ..llm import ask_llm
from ..logging_setup import get_logger
from .state import PipelineState

log = get_logger("pipeline.structure")


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
  "investment_thesis": "2 sentences distilling HOW this firm invests (check size, stage cadence, sector conviction, decision style). Not what — how.",
  "what_to_watch": "one-sentence forward-looking note"
}

RULES:
- Only use facts present in the findings; every non-empty field must cite a source URL from the findings.
- If a field is not supported: value="" (or []) and confidence="unknown". NEVER guess.
- confidence="verified" only if two or more findings agree; otherwise "inferred".
- Deduplicate portfolio and leadership entries.
- investment_thesis should be ANALYTICAL, not a summary of facts. Example good: "Peak XV writes $10-50M growth-stage checks with strong AI conviction; makes 15-20 investments per year and prefers founder-led follow-ons." Example bad: "Peak XV invests in India and SEA."
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
    try: num = float(m.group(1))
    except ValueError: return None
    unit = (m.group(2) or "M").upper()
    return num * 1000 if unit == "B" else num * 0.001 if unit == "K" else num


TAKEAWAY_SYSTEM = """You are a private-markets analyst. Given a structured fund-manager profile,
produce EXACTLY 3 sharp analyst observations in Markdown bullet form.

Rules:
- Each bullet is one sentence, under 30 words, with a specific inference (not a fact restate).
- Prefer inferences about check size, sector momentum, portfolio quality, or forward signals.
- If a bullet uses a number, that number MUST appear in the profile (no invention).
- No preamble. Return only the three bullets.

Example GOOD:
- Growth-tilt confirmed: Fund IX at $2.85B is 47% larger than Fund VIII, implying larger checks and later entries.
- AI/SaaS conviction rising: 6 of last 10 portfolio adds are AI-native (Sarvam, Meesho, etc.).
- Watch for a dedicated growth vehicle in H2; leadership hiring pattern hints at it.

Example BAD:
- Peak XV invests in India and SEA. (fact restate, no inference)
- They are a large firm with many investments. (no specificity)"""


def _takeaway(profile: Dict[str, Any], firm_name: str) -> str:
    try:
        raw = ask_llm(
            TAKEAWAY_SYSTEM,
            [{"role": "user", "content": f"FIRM: {firm_name}\n\nPROFILE:\n{json.dumps(profile, default=str)[:5000]}"}],
            max_tokens=300, temperature=0.4,
        )
        return (raw or "").strip()
    except Exception as e:
        log.warning(f"takeaway failed for {firm_name}: {e}")
        return ""


def run_structuring(state: PipelineState, emit) -> PipelineState:
    emit({"type": "phase", "phase": "structure", "status": "Structuring profile…"})
    firm = state["firm_name"]
    t0 = time.time()
    log.info(f"structure start firm={firm!r}")

    findings = state.get("findings", [])
    findings_block = "\n".join(
        f"- [{f['topic']}] {f['fact']}  <src:{f['source_url']}>" for f in findings
    ) or "(no findings)"

    user = f"FIRM: {firm}\n\nFINDINGS:\n{findings_block}"
    raw = ask_llm(STRUCTURE_SYSTEM, [{"role": "user", "content": user}],
                  max_tokens=2200, temperature=0.15)
    data = _extract_json(raw)

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
        "investment_thesis": "",
        "what_to_watch": "",
    }
    for k, v in (data or {}).items():
        if k in profile:
            profile[k] = v

    aum_display = ""
    aum_field = profile.get("aum") or {}
    if isinstance(aum_field, dict):
        aum_display = str(aum_field.get("value") or "")
    profile["_aum_usd_m"] = _parse_aum_usd_m(aum_display)

    # Second small LLM call for the 3-bullet takeaway
    emit({"type": "phase", "phase": "structure", "status": "Generating analyst takeaway…"})
    profile["_takeaway"] = _takeaway(profile, firm)

    state["profile"] = profile
    emit({"type": "profile", "profile": profile})
    log.info(f"structure done  firm={firm!r} elapsed={time.time()-t0:.1f}s")
    return state
