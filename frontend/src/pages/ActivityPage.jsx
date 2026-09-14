import React from "react";
import ActivityFeed from "../components/ActivityFeed.jsx";

export default function ActivityPage({ onSelect }) {
  return <ActivityFeed onSelectFirm={onSelect} />;
}
