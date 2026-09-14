import React from "react";

/**
 * Visible mapping of Meridian's shipped capabilities to Lanmea's actual JD.
 * Sits on the Overview page so an interviewer sees the alignment before
 * scrolling deeper. Every row is a real, running feature in this app.
 */
const ROWS = [
  {
    jd: "Internal tools & full-stack solutions",
    delivered: "FastAPI + React SPA, Docker-deployed",
    where: "Every page you're on right now",
    status: "shipped",
  },
  {
    jd: "Data infrastructure & queryable advantage",
    delivered: "Normalised Postgres schema · fund_managers, deals, people, findings",
    where: "Tracker · Deals · Overlaps",
    status: "shipped",
  },
  {
    jd: "Applied AI · agents & workflows",
    delivered: "3-agent LangGraph pipeline · streaming over SSE",
    where: "+ New profile",
    status: "shipped",
  },
  {
    jd: "RAG · retrieval-augmented generation",
    delivered: "Ask-this-profile chat · grounded in sourced findings only",
    where: "Every saved profile",
    status: "shipped",
    badge: "RAG",
  },
  {
    jd: "Architecture · build vs buy",
    delivered: "ARCHITECTURE.md defending every technical decision",
    where: "In the repo",
    status: "shipped",
  },
  {
    jd: "Delivery · live environments",
    delivered: "Railway (Docker) backend + Cloudflare Pages frontend",
    where: "This URL",
    status: "shipped",
  },
  {
    jd: "Workflow automation",
    delivered: "Weekly GitHub Action re-profiles stale rows via /api/refresh",
    where: ".github/workflows/refresh.yml",
    status: "shipped",
  },
  {
    jd: "Cloud infrastructure",
    delivered: "Managed Postgres, container platform, CDN, CI cron",
    where: "Deployment layer",
    status: "shipped",
  },
  {
    jd: "Communication · write-ups & case studies",
    delivered: "README as case study + ARCHITECTURE.md with trade-off notes",
    where: "In the repo",
    status: "shipped",
  },
];

export default function CapabilitiesMatrix() {
  return (
    <section className="fade-in d2">
      <div className="section-title">
        <div>
          <div className="kicker">Capabilities · mapped to Lanmea's JD</div>
          <h2>What this ships against what you said you need.</h2>
        </div>
        <div className="sub">Every row is a live feature in this project.</div>
      </div>

      <div className="cap-grid">
        {ROWS.map((r, i) => (
          <div className="cap-row" key={i}>
            <div className="cap-check">
              <svg viewBox="0 0 20 20" width="14" height="14" aria-hidden>
                <path d="M4 10.5 L8.5 15 L16 6.5" fill="none" stroke="currentColor"
                      strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="cap-jd">
              <div className="cap-jd-line">{r.jd}</div>
              <div className="cap-where">{r.where}</div>
            </div>
            <div className="cap-delivered">
              {r.delivered}
              {r.badge && <span className="cap-badge">{r.badge}</span>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
