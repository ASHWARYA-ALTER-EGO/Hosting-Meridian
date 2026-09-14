import React, { useState } from "react";

const EXAMPLES = [
  { name: "Peak XV Partners",     geo: "India / SEA",  stage: "growth",           tag: "$9B+ AUM · ex-Sequoia India" },
  { name: "Blume Ventures",       geo: "India",        stage: "seed / series A",  tag: "Bengaluru · early-stage" },
  { name: "Kedaara Capital",      geo: "India",        stage: "PE / buyout",      tag: "Mumbai · mid-market PE" },
  { name: "East Ventures",        geo: "Indonesia",    stage: "seed / early",     tag: "Jakarta · SEA seed leader" },
  { name: "Openspace Ventures",   geo: "Singapore",    stage: "series A / growth", tag: "Singapore · SEA growth" },
  { name: "Elevation Capital",    geo: "India",        stage: "early / growth",   tag: "Gurgaon · consumer + fintech" },
  { name: "Accel India",          geo: "India",        stage: "series A / B",     tag: "Bengaluru · Flipkart backer" },
  { name: "3one4 Capital",        geo: "India",        stage: "seed / series A",  tag: "Bengaluru · founder-led" },
  { name: "Jungle Ventures",      geo: "Singapore / India", stage: "series A / B", tag: "Singapore · pan-Asian" },
  { name: "Vertex Ventures SEA",  geo: "SEA",          stage: "seed / series B",  tag: "Singapore · Temasek-backed" },
  { name: "Chiratae Ventures",    geo: "India",        stage: "early / growth",   tag: "Bengaluru · deep-tech" },
  { name: "Multiples Alternate",  geo: "India",        stage: "PE / growth",      tag: "Mumbai · Renuka Ramnath" },
];

export default function ProfileForm({ initial = {}, onSubmit, running, onCancel }) {
  const [firm, setFirm]     = useState(initial.firm_name || "");
  const [geo, setGeo]       = useState(initial.geography || "");
  const [sector, setSector] = useState(initial.sector_focus || "");
  const [stage, setStage]   = useState(initial.stage_focus || "");

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
        <div className="row space" style={{ marginBottom: 10 }}>
          <div className="lbl">Try one of these fund managers</div>
          <span className="hint">{EXAMPLES.length} to choose from · scroll →</span>
        </div>
        <div className="examples-scroll">
          {EXAMPLES.map((ex, i) => (
            <button key={i} type="button" className="example-card"
                    onClick={() => pick(ex)}
                    title={`Prefill form with ${ex.name}`}>
              <div className="ex-name">{ex.name}</div>
              <div className="ex-tag">{ex.tag}</div>
              <div className="ex-meta">
                <span className="chip chip-geo">{ex.geo}</span>
                <span className="chip chip-stage">{ex.stage}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
