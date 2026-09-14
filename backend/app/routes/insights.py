"""Analyst-value endpoints:
  GET  /api/comparables/{id}   → 3 most similar firms in the tracker
  POST /api/compare-diff       → LLM-generated "what makes each different" diff
  GET  /api/signals            → tracker-wide recent-activity signal card
"""
import json
import re
from datetime import datetime, timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db, FundManagerProfile, Deal
from ..security import limiter
from ..llm import ask_llm
from ..logging_setup import get_logger

router = APIRouter()
log = get_logger("insights")


# ------------------------------------------------- COMPARABLES
def _tok(s: str):
    return set(re.findall(r"[a-zA-Z]{2,}", (s or "").lower()))


def _similarity(a: FundManagerProfile, b: FundManagerProfile) -> float:
    """Jaccard over sectors + stages + geography tokens, plus small bonus for
    matching stage buckets (seed vs growth vs PE)."""
    A = _tok(a.sectors) | _tok(a.stages) | _tok(a.geography_focus)
    B = _tok(b.sectors) | _tok(b.stages) | _tok(b.geography_focus)
    if not A or not B: return 0.0
    j = len(A & B) / len(A | B)
    # bucket bonus: seed+early clustering, growth+series, pe+buyout
    def bucket(s):
        s = (s or "").lower()
        if any(w in s for w in ("seed","pre-seed","early")): return "s"
        if any(w in s for w in ("growth","series b","series c","series-b","series-c")): return "g"
        if any(w in s for w in ("buyout","pe","private equity")): return "p"
        return "o"
    if bucket(a.stages) == bucket(b.stages): j += 0.10
    return j


@router.get("/api/comparables/{mid}")
@limiter.limit("60/minute")
def comparables(mid: int, request: Request, db: Session = Depends(get_db), k: int = 3):
    me = db.query(FundManagerProfile).filter(FundManagerProfile.id == mid).first()
    if not me: raise HTTPException(404, "Firm not found")
    others = db.query(FundManagerProfile).filter(FundManagerProfile.id != mid).all()
    scored = [(round(_similarity(me, o), 3), o) for o in others]
    scored.sort(key=lambda x: x[0], reverse=True)
    top = scored[:k]

    return {
        "firm_id": me.id,
        "firm_name": me.firm_name,
        "comparables": [
            {
                "id": o.id,
                "firm_name": o.firm_name,
                "similarity": s,
                "geography_focus": o.geography_focus or "",
                "sectors": o.sectors or "",
                "stages": o.stages or "",
                "aum_display": o.aum_display or "",
                "differentiator": _quick_diff(me, o),
            }
            for s, o in top
        ],
    }


def _quick_diff(a: FundManagerProfile, b: FundManagerProfile) -> str:
    """Cheap deterministic one-liner: whichever dimension differs most gets called out."""
    parts = []
    if a.headquarters and b.headquarters and a.headquarters != b.headquarters:
        parts.append(f"HQ in {b.headquarters}")
    if a.stages and b.stages and _tok(a.stages) != _tok(b.stages):
        parts.append(f"stages: {b.stages}")
    if a.sectors and b.sectors:
        b_only = _tok(b.sectors) - _tok(a.sectors)
        if b_only:
            parts.append(f"extra sectors: {', '.join(list(b_only)[:3])}")
    if a.aum_usd_m and b.aum_usd_m and abs((a.aum_usd_m or 0) - (b.aum_usd_m or 0)) > 500:
        parts.append(f"AUM {b.aum_display or ('~$' + str(int(b.aum_usd_m)) + 'M')}")
    return " · ".join(parts[:2]) or "similar profile"


# ------------------------------------------------- COMPARE DIFF (LLM)
class CompareDiffRequest(BaseModel):
    ids: List[int] = Field(min_length=2, max_length=4)


DIFF_SYSTEM = """You are a private-markets analyst. Given 2 to 4 fund-manager profiles, produce a punchy comparative analysis.

Return this EXACT Markdown format:

**Bottom line:** <one sentence, 25 words max, capturing the sharpest contrast>

**How they differ:**
- <Firm A> — <specific edge or tilt, one sentence>
- <Firm B> — <specific edge or tilt, one sentence>
(one bullet per firm)

**When to pick which:**
- Prefer <Firm A> if <specific analyst scenario>
- Prefer <Firm B> if <specific analyst scenario>

Rules:
- No fact restates. Every line makes an inference.
- Numbers you cite must appear in the input profiles.
- No preamble, no closing summary, no meta-commentary."""


@router.post("/api/compare-diff")
@limiter.limit("15/minute")
def compare_diff(request: Request, body: CompareDiffRequest, db: Session = Depends(get_db)):
    rows = db.query(FundManagerProfile).filter(FundManagerProfile.id.in_(body.ids)).all()
    if len(rows) < 2:
        raise HTTPException(400, "Need at least 2 valid firm ids")
    by_id = {r.id: r for r in rows}
    ordered = [by_id[i] for i in body.ids if i in by_id]

    blocks = []
    for r in ordered:
        try: profile = json.loads(r.profile_json or "{}")
        except Exception: profile = {}
        blocks.append(
            f"### {r.firm_name}\n"
            f"HQ: {r.headquarters or '?'}\n"
            f"Geography: {r.geography_focus or '?'}\n"
            f"AUM: {r.aum_display or '?'}\n"
            f"Sectors: {r.sectors or '?'}\n"
            f"Stages: {r.stages or '?'}\n"
            f"Thesis: {r.investment_thesis or '(not extracted)'}\n"
            f"Notable portfolio: {[p.get('name') for p in (profile.get('notable_portfolio') or [])][:6]}\n"
        )
    user = "\n\n".join(blocks) + "\n\nProduce the comparative analysis now."
    log.info(f"compare-diff ids={body.ids}")
    try:
        answer = ask_llm(DIFF_SYSTEM, [{"role": "user", "content": user}],
                         max_tokens=500, temperature=0.35)
    except Exception as e:
        raise HTTPException(500, f"LLM failed: {type(e).__name__}: {e}")

    return {
        "ids": body.ids,
        "firm_names": [r.firm_name for r in ordered],
        "diff_md": answer,
    }


# ------------------------------------------------- SIGNALS (tracker-wide)
@router.get("/api/signals")
@limiter.limit("60/minute")
def signals(request: Request, days: int = 90, db: Session = Depends(get_db)):
    """Auto-computed 'what's moving' card. Uses deals table + updated_at timestamps."""
    cutoff_iso = (datetime.utcnow() - timedelta(days=days)).isoformat()

    counts = dict(
        db.query(Deal.kind, func.count(Deal.id))
          .filter(Deal.created_at > datetime.utcnow() - timedelta(days=days))
          .group_by(Deal.kind).all()
    )

    recent_updates = (
        db.query(FundManagerProfile)
          .filter(FundManagerProfile.updated_at > datetime.utcnow() - timedelta(days=days))
          .order_by(FundManagerProfile.updated_at.desc())
          .limit(5).all()
    )

    total_firms = db.query(func.count(FundManagerProfile.id)).scalar() or 0

    headlines = []
    if counts.get("fund_close"):
        headlines.append(f"{counts['fund_close']} fund close event{'s' if counts['fund_close']!=1 else ''} in the last {days}d")
    if counts.get("exit"):
        headlines.append(f"{counts['exit']} exit event{'s' if counts['exit']!=1 else ''}")
    if counts.get("leadership"):
        headlines.append(f"{counts['leadership']} leadership move{'s' if counts['leadership']!=1 else ''}")
    if not headlines and total_firms > 0:
        headlines.append(f"{total_firms} firms tracked · no notable activity in {days}d window")
    if not headlines:
        headlines.append("Tracker is empty · seed some firms to see activity")

    return {
        "window_days": days,
        "total_firms": total_firms,
        "counts_by_kind": counts,
        "headlines": headlines,
        "recent_updates": [
            {"id": r.id, "firm_name": r.firm_name,
             "updated_at": r.updated_at.isoformat() if r.updated_at else ""}
            for r in recent_updates
        ],
    }


# ------------------------------------------------- DEALS TIMELINE (for sparkline)
@router.get("/api/firms/{mid}/timeline")
@limiter.limit("60/minute")
def firm_timeline(mid: int, request: Request, db: Session = Depends(get_db)):
    """Deals per year for one firm — powers the sparkline in the tracker."""
    rows = db.query(Deal).filter(Deal.firm_id == mid).all()
    counts = {}
    for d in rows:
        y = (d.date_str or "")[:4]
        if y.isdigit():
            counts[y] = counts.get(y, 0) + 1
    if not counts:
        return {"firm_id": mid, "years": [], "counts": []}
    years = sorted(counts.keys())
    lo, hi = int(years[0]), int(years[-1])
    filled = [{"y": str(y), "c": counts.get(str(y), 0)} for y in range(lo, hi + 1)]
    return {
        "firm_id": mid,
        "years": [f["y"] for f in filled],
        "counts": [f["c"] for f in filled],
    }
