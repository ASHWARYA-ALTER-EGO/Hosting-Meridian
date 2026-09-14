import React, { useState } from "react";
import ProfileView from "../components/ProfileView.jsx";
import ExportBar from "../components/ExportBar.jsx";
import AskChat from "../components/AskChat.jsx";
import NotePanel from "../components/NotePanel.jsx";
import GlobalComparables from "../components/GlobalComparables.jsx";
import DiligenceMode from "../components/DiligenceMode.jsx";
import MomentumArrow from "../components/MomentumArrow.jsx";
import { seedById } from "../data/seedFirms.js";

/** Handles BOTH real DB rows and seed rows. For seed rows we synthesise the
 *  same shape from the fixture so every downstream widget just works. */
function normaliseFromSeed(seed) {
  return {
    id: seed.id,
    firm_name: seed.firm_name,
    firm_name_key: seed.firm_name_key,
    headquarters: seed.headquarters,
    geography_focus: seed.geography_focus,
    aum_display: seed.aum_display,
    aum_usd_m: seed.aum_usd_m,
    sectors: seed.sectors,
    stages: seed.stages,
    summary: seed.summary,
    investment_thesis: seed.investment_thesis,
    takeaway: seed.takeaway,
    analyst_notes: "",
    profile: {
      firm_name: { value: seed.firm_name, confidence: "verified", source: "" },
      headquarters: { value: seed.headquarters, confidence: "verified", source: seed.findings?.[0]?.source_url || "" },
      geography_focus: { value: seed.geography_focus, confidence: "verified", source: "" },
      aum: { value: seed.aum_display || "", confidence: seed.aum_display ? "inferred" : "unknown", source: "" },
      fund_vintages: { value: [], confidence: "unknown", source: "" },
      sectors: { value: (seed.sectors || "").split(",").map(s => s.trim()).filter(Boolean), confidence: "verified", source: "" },
      stages:  { value: (seed.stages  || "").split(",").map(s => s.trim()).filter(Boolean), confidence: "verified", source: "" },
      notable_portfolio: seed.portfolio || [],
      leadership: seed.leadership || [],
      recent_activity: seed.recent_activity || [],
      investment_thesis: seed.investment_thesis,
      what_to_watch: "",
      _takeaway: seed.takeaway,
    },
    profile_md: "",
    findings: (seed.findings || []).map(f => ({
      topic: f.topic, fact: f.fact, source_url: f.source_url,
    })),
    updated_at: "",
    created_at: "",
    _seed: true,
    _global_comparables: seed.global_comparables || [],
    _momentum: seed.momentum || "steady",
  };
}

export default function SavedProfilePage({ savedRow, onBack, onRefresh, onSelectFirm }) {
  // Accept either an API row or a seed id string
  const row = typeof savedRow === "string" && savedRow.startsWith("seed-")
    ? (() => { const s = seedById(savedRow); return s ? normaliseFromSeed(s) : null; })()
    : savedRow;

  const [dilig, setDilig] = useState(null);

  if (!row) return null;
  const isSeed = row._seed;

  return (
    <>
      <div className="row space no-print">
        <div className="section-title" style={{ padding: 0 }}>
          <div>
            <div className="kicker">
              {isSeed ? "Profile · pre-loaded from seed data" : "Saved profile"}
              {" · "}<MomentumArrow momentum={row._momentum || "steady"} />
            </div>
            <h2>{row.firm_name}</h2>
            <div className="sub">
              {isSeed
                ? "This profile is baked into the frontend from publicly-known information. Click Refresh to run the live 3-agent pipeline and generate a source-linked profile."
                : `Updated ${new Date(row.updated_at).toLocaleString()} · created ${new Date(row.created_at).toLocaleDateString()}`}
            </div>
          </div>
        </div>
        <div className="row">
          <button className="btn ghost sm" onClick={onBack}>← Tracker</button>
          <button className="btn sm" onClick={onRefresh}>
            {isSeed ? "Generate live profile ↻" : "Refresh profile ↻"}
          </button>
        </div>
      </div>

      <ProfileView
        profile={row.profile}
        profileMd={row.profile_md}
        findings={row.findings}
        firmName={row.firm_name}
        updatedAt={row.updated_at}
        takeaway={row.takeaway}
        investmentThesis={row.investment_thesis}
        managerId={row.id}
        firmKey={row.firm_name_key}
        onSelectFirm={onSelectFirm}
        onDiligence={(company) => setDilig(company)}
      />

      <GlobalComparables comparables={row._global_comparables} />

      {!isSeed && <AskChat managerId={row.id} firmName={row.firm_name} />}
      {!isSeed && <NotePanel managerId={row.id} initial={row.analyst_notes || ""} />}
      {!isSeed && <ExportBar managerId={row.id} />}

      <DiligenceMode
        company={dilig}
        onClose={() => setDilig(null)}
        onSelectFirm={onSelectFirm}
      />
    </>
  );
}
