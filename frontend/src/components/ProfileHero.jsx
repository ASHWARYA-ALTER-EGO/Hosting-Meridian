import React from "react";

/** Equity-research-style header for a saved / freshly-generated profile.
 *  Reads at a glance: name, one-line thesis, key facts, confidence summary. */
export default function ProfileHero({ profile, firmName, savedId, updatedAt }) {
  if (!profile) return null;

  const val = (k, dflt = "-") => {
    const f = profile[k];
    if (!f || !f.value) return dflt;
    return Array.isArray(f.value) ? f.value.join(", ") : String(f.value);
  };
  const conf = (k) => (profile[k]?.confidence || "unknown").toLowerCase();

  // Count confidence flags across the six main fact fields
  const factKeys = ["headquarters","geography_focus","aum","fund_vintages","sectors","stages"];
  const counts = { verified: 0, inferred: 0, unknown: 0 };
  for (const k of factKeys) {
    const c = conf(k);
    if (counts[c] != null) counts[c]++;
  }

  const sectors = Array.isArray(profile.sectors?.value) ? profile.sectors.value : [];
  const stages  = Array.isArray(profile.stages?.value)  ? profile.stages.value  : [];

  return (
    <div className="ph fade-in">
      <div className="ph-topline">
        <div className="ph-topline-l">
          <div className="kicker">Fund manager profile
            {savedId != null && <span className="hint"> · saved as #{savedId}</span>}
          </div>
          <h1 className="ph-name">{firmName || val("firm_name")}</h1>
          {profile.what_to_watch && <div className="ph-thesis">{profile.what_to_watch}</div>}
        </div>
        {updatedAt && (
          <div className="ph-topline-r">
            <div className="hint">Last refreshed</div>
            <div className="mono ph-date">{new Date(updatedAt).toLocaleDateString(undefined,
              { day:"2-digit", month:"short", year:"numeric" })}</div>
          </div>
        )}
      </div>

      <div className="ph-facts">
        <div className="ph-fact">
          <div className="ph-fact-k">Headquarters</div>
          <div className="ph-fact-v">{val("headquarters")}</div>
          <div className={`chip dot chip-conf-${conf("headquarters")}`}>{conf("headquarters")}</div>
        </div>
        <div className="ph-fact">
          <div className="ph-fact-k">Geography focus</div>
          <div className="ph-fact-v">{val("geography_focus")}</div>
          <div className={`chip dot chip-conf-${conf("geography_focus")}`}>{conf("geography_focus")}</div>
        </div>
        <div className="ph-fact ph-fact-hero">
          <div className="ph-fact-k">Assets under management</div>
          <div className="ph-fact-v ph-fact-num">{val("aum")}</div>
          <div className={`chip dot chip-conf-${conf("aum")}`}>{conf("aum")}</div>
        </div>
        <div className="ph-fact">
          <div className="ph-fact-k">Fund vintages</div>
          <div className="ph-fact-v">{val("fund_vintages")}</div>
          <div className={`chip dot chip-conf-${conf("fund_vintages")}`}>{conf("fund_vintages")}</div>
        </div>
      </div>

      <div className="ph-tags">
        {sectors.slice(0, 6).map((s, i) => <span key={"s"+i} className="chip chip-sector">{s}</span>)}
        {stages.slice(0, 4).map((s, i)  => <span key={"g"+i} className="chip chip-stage">{s}</span>)}
      </div>

      <div className="ph-conf-bar">
        <div className="ph-conf-item"><span className="chip chip-conf-verified">verified</span> <b>{counts.verified}</b></div>
        <div className="ph-conf-item"><span className="chip chip-conf-inferred">inferred</span> <b>{counts.inferred}</b></div>
        <div className="ph-conf-item"><span className="chip chip-conf-unknown">unknown</span>  <b>{counts.unknown}</b></div>
        <div className="ph-conf-note hint">
          Every fact below cites its source. Nothing is presented as verified without at least two independent findings.
        </div>
      </div>
    </div>
  );
}
