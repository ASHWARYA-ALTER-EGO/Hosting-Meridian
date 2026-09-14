import React, { useEffect, useState } from "react";

const PHASES = [
  { key: "research",  label: "Research",  desc: "Querying the open web" },
  { key: "structure", label: "Structure", desc: "Building a strict schema" },
  { key: "write",     label: "Write",     desc: "Assembling the profile" },
];

function fmtElapsed(ms) {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export default function PipelineStatus({ phase, phaseStatus, queries, findingsCount, running }) {
  const activeIdx = PHASES.findIndex(p => p.key === phase);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!running) return;
    const t0 = Date.now();
    const id = setInterval(() => setElapsed(Date.now() - t0), 250);
    return () => clearInterval(id);
  }, [running]);

  const pct = activeIdx < 0 ? 0 : ((activeIdx + 0.6) / PHASES.length) * 100;

  return (
    <div className="livebar fade-in">
      <div className="lb-hdr">
        <div>
          <div className="kicker">Live pipeline</div>
          <div className="lb-status">
            {running && <span className="spinner" />}
            <span>{phaseStatus || (running ? "Starting…" : "Idle")}</span>
          </div>
        </div>
        <div className="lb-timer">
          <div className="lb-time">{fmtElapsed(elapsed)}</div>
          <div className="hint">elapsed</div>
        </div>
      </div>

      <div className="lb-progress"><div className="lb-progress-fill" style={{ width: `${pct}%` }} /></div>

      <div className="lb-phases">
        {PHASES.map((p, i) => {
          const state = i < activeIdx ? "done" : i === activeIdx ? "active" : "pending";
          return (
            <div key={p.key} className={`lb-phase lb-phase-${state}`}>
              <div className="lb-phase-num">{String(i + 1).padStart(2, "0")}</div>
              <div>
                <div className="lb-phase-label">{p.label}</div>
                <div className="lb-phase-desc">{p.desc}</div>
              </div>
              {state === "done" && <div className="lb-phase-check">✓</div>}
              {state === "active" && <div className="lb-phase-active-dot" />}
            </div>
          );
        })}
      </div>

      <div className="lb-metrics">
        <div className="lb-metric">
          <div className="lb-metric-v">{queries?.length || 0}</div>
          <div className="lb-metric-k">search queries</div>
        </div>
        <div className="lb-metric">
          <div className="lb-metric-v">{findingsCount}</div>
          <div className="lb-metric-k">sourced findings</div>
        </div>
        <div className="lb-metric">
          <div className="lb-metric-v">{activeIdx + 1}/{PHASES.length}</div>
          <div className="lb-metric-k">stages</div>
        </div>
      </div>

      {queries?.length > 0 && (
        <details className="lb-queries">
          <summary className="hint">Show {queries.length} search queries</summary>
          <ul>
            {queries.map((q, i) => <li key={i}><span className="mono hint">Q{i+1}</span> {q}</li>)}
          </ul>
        </details>
      )}
    </div>
  );
}
