import time
from ..llm import stream_llm
from ..logging_setup import get_logger
from .state import PipelineState

log = get_logger("pipeline.write")


WRITER_SYSTEM = """You write a one-page profile of a PE/VC fund manager for an internal intelligence tracker.

Output ONE clean Markdown document with EXACTLY this structure:

# {Firm name}
*{One-sentence summary — geography, stage, thesis in a line.}*

> **Investment thesis:** {2-sentence distillation of HOW they invest — check size, stage cadence, sector conviction, decision style. Pull from the structured profile.}

## Analyst takeaway
{The three analyst-style bullets from the profile's takeaway field, verbatim. If empty, generate three now under the same rules: one sentence each, specific inference not fact restate, numbers must come from the profile.}

## Fact sheet
| Field | Value | Confidence | Source |
|---|---|---|---|
| Headquarters | ... | verified/inferred/unknown | link |
| Geography focus | ... | ... | link |
| AUM | ... | ... | link |
| Fund vintages | ... | ... | link |
| Sectors | ... | ... | link |
| Stages | ... | ... | link |

## Notable portfolio
- **Company** — note. ([source](url))

## Leadership
- **Name**, Role. ([source](url))

## Recent activity
- YYYY(-MM) — item. ([source](url))

## What to watch
One forward-looking sentence.

RULES:
- Use ONLY the values in the structured profile; never invent facts.
- If a field is unknown, write "-" and confidence "unknown"; do not fabricate a source.
- Analyst takeaway bullets must be SHARP INFERENCES, not fact restates.
- Keep it tight; every source link must come from the profile."""


def _build_user(state: PipelineState) -> str:
    import json as _j
    profile = state.get("profile", {})
    return f"FIRM: {state['firm_name']}\n\nSTRUCTURED_PROFILE:\n{_j.dumps(profile, indent=2)[:7000]}"


def run_writer(state: PipelineState, emit) -> PipelineState:
    emit({"type": "phase", "phase": "write", "status": "Writing profile…"})
    t0 = time.time()
    firm = state.get("firm_name","?")
    log.info(f"write start     firm={firm!r}")
    parts = []
    for chunk in stream_llm(WRITER_SYSTEM, [{"role": "user", "content": _build_user(state)}],
                            max_tokens=2800, temperature=0.35):
        parts.append(chunk)
        emit({"type": "report_chunk", "content": chunk})
    md = "".join(parts).strip()

    summary = ""
    for line in md.splitlines():
        s = line.strip().lstrip("*_ ").rstrip("*_ ")
        if s and not s.startswith("#") and not s.startswith("|") and not s.startswith(">"):
            summary = s; break

    state["profile_md"] = md
    state["summary"] = summary[:1024]
    emit({"type": "report_done", "profile_md": md, "summary": summary})
    log.info(f"write done      firm={firm!r} chars={len(md)} elapsed={time.time()-t0:.1f}s")
    return state
