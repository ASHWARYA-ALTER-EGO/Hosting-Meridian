import React from "react";

const MAP = {
  up:     { char: "↑", cls: "mom-up",     title: "Momentum up · deal count rising vs prior period" },
  down:   { char: "↓", cls: "mom-down",   title: "Momentum down · deal count softening" },
  steady: { char: "↔", cls: "mom-steady", title: "Steady deal cadence" },
};

export default function MomentumArrow({ momentum = "steady" }) {
  const m = MAP[momentum] || MAP.steady;
  return <span className={`mom ${m.cls}`} title={m.title} aria-label={m.title}>{m.char}</span>;
}
