import json
import re
from typing import List, Dict
from ..llm import ask_llm
from ..search import web_search
from .state import PipelineState


QUERY_SYSTEM = """You generate web search queries to research a PE/VC fund manager.
Cover these topics with distinct, targeted queries:
- firm overview + headquarters
- AUM and total capital raised
- fund vintages / recent fund closes
- sector and stage thesis
- notable portfolio companies and recent deals
- leadership / key partners
Return STRICT JSON: {"queries": ["...", ...]}. 5 to 7 queries. No prose outside JSON.
Include the firm name verbatim in every query. If a geography or sector hint is given, weave it in."""


FINDINGS_SYSTEM = """You extract source-linked facts about a PE/VC fund manager from web search snippets.
Return STRICT JSON: {"findings": [{"topic": "aum|hq|vintage|sector|stage|portfolio|leadership|other",
"fact": "one short factual sentence", "source_url": "..."}]}
Rules:
- Every fact MUST have a source_url that came from the provided results.
- Do NOT invent facts. If a topic is not supported by the snippets, omit it.
- Prefer specific, dated facts over generic claims.
- 8 to 20 findings total, deduplicated.
No prose outside JSON."""


def _extract_json(text: str) -> dict:
    m = re.search(r"\{.*\}", text, re.S)
    if not m: return {}
    try: return json.loads(m.group(0))
    except Exception: return {}


def generate_queries(firm: str, geography: str, sector: str, stage: str) -> List[str]:
    hints = " ".join(x for x in [geography, sector, stage] if x)
    user = f"FIRM: {firm}\nHINTS: {hints or '(none)'}"
    raw = ask_llm(QUERY_SYSTEM, [{"role": "user", "content": user}],
                  max_tokens=500, temperature=0.4)
    data = _extract_json(raw)
    qs = [q for q in (data.get("queries") or []) if isinstance(q, str)]
    if qs:
        return qs[:7]
    return [
        f"{firm} fund manager overview",
        f"{firm} AUM assets under management",
        f"{firm} recent fund close vintage",
        f"{firm} portfolio companies investments",
        f"{firm} leadership partners team",
        f"{firm} sector thesis focus",
    ]


def run_research(state: PipelineState, emit) -> PipelineState:
    firm = state["firm_name"]
    emit({"type": "phase", "phase": "research",
          "status": f"Generating targeted queries for {firm}…"})
    queries = generate_queries(
        firm, state.get("geography", ""), state.get("sector_focus", ""),
        state.get("stage_focus", ""),
    )
    emit({"type": "queries", "queries": queries})

    all_results: List[Dict] = []
    for q in queries:
        emit({"type": "search", "query": q})
        hits = web_search(q, max_results=4)
        for h in hits: h["source_query"] = q
        all_results.extend(hits)

    emit({"type": "phase", "phase": "research", "status": "Extracting sourced facts…"})
    top = all_results[:24]
    block = "\n".join(
        f"- [{r.get('title','')}] {r.get('url','')} — {r.get('snippet','')[:280]}"
        for r in top
    ) or "(no search results)"
    user = f"FIRM: {firm}\n\nSEARCH RESULTS:\n{block}"
    raw = ask_llm(FINDINGS_SYSTEM, [{"role": "user", "content": user}],
                  max_tokens=1800, temperature=0.2)
    data = _extract_json(raw)
    findings = data.get("findings") or []

    # sanitize
    clean: List[Dict] = []
    for f in findings:
        fact = (f.get("fact") or "").strip()
        url = (f.get("source_url") or "").strip()
        topic = (f.get("topic") or "other").strip().lower()
        if fact and url:
            clean.append({"topic": topic, "fact": fact, "source_url": url})
    findings = clean[:20]
    emit({"type": "findings", "findings": findings})

    state["queries"] = queries
    state["search_results"] = top
    state["findings"] = findings
    return state
