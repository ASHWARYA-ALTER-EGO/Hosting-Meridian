import React, { useMemo, useState } from "react";
import { SEED_FIRMS, allSeedDeals } from "../data/seedFirms.js";

/** Co-investment network: firms as nodes, companies invested-in by 2+ firms
 *  as connecting edges. Circular layout, hover to highlight edges. */
export default function NetworkGraph({ onSelectFirm }) {
  const [hover, setHover] = useState(null);

  const { nodes, edges } = useMemo(() => {
    const firms = SEED_FIRMS;
    const N = firms.length;
    const R = 220, cx = 300, cy = 260;

    const nodes = firms.map((f, i) => {
      const a = (i / N) * Math.PI * 2 - Math.PI / 2;
      return {
        id: f.id, name: f.firm_name,
        x: cx + R * Math.cos(a), y: cy + R * Math.sin(a),
        angle: a,
      };
    });

    // Build edges from shared portfolio companies (normalised name).
    const byCompany = new Map();
    for (const d of allSeedDeals()) {
      const k = d.company_name_key;
      if (!byCompany.has(k)) byCompany.set(k, []);
      byCompany.get(k).push({ firm_id: d.firm_id, company: d.company_name });
    }
    const edges = [];
    for (const [k, list] of byCompany.entries()) {
      const firmIds = [...new Set(list.map(x => x.firm_id))];
      if (firmIds.length < 2) continue;
      for (let i = 0; i < firmIds.length; i++) {
        for (let j = i + 1; j < firmIds.length; j++) {
          edges.push({ a: firmIds[i], b: firmIds[j], company: list[0].company, key: k });
        }
      }
    }
    return { nodes, edges };
  }, []);

  const isHovered = (id) => hover && (id === hover);
  const edgeActive = (e) => !hover || hover === e.a || hover === e.b;

  return (
    <div className="card">
      <div className="kicker">Co-investment network · computed from portfolio overlap</div>
      <h3>Who has invested alongside whom</h3>
      <div className="sub">
        Each dot is a tracked firm. Each line represents a company both firms have
        invested in. Hover any firm to isolate its co-investment ties.
        {edges.length === 0 && " (No overlaps in the current portfolio data yet.)"}
      </div>
      <div className="netgraph-wrap">
        <svg viewBox="0 0 600 520" className="netgraph">
          {/* Edges */}
          {edges.map((e, i) => {
            const A = nodes.find(n => n.id === e.a);
            const B = nodes.find(n => n.id === e.b);
            if (!A || !B) return null;
            return (
              <line key={i}
                x1={A.x} y1={A.y} x2={B.x} y2={B.y}
                stroke="var(--accent)"
                strokeWidth={edgeActive(e) ? 1.5 : 0.5}
                opacity={edgeActive(e) ? 0.55 : 0.10}
              >
                <title>{`Co-investor in ${e.company}`}</title>
              </line>
            );
          })}
          {/* Nodes */}
          {nodes.map(n => {
            const active = isHovered(n.id);
            return (
              <g key={n.id}
                 onMouseEnter={() => setHover(n.id)}
                 onMouseLeave={() => setHover(null)}
                 onClick={() => onSelectFirm?.(n.id)}
                 style={{ cursor: "pointer" }}>
                <circle cx={n.x} cy={n.y} r={active ? 8 : 5}
                        fill={active ? "var(--accent)" : "#fff"}
                        stroke="var(--accent)"
                        strokeWidth="1.5" />
                <text
                  x={n.x + Math.cos(n.angle) * 22}
                  y={n.y + Math.sin(n.angle) * 22 + 3}
                  fontSize="10.5"
                  fontFamily='"Inter", system-ui'
                  textAnchor={Math.cos(n.angle) > 0 ? "start" : "end"}
                  fill={active ? "var(--accent)" : "var(--text-dim)"}
                  fontWeight={active ? 600 : 500}
                >
                  {n.name.replace(/ (Partners|Ventures|Capital)$/, "")}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
