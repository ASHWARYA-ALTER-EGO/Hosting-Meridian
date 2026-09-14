import React, { useEffect, useState } from "react";

/** Star / unstar a firm. Persisted in localStorage per browser. */
const KEY = "meridian.watchlist";

function loadSet() {
  try {
    const raw = localStorage.getItem(KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch { return new Set(); }
}

export function useWatchlist() {
  const [set, setSet] = useState(() => loadSet());
  const toggle = (key) => {
    setSet(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      try { localStorage.setItem(KEY, JSON.stringify([...next])); } catch {}
      return next;
    });
  };
  return { set, toggle, has: (k) => set.has(k) };
}

export default function WatchStar({ firmKey, size = 14 }) {
  const { has, toggle } = useWatchlist();
  const on = has(firmKey);
  return (
    <button
      className={`watch-star ${on ? "on" : ""}`}
      onClick={(e) => { e.stopPropagation(); toggle(firmKey); }}
      title={on ? "Remove from watchlist" : "Add to watchlist"}
      aria-label="watchlist"
    >
      <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden>
        <path
          d="M10 2 L12.4 7.3 L18 8.1 L14 12 L15 17.6 L10 15 L5 17.6 L6 12 L2 8.1 L7.6 7.3 Z"
          fill={on ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
