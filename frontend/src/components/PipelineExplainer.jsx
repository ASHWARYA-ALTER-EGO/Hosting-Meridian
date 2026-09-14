import React from "react";

const NODES = [
  {
    n: "01 · RESEARCH AGENT",
    title: "Reads the open web with intent",
    desc: "Generates targeted queries per firm (fund history, AUM, recent closes, portfolio, leadership, sector thesis) and executes real web searches through Tavily. Every extracted fact keeps the source URL it came from.",
    out: "8-20 sourced findings",
    example: "aum · vintage · hq · leadership · portfolio · deals",
  },
  {
    n: "02 · STRUCTURING AGENT",
    title: "Turns noise into a schema",
    desc: "Converts the raw findings into a strict, comparable schema: HQ, geography, AUM, vintages, sectors, stages, notable portfolio, leadership, recent activity. Each field carries a confidence flag (verified / inferred / unknown), so no guess is ever presented as a fact.",
    out: "strict JSON · per-field confidence + source",
    example: '{ "aum": { "value": "$2.85B", "confidence": "verified" } }',
  },
  {
    n: "03 · WRITER AGENT",
    title: "Ships an analyst-ready page",
    desc: "Synthesises everything into a one-page Markdown profile with summary, fact sheet, portfolio, leadership, recent activity, and a forward-looking 'what to watch' note. Formatted identically across every firm so profiles compare cleanly.",
    out: "one-page profile · saved to tracker",
    example: "# Peak XV Partners · India / SEA growth-stage VC…",
  },
];

export default function PipelineExplainer() {
  return (
    <section className="fade-in d2">
      <div className="section-title">
        <div>
          <div className="kicker">How Meridian thinks</div>
          <h2>A 3-agent LangGraph pipeline, streaming live to the browser.</h2>
        </div>
        <div className="sub">Each stage streams its progress and its output as it happens.</div>
      </div>

      <div className="pipeline-explain">
        {NODES.map((node, i) => (
          <div className="node" key={i}>
            <div className="n-num">{node.n}</div>
            <div className="n-title">{node.title}</div>
            <div className="n-desc">{node.desc}</div>
            <div className="n-example">{node.example}</div>
            <div className="n-out"><b>Output →</b> {node.out}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
