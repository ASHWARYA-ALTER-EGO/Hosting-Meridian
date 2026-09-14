import React, { useEffect, useRef, useState } from "react";
import { askGlobal } from "../api";
import { seedAsk } from "../lib/seedRag.js";

const QUICK_QS = [
  "Which firms invest in fintech in Indonesia?",
  "Compare Peak XV and Accel India",
  "Who are the most notable exits across the tracker?",
  "Which India PE firms focus on healthcare?",
  "Which SEA seed investors back Vietnam startups?",
];

/**
 * Global "Ask Meridian" search bar. Sits in the top nav.
 * Cmd+K / Ctrl+K opens a full-screen modal that runs RAG across all firms.
 */
export default function AskBar({ onSelectFirm }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);
  const [firmsCovered, setFirmsCovered] = useState(0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const inputRef = useRef(null);

  // Cmd+K / Ctrl+K to open
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 20);
  }, [open]);

  const run = async (question) => {
    const qq = (question ?? q).trim();
    if (!qq || busy) return;
    setBusy(true); setErr(""); setAnswer(""); setSources([]);
    try {
      const r = await askGlobal(qq);
      // If backend has no findings yet, fall back to the seed dataset locally
      if (!r.sources || r.sources.length === 0 || (r.answer || "").toLowerCase().includes("tracker is empty")) {
        const s = seedAsk(qq);
        setAnswer(s.answer); setSources(s.sources); setFirmsCovered(s.firms_covered);
      } else {
        setAnswer(r.answer || "");
        setSources(r.sources || []);
        setFirmsCovered(r.firms_covered || 0);
      }
    } catch (e) {
      // Backend unreachable → run RAG entirely on the pre-baked seed data
      const s = seedAsk(qq);
      setAnswer(s.answer); setSources(s.sources); setFirmsCovered(s.firms_covered);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button className="askbar-trigger" onClick={() => setOpen(true)}
              title="Ask across the whole tracker">
        <span className="askbar-icon" aria-hidden>⌕</span>
        <span className="askbar-hint">Ask Meridian…</span>
        <span className="askbar-kbd">⌘K</span>
      </button>

      {open && (
        <div className="askbar-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div className="askbar-modal fade-in">
            <div className="askbar-modal-hdr">
              <div className="askbar-modal-title">
                Ask Meridian
                <span className="rag-pill">
                  <span className="rag-dot" /> RAG · retrieval across all firms
                </span>
              </div>
              <button className="askbar-close" onClick={() => setOpen(false)}>✕</button>
            </div>

            <form className="askbar-input-row" onSubmit={(e) => { e.preventDefault(); run(); }}>
              <input
                ref={inputRef}
                placeholder="Ask anything about the tracker…"
                value={q}
                onChange={e => setQ(e.target.value)}
                disabled={busy}
              />
              <button className="btn" disabled={busy || q.trim().length < 3}>Ask</button>
            </form>

            {!answer && !busy && !err && (
              <div className="askbar-suggest">
                <div className="kicker">Try one</div>
                <div className="askbar-chips">
                  {QUICK_QS.map((s, i) => (
                    <button key={i} className="askbar-chip"
                            onClick={() => { setQ(s); run(s); }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {busy && (
              <div className="askbar-busy">
                <span className="spinner" /> Retrieving relevant findings and generating an answer…
              </div>
            )}
            {err && <div className="err">Error: {err}</div>}

            {answer && (
              <div className="askbar-answer">
                <div className="kicker">
                  Answer · grounded in {sources.length} sourced findings across {firmsCovered} firms
                </div>
                <div className="askbar-answer-body">{answer}</div>
                {sources.length > 0 && (
                  <details className="askbar-sources">
                    <summary className="hint">Show the {sources.length} findings used</summary>
                    <ul>
                      {sources.map(s => (
                        <li key={s.n}>
                          <span className="mono hint">[{s.n}]</span>{" "}
                          <button className="linkish" onClick={() => { setOpen(false); onSelectFirm?.(s.firm_id); }}>
                            {s.firm_name}
                          </button>
                          {" · "}<span className="chip">{s.topic}</span>{" "}
                          {s.fact}
                          {s.source_url && <> · <a href={s.source_url} target="_blank" rel="noreferrer">src</a></>}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
                <button className="btn ghost sm"
                        onClick={() => { setAnswer(""); setSources([]); setQ(""); inputRef.current?.focus(); }}>
                  Ask another
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
