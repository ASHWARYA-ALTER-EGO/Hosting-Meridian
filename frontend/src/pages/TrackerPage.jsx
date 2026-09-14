import React from "react";
import TrackerTable from "../components/TrackerTable.jsx";

export default function TrackerPage({ onSelect, onCompare, onProfile, onRowsChange, refreshKey }) {
  return (
    <>
      <div className="section-title">
        <h2>Tracker</h2>
        <div className="sub">Sortable, filterable intelligence base · check 2–4 firms to compare side-by-side</div>
      </div>
      <TrackerTable
        refreshKey={refreshKey}
        onSelect={onSelect}
        onNew={onProfile}
        onRowsChange={onRowsChange}
        onCompare={onCompare}
      />
    </>
  );
}
