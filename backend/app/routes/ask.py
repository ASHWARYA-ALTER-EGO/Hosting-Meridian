"""Ask-this-profile: RAG-lite chat over a single firm's sourced findings.

Retrieval: keyword-overlap ranking against the `findings` table for that firm.
Generation: LLM given the top-K findings as context, instructed to answer only
from them and cite sources. No vector DB. No hallucinations from the general web."""
import re
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


ANSWER_SYSTEM = """You answer questions about a PE / VC fund manager using ONLY the sourced findings supplied.
Rules:
- Cite the findings you used inline as [1], [2], etc. Numbers refer to the numbered findings.
- If the findings do not contain the answer, say so explicitly. Do NOT invent.
- Keep the answer under 120 words.
- Plain prose. No preamble."""


def _tokenize(s: str):
    return set(re.findall(r"[a-zA-Z][a-zA-Z0-9]{2,}", (s or "").lower()))


def _rank(findings, question, k=8):
    qtoks = _tokenize(question)
    if not qtoks: return findings[:k]
    scored = []
    for f in findings:
        ftoks = _tokenize(f.fact) | _tokenize(f.topic)
        overlap = len(qtoks & ftoks)
        scored.append((overlap, f))
    scored.sort(key=lambda x: x[0], reverse=True)
    return [f for score, f in scored[:k] if score > 0] or findings[:k]


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
        answer = ask_llm(ANSWER_SYSTEM, [{"role": "user", "content": user}],
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
