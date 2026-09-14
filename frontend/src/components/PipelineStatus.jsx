import React from "react";

const PHASES = [
  { key: "research",  label: "Research"  },
  { key: "structure", label: "Structure" },
  { key: "write",     label: "Write"     },
];

export default function PipelineStatus({ phase, phaseStatus, queries, findingsCount, running }) {
  const activeIdx = PHASES.findIndex(p => p.key === phase);
  return (
    <div className="livebar fade-in">
      <div className="phases">
        {PHASES.map((p, i) => {
          const state = i < activeIdx ? "done" : i === activeIdx ? "active" : "pending";
          return (
            <React.Fragment key={p.key}>
              <div className={`phase phase-${state}`}>
                <span className="dot" /> {p.label}
              </div>
              {i < PHASES.length - 1 && <span className="phase-arrow">→</span>}
            </React.Fragment>
          );
        })}
      </div>
      {(phaseStatus || running) && (
        <div className="status-line">
          {running && <span className="spinner" />}
          <span>{phaseStatus || "waiting…"}</span>
        </div>
      )}
      <div className="row" style={{ gap: 20 }}>
        {queries?.length > 0 && (
          <span className="hint"><b style={{ color: "var(--text-dim)" }}>{queries.length}</b> search queries dispatched</span>
        )}
        {findingsCount > 0 && (
          <span className="hint"><b style={{ color: "var(--text-dim)" }}>{findingsCount}</b> sourced findings extracted</span>
        )}
      </div>
      {queries?.length > 0 && (
        <details className="queries">
          <summary className="hint" style={{ cursor: "pointer" }}>Show search queries</summary>
          <ul style={{ margin: "8px 0 0 18px", padding: 0, color: "var(--text-dim)", fontSize: 12.5, lineHeight: 1.7 }}>
            {queries.map((q, i) => <li key={i}>{q}</li>)}
          </ul>
        </details>
      )}
    </div>
  );
}
