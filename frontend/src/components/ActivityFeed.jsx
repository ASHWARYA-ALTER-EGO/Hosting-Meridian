import React, { useEffect, useMemo, useState } from "react";
import { getActivity } from "../api";

export default function ActivityFeed({ onSelectFirm }) {
  const [data, setData] = useState({ total: 0, events: [], geographies: [] });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [geo, setGeo] = useState("");
  const [firm, setFirm] = useState("");

  useEffect(() => {
    setLoading(true); setErr("");
    getActivity({ geography: geo, firm })
      .then(setData).catch(e => setErr(e.message)).finally(() => setLoading(false));
  }, [geo, firm]);

  const grouped = useMemo(() => {
    const map = new Map();
    for (const e of data.events) {
      const y = (e.date || "").slice(0, 4) || "Undated";
      if (!map.has(y)) map.set(y, []);
      map.get(y).push(e);
    }
    return [...map.entries()];
  }, [data.events]);

  return (
    <>
      <div className="section-title">
        <div>
          <div className="kicker">Cross-firm feed</div>
          <h2>Deals &amp; activity</h2>
          <div className="sub">
            A single reverse-chronological view of every recent event captured
            in the tracker: fund closes, notable investments, exits, leadership
            moves. Filter by geography or firm; click any firm name to jump
            straight to its profile.
          </div>
        </div>
      </div>
      <div className="strip">
        <div className="strip-cell">
          <div className="strip-k">Events tracked</div>
          <div className="strip-v">{data.total}</div>
          <div className="strip-note">across all profiled firms</div>
        </div>
        <div className="strip-cell">
          <div className="strip-k">Geographies</div>
          <div className="strip-v">{data.geographies.length}</div>
          <div className="strip-note">{data.geographies.slice(0,3).join(", ") || "-"}</div>
        </div>
        <div className="strip-cell">
          <div className="strip-k">Years covered</div>
          <div className="strip-v">
            {new Set(data.events.map(e => (e.date || "").slice(0,4)).filter(Boolean)).size || "-"}
          </div>
          <div className="strip-note">distinct calendar years</div>
        </div>
        <div className="strip-cell">
          <div className="strip-k">Most recent</div>
          <div className="strip-v" style={{ fontSize: 22 }}>
            {data.events[0]?.date || "-"}
          </div>
          <div className="strip-note">{data.events[0]?.firm_name || "no events yet"}</div>
        </div>
      </div>

      <div className="card raise">
        <div className="tracker-hdr">
          <div>
            <div className="kicker">Feed</div>
            <h3>{data.total} events across the tracker</h3>
          </div>
          <div className="row">
            <select value={geo} onChange={e => setGeo(e.target.value)}>
              <option value="">All geographies</option>
              {data.geographies.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <input placeholder="Firm name filter…" value={firm}
                   onChange={e => setFirm(e.target.value)} style={{ maxWidth: 220 }} />
          </div>
        </div>

        {err && <div className="err">Error: {err}</div>}
        {loading ? (
          <div className="hint center" style={{ padding: 20 }}>Loading feed…</div>
        ) : data.events.length === 0 ? (
          <div className="empty">
            <div className="empty-title">No activity yet</div>
            <div className="hint">
              The feed populates from every profiled firm's "recent activity"
              section. Profile more firms to see the market move in one place.
            </div>
          </div>
        ) : (
          <div className="timeline">
            {grouped.map(([year, events]) => (
              <div className="tl-group" key={year}>
                <div className="tl-year"><span>{year}</span></div>
                <div className="tl-events">
                  {events.map((e, i) => (
                    <div className="tl-event" key={i}>
                      <div className="tl-date">{e.date || "-"}</div>
                      <div className="tl-dot" />
                      <div className="tl-body">
                        <div className="tl-headline">
                          <button className="linkish" onClick={() => onSelectFirm?.(e.firm_id)}>
                            {e.firm_name}
                          </button>
                          {e.firm_geography && (
                            <span className="chip chip-geo" style={{ marginLeft: 8 }}>{e.firm_geography}</span>
                          )}
                        </div>
                        <div className="tl-item">{e.item}</div>
                        {e.source && (
                          <a href={e.source} target="_blank" rel="noreferrer" className="hint">source ↗</a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
