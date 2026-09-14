import React, { useEffect, useState } from "react";
import { getOverlaps } from "../api";

export default function OverlapsView({ onSelectFirm }) {
  const [data, setData] = useState({ total: 0, overlaps: [] });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    setLoading(true); setErr("");
    getOverlaps().then(setData).catch(e => setErr(e.message)).finally(() => setLoading(false));
  }, []);

  const filtered = q
    ? data.overlaps.filter(o => o.company.toLowerCase().includes(q.toLowerCase()))
    : data.overlaps;

  return (
    <>
      <div className="section-title">
        <div>
          <div className="kicker">Cross-portfolio analysis</div>
          <h2>Portfolio overlaps</h2>
          <div className="sub">
            Meridian cross-references every firm's <em>notable portfolio</em>
            field and surfaces companies backed by two or more tracked funds.
            Useful for spotting co-investment patterns, syndicate behaviour,
            and consensus bets. Company names are normalised (Inc / Pvt Ltd
            / Limited stripped) so variants collapse.
          </div>
        </div>
      </div>

      <div className="strip">
        <div className="strip-cell">
          <div className="strip-k">Overlapping companies</div>
          <div className="strip-v">{data.total}</div>
          <div className="strip-note">across the current intelligence base</div>
        </div>
        <div className="strip-cell">
          <div className="strip-k">Most-shared</div>
          <div className="strip-v" style={{ fontSize: 22 }}>
            {data.overlaps[0]?.company || "-"}
          </div>
          <div className="strip-note">
            {data.overlaps[0] ? `${data.overlaps[0].firm_count} firms` : "add more firms to surface overlaps"}
          </div>
        </div>
      </div>

      <div className="card raise">
        <div className="tracker-hdr">
          <div>
            <div className="kicker">Overlap map</div>
            <h3>Who invested in whom</h3>
          </div>
          <input placeholder="Filter companies…" value={q} onChange={e => setQ(e.target.value)}
                 style={{ maxWidth: 260 }} />
        </div>

        {err && <div className="err">Error: {err}</div>}
        {loading ? (
          <div className="hint center" style={{ padding: 20 }}>Computing overlaps…</div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <div className="empty-title">No overlaps yet</div>
            <div className="hint">
              Overlaps surface once several firms have been profiled. Add 3–5 more
              firms to the tracker and this view fills in automatically.
            </div>
          </div>
        ) : (
          <div className="overlap-grid">
            {filtered.map((o, i) => (
              <div className="overlap-card" key={i}>
                <div className="ov-hdr">
                  <div className="ov-name">{o.company}</div>
                  <span className="badge">{o.firm_count} firms</span>
                </div>
                <ul className="ov-firms">
                  {o.firms.map((f, j) => (
                    <li key={j}>
                      <button className="linkish" onClick={() => onSelectFirm?.(f.firm_id)}>
                        {f.firm_name}
                      </button>
                      {f.note && <span className="hint"> · {f.note}</span>}
                      {f.source && (
                        <> · <a href={f.source} target="_blank" rel="noreferrer" className="hint">src</a></>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
