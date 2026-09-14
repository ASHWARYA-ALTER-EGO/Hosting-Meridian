"""Smoke tests. No live LLM / Tavily calls.
Run: `pytest -q` from backend/."""
import os
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("LLM_PROVIDER", "openai")
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("TAVILY_API_KEY", "")   # search will noop

from fastapi.testclient import TestClient
from app.main import app
from app.database import init_db, SessionLocal, FundManagerProfile


def setup_module(_):
    init_db()


def test_health():
    client = TestClient(app)
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"ok": True}


def test_managers_empty_ok():
    client = TestClient(app)
    r = client.get("/api/managers")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_deals_endpoint_shape():
    client = TestClient(app)
    r = client.get("/api/deals")
    assert r.status_code == 200
    body = r.json()
    assert "deals" in body and "counts_by_kind" in body


def test_ask_returns_empty_when_no_findings(monkeypatch):
    # seed one firm row with zero findings
    db = SessionLocal()
    row = FundManagerProfile(firm_name="Acme VC", firm_name_key="acme vc",
                             profile_json="{}", findings_json="[]")
    db.add(row); db.commit(); db.refresh(row); rid = row.id; db.close()

    client = TestClient(app)
    r = client.post(f"/api/managers/{rid}/ask", json={"question": "What's their AUM?"})
    assert r.status_code == 200
    assert "No sourced findings" in r.json()["answer"]


def test_search_returns_empty_without_key():
    from app.search import web_search
    assert web_search("anything") == []


def test_pipeline_state_shape():
    from app.pipeline.state import PipelineState
    s: PipelineState = {"firm_name": "X"}
    assert s["firm_name"] == "X"
