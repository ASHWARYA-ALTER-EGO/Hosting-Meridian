import React, { useEffect, useRef, useState } from "react";
import { saveNote } from "../api";

/** Analyst notes per firm. Persisted to backend on debounce. */
export default function NotePanel({ managerId, initial = "" }) {
  const [text, setText] = useState(initial);
  const [saved, setSaved] = useState("idle"); // idle | saving | saved | error
  const debounceRef = useRef(null);
  const firstRender = useRef(true);

  useEffect(() => { setText(initial); }, [initial, managerId]);

  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    if (!managerId || typeof managerId !== "number") return;
    setSaved("saving");
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      saveNote(managerId, text)
        .then(() => setSaved("saved"))
        .catch(() => setSaved("error"));
    }, 700);
    return () => clearTimeout(debounceRef.current);
  }, [text, managerId]);

  return (
    <div className="card notes-card">
      <div className="row space">
        <div>
          <div className="kicker">Analyst notes · saved automatically</div>
          <h3>Your notes on this firm</h3>
        </div>
        <span className={`save-indicator save-${saved}`}>
          {saved === "saving" && "Saving…"}
          {saved === "saved"  && "✓ Saved"}
          {saved === "error"  && "Save failed"}
          {saved === "idle"   && ""}
        </span>
      </div>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Jot thoughts, follow-ups, meeting takeaways… persists across sessions."
        rows={6}
      />
    </div>
  );
}
