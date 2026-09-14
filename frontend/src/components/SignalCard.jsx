import React, { useEffect, useState } from "react";
import { getSignals } from "../api";

/** Tracker-wide "what's moving" card. Sits above the tracker on Overview. */
export default function SignalCard({ onSelectFirm }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    getSignals(90).then(setData).catch(() => setData(null));
  }, []);

  if (!data) return null;
  const noActivity = !data.recent_updates || data.recent_updates.length === 0;

  return (
    <div className="signal-card fade-in d1">
      <div className="signal-l">
        <div className="signal-kicker">
          <span className="signal-pulse" />
          LIVE SIGNAL · last {data.window_days} days
        </div>
        <div className="signal-headlines">
          {(data.headlines || []).map((h, i) => (
            <div className="signal-headline" key={i}>· {h}</div>
          ))}
        </div>
      </div>
      {!noActivity && (
        <div className="signal-r">
          <div className="kicker">Most recently updated</div>
          <ul className="signal-updates">
            {data.recent_updates.slice(0, 4).map(u => (
              <li key={u.id}>
                <button className="linkish" onClick={() => onSelectFirm?.(u.id)}>
                  {u.firm_name}
                </button>
                <span className="hint"> · {new Date(u.updated_at).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
