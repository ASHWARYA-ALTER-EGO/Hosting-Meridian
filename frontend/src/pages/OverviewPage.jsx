import React from "react";
import Hero from "../components/Hero.jsx";
import FundFitSearch from "../components/FundFitSearch.jsx";
import WhatItDoes from "../components/WhatItDoes.jsx";
import PipelineExplainer from "../components/PipelineExplainer.jsx";
import SignalCard from "../components/SignalCard.jsx";
import TrackerTable from "../components/TrackerTable.jsx";
import TrustSection from "../components/TrustSection.jsx";

export default function OverviewPage({
  onProfile, onExplore, onSelect, onCompare, onRowsChange, refreshKey,
}) {
  return (
    <>
      <Hero onProfile={onProfile} onExplore={onExplore} />
      <FundFitSearch onSelectFirm={onSelect} />
      <WhatItDoes />
      <PipelineExplainer />
      <SignalCard onSelectFirm={onSelect} />
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
