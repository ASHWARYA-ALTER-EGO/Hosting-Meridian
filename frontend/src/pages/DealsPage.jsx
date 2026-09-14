import React, { useEffect, useState } from "react";
import { listDeals } from "../api";

const KINDS = [
  { k: "", label: "All events" },
  { k: "investment", label: "Investments" },
  { k: "fund_close", label: "Fund closes" },
  { k: "exit",       label: "Exits" },
  { k: "leadership", label: "Leadership" },
  { k: "other",      label: "Other" },
];

export default function DealsPage({ onSelectFirm }) {
  const [data, setData] = useState({ deals: [], total: 0, counts_by_kind: {} });
  const [kind, setKind] = useState("");
  const [firm, setFirm] = useState("");
  const [q, setQ] = useState("");
  const [year, setYear] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    setLoading(true); setErr("");
    listDeals({ kind, firm, q, year })
      .then(setData)
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false));
  }, [kind, firm, q, year]);

  return (
    <>
      <div className="section-title">
        <div>
          <div className="kicker">First-class table</div>
          <h2>Deals &amp; events</h2>
          <div className="sub">
            Every investment, fund close, exit and leadership move captured
            during profiling is stored as a row here, joined to the firm that
            made it. Filter by kind, firm, company or year.
          </div>
        </div>
      </div>

      <div className="strip">
        <div className="strip-cell">
          <div className="strip-k">Events on file</div>
          <div className="strip-v">{data.total}</div>
          <div className="strip-note">across the whole tracker</div>
        </div>
        <div className="strip-cell">
          <div className="strip-k">Investments</div>
          <div className="strip-v">{data.counts_by_kind?.investment || 0}</div>
          <div className="strip-note">portfolio bets recorded</div>
        </div>
        <div className="strip-cell">
          <div className="strip-k">Fund closes</div>
          <div className="strip-v">{data.counts_by_kind?.fund_close || 0}</div>
          <div className="strip-note">raise events captured</div>
        </div>
        <div className="strip-cell">
          <div className="strip-k">Exits</div>
          <div className="strip-v">{data.counts_by_kind?.exit || 0}</div>
          <div className="strip-note">IPOs, acquisitions, secondary</div>
        </div>
      </div>

      <div className="card raise">
        <div className="tracker-hdr">
          <div>
            <div className="kicker">Filter</div>
            <h3>{data.deals.length} matching events</h3>
          </div>
        </div>
        <div className="filters" style={{ gridTemplateColumns: "1.4fr 1fr 1fr 0.5fr auto" }}>
          <input placeholder="Company name…" value={q} onChange={e => setQ(e.target.value)} />
          <input placeholder="Firm name…" value={firm} onChange={e => setFirm(e.target.value)} />
          <select value={kind} onChange={e => setKind(e.target.value)}>
            {KINDS.map(k => <option key={k.k} value={k.k}>{k.label}</option>)}
          </select>
          <input placeholder="Year (e.g. 2024)" value={year} onChange={e => setYear(e.target.value)} />
        </div>

        {err && <div className="err">Error: {err}</div>}
        {loading ? (
          <div className="hint center" style={{ padding: 24 }}>Loading deals…</div>
        ) : data.deals.length === 0 ? (
          <div className="empty">
            <div className="empty-title">No deals match those filters</div>
            <div className="hint">Broaden the filters, or refresh the tracker to capture more events.</div>
          </div>
        ) : (
          <div className="tblwrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Firm</th>
                  <th>Kind</th>
                  <th>Company / event</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {data.deals.map(d => (
                  <tr key={d.id}>
                    <td className="mono hint">{d.date || "-"}</td>
                    <td>
                      <button className="linkish" onClick={() => onSelectFirm?.(d.firm_id)}>
                        {d.firm_name}
                      </button>
                    </td>
                    <td><span className={`chip chip-${d.kind === "investment" ? "sector" : d.kind === "fund_close" ? "stage" : d.kind === "exit" ? "geo" : ""}`}>{d.kind}</span></td>
                    <td>
                      {d.company_name && <b>{d.company_name}</b>}
                      {d.company_name && d.note && <span className="hint"> · </span>}
                      <span style={{ color: "var(--text-dim)" }}>{d.note}</span>
                    </td>
                    <td>{d.source ? <a href={d.source} target="_blank" rel="noreferrer" className="hint">source ↗</a> : "-"}</td>
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
