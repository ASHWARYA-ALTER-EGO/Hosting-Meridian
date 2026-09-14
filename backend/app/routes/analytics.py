"""Cross-firm analytics + export.

- GET /api/compare?ids=1,2,3       — parallel profiles for the compare view
- GET /api/overlaps                — companies invested in by 2+ tracked firms
- GET /api/activity?geography=...  — reverse-chron activity feed, all firms
- GET /api/managers/{id}/export.csv — flat CSV of the fact sheet + portfolio
- GET /api/managers/{id}/export.md  — the Markdown profile as a downloadable file
"""
import csv
import io
import json
import re
from typing import Dict, List, Tuple, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import PlainTextResponse, Response
from sqlalchemy.orm import Session

from ..database import get_db, FundManagerProfile

router = APIRouter()


def _profile_of(row: FundManagerProfile) -> Dict[str, Any]:
    try:    return json.loads(row.profile_json or "{}")
    except Exception: return {}


def _val(field, default=""):
    if not isinstance(field, dict): return default
    v = field.get("value", default)
    if isinstance(v, list): return ", ".join(str(x) for x in v)
    return str(v) if v is not None else default


# ---------------------------------------------------------------- COMPARE
@router.get("/api/compare")
def compare(ids: str = Query(...), db: Session = Depends(get_db)):
    try:
        id_list = [int(x) for x in ids.split(",") if x.strip()]
    except ValueError:
        raise HTTPException(400, "ids must be comma-separated integers")
    if not (2 <= len(id_list) <= 4):
        raise HTTPException(400, "compare 2 to 4 firms at a time")

    rows = db.query(FundManagerProfile).filter(FundManagerProfile.id.in_(id_list)).all()
    by_id = {r.id: r for r in rows}
    ordered = [by_id[i] for i in id_list if i in by_id]

    return [
        {
            "id": r.id,
            "firm_name": r.firm_name,
            "summary": r.summary or "",
            "updated_at": r.updated_at.isoformat() if r.updated_at else "",
            "profile": _profile_of(r),
        }
        for r in ordered
    ]


# ---------------------------------------------------------------- OVERLAPS
def _norm_company(name: str) -> str:
    s = (name or "").lower().strip()
    s = re.sub(r"[.,'`\"’]", "", s)
    s = re.sub(r"\s+(inc|ltd|pvt|private limited|limited|corp|llc|co)\b\.?", "", s)
    return re.sub(r"\s+", " ", s).strip()


@router.get("/api/overlaps")
def overlaps(db: Session = Depends(get_db)):
    rows = db.query(FundManagerProfile).all()
    bucket: Dict[str, Dict[str, Any]] = {}

    for r in rows:
        profile = _profile_of(r)
        portfolio = profile.get("notable_portfolio") or []
        if not isinstance(portfolio, list): continue
        for p in portfolio:
            if not isinstance(p, dict): continue
            raw = p.get("name") or ""
            key = _norm_company(raw)
            if not key: continue
            b = bucket.setdefault(key, {"display": raw, "firms": []})
            # Prefer a title-cased display when multiple variants exist
            if len(raw) > len(b["display"]) or raw[:1].isupper():
                b["display"] = raw
            b["firms"].append({
                "firm_id": r.id,
                "firm_name": r.firm_name,
                "note": p.get("note") or "",
                "source": p.get("source") or "",
            })

    overlaps = []
    for key, b in bucket.items():
        seen = set(); unique_firms = []
        for f in b["firms"]:
            if f["firm_id"] in seen: continue
            seen.add(f["firm_id"])
            unique_firms.append(f)
        if len(unique_firms) >= 2:
            overlaps.append({
                "company": b["display"],
                "firm_count": len(unique_firms),
                "firms": unique_firms,
            })

    overlaps.sort(key=lambda x: (-x["firm_count"], x["company"].lower()))
    return {"total": len(overlaps), "overlaps": overlaps[:100]}


# ---------------------------------------------------------------- ACTIVITY
_DATE_RE = re.compile(r"(\d{4})(?:[-/](\d{1,2}))?(?:[-/](\d{1,2}))?")

def _date_key(s: str) -> Tuple[int, int, int]:
    """Very permissive — turn "2024", "2024-06", "2024-06-14", "Jun 2024" into a sortable tuple."""
    if not s: return (0, 0, 0)
    m = _DATE_RE.search(s)
    if not m: return (0, 0, 0)
    y = int(m.group(1))
    mo = int(m.group(2)) if m.group(2) else 0
    d  = int(m.group(3)) if m.group(3) else 0
    return (y, mo, d)


@router.get("/api/activity")
def activity(
    geography: str = Query(default=""),
    firm: str = Query(default=""),
    limit: int = Query(default=200),
    db: Session = Depends(get_db),
):
    rows = db.query(FundManagerProfile).all()
    events: List[Dict[str, Any]] = []
    geographies = set()

    for r in rows:
        if firm and firm.lower() not in r.firm_name.lower(): continue
        if geography and geography.lower() not in (r.geography_focus or "").lower(): continue
        if r.geography_focus: geographies.add(r.geography_focus)
        profile = _profile_of(r)
        acts = profile.get("recent_activity") or []
        if not isinstance(acts, list): continue
        for a in acts:
            if not isinstance(a, dict): continue
            item = a.get("item") or ""
            if not item: continue
            events.append({
                "firm_id": r.id,
                "firm_name": r.firm_name,
                "firm_geography": r.geography_focus or "",
                "date": a.get("date") or "",
                "item": item,
                "source": a.get("source") or "",
                "_sort": _date_key(a.get("date") or ""),
            })

    events.sort(key=lambda e: e["_sort"], reverse=True)
    for e in events: e.pop("_sort", None)
    return {
        "total": len(events),
        "geographies": sorted(geographies),
        "events": events[:limit],
    }


# ---------------------------------------------------------------- EXPORT
def _fetch(db: Session, mid: int) -> FundManagerProfile:
    r = db.query(FundManagerProfile).filter(FundManagerProfile.id == mid).first()
    if not r: raise HTTPException(404, "Not found")
    return r


@router.get("/api/managers/{mid}/export.csv")
def export_csv(mid: int, db: Session = Depends(get_db)):
    r = _fetch(db, mid)
    profile = _profile_of(r)
    buf = io.StringIO()
    w = csv.writer(buf)

    w.writerow(["Meridian export", r.firm_name])
    w.writerow(["Updated", r.updated_at.isoformat() if r.updated_at else ""])
    w.writerow([])
    w.writerow(["Field", "Value", "Confidence", "Source"])
    for k, label in [
        ("headquarters", "Headquarters"),
        ("geography_focus", "Geography focus"),
        ("aum", "AUM"),
        ("fund_vintages", "Fund vintages"),
        ("sectors", "Sectors"),
        ("stages", "Stages"),
    ]:
        f = profile.get(k) or {}
        w.writerow([label, _val(f), f.get("confidence", "") if isinstance(f, dict) else "",
                    f.get("source", "") if isinstance(f, dict) else ""])

    w.writerow([])
    w.writerow(["Notable portfolio"])
    w.writerow(["Company", "Note", "Source"])
    for p in profile.get("notable_portfolio") or []:
        if isinstance(p, dict):
            w.writerow([p.get("name", ""), p.get("note", ""), p.get("source", "")])

    w.writerow([])
    w.writerow(["Leadership"])
    w.writerow(["Name", "Role", "Source"])
    for p in profile.get("leadership") or []:
        if isinstance(p, dict):
            w.writerow([p.get("name", ""), p.get("role", ""), p.get("source", "")])

    w.writerow([])
    w.writerow(["Recent activity"])
    w.writerow(["Date", "Item", "Source"])
    for p in profile.get("recent_activity") or []:
        if isinstance(p, dict):
            w.writerow([p.get("date", ""), p.get("item", ""), p.get("source", "")])

    slug = re.sub(r"[^A-Za-z0-9]+", "-", r.firm_name.lower()).strip("-")
    fname = f"meridian-{slug or 'profile'}.csv"
    return Response(
        content=buf.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{fname}"'},
    )


@router.get("/api/managers/{mid}/export.md", response_class=PlainTextResponse)
def export_md(mid: int, db: Session = Depends(get_db)):
    r = _fetch(db, mid)
    md = r.profile_md or f"# {r.firm_name}\n\n(No profile generated.)"
    slug = re.sub(r"[^A-Za-z0-9]+", "-", r.firm_name.lower()).strip("-")
    return Response(
        content=md,
        media_type="text/markdown",
        headers={"Content-Disposition": f'attachment; filename="meridian-{slug or "profile"}.md"'},
    )
