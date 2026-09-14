# Meridian

An AI research analyst that profiles PE and VC fund managers across India and Southeast Asia, structures the findings into a queryable database, and tracks the private-markets landscape as it changes.

Built explicitly to solve a problem Lanmea Capital has publicly said it needs solved.

**Live demo:** https://YOUR-CLOUDFLARE-URL.pages.dev
**Sample profile:** https://YOUR-CLOUDFLARE-URL.pages.dev/#/firms/peak-xv-partners
**Repo:** the one you're looking at

---

## Why I built this

I applied to Lanmea's AI & Software Engineering Internship. Rather than send a resume and hope, I built the thing they said they need.

Two direct quotes from Lanmea:

> "Research and profile PE/VC fund managers, build databases, use AI to create tools and trackers."
> ...Lanmea Investment Intern listing

> "A more independent and timely view of markets, fund managers, companies, deals and risks."
> ...Lanmea Capital, About page

Meridian is that view. You give it a fund manager's name; three cooperating agents read the open web about the firm, structure what they find into a strict schema with per-field confidence flags, and file the result in a shared tracker. Every claim is sourced. Every field carries confidence. Every profile stays current the next time you re-run it.

The seed dataset is India + Southeast Asia focused (Peak XV, Blume, Kedaara, East Ventures, Openspace, Elevation, Accel India, 3one4, Jungle, Vertex SEA, Chiratae, Multiples, and more) so the tracker looks like a real intelligence base on first open, not an empty form.

---

## What it does

1. **Research a firm.** Type "Blume Ventures" and hit go. A 3-agent LangGraph pipeline generates targeted web queries, executes real searches through Tavily, extracts sourced facts, structures them into a strict schema with confidence flags, and writes a one-page analyst-ready profile. Every step streams live to the browser over Server-Sent Events.
2. **Save profiles into a tracker.** Every profile is upserted to Postgres, keyed on firm name. Re-running a firm refreshes the record in place with a new `last_updated` timestamp.
3. **Cross-firm analysis.** A live deals-and-activity feed rolls up every firm's recent activity into one reverse-chronological view. Portfolio-overlap detection surfaces companies backed by two or more tracked firms. Side-by-side comparison lets you pick 2 to 4 firms and see their fact sheets in parallel columns.
4. **Ask questions.** Every saved profile has a chat box that answers questions about that firm using only its sourced findings as context. No hallucinations from the general web; only what the pipeline actually cited.
5. **Export.** Any profile can be downloaded as CSV, Markdown, or PDF (browser print, styled as a proper one-pager with source URLs footnoted).
6. **Refresh on a schedule.** A GitHub Action can hit the `/api/refresh` endpoint weekly to re-profile everything older than 7 days, so the tracker stays current without anyone touching it.

---

## Architecture, in one screen

```
┌──────────────────────────────────────────────────────────────────────┐
│  Vite + React frontend (Cloudflare Pages)                            │
│    Overview page, Tracker, Activity feed, Overlaps, Deals,           │
│    Profile generator, Compare view, Saved profile + Ask chat.        │
│    Consumes SSE stream from /api/profile with a plain fetch reader.  │
└──────────────────────┬───────────────────────────────────────────────┘
                       │  HTTPS + X-API-Key (optional shared secret)
┌──────────────────────▼───────────────────────────────────────────────┐
│  FastAPI backend (Railway, Docker)                                   │
│    /api/profile     3-agent LangGraph pipeline, SSE                  │
│    /api/managers    tracker CRUD (list, get, upsert-on-refresh)      │
│    /api/compare     parallel profiles for side-by-side               │
│    /api/overlaps    portfolio cross-reference                        │
│    /api/activity    cross-firm reverse-chron feed                    │
│    /api/deals       first-class deals table, filterable              │
│    /api/managers/{id}/ask   RAG chat over that firm's findings       │
│    /api/managers/{id}/export.{csv,md}                                │
│    /api/refresh     re-profile stale rows (called by cron)           │
│                                                                      │
│  Middleware: CORS, security headers, per-IP rate limiting (slowapi), │
│  optional shared-secret gate on POST /api/profile.                   │
└──────────────────────┬───────────────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┬───────────────┐
        ▼              ▼              ▼               ▼
   PostgreSQL      OpenAI          Tavily         GitHub Action
   fund_managers   (structured     (web search)   weekly cron
   deals           JSON output)                   hits /api/refresh
   findings
```

Full explanation of the design choices is in [ARCHITECTURE.md](./ARCHITECTURE.md), including every build-vs-buy call I made and why.

---

## What's inside

```
Lanmea/
  backend/
    Dockerfile              # Railway-ready
    railway.json            # deploy config
    requirements.txt
    seed_managers.py        # 20 real India / SEA firms
    tests/                  # pytest smoke tests
    app/
      main.py               # FastAPI assembly + middleware
      config.py             # env loading
      database.py           # SQLAlchemy models: FundManager, Deal, Person
      llm.py                # OpenAI / Anthropic client wrapper
      search.py             # Tavily wrapper with retry
      logging_setup.py      # structured logs
      security.py           # rate limiter, headers, API-key gate
      pipeline/
        research.py         # agent 1: targeted queries + sourced facts
        structuring.py      # agent 2: JSON schema + confidence flags
        writer.py           # agent 3: one-page Markdown profile
        graph.py            # LangGraph wiring
      routes/
        evaluate.py         # POST /api/profile (SSE), /api/managers
        analytics.py        # /api/compare, /overlaps, /activity, exports
        deals.py            # /api/deals (first-class deals table)
        ask.py              # /api/managers/{id}/ask (RAG chat)
        automation.py       # /api/refresh (cron target)
  frontend/
    Dockerfile              # optional, if you don't use Pages
    package.json
    src/
      App.jsx               # thin router
      styles.css            # design system, print stylesheet
      components/           # BrandMark, Hero, WorldMap, PipelineStatus...
      pages/                # OverviewPage, TrackerPage, DealsPage, etc.
      hooks/useEvaluationStream.js
  .github/workflows/
    refresh.yml             # weekly cron that hits /api/refresh
  ARCHITECTURE.md           # build-vs-buy decisions
  README.md                 # this file
```

---

## Getting it running locally

You need Python 3.11+, Node 18+, an OpenAI key, and a Tavily key.

**Backend:**

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate                # PowerShell / cmd
# source .venv/bin/activate           # macOS / Linux
pip install -r requirements.txt
copy .env.example .env                # then edit .env with your keys
uvicorn app.main:app --reload --port 8000
```

**Seed the tracker** (in a second terminal, same venv):

```bash
python seed_managers.py
```

This runs the full pipeline against 20 real India + SEA firms. Takes about 15 minutes. Idempotent, so you can re-run it any time to refresh.

**Frontend:**

```bash
cd frontend
npm install
copy .env.example .env                # points at http://localhost:8000
npm run dev
```

Open http://localhost:5173.

---

## Deploying it live

I deployed the demo to Railway (backend, via Docker) and Cloudflare Pages (frontend, static). Roughly 10 minutes end to end. Full walkthrough is in [ARCHITECTURE.md](./ARCHITECTURE.md#deployment), but the short version:

**Backend on Railway:**
1. Add the repo, point at `Lanmea/backend` as the service root.
2. Railway sees `railway.json`, uses `Dockerfile`.
3. Add a Postgres plugin. Railway wires `DATABASE_URL` for you.
4. Set env vars: `LLM_PROVIDER`, `OPENAI_API_KEY`, `TAVILY_API_KEY`, `ALLOWED_ORIGINS` (your Pages URL), `API_KEY` (any random string).
5. Deploy. Healthcheck lives at `/health`.
6. Run the seed once: `railway run python seed_managers.py`.

**Frontend on Cloudflare Pages:**
1. Framework preset: Vite. Build command: `npm run build`. Output: `dist`.
2. Env vars: `VITE_API_BASE_URL` (your Railway URL), `VITE_API_KEY` (same string as backend `API_KEY`).
3. Deploy.

---

## Build-vs-buy calls I made

Full detail in [ARCHITECTURE.md](./ARCHITECTURE.md). Summary:

| Decision | I picked | Because |
|---|---|---|
| Agent orchestration | LangGraph | Explicit state graph, easier to reason about than LangChain runnables for a fixed 3-node pipeline |
| Web search | Tavily | Purpose-built for LLM retrieval, one API call returns clean snippets, cheaper than Serper for this volume |
| LLM provider | OpenAI (Anthropic as fallback) | Cheap, fast, `gpt-4o-mini` was sufficient for both structuring and writing |
| Vector DB / RAG | None for the pipeline, in-memory keyword filter for the chat | Findings per firm are small enough (10 to 20 rows) that a vector index is overkill and adds infra cost |
| Streaming | Server-Sent Events | Simpler than WebSockets for one-way progress; no message-framing worries |
| Database | Postgres in prod, SQLite locally | Same SQLAlchemy models both ways, no ceremony in dev |
| Backend | FastAPI | Native async, first-class Pydantic validation, small footprint in Docker |
| Frontend | Vite + React (plain, no Next.js) | No SSR needed, static build fits Cloudflare Pages, faster local dev |
| Deploy backend | Railway + Docker | One config file, Postgres one click away, matches the deploy pattern I already knew |
| Deploy frontend | Cloudflare Pages | Free tier, global CDN, no cold starts |
| Auth | Optional shared-secret X-API-Key | Full JWT is overkill for a demo, but I still need to stop random scripts from burning my OpenAI credits |

Every one of those calls has a "when I'd change my mind" note in [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## Design principles I stuck to

1. **Sourced or silent.** Every non-empty field on a profile cites a specific URL from the research pass. If nothing in the findings supports a claim, the field renders as a dash, never as an unattributed guess.
2. **Confidence, not vibes.** Fields are tagged `verified` (two or more independent findings agreed), `inferred` (a single supporting source), or `unknown`. An analyst can see at a glance which numbers to trust.
3. **A tracker, not a lookup.** Every profile is upserted to a real relational store. Re-run the same firm a month later and the record is refreshed in place, the way a live intelligence base actually works.

---

## What's next (v0.4 backlog)

Things I know are missing and would build next:

* True cross-source confidence: today the "verified" flag is assigned by the LLM based on how many findings mention a fact. A more honest v2 would compute it from the raw findings deterministically.
* `people` and `funds` as first-class tables joined to `fund_managers` (right now `people` are still per-firm rows in the leadership blob).
* An "alerts" feed: when a refresh detects a delta (new fund close, new leadership, big new portfolio bet), surface it as a change event on the tracker.
* Firm URL slugs so profiles are shareable as `/firms/peak-xv-partners`.
* Read-only cache layer for search results so re-runs cost less on repeat queries.

---

## Credits and honest caveats

* Fact quality is bounded by whatever Tavily surfaces. Small or opaque firms come back thin.
* AUM figures pulled from press coverage tend to lag actual size by a fund cycle. Treat everything with the `inferred` chip skeptically.
* The `recent_activity` field is whatever the LLM decided was newsworthy from the sources it saw. This is why the `deals` table exists as a separate first-class store; it's easier to reason about deals as rows than as prose bullets.
* This is a portfolio project built for one specific job application. It is not production-graded software.

---

Built for the Lanmea Group AI & Software Engineering Internship application, September 2026.
