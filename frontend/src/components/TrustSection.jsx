import React from "react";

const ITEMS = [
  {
    n: "01",
    title: "Sourced or silent",
    desc: "Every non-empty field cites a specific URL from the research pass. If nothing supports a claim, the field renders as an em-dash — never as an unattributed guess.",
  },
  {
    n: "02",
    title: "Confidence, not vibes",
    desc: "Fields are tagged verified (two or more independent findings agreed), inferred (a single supporting source), or unknown. An analyst can see at a glance which numbers to trust.",
  },
  {
    n: "03",
    title: "A tracker, not a lookup",
    desc: "Every profile is upserted to a real relational store. Re-run the same firm a month later and the record is refreshed in place — the way a live intelligence base actually works.",
  },
];

export default function TrustSection() {
  return (
    <section className="fade-in d2">
      <div className="section-title">
        <h2>Built for analysts, not for demos</h2>
        <div className="sub">Three principles the pipeline is designed around</div>
      </div>
      <div className="trust" style={{ marginTop: 14 }}>
        {ITEMS.map((t, i) => (
          <div className="trust-item" key={i}>
            <div className="ti-num">{t.n}</div>
            <div className="ti-title">{t.title}</div>
            <div className="ti-desc">{t.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
