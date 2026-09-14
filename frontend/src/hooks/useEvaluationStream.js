import { useCallback, useRef, useState } from "react";
import { API_BASE_URL } from "../config";

/** Consume /api/profile SSE. Adapted from MARA useLiveStream pattern. */
export function useProfileStream() {
  const [phase, setPhase] = useState("");
  const [phaseStatus, setPhaseStatus] = useState("");
  const [queries, setQueries] = useState([]);
  const [findings, setFindings] = useState([]);
  const [profile, setProfile] = useState(null);
  const [profileMd, setProfileMd] = useState("");
  const [summary, setSummary] = useState("");
  const [savedId, setSavedId] = useState(null);
  const [error, setError] = useState("");
  const [running, setRunning] = useState(false);
  const controllerRef = useRef(null);

  const reset = () => {
    setPhase(""); setPhaseStatus(""); setQueries([]); setFindings([]);
    setProfile(null); setProfileMd(""); setSummary("");
    setSavedId(null); setError("");
  };

  const run = useCallback(async ({ firm_name, geography, sector_focus, stage_focus }) => {
    if (controllerRef.current) controllerRef.current.abort();
    reset();
    setRunning(true);
    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      const res = await fetch(`${API_BASE_URL}/api/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firm_name, geography, sector_focus, stage_focus }),
        signal: controller.signal,
      });
      if (!res.ok) { setError(`Server returned ${res.status}`); setRunning(false); return; }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop();
        for (const part of parts) {
          const line = part.split("\n").find(l => l.startsWith("data:"));
          if (!line) continue;
          let ev; try { ev = JSON.parse(line.slice(5).trim()); } catch { continue; }
          if (!ev || !ev.type) continue;
          switch (ev.type) {
            case "phase":    setPhase(ev.phase); setPhaseStatus(ev.status || ""); break;
            case "queries":  setQueries(ev.queries || []); break;
            case "findings": setFindings(ev.findings || []); break;
            case "profile":  setProfile(ev.profile || null); break;
            case "report_chunk": setProfileMd(p => p + (ev.content || "")); break;
            case "report_done":
              setProfileMd(ev.profile_md || "");
              setSummary(ev.summary || "");
              break;
            case "saved":  setSavedId(ev.id); break;
            case "error":  setError(ev.message || "Unknown error"); break;
            case "end":    setRunning(false); break;
            default: break;
          }
        }
      }
    } catch (e) {
      if (e.name !== "AbortError") setError(e.message || "Stream failed");
    } finally {
      setRunning(false);
    }
  }, []);

  const cancel = () => { if (controllerRef.current) controllerRef.current.abort(); };

  return { phase, phaseStatus, queries, findings, profile, profileMd, summary,
           savedId, error, running, run, cancel };
}
