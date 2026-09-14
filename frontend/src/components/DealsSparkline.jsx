import React, { useEffect, useState } from "react";
import { firmTimeline } from "../api";
import { seedById } from "../data/seedFirms.js";

function sparkSvg(counts, years) {
  const w = 80, h = 22, pad = 2;
  const max = Math.max(1, ...counts);
  const step = counts.length > 1 ? (w - pad * 2) / (counts.length - 1) : 0;
  const pts = counts.map((c, i) => {
    const x = pad + i * step;
    const y = h - pad - (c / max) * (h - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const total = counts.reduce((a, b) => a + b, 0);
  return (
    <span className="sparkline" title={`${total} deals · ${years[0]}–${years[years.length - 1]}`}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden>
        <polyline fill="none" stroke="var(--accent)" strokeWidth="1.4"
                  strokeLinecap="round" strokeLinejoin="round" points={pts} />
      </svg>
      <span className="sparkline-total">{total}</span>
    </span>
  );
}

export default function DealsSparkline({ firmId }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (typeof firmId === "string" && firmId.startsWith("seed-")) {
      const s = seedById(firmId);
      if (s?.timeline) setData(s.timeline);
      return;
    }
    if (typeof firmId !== "number") return;
    firmTimeline(firmId).then(setData).catch(() => setData(null));
  }, [firmId]);

  if (!data?.counts?.length) return null;
  return sparkSvg(data.counts, data.years);
}
