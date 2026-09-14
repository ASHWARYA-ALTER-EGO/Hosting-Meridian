import React from "react";

const NODES = [
  {
    n: "01 — RESEARCH AGENT",
    title: "Reads the open web with intent",
    desc: "Generates targeted queries per firm — fund history, AUM, recent closes, portfolio, leadership, sector thesis — and executes real web searches through Tavily. Every extracted fact keeps the source URL it came from.",
    out: "Output → 8-20 sourced findings",
  },
  {
    n: "02 — STRUCTURING AGENT",
    title: "Turns noise into a schema",
    desc: "Converts the raw findings into a strict, comparable schema: HQ, geography, AUM, vintages, sectors, stages, notable portfolio, leadership, recent activity. Each field carries a confidence flag (verified / inferred / unknown) — no guess is ever presented as a fact.",
    out: "Output → strict JSON, per-field confidence + source",
  },
  {
    n: "03 — WRITER AGENT",
    title: "Ships an analyst-ready page",
    desc: "Synthesises everything into a one-page Markdown profile: summary, fact sheet with confidence chips, notable portfolio, leadership, recent activity, and a forward-looking 'what to watch' note — formatted identically across every firm so profiles compare cleanly side-by-side.",
    out: "Output → one-page profile, saved to tracker",
  },
];

export default function PipelineExplainer() {
  return (
    <section className="fade-in d2">
      <div className="section-title">
        <h2>How Meridian thinks</h2>
        <div className="sub">A 3-agent LangGraph pipeline · streams live to the browser</div>
      </div>
      <div className="pipeline-explain" style={{ marginTop: 14 }}>
        {NODES.map((node, i) => (
          <div className="node" key={i}>
            <div className="n-num">{node.n}</div>
            <div className="n-title">{node.title}</div>
            <div className="n-desc">{node.desc}</div>
            <div className="n-out"><b>{node.out.split("→")[0]}→</b>{node.out.split("→")[1]}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
