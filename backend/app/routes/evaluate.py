"""Profile generation + tracker CRUD."""
import json
import queue
import threading
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from datetime import datetime

from ..database import get_db, SessionLocal, FundManagerProfile
from ..pipeline.graph import run_pipeline

router = APIRouter()
_SENTINEL = object()


class ProfileRequest(BaseModel):
    firm_name: str = Field(min_length=2, max_length=255)
    geography: Optional[str] = Field(default="", max_length=128)
    sector_focus: Optional[str] = Field(default="", max_length=128)
    stage_focus: Optional[str] = Field(default="", max_length=128)


def _upsert_profile(final_state: dict) -> int:
    firm = final_state["firm_name"].strip()
    key = firm.lower()
    profile = final_state.get("profile", {}) or {}

    def _val(fname, default=""):
        f = profile.get(fname) or {}
        if isinstance(f, dict):
            v = f.get("value", default)
            if isinstance(v, list):
                return ", ".join(str(x) for x in v)
            return str(v) if v is not None else default
        return default

    aum_display = _val("aum")
    aum_usd_m = profile.get("_aum_usd_m") if isinstance(profile.get("_aum_usd_m"), (int, float)) else None

    db = SessionLocal()
    try:
        row = db.query(FundManagerProfile).filter(
            FundManagerProfile.firm_name_key == key
        ).first()
        payload = dict(
            firm_name=firm,
            firm_name_key=key,
            headquarters=_val("headquarters"),
            geography_focus=_val("geography_focus"),
            aum_usd_m=aum_usd_m,
            aum_display=aum_display,
            fund_vintages=_val("fund_vintages"),
            sectors=_val("sectors"),
            stages=_val("stages"),
            profile_json=json.dumps(profile, default=str),
            findings_json=json.dumps(final_state.get("findings", []), default=str),
            profile_md=final_state.get("profile_md", "") or "",
            summary=(final_state.get("summary") or "")[:1024],
        )
        if row:
            for k, v in payload.items(): setattr(row, k, v)
            row.updated_at = datetime.utcnow()
        else:
            row = FundManagerProfile(**payload)
            db.add(row)
        db.commit()
        db.refresh(row)
        return row.id
    finally:
        db.close()


def _worker(req: ProfileRequest, q: "queue.Queue"):
    def emit(ev): q.put(ev)
    try:
        final = run_pipeline(
            req.firm_name.strip(), req.geography or "",
            req.sector_focus or "", req.stage_focus or "",
            emit,
        )
        try:
            row_id = _upsert_profile(final)
            emit({"type": "saved", "id": row_id})
        except Exception as e:
            emit({"type": "error", "message": f"Persist failed: {type(e).__name__}: {e}"})
    except Exception as e:
        emit({"type": "error", "message": f"{type(e).__name__}: {e}"})
    finally:
        q.put(_SENTINEL)


@router.post("/api/profile")
def profile(req: ProfileRequest):
    q: "queue.Queue" = queue.Queue()
    threading.Thread(target=_worker, args=(req, q), daemon=True).start()

    def gen():
        yield f"data: {json.dumps({'type': 'start', 'firm_name': req.firm_name})}\n\n"
        while True:
            item = q.get()
            if item is _SENTINEL: break
            yield f"data: {json.dumps(item)}\n\n"
        yield f"data: {json.dumps({'type': 'end'})}\n\n"

    return StreamingResponse(gen(), media_type="text/event-stream", headers={
        "Cache-Control": "no-cache", "X-Accel-Buffering": "no",
    })


@router.get("/api/managers")
def list_managers(
    db: Session = Depends(get_db),
    geography: Optional[str] = Query(default=None),
    sector: Optional[str] = Query(default=None),
    q: Optional[str] = Query(default=None),
    sort: str = Query(default="updated_at"),
    order: str = Query(default="desc"),
    limit: int = 200,
):
    query = db.query(FundManagerProfile)
    if q:
        like = f"%{q.lower()}%"
        query = query.filter(FundManagerProfile.firm_name_key.like(like))
    if geography:
        query = query.filter(FundManagerProfile.geography_focus.ilike(f"%{geography}%"))
    if sector:
        query = query.filter(FundManagerProfile.sectors.ilike(f"%{sector}%"))

    col = {
        "updated_at": FundManagerProfile.updated_at,
        "firm_name":  FundManagerProfile.firm_name,
        "aum":        FundManagerProfile.aum_usd_m,
        "geography":  FundManagerProfile.geography_focus,
    }.get(sort, FundManagerProfile.updated_at)
    query = query.order_by(col.desc() if order == "desc" else col.asc())

    rows = query.limit(limit).all()
    return [
        {
            "id": r.id,
            "firm_name": r.firm_name,
            "headquarters": r.headquarters or "",
            "geography_focus": r.geography_focus or "",
            "aum_display": r.aum_display or "",
            "aum_usd_m": r.aum_usd_m,
            "sectors": r.sectors or "",
            "stages": r.stages or "",
            "summary": r.summary or "",
            "updated_at": r.updated_at.isoformat() if r.updated_at else "",
        }
        for r in rows
    ]


@router.get("/api/managers/{mid}")
def get_manager(mid: int, db: Session = Depends(get_db)):
    r = db.query(FundManagerProfile).filter(FundManagerProfile.id == mid).first()
    if not r: raise HTTPException(status_code=404, detail="Not found")
    return {
        "id": r.id,
        "firm_name": r.firm_name,
        "headquarters": r.headquarters or "",
        "geography_focus": r.geography_focus or "",
        "aum_display": r.aum_display or "",
        "aum_usd_m": r.aum_usd_m,
        "fund_vintages": r.fund_vintages or "",
        "sectors": r.sectors or "",
        "stages": r.stages or "",
        "summary": r.summary or "",
        "profile": json.loads(r.profile_json or "{}"),
        "findings": json.loads(r.findings_json or "[]"),
        "profile_md": r.profile_md or "",
        "updated_at": r.updated_at.isoformat() if r.updated_at else "",
        "created_at": r.created_at.isoformat() if r.created_at else "",
    }
