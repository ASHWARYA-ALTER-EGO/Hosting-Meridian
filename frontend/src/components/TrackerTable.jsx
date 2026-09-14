import React, { useEffect, useState } from "react";
import { listManagers } from "../api";
import { mergeWithSeed, SEED_FIRMS } from "../data/seedFirms.js";
import StatStrip from "./StatStrip.jsx";
import DealsSparkline from "./DealsSparkline.jsx";
import WatchStar from "./WatchStar.jsx";
import MomentumArrow from "./MomentumArrow.jsx";
import { momentumFromTimeline } from "../lib/momentum.js";
import { seedById } from "../data/seedFirms.js";

const SORT_OPTIONS = [
  { key: "updated_at", label: "Last updated" },
  { key: "firm_name",  label: "Firm name" },
  { key: "aum",        label: "AUM" },
  { key: "geography",  label: "Geography" },
];

function fmtDate(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

// Client-side filter + sort so seed rows behave the same as API rows.
function applyFilters(rows, { q, geo, sector, sort, order }) {
  let out = rows;
  if (q)      out = out.filter(r => (r.firm_name || "").toLowerCase().includes(q.toLowerCase()));
  if (geo)    out = out.filter(r => (r.geography_focus || "").toLowerCase().includes(geo.toLowerCase()));
  if (sector) out = out.filter(r => (r.sectors || "").toLowerCase().includes(sector.toLowerCase()));

  const cmp = {
    firm_name:  (a,b) => (a.firm_name || "").localeCompare(b.firm_name || ""),
    aum:        (a,b) => (a.aum_usd_m || 0) - (b.aum_usd_m || 0),
    geography:  (a,b) => (a.geography_focus || "").localeCompare(b.geography_focus || ""),
    updated_at: (a,b) => (a.updated_at || "").localeCompare(b.updated_at || ""),
  }[sort] || (() => 0);

  out = [...out].sort(cmp);
  if (order === "desc") out.reverse();
  return out;
}

export default function TrackerTable({ refreshKey, onSelect, onNew, onRowsChange, onCompare }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [geo, setGeo] = useState("");
  const [sector, setSector] = useState("");
  const [sort, setSort] = useState("updated_at");
  const [order, setOrder] = useState("desc");
  const [selected, setSelected] = useState(new Set());
  const [usingSeed, setUsingSeed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setErr("");
    listManagers({})    // filter/sort locally so seed rows participate
      .then(apiRows => {
        if (cancelled) return;
        const merged = mergeWithSeed(apiRows);
        setRows(merged);
        setUsingSeed(apiRows.length === 0);
        onRowsChange?.(merged);
      })
      .catch(e => {
        if (cancelled) return;
        // Backend unreachable → still show the seed rows so the site is never empty
        console.warn("Tracker API failed, falling back to seed:", e.message);
        const merged = mergeWithSeed([]);
        setRows(merged);
        setUsingSeed(true);
        onRowsChange?.(merged);
        setErr("");   // hide the failure; seed data is a graceful fallback
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [refreshKey, onRowsChange]);

  const filtered = applyFilters(rows, { q, geo, sector, sort, order });

  const toggleSort = (k) => {
    if (sort === k) setOrder(order === "desc" ? "asc" : "desc");
    else { setSort(k); setOrder("desc"); }
  };
  const arrow = (k) => sort === k ? (order === "desc" ? " ↓" : " ↑") : "";

  const toggleSel = (id) => {
    if (typeof id === "string" && id.startsWith("seed-")) return;   // seed rows aren't real DB ids
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else if (next.size < 4) next.add(id);
    setSelected(next);
  };
  const clearSel = () => setSelected(new Set());
  const canCompare = selected.size >= 2 && selected.size <= 4;

  const clickRow = (r) => {
    // Both seed rows and real rows open the profile page.
    // SavedProfilePage handles both via seed lookup or API fetch.
    onSelect(r.id);
  };

  return (
    <>
      <StatStrip rows={rows} usingSeed={usingSeed} />

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
            <div className="sub">
              {filtered.length} firm{filtered.length === 1 ? "" : "s"} listed ·
              {usingSeed
                ? " showing pre-loaded seed data · click any firm to generate its full profile"
                : " re-run any firm to refresh in place · check boxes to compare"}
            </div>
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

        {loading ? (
          <div className="hint center" style={{ padding: 24 }}>Loading firms…</div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <div className="empty-title">No firms match those filters</div>
            <div className="hint" style={{ marginBottom: 16 }}>Try a broader geography or sector.</div>
          </div>
        ) : (
          <div className="tblwrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th style={{ width: 34 }}></th>
                  <th style={{ width: 28 }}></th>
                  <th onClick={() => toggleSort("firm_name")}>Firm{arrow("firm_name")}</th>
                  <th onClick={() => toggleSort("geography")}>Geography{arrow("geography")}</th>
                  <th>HQ</th>
                  <th onClick={() => toggleSort("aum")}>AUM{arrow("aum")}</th>
                  <th>Sectors</th>
                  <th>Deals</th>
                  <th onClick={() => toggleSort("updated_at")}>Updated{arrow("updated_at")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id} className="clickable">
                    <td onClick={(e) => { e.stopPropagation(); toggleSel(r.id); }}>
                      {typeof r.id === "string" && r.id.startsWith("seed-") ? (
                        <span className="badge" title="Seed row — profile not yet generated">seed</span>
                      ) : (
                        <input type="checkbox" checked={selected.has(r.id)}
                               onChange={() => {}} onClick={(e) => e.stopPropagation()} />
                      )}
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <WatchStar firmKey={r.firm_name_key || r.firm_name?.toLowerCase()} />
                    </td>
                    <td onClick={() => clickRow(r)}>
                      <div className="firm-name">{r.firm_name}</div>
                      {r.summary && <div className="firm-sub">{r.summary}</div>}
                    </td>
                    <td onClick={() => clickRow(r)}>
                      {r.geography_focus ? <span className="chip chip-geo">{r.geography_focus}</span> : "-"}
                    </td>
                    <td onClick={() => clickRow(r)}>{r.headquarters || "-"}</td>
                    <td onClick={() => clickRow(r)} className="num">{r.aum_display || "-"}</td>
                    <td onClick={() => clickRow(r)}>
                      {r.sectors
                        ? r.sectors.split(",").slice(0, 3).map((s, i) => (
                            <span className="chip chip-sector" key={i} style={{ marginRight: 4 }}>{s.trim()}</span>
                          ))
                        : "-"}
                    </td>
                    <td onClick={() => clickRow(r)}>
                      <DealsSparkline firmId={r.id} />
                      {(() => {
                        const s = typeof r.id === "string" && r.id.startsWith("seed-") ? seedById(r.id) : null;
                        const mom = s?.momentum || (s?.timeline && momentumFromTimeline(s.timeline)) || "steady";
                        return <MomentumArrow momentum={mom} />;
                      })()}
                    </td>
                    <td onClick={() => clickRow(r)} className="hint">
                      {r.updated_at ? fmtDate(r.updated_at) : <span className="badge">seed</span>}
                    </td>
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
