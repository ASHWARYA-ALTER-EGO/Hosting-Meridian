import React from "react";

/** Cross-database mode: India/SEA firm → US/EU global comparables.
 *  Pulled from seed data (each seed firm carries a `global_comparables` array). */
export default function GlobalComparables({ comparables }) {
  if (!comparables || comparables.length === 0) return null;
  return (
    <div className="card">
      <div className="kicker">Global lens · comparable firms outside India / SEA</div>
      <h3>Closest global peers</h3>
      <div className="sub">
        For every India / SEA firm we track, the closest institutional analogues in
        the US and Europe by strategy, stage cadence and portfolio shape.
      </div>
      <ul className="global-comps">
        {comparables.map((c, i) => (
          <li key={i}>
            <div className="gc-name">{c.name}</div>
            <div className="gc-why">{c.why}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
