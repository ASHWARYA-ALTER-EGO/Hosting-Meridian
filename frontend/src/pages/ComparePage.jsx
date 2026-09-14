import React from "react";
import CompareView from "../components/CompareView.jsx";

export default function ComparePage({ ids, onBack }) {
  return <CompareView ids={ids} onBack={onBack} />;
}
