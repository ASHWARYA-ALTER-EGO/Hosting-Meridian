import React from "react";

export default function StatStrip({ rows = [], usingSeed = false }) {
  const firms = rows.length;
  const geos = new Set();
  const sectors = new Set();
  let aumSum = 0, aumCount = 0;
  for (const r of rows) {
    if (r.geography_focus) geos.add(r.geography_focus.split(",")[0].trim());
    if (r.sectors) r.sectors.split(",").forEach(s => { const t = s.trim(); if (t) sectors.add(t); });
    if (typeof r.aum_usd_m === "number") { aumSum += r.aum_usd_m; aumCount++; }
  }
  const aumDisplay = aumCount > 0
    ? (aumSum >= 1000 ? `$${(aumSum/1000).toFixed(1)}B+` : `$${aumSum.toFixed(0)}M+`)
    : "-";

  const cells = [
    { k: "Firms tracked",   v: firms.toString(),         n: usingSeed ? "pre-loaded · generate any for a full profile" : "profiles saved" },
    { k: "Geographies",     v: geos.size.toString(),     n: [...geos].slice(0,3).join(", ") || "-" },
    { k: "Sector coverage", v: sectors.size.toString(),  n: [...sectors].slice(0,2).join(", ") + (sectors.size > 2 ? "…" : "") },
    { k: "Aggregate AUM",   v: aumDisplay,               n: aumCount > 0 ? `across ${aumCount} sourced` : "AUM populates as profiles are generated" },
  ];

  return (
    <>
      {usingSeed && (
        <div className="seed-banner fade-in d1">
          <div className="seed-banner-l">
            <span className="seed-banner-badge">SEED PREVIEW</span>
            <div className="seed-banner-title">Showing {firms} pre-loaded India + SEA fund managers.</div>
            <div className="seed-banner-sub">
              Firm names, geographies and sector focus are seeded so the tracker is
              never empty. Click any row (or hit <b>+ New profile</b>) to run the
              full 3-agent pipeline and generate a sourced, confidence-flagged profile.
              Once saved, that firm's real profile replaces its seed row here.
            </div>
          </div>
          <div className="seed-banner-num">{firms}</div>
        </div>
      )}
      <div className="strip fade-in d1">
        {cells.map((c, i) => (
          <div className="strip-cell" key={i}>
            <div className="strip-k">{c.k}</div>
            <div className="strip-v">{c.v}</div>
            <div className="strip-note">{c.n}</div>
          </div>
        ))}
      </div>
    </>
  );
}
