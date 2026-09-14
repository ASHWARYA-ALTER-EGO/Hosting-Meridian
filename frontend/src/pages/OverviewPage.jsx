import React from "react";
import Hero from "../components/Hero.jsx";
import WhatItDoes from "../components/WhatItDoes.jsx";
import PipelineExplainer from "../components/PipelineExplainer.jsx";
import CapabilitiesMatrix from "../components/CapabilitiesMatrix.jsx";
import TrackerTable from "../components/TrackerTable.jsx";
import TrustSection from "../components/TrustSection.jsx";

export default function OverviewPage({
  onProfile, onExplore, onSelect, onCompare, onRowsChange, refreshKey,
}) {
  return (
    <>
      <Hero onProfile={onProfile} onExplore={onExplore} />
      <WhatItDoes />
      <PipelineExplainer />
      <CapabilitiesMatrix />
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
