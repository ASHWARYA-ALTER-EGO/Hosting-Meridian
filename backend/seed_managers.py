"""Pre-populate the tracker with 20 real India + SEA fund managers.

Run: `python seed_managers.py` from backend/, with .env keys set.
Idempotent. Re-runs refresh rows in place."""
import sys
import time
from app.database import init_db
from app.routes.evaluate import _upsert_profile
from app.pipeline.graph import run_pipeline

SEED_FIRMS = [
    # India, VC
    {"firm_name": "Peak XV Partners",      "geography": "India / SEA",  "stage_focus": "growth"},
    {"firm_name": "Blume Ventures",        "geography": "India",        "stage_focus": "seed / series A"},
    {"firm_name": "Elevation Capital",     "geography": "India",        "stage_focus": "early / growth"},
    {"firm_name": "Accel India",           "geography": "India",        "stage_focus": "series A / B"},
    {"firm_name": "3one4 Capital",         "geography": "India",        "stage_focus": "seed / series A"},
    {"firm_name": "Chiratae Ventures",     "geography": "India",        "stage_focus": "early / growth"},
    {"firm_name": "Nexus Venture Partners","geography": "India / US",   "stage_focus": "series A / B"},
    {"firm_name": "Stellaris Venture Partners","geography":"India",     "stage_focus": "seed / series A"},
    {"firm_name": "Prime Venture Partners","geography": "India",        "stage_focus": "seed / series A"},
    # India, PE
    {"firm_name": "Kedaara Capital",       "geography": "India",        "stage_focus": "PE / buyout"},
    {"firm_name": "Multiples Alternate Asset Management","geography":"India","stage_focus":"PE / growth"},
    {"firm_name": "ChrysCapital",          "geography": "India",        "stage_focus": "PE / growth"},
    {"firm_name": "True North",            "geography": "India",        "stage_focus": "PE / mid-market"},
    # SEA / pan-Asia
    {"firm_name": "East Ventures",         "geography": "Indonesia / SEA","stage_focus":"seed / early"},
    {"firm_name": "Openspace Ventures",    "geography": "Singapore / SEA","stage_focus":"series A / growth"},
    {"firm_name": "Jungle Ventures",       "geography": "Singapore / India","stage_focus":"series A / B"},
    {"firm_name": "Vertex Ventures Southeast Asia and India","geography":"Singapore","stage_focus":"seed / series B"},
    {"firm_name": "Golden Gate Ventures",  "geography": "Southeast Asia","stage_focus":"seed / early"},
    {"firm_name": "Monk's Hill Ventures",  "geography": "Southeast Asia","stage_focus":"series A"},
    {"firm_name": "AC Ventures",           "geography": "Indonesia",    "stage_focus": "seed / series A"},
]


def main():
    init_db()
    total = len(SEED_FIRMS)
    for i, f in enumerate(SEED_FIRMS, 1):
        print(f"\n=== [{i}/{total}] {f['firm_name']} ===")
        t0 = time.time()

        def emit(ev):
            t = ev.get("type", "?")
            if t == "phase":
                print(f"  · {ev.get('phase')}: {ev.get('status','')}")
            elif t == "queries":
                print(f"  · {len(ev.get('queries', []))} queries")
            elif t == "findings":
                print(f"  · {len(ev.get('findings', []))} sourced findings")
            elif t == "report_done":
                print(f"  · report ready ({len(ev.get('profile_md',''))} chars)")
            elif t == "error":
                print(f"  ! ERROR: {ev.get('message')}")

        try:
            final = run_pipeline(
                f["firm_name"], f.get("geography", ""),
                f.get("sector_focus", ""), f.get("stage_focus", ""),
                emit,
            )
            rid = _upsert_profile(final)
            print(f"  ✓ saved as #{rid} in {time.time()-t0:.1f}s")
        except Exception as e:
            print(f"  ✗ failed: {type(e).__name__}: {e}")

    print("\nDone.")


if __name__ == "__main__":
    sys.exit(main())
