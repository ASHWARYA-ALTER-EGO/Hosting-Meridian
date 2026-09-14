"""First-class /api/deals endpoint. Powered by the normalised `deals` table."""
from typing import Optional
from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db, Deal, FundManagerProfile
from ..security import limiter

router = APIRouter()


@router.get("/api/deals")
@limiter.limit("60/minute")
def list_deals(
    request: Request,
    kind: Optional[str] = Query(default=None, description="investment | fund_close | exit | leadership | other"),
    firm: Optional[str] = Query(default=None, description="filter by firm name substring"),
    q: Optional[str] = Query(default=None, description="filter by company name substring"),
    year: Optional[str] = Query(default=None),
    limit: int = 200,
    db: Session = Depends(get_db),
):
    query = db.query(Deal, FundManagerProfile).join(
        FundManagerProfile, Deal.firm_id == FundManagerProfile.id
    )
    if kind: query = query.filter(Deal.kind == kind)
    if firm: query = query.filter(FundManagerProfile.firm_name.ilike(f"%{firm}%"))
    if q:    query = query.filter(Deal.company_name.ilike(f"%{q}%"))
    if year: query = query.filter(Deal.date_str.like(f"{year}%"))

    query = query.order_by(Deal.date_str.desc().nullslast(), Deal.id.desc())
    rows = query.limit(limit).all()

    total = db.query(func.count(Deal.id)).scalar() or 0
    kinds = dict(db.query(Deal.kind, func.count(Deal.id)).group_by(Deal.kind).all())

    return {
        "total": total,
        "counts_by_kind": kinds,
        "deals": [
            {
                "id": d.id,
                "firm_id": f.id,
                "firm_name": f.firm_name,
                "company_name": d.company_name,
                "kind": d.kind,
                "note": d.note,
                "date": d.date_str,
                "source": d.source_url,
            }
            for d, f in rows
        ],
    }
