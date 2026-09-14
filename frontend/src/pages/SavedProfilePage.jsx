import React from "react";
import ProfileView from "../components/ProfileView.jsx";
import ExportBar from "../components/ExportBar.jsx";

export default function SavedProfilePage({ savedRow, onBack, onRefresh }) {
  if (!savedRow) return null;
  return (
    <>
      <div className="row space no-print">
        <div className="section-title" style={{ padding: 0 }}>
          <div>
            <div className="kicker">Saved profile</div>
            <h2>{savedRow.firm_name}</h2>
            <div className="sub">
              Updated {new Date(savedRow.updated_at).toLocaleString()} ·
              {" "}created {new Date(savedRow.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
        <div className="row">
          <button className="btn ghost sm" onClick={onBack}>← Tracker</button>
          <button className="btn sm" onClick={onRefresh}>Refresh profile ↻</button>
        </div>
      </div>
      <ProfileView
        profile={savedRow.profile}
        profileMd={savedRow.profile_md}
        findings={savedRow.findings}
        firmName={savedRow.firm_name}
        updatedAt={savedRow.updated_at}
      />
      <ExportBar managerId={savedRow.id} />
    </>
  );
}
