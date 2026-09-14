import React, { useState } from "react";
import { findFits } from "../lib/fundFit.js";

const EXAMPLES = [
  "Series A fintech in Indonesia, $8M raise",
  "Seed consumer D2C in India, ₹15Cr",
  "SaaS company selling to US enterprise, Series B",
  "Growth-stage healthcare business in Mumbai",
  "Deep-tech AI startup, Bengaluru, pre-Series A",
];

export default function FundFitSearch({ onSelectFirm }) {
  const [q, setQ] = useState("");
  const [result, setResult] = useState(null);

  const run = (text) => {
    const qq = (text ?? q).trim();
    if (qq.length < 5) return;
    if (text != null && text !== q) setQ(text);
    setResult(findFits(qq, 5));
  };

  return (
    <section className="fundfit fade-in d1">
      <div className="fundfit-hdr">
        <div className="kicker">Fund fit · match a startup to investors</div>
        <h2>Which firms would fund your startup?</h2>
        <div className="sub">
          Describe a company in one line. Meridian ranks the 5 most likely investors
          from the tracker, with a one-line reason for each match. Runs entirely on
          structured tracker data · no LLM call · instant.
        </div>
      </div>

      <form className="fundfit-form" onSubmit={(e) => { e.preventDefault(); run(); }}>
        <input
          placeholder="e.g. Series A fintech in Indonesia, $8M raise"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button className="btn" disabled={q.trim().length < 5}>Find matches</button>
      </form>

      {!result && (
        <div className="fundfit-suggest">
          <span className="hint">Try:</span>
          {EXAMPLES.map((s, i) => (
            <button key={i} className="askbar-chip" onClick={() => run(s)}>{s}</button>
          ))}
        </div>
      )}

      {result && (
        <div className="fundfit-results">
          <div className="fundfit-detected">
            <span className="hint">Detected:</span>
            {result.detected.sectors.map(s => <span key={s} className="chip chip-sector">{s}</span>)}
            {result.detected.stages.map(s => <span key={s} className="chip chip-stage">{s}</span>)}
            {result.detected.geographies.map(g => <span key={g} className="chip chip-geo">{g}</span>)}
            {!result.detected.sectors.length && !result.detected.stages.length && !result.detected.geographies.length && (
              <span className="hint">no signals detected · try adding sector, stage, or geography</span>
            )}
          </div>

          {result.fits.length === 0 ? (
            <div className="empty" style={{ marginTop: 12 }}>
              <div className="empty-title">No strong matches in the tracker</div>
              <div className="hint">Try broadening the description — add a sector, stage, or geography.</div>
            </div>
          ) : (
            <ol className="fundfit-list">
              {result.fits.map((f, i) => (
                <li key={f.id} className="fundfit-row"
                    onClick={() => onSelectFirm?.(f.id)}>
                  <div className="fundfit-rank">{String(i + 1).padStart(2, "0")}</div>
                  <div className="fundfit-body">
                    <div className="fundfit-name">{f.firm_name}</div>
                    <div className="fundfit-why">{f.why}</div>
                    <div className="fundfit-meta">
                      <span className="chip chip-geo">{f.geography_focus}</span>
                      <span className="chip chip-stage">{f.stages?.split(",")[0].trim()}</span>
                    </div>
                  </div>
                  <div className="fundfit-score">
                    <div className="fundfit-score-v">{f.score}</div>
                    <div className="fundfit-score-l">match</div>
                  </div>
                </li>
              ))}
            </ol>
          )}
          <button className="btn ghost sm" onClick={() => { setResult(null); setQ(""); }}>
            Try another
          </button>
        </div>
      )}
    </section>
  );
}
