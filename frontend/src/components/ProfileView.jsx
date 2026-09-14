import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function ConfChip({ conf }) {
  const c = (conf || "unknown").toLowerCase();
  return <span className={`chip dot chip-conf-${c}`}>{c}</span>;
}

function displayValue(v) {
  if (v == null || v === "") return null;
  if (Array.isArray(v)) return v.length ? v.join(" · ") : null;
  return String(v);
}

function Fact({ label, field }) {
  const v = displayValue(field?.value);
  return (
    <div className="fact">
      <div className="fact-k">{label}</div>
      <div className={"fact-v" + (v ? "" : " empty")}>{v || "unavailable"}</div>
      <div className="fact-foot">
        <ConfChip conf={field?.confidence} />
        {field?.source
          ? <a href={field.source} target="_blank" rel="noreferrer" className="hint">source ↗</a>
          : <span className="hint">no source</span>}
      </div>
    </div>
  );
}

export default function ProfileView({ profile, profileMd, savedId, findings, firmName, updatedAt }) {
  const hasStruct = profile && typeof profile === "object";
  const summary = hasStruct ? (profile.what_to_watch || "") : "";
  const displayName = firmName || (hasStruct ? (profile.firm_name?.value || "Profile") : "Profile");

  return (
    <>
      {hasStruct && (
        <>
          <div className="profile-hero fade-in">
            <div className="row space" style={{ alignItems: "flex-start" }}>
              <div>
                <div className="kicker">Structured profile{savedId != null && <> · saved as #{savedId}</>}</div>
                <h1>{displayName}</h1>
                {summary && <div className="summary">{summary}</div>}
                <div className="meta">
                  {profile.geography_focus?.value && (
                    <span className="chip chip-geo">{profile.geography_focus.value}</span>
                  )}
                  {(Array.isArray(profile.sectors?.value) ? profile.sectors.value : []).slice(0, 3).map((s, i) => (
                    <span key={i} className="chip chip-sector">{s}</span>
                  ))}
                  {(Array.isArray(profile.stages?.value) ? profile.stages.value : []).slice(0, 3).map((s, i) => (
                    <span key={i} className="chip chip-stage">{s}</span>
                  ))}
                  {updatedAt && <span className="chip">updated {new Date(updatedAt).toLocaleDateString()}</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="row space">
              <div>
                <div className="kicker">Fact sheet</div>
                <h3>Structured fields · sourced &amp; confidence-flagged</h3>
              </div>
              <span className="hint">every field cites its origin</span>
            </div>
            <div className="factgrid">
              <Fact label="Headquarters"    field={profile.headquarters} />
              <Fact label="Geography focus" field={profile.geography_focus} />
              <Fact label="AUM"             field={profile.aum} />
              <Fact label="Fund vintages"   field={profile.fund_vintages} />
              <Fact label="Sectors"         field={profile.sectors} />
              <Fact label="Stages"          field={profile.stages} />
            </div>
          </div>

          {Array.isArray(profile.notable_portfolio) && profile.notable_portfolio.length > 0 && (
            <div className="card">
              <div className="kicker">Portfolio</div>
              <h3>Notable investments</h3>
              <div className="pill-list">
                {profile.notable_portfolio.map((p, i) => (
                  <div className="pill-item" key={i}>
                    <div><b>{p.name}</b></div>
                    <div className="pi-note">{p.note}</div>
                    {p.source && <a href={p.source} target="_blank" rel="noreferrer" className="hint">source ↗</a>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {Array.isArray(profile.leadership) && profile.leadership.length > 0 && (
            <div className="card">
              <div className="kicker">People</div>
              <h3>Leadership &amp; key partners</h3>
              <div className="pill-list">
                {profile.leadership.map((p, i) => (
                  <div className="pill-item" key={i}>
                    <div><b>{p.name}</b>{p.role ? <span className="hint"> · {p.role}</span> : null}</div>
                    {p.source && <a href={p.source} target="_blank" rel="noreferrer" className="hint">source ↗</a>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {Array.isArray(profile.recent_activity) && profile.recent_activity.length > 0 && (
            <div className="card">
              <div className="kicker">Signal</div>
              <h3>Recent activity</h3>
              <div className="pill-list">
                {profile.recent_activity.map((p, i) => (
                  <div className="pill-item" key={i}>
                    <div><span className="mono hint">{p.date || "—"}</span></div>
                    <div className="pi-note">{p.item}</div>
                    {p.source && <a href={p.source} target="_blank" rel="noreferrer" className="hint">source ↗</a>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {profileMd && (
        <div className="card">
          <div className="kicker">Narrative</div>
          <h3>One-page profile</h3>
          <div className="md">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{profileMd}</ReactMarkdown>
          </div>
        </div>
      )}

      {findings?.length > 0 && (
        <details className="card findings-card">
          <summary>
            <div className="row space">
              <div>
                <div className="kicker">Provenance</div>
                <h3><span className="chev">›</span> {findings.length} raw sourced findings</h3>
              </div>
              <span className="hint">every claim in the profile traces back to one of these</span>
            </div>
          </summary>
          <div className="findings-list">
            {findings.map((f, i) => (
              <div className="finding" key={i}>
                <span className="f-topic"><span className="chip">{f.topic}</span></span>
                <span className="f-fact">{f.fact}</span>
                <a className="f-src" href={f.source_url} target="_blank" rel="noreferrer">source ↗</a>
              </div>
            ))}
          </div>
        </details>
      )}
    </>
  );
}
