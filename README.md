# Lanmea Fund Manager Intelligence & Tracker

AI tool that researches, structures, and tracks India / Southeast-Asia PE & VC
fund managers. Built for the Lanmea Group internship application.

**3-agent LangGraph pipeline:**
1. **Research** — generates targeted web queries, extracts sourced facts (Tavily)
2. **Structure** — converts findings into a strict schema with per-field confidence + source URL
3. **Write** — produces a comparable one-page Markdown profile

**Tracker** — profiles are upserted by firm name, listed in a sortable/filterable dashboard.

---

## Local dev

### Backend
```bash
cd backend
python -m venv .venv && .venv\Scripts\activate       # or source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env    # fill in ANTHROPIC_API_KEY + TAVILY_API_KEY
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# open http://localhost:5173
```

### Seed the tracker with real India/SEA managers
```bash
cd backend
python seed_managers.py
```
Runs the full pipeline against 5 pre-listed firms (Peak XV, Blume, Kedaara,
East Ventures, Openspace Ventures). Idempotent — re-running refreshes rows.

---

## Deploy

### Backend on Railway
- Push this repo, create a Railway service from `backend/`
- Set env vars: `ANTHROPIC_API_KEY`, `TAVILY_API_KEY`, `DATABASE_URL` (Postgres),
  `ALLOWED_ORIGINS` (your Cloudflare Pages URL)
- Railway picks up `Procfile` / `railway.json`

### Frontend on Cloudflare Pages
- Build command: `npm run build`
- Build output: `dist`
- Env var: `VITE_API_BASE_URL` = your Railway backend URL

---

## API

- `POST /api/profile` — SSE stream; body `{firm_name, geography?, sector_focus?, stage_focus?}`
- `GET /api/managers?q=&geography=&sector=&sort=&order=` — list
- `GET /api/managers/{id}` — full profile with structured fields + raw findings
- `GET /health`

---

## Reuse from multi-agent-research-assistant
- LLM provider routing pattern (`llm.py`)
- SSE `data: {json}\n\n` endpoint shape + `getReader()` frontend hook
- SQLAlchemy session pattern
- Vite + React shell

Skipped: Neo4j, Pinecone, embeddings, JWT auth, OAuth, KG — none needed here.
