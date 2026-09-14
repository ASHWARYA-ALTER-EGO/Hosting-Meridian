import React, { useEffect, useState } from "react";
import { listManagers } from "../api";
import StatStrip from "./StatStrip.jsx";

const SORT_OPTIONS = [
  { key: "updated_at", label: "Last updated" },
  { key: "firm_name",  label: "Firm name" },
  { key: "aum",        label: "AUM" },
  { key: "geography",  label: "Geography" },
];

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function TrackerTable({ refreshKey, onSelect, onNew, onRowsChange, onCompare }) {
  const [rows, setRows] = useState([]);
  const [allRows, setAllRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [geo, setGeo] = useState("");
  const [sector, setSector] = useState("");
  const [sort, setSort] = useState("updated_at");
  const [order, setOrder] = useState("desc");
  const [selected, setSelected] = useState(new Set());

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setErr("");
    listManagers({ q, geography: geo, sector, sort, order })
      .then(r => { if (!cancelled) { setRows(r); if (!q && !geo && !sector) setAllRows(r); onRowsChange?.(r); } })
      .catch(e => { if (!cancelled) setErr(e.message || "Failed to load"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [refreshKey, q, geo, sector, sort, order, onRowsChange]);

  const toggleSort = (k) => {
    if (sort === k) setOrder(order === "desc" ? "asc" : "desc");
    else { setSort(k); setOrder("desc"); }
  };
  const arrow = (k) => sort === k ? (order === "desc" ? " ↓" : " ↑") : "";

  const toggleSel = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else if (next.size < 4) next.add(id);
    setSelected(next);
  };
  const clearSel = () => setSelected(new Set());

  const canCompare = selected.size >= 2 && selected.size <= 4;

  return (
    <>
      <StatStrip rows={allRows.length ? allRows : rows} />

      {selected.size > 0 && (
        <div className="cmp-bar">
          <div>
            <b>{selected.size}</b> selected
            <span className="hint"> · pick 2–4 firms to compare</span>
          </div>
          <div className="row">
            <button className="btn ghost sm" onClick={clearSel}>Clear</button>
            <button className="btn sm" disabled={!canCompare} onClick={() => onCompare?.([...selected])}>
              Compare {selected.size} →
            </button>
          </div>
        </div>
      )}

      <div className="card raise fade-in d2">
        <div className="tracker-hdr">
          <div>
            <div className="kicker">Tracker</div>
            <h2>Fund manager intelligence base</h2>
            <div className="sub">{rows.length} profiled firm{rows.length === 1 ? "" : "s"} · re-run any firm to refresh in place · check boxes to compare</div>
          </div>
          <div className="row">
            <button className="btn ghost sm" onClick={onNew}>+ Profile a firm</button>
          </div>
        </div>

        <div className="filters">
          <input placeholder="Search firm name…" value={q} onChange={e => setQ(e.target.value)} />
          <input placeholder="Geography filter" value={geo} onChange={e => setGeo(e.target.value)} />
          <input placeholder="Sector filter" value={sector} onChange={e => setSector(e.target.value)} />
          <select value={sort} onChange={e => setSort(e.target.value)}>
            {SORT_OPTIONS.map(o => <option key={o.key} value={o.key}>Sort · {o.label}</option>)}
          </select>
          <button className="tnav-btn" onClick={() => setOrder(order === "desc" ? "asc" : "desc")}>
            {order === "desc" ? "↓ desc" : "↑ asc"}
          </button>
        </div>

        {err && <div className="err">Error: {err}</div>}
        {loading ? (
          <div className="hint center" style={{ padding: 24 }}>Loading firms…</div>
        ) : rows.length === 0 ? (
          <div className="empty">
            <div className="empty-title">No firms in the tracker yet</div>
            <div className="hint" style={{ marginBottom: 16 }}>
              Profile your first fund manager and it will land here — sortable,
              filterable, refreshable in place.
            </div>
            <button className="btn" onClick={onNew}>+ Profile the first firm</button>
          </div>
        ) : (
          <div className="tblwrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th style={{ width: 34 }}></th>
                  <th onClick={() => toggleSort("firm_name")}>Firm{arrow("firm_name")}</th>
                  <th onClick={() => toggleSort("geography")}>Geography{arrow("geography")}</th>
                  <th>HQ</th>
                  <th onClick={() => toggleSort("aum")}>AUM{arrow("aum")}</th>
                  <th>Sectors</th>
                  <th onClick={() => toggleSort("updated_at")}>Updated{arrow("updated_at")}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.id} className="clickable">
                    <td onClick={(e) => { e.stopPropagation(); toggleSel(r.id); }}>
                      <input type="checkbox" checked={selected.has(r.id)}
                             onChange={() => {}} onClick={(e) => e.stopPropagation()} />
                    </td>
                    <td onClick={() => onSelect(r.id)}>
                      <div className="firm-name">{r.firm_name}</div>
                      {r.summary && <div className="firm-sub">{r.summary}</div>}
                    </td>
                    <td onClick={() => onSelect(r.id)}>
                      {r.geography_focus ? <span className="chip chip-geo">{r.geography_focus}</span> : "—"}
                    </td>
                    <td onClick={() => onSelect(r.id)}>{r.headquarters || "—"}</td>
                    <td onClick={() => onSelect(r.id)} className="num">{r.aum_display || "—"}</td>
                    <td onClick={() => onSelect(r.id)}>
                      {r.sectors
                        ? r.sectors.split(",").slice(0, 3).map((s, i) => (
                            <span className="chip chip-sector" key={i} style={{ marginRight: 4 }}>{s.trim()}</span>
                          ))
                        : "—"}
                    </td>
                    <td onClick={() => onSelect(r.id)} className="hint">{fmtDate(r.updated_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
