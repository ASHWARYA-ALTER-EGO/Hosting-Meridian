import React from "react";
import Hero from "../components/Hero.jsx";
import PipelineExplainer from "../components/PipelineExplainer.jsx";
import TrackerTable from "../components/TrackerTable.jsx";
import TrustSection from "../components/TrustSection.jsx";

export default function OverviewPage({
  onProfile, onExplore, onSelect, onCompare, onRowsChange, refreshKey,
}) {
  return (
    <>
      <Hero onProfile={onProfile} onExplore={onExplore} />
      <PipelineExplainer />
      <TrackerTable
        refreshKey={refreshKey}
        onSelect={onSelect}
        onNew={onProfile}
        onRowsChange={onRowsChange}
        onCompare={onCompare}
      />
      <TrustSection />
    </>
  );
}
