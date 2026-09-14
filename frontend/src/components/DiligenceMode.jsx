import React, { useMemo, useState } from "react";
import { allSeedDeals } from "../data/seedFirms.js";

/** Click any portfolio company → modal shows every tracked firm that invested
 *  in that company, from the seed dataset. Cross-firm portfolio intelligence. */
export default function DiligenceMode({ company, onClose, onSelectFirm }) {
  const investors = useMemo(() => {
    if (!company) return [];
    const key = company.toLowerCase().trim();
    return allSeedDeals().filter(d => d.company_name_key === key || d.company_name_key.includes(key));
  }, [company]);

  if (!company) return null;

  return (
    <div className="askbar-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="askbar-modal fade-in" style={{ maxWidth: 620 }}>
        <div className="askbar-modal-hdr">
          <div className="askbar-modal-title">
            <span className="rag-pill" style={{ marginRight: 8 }}>DILIGENCE</span>
            {company}
          </div>
          <button className="askbar-close" onClick={onClose}>✕</button>
        </div>
        <div className="sub">
          Every tracked firm that has {company} in its notable-portfolio list.
        </div>

        {investors.length === 0 ? (
          <div className="empty" style={{ marginTop: 12 }}>
            <div className="empty-title">No tracked firms report this investment</div>
            <div className="hint">The company may exist but no seed firm lists it as notable.</div>
          </div>
        ) : (
          <ul className="dilig-list">
            {investors.map((d, i) => (
              <li key={i}>
                <button className="linkish" onClick={() => { onClose(); onSelectFirm?.(d.firm_id); }}>
                  {d.firm_name}
                </button>
                {d.note && <span className="hint"> · {d.note}</span>}
                {d.source && <> · <a href={d.source} target="_blank" rel="noreferrer" className="hint">src</a></>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
