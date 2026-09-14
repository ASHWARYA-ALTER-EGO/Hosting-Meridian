"""Automation endpoint hit by the weekly GitHub Action.
Re-profiles every firm older than STALE_DAYS."""
import os
import threading
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from ..database import get_db, SessionLocal, FundManagerProfile
from ..pipeline.graph import run_pipeline
from ..security import require_api_key, limiter
from ..logging_setup import get_logger
from .evaluate import _upsert_profile

router = APIRouter()
log = get_logger("automation")

STALE_DAYS = int(os.getenv("REFRESH_STALE_DAYS", "7"))


def _refresh_stale(rows):
    """Run in a background thread so the HTTP call returns immediately."""
    for r in rows:
        try:
            log.info(f"refresh start firm={r.firm_name}")
            final = run_pipeline(r.firm_name, r.geography_focus or "",
                                 r.sectors or "", r.stages or "",
                                 emit=lambda _: None)
            _upsert_profile(final)
            log.info(f"refresh ok    firm={r.firm_name}")
        except Exception as e:
            log.error(f"refresh fail  firm={r.firm_name} err={type(e).__name__}: {e}")


@router.post("/api/refresh", dependencies=[Depends(require_api_key)])
@limiter.limit("6/hour")
def refresh(request: Request, db: Session = Depends(get_db)):
    cutoff = datetime.utcnow() - timedelta(days=STALE_DAYS)
    stale = db.query(FundManagerProfile).filter(
        FundManagerProfile.updated_at < cutoff
    ).all()
    if not stale:
        return {"ok": True, "refreshed": 0, "message": "nothing older than cutoff"}

    # We need a detached list of primitive fields, not SQLAlchemy row objects tied
    # to a request-scoped session, because we hand them to a background thread.
    detached = [
        type("R", (), {
            "firm_name": r.firm_name, "geography_focus": r.geography_focus,
            "sectors": r.sectors, "stages": r.stages,
        })() for r in stale
    ]
    threading.Thread(target=_refresh_stale, args=(detached,), daemon=True).start()
    return {"ok": True, "queued": len(detached), "cutoff": cutoff.isoformat()}
