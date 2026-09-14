import React, { useState } from "react";
import { askProfile } from "../api";

/**
 * Ask-this-profile chat widget. RAG over that firm's sourced findings only,
 * so answers are grounded in the same evidence the profile is built on.
 */
export default function AskChat({ managerId, firmName }) {
  const [messages, setMessages] = useState([]);      // [{role, text, sources?}]
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  const send = async (e) => {
    e?.preventDefault?.();
    const q = input.trim();
    if (!q || busy) return;
    setInput("");
    setMessages(m => [...m, { role: "user", text: q }]);
    setBusy(true);
    try {
      const { answer, sources } = await askProfile(managerId, q);
      setMessages(m => [...m, { role: "assistant", text: answer, sources }]);
    } catch (err) {
      setMessages(m => [...m, { role: "assistant", text: `Failed: ${err.message}` }]);
    } finally {
      setBusy(false);
    }
  };

  const suggestions = [
    "What sectors does this firm focus on?",
    "Who leads this firm?",
    "What are their most notable investments?",
    "When did they last raise a fund?",
  ];

  return (
    <div className="card ask">
      <div className="row space">
        <div>
          <div className="kicker">Ask this profile</div>
          <h3>Chat with {firmName}'s sourced findings</h3>
        </div>
        <span className="badge">RAG · sourced only</span>
      </div>
      <div className="sub">
        Answers are built from the same source-linked findings that power the
        profile. If the findings do not contain the answer, the assistant will
        say so instead of guessing.
      </div>

      {messages.length === 0 && (
        <div className="ask-suggestions">
          {suggestions.map((s, i) => (
            <button key={i} type="button" className="tnav-btn"
              onClick={() => { setInput(s); setTimeout(() => document.getElementById("ask-input")?.focus(), 10); }}>
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="ask-msgs">
        {messages.map((m, i) => (
          <div key={i} className={`ask-msg ask-msg-${m.role}`}>
            <div className="ask-msg-role">{m.role === "user" ? "You" : "Meridian"}</div>
            <div className="ask-msg-text">{m.text}</div>
            {m.sources?.length > 0 && (
              <details className="ask-msg-sources">
                <summary className="hint">Show {m.sources.length} findings used</summary>
                <ul>
                  {m.sources.map(s => (
                    <li key={s.n}>
                      <span className="mono hint">[{s.n}]</span>{" "}
                      <span className="chip">{s.topic}</span>{" "}
                      {s.fact}
                      {s.source_url && <> · <a href={s.source_url} target="_blank" rel="noreferrer">src</a></>}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        ))}
        {busy && <div className="ask-msg ask-msg-assistant"><div className="hint"><span className="spinner" /> Thinking…</div></div>}
      </div>

      <form className="ask-form" onSubmit={send}>
        <input
          id="ask-input"
          placeholder="Ask a question about this firm…"
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={busy}
        />
        <button className="btn sm" disabled={busy || input.trim().length < 3}>Ask</button>
      </form>
    </div>
  );
}
