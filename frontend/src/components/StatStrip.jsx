import React from "react";

function fmtAgo(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60)   return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400)return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
}

export default function StatStrip({ rows = [] }) {
  const firms = rows.length;
  const geos = new Set();
  const sectors = new Set();
  let aumSum = 0, aumCount = 0;
  let latest = null;
  for (const r of rows) {
    if (r.geography_focus) geos.add(r.geography_focus.split(",")[0].trim());
    if (r.sectors) r.sectors.split(",").forEach(s => { const t = s.trim(); if (t) sectors.add(t); });
    if (typeof r.aum_usd_m === "number") { aumSum += r.aum_usd_m; aumCount++; }
    if (r.updated_at && (!latest || r.updated_at > latest)) latest = r.updated_at;
  }
  const aumDisplay = aumCount > 0
    ? (aumSum >= 1000 ? `$${(aumSum/1000).toFixed(1)}B+` : `$${aumSum.toFixed(0)}M+`)
    : "-";

  const cells = [
    { k: "Firms tracked",   v: firms.toString(),         n: firms === 0 ? "empty · profile one" : "profiles saved" },
    { k: "Geographies",     v: geos.size.toString(),     n: [...geos].slice(0,3).join(", ") || "-" },
    { k: "Sector coverage", v: sectors.size.toString(),  n: [...sectors].slice(0,2).join(", ") + (sectors.size > 2 ? "…" : "") },
    { k: "Aggregate AUM",   v: aumDisplay,               n: aumCount > 0 ? `across ${aumCount} sourced` : "not yet extracted" },
  ];

  return (
    <div className="strip fade-in d1">
      {cells.map((c, i) => (
        <div className="strip-cell" key={i}>
          <div className="strip-k">{c.k}</div>
          <div className="strip-v">{c.v}</div>
          <div className="strip-note">{c.n}</div>
        </div>
      ))}
    </div>
  );
}
