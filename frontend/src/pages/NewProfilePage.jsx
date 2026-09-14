import React from "react";
import ProfileForm from "../components/EvaluateForm.jsx";
import PipelineStatus from "../components/PipelineStatus.jsx";
import ProfileView from "../components/ProfileView.jsx";
import ExportBar from "../components/ExportBar.jsx";

export default function NewProfilePage({ initial, stream, onSelectFirm }) {
  const s = stream;
  return (
    <>
      <div className="section-title">
        <h2>Profile generator</h2>
        <div className="sub">Live 3-agent pipeline · streams over Server-Sent Events</div>
      </div>
      <ProfileForm initial={initial} onSubmit={s.run} running={s.running} onCancel={s.cancel} />
      {s.error && <div className="err">Pipeline error: {s.error}</div>}
      {(s.running || s.phase || s.profileMd) && !s.error && (
        <PipelineStatus
          phase={s.phase} phaseStatus={s.phaseStatus}
          queries={s.queries} findingsCount={s.findings.length}
          running={s.running}
        />
      )}
      <ProfileView
        profile={s.profile}
        profileMd={s.profileMd}
        savedId={s.savedId}
        findings={s.findings}
        firmName={initial.firm_name}
        takeaway={s.profile?._takeaway}
        investmentThesis={s.profile?.investment_thesis}
        managerId={s.savedId}
        onSelectFirm={onSelectFirm}
      />
      {s.savedId != null && <ExportBar managerId={s.savedId} />}
    </>
  );
}
