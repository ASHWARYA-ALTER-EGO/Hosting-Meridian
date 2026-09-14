"""Pre-populate the tracker with a handful of real India/SEA fund managers.

Run: `python seed_managers.py` (from backend/) — requires .env with keys set.
Each firm goes through the full pipeline (research → structure → write) and is
upserted into the SQLite/Postgres database exactly as if the frontend had
submitted it. Idempotent: re-running refreshes existing rows in place."""
import sys
import time
from app.database import init_db
from app.routes.evaluate import _upsert_profile
from app.pipeline.graph import run_pipeline

SEED_FIRMS = [
    {"firm_name": "Peak XV Partners", "geography": "India / SEA", "stage_focus": "growth"},
    {"firm_name": "Blume Ventures",   "geography": "India",       "stage_focus": "seed / series A"},
    {"firm_name": "Kedaara Capital",  "geography": "India",       "stage_focus": "private equity / buyout"},
    {"firm_name": "East Ventures",    "geography": "Southeast Asia (Indonesia)", "stage_focus": "seed / early"},
    {"firm_name": "Openspace Ventures", "geography": "Southeast Asia (Singapore)", "stage_focus": "series A / growth"},
]


def main():
    init_db()
    for i, f in enumerate(SEED_FIRMS, 1):
        print(f"\n=== [{i}/{len(SEED_FIRMS)}] {f['firm_name']} ===")
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
