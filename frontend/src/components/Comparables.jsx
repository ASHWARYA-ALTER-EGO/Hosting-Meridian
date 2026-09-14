import React, { useEffect, useState } from "react";
import { getComparables } from "../api";
import { SEED_FIRMS, seedById } from "../data/seedFirms.js";

// Client-side similarity (Jaccard over sectors+stages+geo) — mirrors backend.
function tok(s) { return new Set((s || "").toLowerCase().match(/[a-z]{2,}/g) || []); }
function sim(a, b) {
  const A = new Set([...tok(a.sectors), ...tok(a.stages), ...tok(a.geography_focus)]);
  const B = new Set([...tok(b.sectors), ...tok(b.stages), ...tok(b.geography_focus)]);
  if (!A.size || !B.size) return 0;
  const inter = [...A].filter(x => B.has(x)).length;
  const uni = new Set([...A, ...B]).size;
  return inter / uni;
}
function quickDiff(a, b) {
  const parts = [];
  if (b.headquarters && a.headquarters !== b.headquarters) parts.push(`HQ in ${b.headquarters}`);
  if (b.aum_display) parts.push(`AUM ${b.aum_display}`);
  const aSec = tok(a.sectors), bSec = tok(b.sectors);
  const extra = [...bSec].filter(x => !aSec.has(x)).slice(0, 3);
  if (extra.length) parts.push(`extra sectors: ${extra.join(", ")}`);
  return parts.slice(0, 2).join(" · ") || "similar profile";
}

function seedComparablesFor(firmKey) {
  const me = SEED_FIRMS.find(f => f.firm_name_key === firmKey || f.id === firmKey);
  if (!me) return [];
  return SEED_FIRMS
    .filter(f => f.id !== me.id)
    .map(f => ({ score: sim(me, f), firm: f }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(x => ({
      id: x.firm.id, firm_name: x.firm.firm_name,
      similarity: Math.round(x.score * 100) / 100,
      geography_focus: x.firm.geography_focus,
      sectors: x.firm.sectors, stages: x.firm.stages, aum_display: x.firm.aum_display,
      differentiator: quickDiff(me, x.firm),
    }));
}

export default function Comparables({ managerId, firmKey, onSelectFirm }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Seed row → compute client-side, no API
    if (typeof managerId === "string" && managerId.startsWith("seed-")) {
      setRows(seedComparablesFor(managerId));
      setLoading(false);
      return;
    }
    // Real DB row → try backend, fall back to seed if it fails
    if (typeof managerId !== "number") { setLoading(false); return; }
    setLoading(true);
    getComparables(managerId, 3)
      .then(r => setRows(r.comparables || []))
      .catch(() => firmKey && setRows(seedComparablesFor(firmKey)))
      .finally(() => setLoading(false));
  }, [managerId, firmKey]);

  if (loading || rows.length === 0) return null;

  return (
    <div className="card">
      <div className="kicker">Peers · computed from sector, stage, geography overlap</div>
      <h3>Most similar firms in the tracker</h3>
      <div className="comparables-grid">
        {rows.map(r => (
          <button key={r.id} className="comparable-card" onClick={() => onSelectFirm?.(r.id)}>
            <div className="comp-hdr">
              <div className="comp-name">{r.firm_name}</div>
              <div className="comp-score">{Math.round(r.similarity * 100)}% match</div>
            </div>
            <div className="comp-diff">{r.differentiator}</div>
            <div className="comp-meta">
              {r.geography_focus && <span className="chip chip-geo">{r.geography_focus}</span>}
              {r.aum_display && <span className="chip">{r.aum_display}</span>}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
