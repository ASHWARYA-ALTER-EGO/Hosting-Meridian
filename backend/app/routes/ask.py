"""Ask endpoints — RAG-lite over sourced findings.

Two flavours:
  POST /api/managers/{id}/ask   → chat scoped to ONE firm's findings
  POST /api/ask-global          → chat scoped to EVERY firm's findings (global RAG)

Retrieval: keyword-token overlap + firm-name mentions.
Generation: LLM with strict "cite [n], don't invent" instructions."""
import re
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ..database import get_db, FundManagerProfile, Finding
from ..security import limiter
from ..llm import ask_llm
from ..logging_setup import get_logger

router = APIRouter()
log = get_logger("ask")


class AskRequest(BaseModel):
    question: str = Field(min_length=3, max_length=500)


ONE_FIRM_SYSTEM = """You answer questions about a PE / VC fund manager using ONLY the sourced findings supplied.
Rules:
- Cite the findings you used inline as [1], [2], etc. Numbers refer to the numbered findings.
- If the findings do not contain the answer, say so explicitly. Do NOT invent.
- Keep the answer under 120 words.
- Plain prose. No preamble."""


GLOBAL_SYSTEM = """You answer questions about India / SEA PE and VC fund managers using ONLY the sourced findings supplied.
The findings come from MULTIPLE firms. Each finding is prefixed with [n] (Firm name).
Rules:
- Cite the findings you used inline as [n]. When referring to a firm, use its name explicitly.
- If the findings do not contain the answer, say so explicitly. Do NOT invent.
- When the question compares firms, structure the answer so the differences are clear.
- Keep the answer under 180 words.
- Plain prose. No preamble."""


def _tokenize(s: str):
    return set(re.findall(r"[a-zA-Z][a-zA-Z0-9]{2,}", (s or "").lower()))


def _rank(findings, question, k=8):
    qtoks = _tokenize(question)
    if not qtoks: return findings[:k]
    scored = []
    for f in findings:
        ftoks = _tokenize(getattr(f, "fact", "")) | _tokenize(getattr(f, "topic", ""))
        overlap = len(qtoks & ftoks)
        scored.append((overlap, f))
    scored.sort(key=lambda x: x[0], reverse=True)
    return [f for score, f in scored[:k] if score > 0] or findings[:k]


# ---------------- one-firm ask ----------------
@router.post("/api/managers/{mid}/ask")
@limiter.limit("15/minute")
def ask(mid: int, request: Request, body: AskRequest, db: Session = Depends(get_db)):
    firm = db.query(FundManagerProfile).filter(FundManagerProfile.id == mid).first()
    if not firm:
        raise HTTPException(404, "Firm not found")

    findings = db.query(Finding).filter(Finding.firm_id == mid).all()
    if not findings:
        return {
            "answer": "No sourced findings on file for this firm yet. Run a profile refresh first.",
            "sources": [],
        }

    top = _rank(findings, body.question, k=8)
    numbered = "\n".join(f"[{i+1}] ({f.topic}) {f.fact}  <src:{f.source_url}>"
                        for i, f in enumerate(top))
    user = (
        f"FIRM: {firm.firm_name}\n\n"
        f"FINDINGS:\n{numbered}\n\n"
        f"QUESTION: {body.question}"
    )
    log.info(f"ask firm_id={mid} q={body.question[:80]!r} k={len(top)}")
    try:
        answer = ask_llm(ONE_FIRM_SYSTEM, [{"role": "user", "content": user}],
                         max_tokens=400, temperature=0.2)
    except Exception as e:
        raise HTTPException(500, f"LLM failed: {type(e).__name__}: {e}")

    return {
        "answer": answer,
        "sources": [
            {"n": i+1, "topic": f.topic, "fact": f.fact, "source_url": f.source_url}
            for i, f in enumerate(top)
        ],
    }


# ---------------- global ask ----------------
class _FF:
    """Small shim so global rank can reuse the same _rank / mention firm name."""
    __slots__ = ("id", "topic", "fact", "source_url", "firm_id", "firm_name")


@router.post("/api/ask-global")
@limiter.limit("15/minute")
def ask_global(request: Request, body: AskRequest, db: Session = Depends(get_db)):
    firms = db.query(FundManagerProfile).all()
    if not firms:
        return {
            "answer": "The tracker is empty. Profile some firms first and then ask again.",
            "sources": [],
            "firms_covered": 0,
        }
    firm_by_id = {f.id: f for f in firms}

    all_findings = db.query(Finding).all()
    if not all_findings:
        # Fallback: use firm-level summaries + investment thesis as retrieval corpus
        stub = []
        for f in firms:
            row = _FF()
            row.id = f.id; row.topic = "overview"; row.firm_id = f.id
            row.firm_name = f.firm_name; row.source_url = ""
            row.fact = f"{f.firm_name} · HQ {f.headquarters or '?'} · geo {f.geography_focus or '?'} · sectors {f.sectors or '?'} · stages {f.stages or '?'} · thesis: {f.investment_thesis or '(not extracted)'}"
            stub.append(row)
        all_findings = stub

    # Attach firm name to every finding for citation clarity
    enriched = []
    for f in all_findings:
        e = _FF()
        e.id = getattr(f, "id", 0)
        e.topic = getattr(f, "topic", "other")
        e.fact = getattr(f, "fact", "")
        e.source_url = getattr(f, "source_url", "")
        e.firm_id = getattr(f, "firm_id", None)
        e.firm_name = firm_by_id.get(e.firm_id).firm_name if e.firm_id in firm_by_id else "?"
        enriched.append(e)

    # If the question mentions a firm name, boost that firm's findings
    q_lower = body.question.lower()
    for e in enriched:
        if e.firm_name and e.firm_name.lower() in q_lower:
            # duplicate to boost its retrieval weight
            enriched.append(e)

    top = _rank(enriched, body.question, k=12)
    numbered = "\n".join(
        f"[{i+1}] ({f.firm_name} · {f.topic}) {f.fact}"
        + (f"  <src:{f.source_url}>" if f.source_url else "")
        for i, f in enumerate(top)
    )
    user = f"FINDINGS (across firms):\n{numbered}\n\nQUESTION: {body.question}"
    log.info(f"ask-global q={body.question[:80]!r} firms={len(firms)} k={len(top)}")
    try:
        answer = ask_llm(GLOBAL_SYSTEM, [{"role": "user", "content": user}],
                         max_tokens=550, temperature=0.25)
    except Exception as e:
        raise HTTPException(500, f"LLM failed: {type(e).__name__}: {e}")

    return {
        "answer": answer,
        "sources": [
            {"n": i+1, "firm_name": f.firm_name, "firm_id": f.firm_id,
             "topic": f.topic, "fact": f.fact, "source_url": f.source_url}
            for i, f in enumerate(top)
        ],
        "firms_covered": len(firms),
    }
