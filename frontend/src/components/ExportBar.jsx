import React from "react";
import { exportUrl } from "../api";

export default function ExportBar({ managerId }) {
  if (!managerId) return null;
  return (
    <div className="card tight export-bar no-print">
      <div className="row space">
        <div>
          <div className="kicker">Export</div>
          <div className="hint">Take this profile with you — spreadsheet, doc, or PDF.</div>
        </div>
        <div className="row">
          <a className="btn ghost sm" href={exportUrl(managerId, "csv")} download>
            ⤓ CSV
          </a>
          <a className="btn ghost sm" href={exportUrl(managerId, "md")} download>
            ⤓ Markdown
          </a>
          <button className="btn sm" onClick={() => window.print()}>
            ⎙ Print / Save as PDF
          </button>
        </div>
      </div>
    </div>
  );
}
