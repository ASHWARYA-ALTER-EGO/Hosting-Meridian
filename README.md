# Meridian

An AI analyst for India + Southeast Asia private markets. Type a fund manager's name; a 3-agent pipeline researches them, structures the findings into a strict Postgres schema with per-field confidence, produces an analyst-grade takeaway, and files it in a shared tracker you can query with natural language.

Built explicitly to solve a problem Lanmea Capital has publicly said it needs solved.

**Live demo:** https://meridian-fund-manager.pages.dev
**Repo:** the one you're looking at

---

## Why I built this

I applied to Lanmea's AI & Software Engineering Internship. Rather than send a resume and hope, I built the thing they said they need.

Two direct quotes from Lanmea:

> "Research and profile PE/VC fund managers, build databases, use AI to create tools and trackers."
> ...Lanmea Investment Intern listing

> "A more independent and timely view of markets, fund managers, companies, deals and risks."
> ...Lanmea Capital, About page

Meridian is that view. Every fact is source-linked. Every field carries confidence. Every profile stays current on re-run. And you can *ask* the tracker questions in plain English.

---

## What it actually does

1. **Ask Meridian anything** (top-nav search bar, ⌘K to open). Global RAG over every firm's sourced findings. "Which India VCs invest in fintech?" "Compare Peak XV and Blume." "Who backs Indonesian consumer startups?" Answers are grounded in the tracker's own database, cited [n], firm names clickable.
2. **Profile a firm.** The 3-agent LangGraph pipeline generates targeted web queries, executes them through Tavily, extracts sourced facts, structures them with confidence flags, and writes a one-page analyst-ready profile. Streams live over SSE.
3. **Read the analyst takeaway.** Every profile leads with a 3-bullet inference block ("Growth-tilt confirmed: Fund IX is 47% larger…") and a 2-sentence investment thesis pullquote. The difference between a database and an analyst.
4. **See who's most similar.** Every profile shows the 3 most comparable firms in the tracker, scored by sector / stage / geography overlap, one-line differentiator each.
5. **Compare firms side-by-side + LLM diff.** Pick 2–4 firms from the tracker → parallel columns of their fact sheets, plus an auto-generated "what actually distinguishes these" analysis at the top.
6. **Track deals and activity.** Every notable investment, fund close, exit, and leadership move is a first-class row in Postgres. Filter by firm, kind, company or year. Cross-firm portfolio overlaps auto-detected. Deal-frequency sparkline on every tracker row.
7. **Live signal card.** "3 fund closes in the last 90 days" + list of most-recently-updated firms right on the Overview page.
8. **Analyst notes per firm.** Textarea, auto-saved to the backend on debounce.
9. **Watchlist.** Star firms locally; persisted per browser.
10. **Chat with one firm's findings** (RAG scoped to that firm). Every answer cites the specific findings used.
11. **Export.** Any profile → CSV, Markdown, or print-styled PDF.
12. **Weekly automation.** A GitHub Action hits `/api/refresh` every Monday to re-profile firms older than 7 days.

---

## Architecture, in one screen

```
┌──────────────────────────────────────────────────────────────────────┐
│  Vite + React SPA (Cloudflare Pages)                                 │
│    Overview (Hero + Pipeline + Signal + Tracker + Trust)             │
│    Tracker · Deals · Activity · Overlaps                             │
│    Profile generator · Saved profile · Compare · AskChat · Notes     │
│    Global Ask Meridian bar in top nav (⌘K)                           │
└──────────────────────┬───────────────────────────────────────────────┘
                       │  HTTPS + X-API-Key
┌──────────────────────▼───────────────────────────────────────────────┐
│  FastAPI backend (Railway, Docker, non-root user, --proxy-headers)   │
│    /api/profile           3-agent LangGraph pipeline, SSE            │
│    /api/managers[/{id}]   tracker CRUD, upsert by firm_name          │
│    /api/managers/{id}/note   PUT persistent analyst notes            │
│    /api/managers/{id}/ask    RAG scoped to that firm                 │
│    /api/ask-global        RAG across ALL firms                       │
│    /api/comparables/{id}  3 most similar firms                       │
│    /api/compare-diff      LLM-generated diff over 2-4 firms          │
│    /api/compare           parallel profiles for side-by-side         │
│    /api/signals           tracker-wide activity signal (last N days) │
│    /api/firms/{id}/timeline  deals-per-year for sparklines           │
│    /api/deals             first-class deals table, filterable        │
│    /api/overlaps          portfolio cross-reference                  │
│    /api/activity          cross-firm activity feed                   │
│    /api/refresh           re-profile stale rows (cron target)        │
│    /api/managers/{id}/export.{csv,md}                                │
│                                                                      │
│  Middleware: CORS, security headers, per-IP rate limiting (slowapi), │
│  optional shared-secret gate on POST /api/profile.                   │
│  Logging: stdlib structured. Tavily retry: 3× exponential backoff.   │
└──────────────────────┬───────────────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┬───────────────┐
        ▼              ▼              ▼               ▼
   PostgreSQL      OpenAI          Tavily         GitHub Action
   fund_managers   (structured     (web search)   weekly cron
   deals           JSON output +                  hits /api/refresh
   findings        analyst
   people          takeaway)
```

Full design defence in [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## The pipeline, in more detail

Three cooperating agents, deterministic order, LangGraph state machine.

**1. Research agent** generates 5–7 targeted queries per firm (fund history, AUM, portfolio, leadership, sector thesis, recent activity), fires each through Tavily with 3× exponential-backoff retry, and asks the LLM to extract atomic facts, each with the source URL it came from.
Output: 8–20 sourced findings.

**2. Structuring agent** converts findings to a strict JSON profile:
```json
{
  "aum": { "value": "$2.85B", "confidence": "verified", "source": "..." },
  "sectors": { "value": ["fintech", "SaaS"], "confidence": "inferred", "source": "..." },
  ...
  "investment_thesis": "Peak XV writes $10-50M growth-stage checks with strong AI conviction; 15-20 investments per year, prefers founder-led follow-ons.",
  "notable_portfolio": [...],
  "leadership": [...],
  "recent_activity": [...]
}
```
Then a second small LLM call produces the 3-bullet analyst takeaway — sharp inferences, not fact restates. Numbers in the takeaway must appear in the profile.

**3. Writer agent** streams a one-page Markdown profile with the takeaway at the top, thesis as a pullquote, fact sheet, portfolio, leadership, activity, and "what to watch."

Every stage streams progress + output over SSE to the browser: `phase`, `queries`, `findings`, `profile`, `report_chunk`, `report_done`, `saved`.

---

## What's inside

```
Lanmea/
  backend/
    Dockerfile              # Railway-ready, non-root user
    railway.json            # deploy config
    requirements.txt        # includes psycopg2-binary, slowapi, pytest
    seed_managers.py        # 20 real India / SEA firms
    tests/                  # pytest smoke tests
    app/
      main.py               # FastAPI assembly + middleware
      config.py             # env loading
      database.py           # SQLAlchemy: FundManager, Deal, Person, Finding
      llm.py                # OpenAI / Anthropic client wrapper
      search.py             # Tavily wrapper with retry + backoff
      logging_setup.py      # structured logs
      security.py           # rate limiter, security headers, API-key gate
      pipeline/
        research.py         # agent 1: queries + sourced facts
        structuring.py      # agent 2: JSON schema + confidence + takeaway
        writer.py           # agent 3: one-page Markdown profile
        graph.py            # LangGraph wiring
      routes/
        evaluate.py         # POST /api/profile (SSE), /api/managers, /api/notes
        analytics.py        # /api/compare, /overlaps, /activity, exports
        deals.py            # /api/deals (first-class table)
        ask.py              # /api/managers/{id}/ask + /api/ask-global (RAG)
        insights.py         # /api/comparables, /compare-diff, /signals, /timeline
        automation.py       # /api/refresh (cron target)
  frontend/
    package.json
    src/
      App.jsx               # thin router + top nav with AskBar
      styles.css            # design system (light theme, print stylesheet)
      config.js             # API base URL + optional key
      api.js                # fetch helpers for every backend route
      components/
        AskBar.jsx          # ⌘K global RAG modal
        Hero.jsx            # full-bleed WebGL hero + India/SEA map
        WorldMap.jsx        # region-cropped Asia + SEA coverage map
        SignalCard.jsx      # tracker-wide "what's moving"
        TrackerTable.jsx    # with sparklines + watch stars
        DealsSparkline.jsx
        WatchStar.jsx
        StatStrip.jsx
        TakeawayCard.jsx    # thesis pullquote + 3-bullet analyst take
        Comparables.jsx     # 3 most similar firms per profile
        CompareView.jsx     # side-by-side table
        CompareDiff.jsx     # LLM diff over 2-4 firms
        ProfileHero.jsx     # equity-research-style profile header
        ProfileView.jsx     # composes all profile sections
        AskChat.jsx         # scoped RAG chat per firm
        NotePanel.jsx       # analyst notes, auto-saved
        ExportBar.jsx       # CSV / Markdown / print
        PipelineStatus.jsx  # live pipeline card with progress bar + timer
        ...
      pages/                # one file per top-level view
        OverviewPage.jsx
        TrackerPage.jsx
        DealsPage.jsx
        ActivityPage.jsx
        OverlapsPage.jsx
        NewProfilePage.jsx
        SavedProfilePage.jsx
        ComparePage.jsx
      data/
        seedFirms.js        # 20 real firms shipped as fallback fixtures
  .github/workflows/
    refresh.yml             # weekly cron
  ARCHITECTURE.md
  README.md
```

---

## Getting it running locally

Python 3.11+, Node 18+, OpenAI + Tavily keys.

**Backend:**
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate                # Windows
# source .venv/bin/activate           # macOS / Linux
pip install -r requirements.txt
copy .env.example .env                # then fill in your keys
uvicorn app.main:app --reload --port 8000
```

**Seed the tracker** (second terminal, same venv):
```bash
python seed_managers.py
```
Runs the pipeline against 20 real India + SEA firms. ~15 minutes. Idempotent.

**Frontend:**
```bash
cd frontend
npm install
copy .env.example .env
npm run dev
# open http://localhost:5173
```

---

## Deploying it live

Backend to Railway (Docker + Postgres plugin), frontend to Cloudflare Pages (Vite build). Full walkthrough in [ARCHITECTURE.md § Deployment](./ARCHITECTURE.md#deployment).

Short version:
1. **Railway** → deploy from GitHub, Root Directory `backend`, Dockerfile Path `Dockerfile`.
2. Add Postgres plugin, reference its `DATABASE_URL` on the backend service.
3. Backend env: `LLM_PROVIDER=openai`, `OPENAI_API_KEY`, `TAVILY_API_KEY`, `ALLOWED_ORIGINS=<your-pages-url>`, `API_KEY=<random>`.
4. Once green, seed once from local against the public Postgres URL:
   ```powershell
   $env:DATABASE_URL="postgresql://...public URL from Railway..."
   $env:OPENAI_API_KEY="..."; $env:TAVILY_API_KEY="..."
   python seed_managers.py
   ```
5. **Cloudflare Pages** → framework preset Vite, build `npm run build`, output `dist`.
6. Env: `VITE_API_BASE_URL=https://<your-railway-url>`, `VITE_API_KEY=<same as backend>`.

The frontend ships 20 real firms as fallback fixtures so the tracker is populated the instant the page loads, even before seeding runs.

---

## What sets this apart

Most "AI profiler" side projects stop at generating a summary. Meridian goes past that:

* **Analyst view, not data dump.** Every profile leads with a 3-bullet inference and a thesis pullquote generated after structuring, so the reader gets analysis before facts.
* **RAG as the front door, not a hidden feature.** The Ask Meridian bar is in the top nav, ⌘K opens it from anywhere. Runs retrieval across every firm's findings and grounds every answer with citations.
* **Cross-firm comparability.** Comparables panel on every profile. LLM-generated diff on the compare page. Portfolio-overlap detection across all firms. These are the queries analysts actually need.
* **First-class entities, not JSON blobs.** Deals, people, findings each get their own Postgres table with FKs, so cross-firm queries are cheap SQL, not application-layer JSON scans.
* **Live signal card + sparklines** turn the tracker from a directory into something that reads as *alive*.
* **Analyst notes** are persisted per firm so the tool remembers what you thought last time.

---

## Design principles I stuck to

1. **Sourced or silent.** Every non-empty field cites a specific URL from the research pass. Nothing rendered as verified without an attributed source.
2. **Confidence, not vibes.** Fields are tagged verified / inferred / unknown so an analyst sees at a glance which numbers to trust.
3. **A tracker, not a lookup.** Every profile is upserted, refreshable in place. The database is the product.
4. **No fabrication in the UI even at empty state.** Seed rows are marked as `seed` badges, not passed off as generated profiles. AUM is only shown for firms where the number is publicly reported.

---

## Build-vs-buy summary

Full detail in [ARCHITECTURE.md](./ARCHITECTURE.md).

| Decision | I picked | Because |
|---|---|---|
| Agent orchestration | LangGraph | Explicit state graph, right shape for a fixed 3-node pipeline |
| Web search | Tavily | Purpose-built for LLM retrieval, clean snippets, right price for this volume |
| LLM provider | OpenAI (Anthropic as fallback) | `gpt-4o-mini` sufficient for structuring + writing, cheap and fast |
| Vector DB / RAG | None. Keyword-overlap ranking over `findings` table | Per-firm findings are small enough that a vector index adds infra without accuracy gain. pgvector on the same Postgres is the natural next step if search across all firms grows |
| Streaming | Server-Sent Events | Simpler than WebSockets for one-way progress |
| Database | Postgres in prod, SQLite locally | Same SQLAlchemy models both ways |
| Backend | FastAPI | Native async, first-class Pydantic, small Docker footprint |
| Frontend | Vite + React (plain, no Next.js) | No SSR needed, static build fits Cloudflare Pages |
| Container | Hand-rolled Dockerfile, not Nixpacks | Control over Python version, non-root user, CMD |
| Auth | Optional shared-secret X-API-Key | Full JWT is overkill for a demo; enough to protect LLM budget |
| Rate limiting | slowapi in-process | No Redis needed for single-replica |

---

## What's next (v0.4)

* True cross-source confidence — compute deterministically from findings rather than let the LLM self-report.
* pgvector on the `findings` table for semantic search across all firms (natural upgrade path from the current keyword-overlap retrieval).
* `people` promoted to first-class rows with cross-firm join (co-investor networks).
* Public per-firm URL slugs so profiles are shareable as `/firms/peak-xv-partners`.
* Alerts feed when a refresh detects a delta (new fund close, big new bet) worth surfacing.

---

## Honest caveats

* Fact quality is bounded by Tavily. Small or opaque firms come back thin.
* AUM figures pulled from press coverage tend to lag actual size by a fund cycle. Trust the confidence chip.
* The `verified` confidence label is LLM-assigned based on how many findings agree — an honest v2 would count them deterministically.
* This is a portfolio project built for one specific job application. Not production-grade software.

---

Built for the Lanmea Group AI & Software Engineering Internship application, September 2026.
