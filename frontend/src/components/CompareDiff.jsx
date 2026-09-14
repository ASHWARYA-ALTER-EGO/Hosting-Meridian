import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { compareDiff } from "../api";

/** Below the parallel-column compare table: an LLM-generated diff. */
export default function CompareDiff({ ids }) {
  const [md, setMd] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!ids || ids.length < 2) return;
    setLoading(true); setErr(""); setMd("");
    compareDiff(ids)
      .then(r => setMd(r.diff_md || ""))
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false));
  }, [JSON.stringify(ids)]);

  const copy = () => {
    navigator.clipboard?.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="card diff-card">
      <div className="row space">
        <div>
          <div className="kicker">Comparative analysis · generated over the profiles above</div>
          <h3>What actually distinguishes these firms</h3>
        </div>
        {md && !loading && (
          <button className="btn ghost sm" onClick={copy}>
            {copied ? "✓ Copied" : "Copy analysis"}
          </button>
        )}
      </div>

      {loading && <div className="hint"><span className="spinner" /> Running LLM diff over the structured profiles…</div>}
      {err && <div className="err">Error: {err}</div>}
      {md && !loading && (
        <div className="md diff-md">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{md}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}
