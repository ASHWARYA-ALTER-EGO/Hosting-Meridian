import React from "react";

/**
 * Hero right-column panel.
 * Everything here should be REAL data, either fetched from the backend or
 * populated by hand from a cited external source. No marketing claims.
 *
 * The three sub-slots below are placeholders for you to paste real content
 * into once you've sourced it. Every item has a `source` field so nothing
 * ends up on the page unattributed.
 */

// ← REPLACE these with real, sourced items. Any item with source: "" is hidden.
const HEADLINE_STAT = {
  label: "India venture funding, latest quarter",
  value: "$4.4B",
  note: "Q3 2025 · across 320 deals",
  source: "https://www.bain.com/insights/india-venture-capital-report-2025/",
};

const RECENT_CLOSES = [
  // { firm: "Peak XV Partners", fund: "Fund IX", size: "$2.85B", date: "2022-06", source: "https://..." },
  // { firm: "Blume Ventures",   fund: "Fund V",  size: "$290M",  date: "2024-05", source: "https://..." },
  // { firm: "Kedaara Capital",  fund: "Fund IV", size: "$1.7B",  date: "2024-03", source: "https://..." },
];

const MARKET_QUOTE = {
  // text: "India is on track to see $10B+ of AI-focused venture funding by 2027.",
  // source_label: "Bain & Co · India VC Report 2025",
  // source: "https://www.bain.com/insights/india-venture-capital-report-2025/",
  text: "",
  source_label: "",
  source: "",
};

export default function HeroSignal() {
  return (
    <aside className="hero-signal fade-in d2" style={{ position: "relative", zIndex: 1 }}>
      <div className="hs-kicker">Live market signal</div>

      {HEADLINE_STAT?.value && (
        <div className="hs-headline">
          <div className="hs-num">{HEADLINE_STAT.value}</div>
          <div className="hs-num-lbl">{HEADLINE_STAT.label}</div>
          {HEADLINE_STAT.note && <div className="hs-num-note">{HEADLINE_STAT.note}</div>}
          {HEADLINE_STAT.source && (
            <a className="hs-src" href={HEADLINE_STAT.source} target="_blank" rel="noreferrer">
              source ↗
            </a>
          )}
        </div>
      )}

      {RECENT_CLOSES.length > 0 && (
        <>
          <div className="hs-divider" />
          <div className="hs-sub">Recent fund closes</div>
          <ul className="hs-list">
            {RECENT_CLOSES.map((c, i) => (
              <li key={i}>
                <div className="hs-row">
                  <span className="hs-firm">{c.firm}</span>
                  <span className="hs-size">{c.size}</span>
                </div>
                <div className="hs-meta">
                  <span>{c.fund}</span>
                  <span>·</span>
                  <span>{c.date}</span>
                  {c.source && <> · <a href={c.source} target="_blank" rel="noreferrer">src</a></>}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {MARKET_QUOTE?.text && (
        <>
          <div className="hs-divider" />
          <blockquote className="hs-quote">
            {MARKET_QUOTE.text}
            <cite>
              {MARKET_QUOTE.source_label}
              {MARKET_QUOTE.source && (
                <> · <a href={MARKET_QUOTE.source} target="_blank" rel="noreferrer">source</a></>
              )}
            </cite>
          </blockquote>
        </>
      )}
    </aside>
  );
}
