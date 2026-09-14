import React, { useState } from "react";

/** Analyst-style 3-bullet takeaway pulled from the LLM structuring step.
 *  Includes a "copy to clipboard" so it can be pasted straight into outreach. */
export default function TakeawayCard({ takeaway, thesis, firmName }) {
  const [copied, setCopied] = useState(false);
  if (!takeaway && !thesis) return null;

  const copy = () => {
    const text = [
      thesis ? `${firmName || "Firm"} — Investment thesis: ${thesis}` : "",
      takeaway ? `\nAnalyst takeaway:\n${takeaway}` : "",
    ].join("").trim();
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="card takeaway-card">
      <div className="row space">
        <div>
          <div className="kicker">Analyst view · auto-generated from findings</div>
          <h3>The read on {firmName || "this firm"}</h3>
        </div>
        <button className="btn ghost sm" onClick={copy}>
          {copied ? "✓ Copied" : "Copy for outreach"}
        </button>
      </div>

      {thesis && (
        <blockquote className="thesis-quote">
          <span className="thesis-label">INVESTMENT THESIS</span>
          {thesis}
        </blockquote>
      )}

      {takeaway && (
        <div className="takeaway-body">
          <div className="takeaway-label">TAKEAWAY</div>
          <div className="takeaway-bullets">
            {takeaway
              .split("\n")
              .map(s => s.replace(/^[-*]\s*/, "").trim())
              .filter(Boolean)
              .map((line, i) => (
                <div className="takeaway-bullet" key={i}>
                  <span className="tb-marker">{String(i + 1).padStart(2, "0")}</span>
                  <span className="tb-text">{line}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
