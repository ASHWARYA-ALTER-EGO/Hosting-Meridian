# Architecture and Build-vs-Buy Decisions

This is the design doc I would have written on day one if I were joining a team and had to defend every choice. Every recommendation Lanmea's JD calls "build-versus-buy" is a real call I made here.

Written from my point of view; opinions are mine.

---

## System overview

Meridian is a three-tier system:

1. **A React SPA** served as a static build from Cloudflare Pages.
2. **A FastAPI backend** deployed as a Docker container on Railway.
3. **A managed Postgres** on Railway.

Two external services do the heavy lifting: **OpenAI** for LLM calls, **Tavily** for web search. Everything else is code I own.

```
[ Browser ] ──HTTPS──> [ Cloudflare Pages ] (static React)
                                │
                                │ fetch() with X-API-Key header
                                ▼
[ Railway ] ─────> [ FastAPI in Docker ]
                     ├── slowapi middleware (rate limiting per IP)
                     ├── security headers middleware
                     ├── CORS
                     ├── SSE streaming endpoint (POST /api/profile)
                     ├── LangGraph 3-node pipeline
                     │      research → structure → write
                     ├── SQLAlchemy models
                     └──> Postgres (fund_managers, deals, findings, people)
                     
                     └──> OpenAI (gpt-4o-mini)
                     └──> Tavily (web search)
```

---

## Data model

Four tables:

```
fund_managers (one row per firm, upserted by lowercased firm_name)
  id, firm_name, firm_name_key, headquarters, geography_focus,
  aum_usd_m, aum_display, fund_vintages, sectors, stages,
  profile_json, findings_json, profile_md, summary,
  created_at, updated_at

deals (one row per notable investment or activity event)
  id, firm_id (FK), company_name, company_name_key,
  kind ('investment' | 'fund_close' | 'exit' | 'leadership' | 'other'),
  note, date_str, source_url, created_at

people (leadership / partners, one row per person per firm)
  id, firm_id (FK), name, role, source_url, created_at

findings (raw sourced facts from the research node)
  id, firm_id (FK), topic, fact, source_url, created_at
```

`fund_managers.profile_json` still carries the full structured profile for backwards compatibility and for the rendering layer, but the important entities (`deals`, `people`, `findings`) are now real rows with foreign keys. This is what makes cross-firm queries like "which companies did more than one firm invest in" or "how many deals last quarter across the tracker" cheap instead of scanning every profile blob.

I made this call because the JD line I care most about is "structuring data and pipelines that turn what we learn into a durable, queryable advantage". You cannot have a queryable advantage if your data lives in JSON blobs.

---

## Pipeline design

The pipeline is a LangGraph state machine with three nodes in strict sequence. State is a plain TypedDict passed forward through each node.

```
initial state ──▶ [research] ──▶ [structure] ──▶ [write] ──▶ END
                      │              │              │
                      └── emits SSE events at every meaningful step ──┘
```

**Research node** takes the firm name and generates 3 to 5 targeted queries covering fund history, AUM, portfolio, leadership, sector thesis, vintage. It fires each query through Tavily and asks the LLM to extract atomic facts, each with a source URL. Output is 8 to 20 facts. Nothing without a source survives.

**Structure node** takes those facts and produces a strict JSON object matching the profile schema. Each field carries a confidence flag (`verified`, `inferred`, or `unknown`) which the LLM assigns based on how many independent findings support it. The output is validated field-by-field before persistence.

**Write node** takes the structured profile and emits a one-page Markdown document. The prompt is constrained to reproduce only the values already in the structured profile so the writer cannot invent new facts.

Every node emits SSE events (`phase`, `queries`, `findings`, `profile`, `report_chunk`, `report_done`, `saved`) that the frontend consumes in real time.

**Why LangGraph and not raw LangChain runnables:** the 3-node pipeline has explicit state that all three nodes read and write. LangGraph's `StateGraph` makes the state contract obvious in code. With plain runnables I'd end up building the same thing myself, less legibly.

**Why not agents that decide their own next step:** for this problem the flow is deterministic. Research always precedes structuring always precedes writing. An autonomous ReAct-style agent would add latency, cost, and unpredictability with no upside.

---

## Build-vs-buy decisions

Each of these was a fork in the road. I picked one and I know why.

### Agent orchestration: LangGraph, not LangChain runnables, not homemade

LangGraph gives you a real state graph with typed nodes and edges. That fits my pipeline exactly. LangChain runnables would work but require me to invent the state contract. A homemade orchestrator is fine for two nodes; at three it starts to feel like reinventing what LangGraph gives you free.

**When I'd change my mind:** if the pipeline needs conditional branching (e.g. "if the structuring node returns confidence too low, loop back to research"), LangGraph's edge functions make it easy. If I never need branching, plain sequential code would be more honest.

### Web search: Tavily, not Serper or SerpAPI

Tavily is built for LLM retrieval. One call returns cleaned snippets with URLs, no HTML parsing on my end. Serper is a bit cheaper per query but returns raw Google results that need scraping. For a demo running 20 seed firms plus occasional live queries, Tavily's cost is negligible and the DX is a lot better.

**When I'd change my mind:** at Lanmea scale (hundreds of firms refreshed weekly), the pricing math flips. Serper plus a scraping worker would win on unit economics.

### LLM provider: OpenAI, with Anthropic as fallback

`gpt-4o-mini` handles both the structuring JSON output and the Markdown writing at good enough quality for meaningful cost. My `llm.py` wraps both providers behind one interface so switching is a config change, not a code change.

**When I'd change my mind:** for the writer node specifically, Claude Sonnet produces noticeably better prose. If I were shipping this to real analysts I'd probably route the writer to Anthropic and keep structuring on OpenAI.

### Vector DB / RAG: none for the pipeline; keyword filter for chat

I deliberately skipped Pinecone / Weaviate / pgvector. Every firm's findings are 10 to 20 short rows. A keyword filter over those rows is a millisecond and involves no infra. Adding a vector DB would give me nothing on retrieval quality and a bigger AWS bill.

The ask-this-profile chat feature uses the same in-memory approach: it retrieves relevant findings by keyword overlap with the question, then hands them to the LLM as context. Zero vector infra, ticks the "RAG" line from the JD.

**When I'd change my mind:** the moment I want to search across all firms' findings ("find every firm that ever invested in a fintech in Indonesia"), a vector index over the `findings` table starts to make sense. pgvector on the same Postgres would be my first move because it avoids a new service.

### Streaming: Server-Sent Events, not WebSockets

The pipeline streams one way (backend to browser). SSE is a simple HTTP response with `Content-Type: text/event-stream` and `data: {...}\n\n` frames. No handshake, no message framing, no reconnect logic to write. The browser's `fetch` API can read the stream with `getReader()` cleanly.

**When I'd change my mind:** the day I want bidirectional streaming (chat during a running pipeline, cancel signals), WebSockets earn their complexity.

### Database: Postgres in production, SQLite locally

Same SQLAlchemy models both ways. SQLite in dev means no Docker Postgres or local install, zero ceremony to `pip install && uvicorn`. Postgres in prod because Railway offers it as a managed service, foreign keys and JSONB are real, and it's what a production system would use.

The switch is a one-line env var change (`DATABASE_URL=sqlite:///./lanmea.db` vs `postgresql://...`).

**When I'd change my mind:** if I need real full-text search or `pgvector`, SQLite falls short. That's when the whole team moves to Postgres locally too.

### Backend framework: FastAPI, not Django or Flask

FastAPI's native async, Pydantic validation, and OpenAPI auto-docs win. Django would give me an admin panel for free but I don't need one, and Django's ORM is heavier than SQLAlchemy for this size of schema. Flask would work but I'd end up bolting on Pydantic and async myself.

### Frontend framework: Vite + React, not Next.js

I don't need SSR. Every page is a client-rendered SPA hitting the same API. Vite gives me a faster dev loop, a smaller build, and a static output that Cloudflare Pages serves as flat files. Next.js is fine, but adds a Node runtime I don't need and complicates the deploy story.

**When I'd change my mind:** if SEO on public profile pages ever mattered (share a firm's profile as a link, want it indexed by Google), Next.js SSG would earn its keep.

### Deploy: Railway (Docker) for backend, Cloudflare Pages for frontend

Railway takes a Dockerfile and hosts the backend plus its Postgres in one project with wired env vars. No AWS console gymnastics. Cloudflare Pages does zero-config static hosting with a global CDN and free HTTPS.

The alternatives I considered:

* **Render.** Similar to Railway. Slightly slower cold starts on the free tier. Fine second choice.
* **Fly.io.** More power (multi-region, volume mounts) at the cost of more config. Overkill for this size.
* **AWS Fargate + RDS.** Best for real production. Terrible for a portfolio demo I want to ship in an evening.
* **Vercel (frontend).** Equivalent to Pages but tighter Next.js integration. I'm on Vite so Cloudflare fits better.

### Container: hand-rolled Dockerfile, not Nixpacks

Railway defaults to Nixpacks (autodetect). I wrote a proper `Dockerfile` because I want control over the Python version, the non-root user, and the CMD. It's 20 lines and I can reason about every one.

### Auth: optional shared-secret X-API-Key

Full JWT is what the reference codebase I ported patterns from uses. For this demo it's overkill. What I actually need is a way to stop random scripts from hammering the expensive `/api/profile` endpoint and burning my OpenAI budget.

The gate is off in dev (no env var), on in prod (`API_KEY` env var set to a random string). The frontend reads `VITE_API_KEY` and sends it as `X-API-Key`. Anyone with the URL can browse the tracker (reads are open); only `POST /api/profile` requires the key.

**When I'd change my mind:** the moment there are multiple analysts using this and I need per-user quotas or audit trails, JWT with real accounts is the answer.

### Rate limiting: slowapi (in-memory), not Redis

`slowapi` runs in-process, no Redis. Fine for one backend replica. If I scaled to N replicas each replica would enforce its own limits, so the true limit becomes N times the configured one. For a demo that's fine.

**When I'd change my mind:** the second I horizontally scale, I move to Redis-backed rate limiting.

### Observability: stdlib `logging` with a structured formatter, not Datadog or Sentry

Print statements are what the reference codebase had. I replaced them with the stdlib `logging` module, structured formatter, and one log line per pipeline node with the firm name and timing. Enough to grep Railway's log viewer for what happened.

**When I'd change my mind:** the moment this handles anyone else's money, I'd wire Sentry for exceptions and something like Grafana Cloud or Baselime for structured logs.

---

## Deployment

### Backend to Railway

1. Push repo to GitHub.
2. Railway → New project → Deploy from GitHub → pick repo, service root `Lanmea/backend`.
3. Railway reads `railway.json`, builds via `Dockerfile`, exposes port from `$PORT`.
4. Add a Postgres service in the same project. Railway sets `DATABASE_URL` on the backend automatically.
5. Backend env vars:
   * `LLM_PROVIDER=openai`
   * `OPENAI_API_KEY=sk-...`
   * `OPENAI_MODEL=gpt-4o-mini`
   * `TAVILY_API_KEY=tvly-...`
   * `ALLOWED_ORIGINS=https://your-cloudflare-pages.pages.dev`
   * `API_KEY=` a long random string, e.g. `openssl rand -hex 32`
6. Deploy. Healthcheck at `/health`. Wait for green.
7. Seed once: `railway run python seed_managers.py`.

### Frontend to Cloudflare Pages

1. Pages → Create → connect the same GitHub repo.
2. Root directory: `Lanmea/frontend`. Framework preset: Vite. Build command: `npm run build`. Output: `dist`.
3. Env vars:
   * `VITE_API_BASE_URL=https://your-service.up.railway.app`
   * `VITE_API_KEY=` (same value as backend `API_KEY`)
4. Deploy.

### Weekly refresh cron

The included GitHub Action at `.github/workflows/refresh.yml` runs every Monday at 04:00 UTC and hits `/api/refresh` with your API key. That endpoint re-profiles every firm older than 7 days.

Requires two GitHub Secrets on the repo:

* `MERIDIAN_API_URL` = your Railway URL
* `MERIDIAN_API_KEY` = same `API_KEY` value

---

## Security posture

* **CORS** locked to your Cloudflare Pages origin (plus `*.pages.dev` regex for preview deploys).
* **Security headers** applied to every response: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`.
* **Rate limiting** per IP via `slowapi`. Expensive endpoint (`POST /api/profile`) is capped at 5 per minute per IP. Reads are 30 to 60 per minute.
* **API-key gate** on the expensive endpoint. Random visitors can browse the tracker but cannot spend my LLM budget.
* **Input validation** via Pydantic with explicit `min_length` / `max_length` on every user string.
* **Non-root user** in the Docker image.
* **`--proxy-headers` on uvicorn** so client IPs from Railway's proxy actually reach the rate limiter (otherwise everyone would look like Railway's edge).

Things I did not do:

* No CSRF tokens (API is JSON-only, no cookies, no browser session).
* No Content-Security-Policy on the API (serves JSON and SSE, not HTML).
* No secrets scanning in CI. Would add for a real production project.

---

## Trade-offs I know I'm making

* **The `verified` confidence flag is self-reported by the LLM.** A rigorous version would compute it deterministically by counting overlapping findings that mention the same fact. I flagged this in the roadmap.
* **`recent_activity` in the profile JSON overlaps with the `deals` table.** For now both exist; the profile blob is what renders, the deals table is what queries. If I owned this for longer I'd normalise fully and drop the JSON copy.
* **The pipeline is single-threaded per request.** Three sequential LLM calls means ~40 seconds per profile. Parallelising research queries across the LLM would cut it to ~20 seconds. Not done because 40 seconds is fine for a demo.
* **No caching layer** on Tavily search results. Re-running the same firm within an hour spends fresh API calls. A Redis TTL cache would fix it in ~30 lines.
* **The frontend has no react-router.** Views are switched by local state. Fine for a demo, would break sharing a specific URL. Adding it is on the roadmap.

---

Written September 2026, in support of the Lanmea Group AI & Software Engineering Internship application.
