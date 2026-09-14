/** Momentum: compare last-N-years deal count to prior-N-years. */
export function momentumFromTimeline(timeline) {
  if (!timeline?.counts?.length) return "steady";
  const c = timeline.counts;
  const half = Math.max(1, Math.floor(c.length / 2));
  const recent = c.slice(-half).reduce((a, b) => a + b, 0);
  const prior  = c.slice(0, c.length - half).reduce((a, b) => a + b, 0) || 1;
  const ratio = recent / prior;
  if (ratio > 1.2) return "up";
  if (ratio < 0.85) return "down";
  return "steady";
}
