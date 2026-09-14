import React, { useState } from "react";

const EXAMPLES = [
  { name: "Peak XV Partners",   geo: "India / SEA",  stage: "growth" },
  { name: "Blume Ventures",     geo: "India",        stage: "seed / series A" },
  { name: "Kedaara Capital",    geo: "India",        stage: "private equity / buyout" },
  { name: "East Ventures",      geo: "Southeast Asia (Indonesia)", stage: "seed / early" },
  { name: "Openspace Ventures", geo: "Southeast Asia (Singapore)", stage: "series A / growth" },
];

export default function ProfileForm({ initial = {}, onSubmit, running, onCancel }) {
  const [firm, setFirm] = useState(initial.firm_name || "");
  const [geo, setGeo] = useState(initial.geography || "");
  const [sector, setSector] = useState(initial.sector_focus || "");
  const [stage, setStage] = useState(initial.stage_focus || "");

  const pick = (ex) => { setFirm(ex.name); setGeo(ex.geo); setStage(ex.stage); };

  return (
    <div className="card raise">
      <div className="row space">
        <div>
          <div className="kicker">Profile generator</div>
          <h2>Research a fund manager</h2>
        </div>
        <span className="badge">langgraph · sse · sourced</span>
      </div>

      <form onSubmit={(e) => {
        e.preventDefault();
        if (!running && firm.trim().length >= 2) {
          onSubmit({
            firm_name: firm.trim(),
            geography: geo.trim(),
            sector_focus: sector.trim(),
            stage_focus: stage.trim(),
          });
        }
      }}>
        <label>
          <span className="lbl">Fund / firm name <span className="req">*</span></span>
          <input value={firm} onChange={e => setFirm(e.target.value)}
                 placeholder="e.g. Peak XV Partners, Sequoia Capital India" />
        </label>
        <div className="grid2" style={{ marginTop: 12 }}>
          <label>
            <span className="lbl">Geography (optional)</span>
            <input value={geo} onChange={e => setGeo(e.target.value)}
                   placeholder="India, SEA, Indonesia…" />
          </label>
          <label>
            <span className="lbl">Sector focus (optional)</span>
            <input value={sector} onChange={e => setSector(e.target.value)}
                   placeholder="fintech, SaaS, consumer…" />
          </label>
          <label>
            <span className="lbl">Stage focus (optional)</span>
            <input value={stage} onChange={e => setStage(e.target.value)}
                   placeholder="seed, growth, buyout…" />
          </label>
        </div>
        <div className="row" style={{ marginTop: 16 }}>
          <button type="submit" className="btn" disabled={running || firm.trim().length < 2}>
            {running ? "Profiling…" : "Run 3-agent pipeline"}
          </button>
          {running && (
            <button type="button" className="btn ghost" onClick={onCancel}>Cancel</button>
          )}
        </div>
      </form>

      <div className="divider" />
      <div>
        <div className="lbl" style={{ marginBottom: 8 }}>Try an example</div>
        <div className="row">
          {EXAMPLES.map((ex, i) => (
            <button key={i} type="button" className="tnav-btn"
                    onClick={() => pick(ex)}>{ex.name}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
