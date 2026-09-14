import React, { useEffect, useState } from "react";
import { compareManagers } from "../api";

function ConfChip({ conf }) {
  const c = (conf || "unknown").toLowerCase();
  return <span className={`chip dot chip-conf-${c}`}>{c}</span>;
}
function valOf(f) {
  if (!f) return "—";
  const v = f.value;
  if (v == null || v === "") return "—";
  return Array.isArray(v) ? (v.length ? v.join(", ") : "—") : String(v);
}

const ROWS = [
  { key: "headquarters",    label: "Headquarters" },
  { key: "geography_focus", label: "Geography focus" },
  { key: "aum",             label: "AUM" },
  { key: "fund_vintages",   label: "Fund vintages" },
  { key: "sectors",         label: "Sectors" },
  { key: "stages",          label: "Stages" },
];

export default function CompareView({ ids, onBack }) {
  const [firms, setFirms] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ids?.length) return;
    setLoading(true); setErr("");
    compareManagers(ids)
      .then(setFirms)
      .catch(e => setErr(e.message || "Failed"))
      .finally(() => setLoading(false));
  }, [ids]);

  const cols = firms.length || ids.length;

  return (
    <>
      <div className="row space">
        <div className="section-title" style={{ padding: 0 }}>
          <div>
            <div className="kicker">Comparison</div>
            <h2>Side-by-side · {cols} firms</h2>
            <div className="sub">Every fact carries a confidence chip; every source is one click away.</div>
          </div>
        </div>
        <button className="btn ghost sm" onClick={onBack}>← Back to tracker</button>
      </div>

      {err && <div className="err">Error: {err}</div>}
      {loading ? (
        <div className="card center hint">Loading comparison…</div>
      ) : (
        <div className="card raise" style={{ padding: 0, overflow: "hidden" }}>
          <div className="cmp-scroll">
            <table className="cmp">
              <thead>
                <tr>
                  <th className="cmp-lbl"></th>
                  {firms.map(f => (
                    <th key={f.id}>
                      <div className="cmp-firm">
                        <div className="cmp-firm-name">{f.firm_name}</div>
                        {f.summary && <div className="cmp-firm-sub">{f.summary}</div>}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map(row => (
                  <tr key={row.key}>
                    <td className="cmp-lbl">{row.label}</td>
                    {firms.map(f => {
                      const field = f.profile?.[row.key];
                      return (
                        <td key={f.id}>
                          <div className="cmp-val">{valOf(field)}</div>
                          <div className="cmp-foot">
                            <ConfChip conf={field?.confidence} />
                            {field?.source
                              ? <a href={field.source} target="_blank" rel="noreferrer" className="hint">source ↗</a>
                              : <span className="hint">no source</span>}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr>
                  <td className="cmp-lbl">Notable portfolio</td>
                  {firms.map(f => (
                    <td key={f.id}>
                      <ul className="cmp-list">
                        {(f.profile?.notable_portfolio || []).slice(0, 6).map((p, i) => (
                          <li key={i}>
                            <b>{p.name}</b>{p.note ? <span className="hint"> — {p.note}</span> : null}
                          </li>
                        ))}
                        {!(f.profile?.notable_portfolio || []).length && <li className="hint">—</li>}
                      </ul>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="cmp-lbl">Leadership</td>
                  {firms.map(f => (
                    <td key={f.id}>
                      <ul className="cmp-list">
                        {(f.profile?.leadership || []).slice(0, 6).map((p, i) => (
                          <li key={i}>
                            <b>{p.name}</b>{p.role ? <span className="hint">, {p.role}</span> : null}
                          </li>
                        ))}
                        {!(f.profile?.leadership || []).length && <li className="hint">—</li>}
                      </ul>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="cmp-lbl">What to watch</td>
                  {firms.map(f => (
                    <td key={f.id}>
                      <div className="cmp-watch">{f.profile?.what_to_watch || "—"}</div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
