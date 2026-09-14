import React, { useMemo } from "react";
import { SEED_FIRMS } from "../data/seedFirms.js";

/** Aggregate view across the whole tracker: sector heat, momentum split,
 *  aggregate AUM, geography split. Reads client-side from the seed set. */
export default function MarketTemperature({ onSelectFirm }) {
  const stats = useMemo(() => {
    const sectorCount = new Map();
    const geoCount = new Map();
    const momentumCount = { up: 0, steady: 0, down: 0 };
    let aumSum = 0, aumCount = 0;
    let totalDeals = 0;
    for (const f of SEED_FIRMS) {
      for (const s of (f.sectors || "").split(",").map(x => x.trim()).filter(Boolean)) {
        sectorCount.set(s, (sectorCount.get(s) || 0) + 1);
      }
      const g = (f.geography_focus || "").split(/[\/,]/)[0].trim();
      if (g) geoCount.set(g, (geoCount.get(g) || 0) + 1);
      if (f.momentum && momentumCount[f.momentum] != null) momentumCount[f.momentum]++;
      if (typeof f.aum_usd_m === "number") { aumSum += f.aum_usd_m; aumCount++; }
      totalDeals += (f.timeline?.counts || []).reduce((a, b) => a + b, 0);
    }
    const sectors = [...sectorCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
    const geos    = [...geoCount.entries()].sort((a, b) => b[1] - a[1]);
    return { sectors, geos, momentumCount, aumSum, aumCount, totalDeals };
  }, []);

  const maxSector = stats.sectors[0]?.[1] || 1;
  const aumDisplay = stats.aumCount > 0
    ? (stats.aumSum >= 1000 ? `$${(stats.aumSum / 1000).toFixed(1)}B+` : `$${stats.aumSum.toFixed(0)}M+`)
    : "-";

  return (
    <>
      <div className="section-title">
        <div>
          <div className="kicker">Market temperature · India + SEA private markets</div>
          <h2>What the tracker says about the whole region.</h2>
          <div className="sub">Aggregate view computed across every firm in the tracker.</div>
        </div>
      </div>

      <div className="strip">
        <div className="strip-cell">
          <div className="strip-k">Firms in tracker</div>
          <div className="strip-v">{SEED_FIRMS.length}</div>
          <div className="strip-note">India + SEA institutional coverage</div>
        </div>
        <div className="strip-cell">
          <div className="strip-k">Aggregate AUM</div>
          <div className="strip-v">{aumDisplay}</div>
          <div className="strip-note">across {stats.aumCount} firms with public AUM</div>
        </div>
        <div className="strip-cell">
          <div className="strip-k">Cumulative deals</div>
          <div className="strip-v">{stats.totalDeals}</div>
          <div className="strip-note">2019 – 2025 across the tracker</div>
        </div>
        <div className="strip-cell">
          <div className="strip-k">Momentum split</div>
          <div className="strip-v" style={{ fontSize: 22 }}>
            <span style={{ color: "var(--ok)" }}>↑{stats.momentumCount.up}</span>
            {" "}<span style={{ color: "var(--muted)" }}>↔{stats.momentumCount.steady}</span>
            {" "}<span style={{ color: "var(--err)" }}>↓{stats.momentumCount.down}</span>
          </div>
          <div className="strip-note">recent-vs-prior period cadence</div>
        </div>
      </div>

      <div className="card">
        <div className="kicker">Sector heat · sector coverage across tracked firms</div>
        <h3>What's crowded, what's contested</h3>
        <div className="heat-list">
          {stats.sectors.map(([s, c]) => (
            <div className="heat-row" key={s}>
              <div className="heat-label">{s}</div>
              <div className="heat-bar-wrap">
                <div className="heat-bar" style={{ width: `${(c / maxSector) * 100}%` }} />
              </div>
              <div className="heat-count">{c}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="kicker">Geography · where the tracker's coverage sits</div>
        <h3>Regional split</h3>
        <div className="geo-split">
          {stats.geos.map(([g, c]) => (
            <div className="geo-cell" key={g}>
              <div className="geo-name">{g}</div>
              <div className="geo-count">{c} firm{c === 1 ? "" : "s"}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
