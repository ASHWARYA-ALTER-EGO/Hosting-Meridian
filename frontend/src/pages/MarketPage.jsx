import React from "react";
import MarketTemperature from "../components/MarketTemperature.jsx";
import NetworkGraph from "../components/NetworkGraph.jsx";

export default function MarketPage({ onSelectFirm }) {
  return (
    <>
      <MarketTemperature onSelectFirm={onSelectFirm} />
      <NetworkGraph onSelectFirm={onSelectFirm} />
    </>
  );
}
