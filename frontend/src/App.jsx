import React, { useCallback, useEffect, useState } from "react";
import BrandMark from "./components/BrandMark.jsx";
import AskBar from "./components/AskBar.jsx";
import OverviewPage from "./pages/OverviewPage.jsx";
import TrackerPage from "./pages/TrackerPage.jsx";
import ActivityPage from "./pages/ActivityPage.jsx";
import OverlapsPage from "./pages/OverlapsPage.jsx";
import NewProfilePage from "./pages/NewProfilePage.jsx";
import SavedProfilePage from "./pages/SavedProfilePage.jsx";
import ComparePage from "./pages/ComparePage.jsx";
import DealsPage from "./pages/DealsPage.jsx";
import MarketPage from "./pages/MarketPage.jsx";
import { SEED_FIRMS } from "./data/seedFirms.js";
import { useProfileStream } from "./hooks/useEvaluationStream.js";
import { getManager } from "./api";

export default function App() {
  const [view, setView] = useState("home");
  const [refreshKey, setRefreshKey] = useState(0);
  const [savedRow, setSavedRow] = useState(null);
  const [initial, setInitial] = useState({});
  const [, setTrackerRows] = useState([]);
  const [compareIds, setCompareIds] = useState([]);
  const s = useProfileStream();

  useEffect(() => { if (s.savedId != null) setRefreshKey(k => k + 1); }, [s.savedId]);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const openSaved = async (id) => {
    // Seed rows: hand the string id to SavedProfilePage; it looks it up locally.
    if (typeof id === "string" && id.startsWith("seed-")) {
      setSavedRow(id); setView("saved"); scrollTop();
      return;
    }
    try {
      const row = await getManager(id);
      setSavedRow(row); setView("saved"); scrollTop();
    } catch (e) {
      // Backend unreachable / row missing: fall through gracefully
      alert("Failed to load: " + e.message);
    }
  };
  const goNew      = (seed = {}) => { setInitial(seed); setView("profile"); scrollTop(); };
  const goTracker  = () => { setView("tracker"); scrollTop(); };
  const goHome     = () => { setView("home"); scrollTop(); };
  const goOverlaps = () => { setView("overlaps"); scrollTop(); };
  const goActivity = () => { setView("activity"); scrollTop(); };
  const goDeals    = () => { setView("deals");    scrollTop(); };
  const goMarket   = () => { setView("market");   scrollTop(); };
  const goCompare  = (ids) => { setCompareIds(ids); setView("compare"); scrollTop(); };

  const onRowsChange = useCallback((rows) => setTrackerRows(rows), []);

  const navBtn = (key, label, onClick, extra = "") => (
    <button className={`tnav-btn ${extra} ${view === key ? "active" : ""}`} onClick={onClick}>{label}</button>
  );

  const onHero = view === "home";

  return (
    <div className={`shell ${onHero ? "shell--home" : ""}`}>
      <nav className={`topnav no-print ${onHero ? "topnav--on-hero" : ""}`}>
        <div className="brand" role="button" onClick={goHome} style={{ cursor: "pointer" }}>
          <div className="brand-mark"><BrandMark /></div>
          <div>
            <div className="brand-title">Meridian</div>
            <div className="brand-sub">Fund Manager Intelligence · India &amp; SEA</div>
          </div>
        </div>
        <div className="topnav-right">
          <AskBar onSelectFirm={openSaved} />
          {navBtn("home",     "Overview", goHome)}
          {navBtn("tracker",  "Tracker",  goTracker)}
          {navBtn("market",   "Market",   goMarket)}
          {navBtn("deals",    "Deals",    goDeals)}
          {navBtn("activity", "Activity", goActivity)}
          {navBtn("overlaps", "Overlaps", goOverlaps)}
          {navBtn("profile",  "+ New profile", () => goNew(), "primary")}
        </div>
      </nav>

      {view === "home" && (
        <OverviewPage
          refreshKey={refreshKey}
          onProfile={() => goNew()}
          onExplore={goTracker}
          onSelect={openSaved}
          onCompare={goCompare}
          onRowsChange={onRowsChange}
        />
      )}
      {view === "tracker" && (
        <TrackerPage
          refreshKey={refreshKey}
          onSelect={openSaved}
          onCompare={goCompare}
          onProfile={() => goNew()}
          onRowsChange={onRowsChange}
        />
      )}
      {view === "activity" && <ActivityPage onSelect={openSaved} />}
      {view === "overlaps" && <OverlapsPage onSelect={openSaved} />}
      {view === "deals"    && <DealsPage    onSelectFirm={openSaved} />}
      {view === "market"   && <MarketPage   onSelectFirm={openSaved} />}
      {view === "compare"  && <ComparePage ids={compareIds} onBack={goTracker} />}
      {view === "profile"  && <NewProfilePage initial={initial} stream={s} onSelectFirm={openSaved} />}
      {view === "saved" && savedRow && (
        <SavedProfilePage
          savedRow={savedRow}
          onBack={goTracker}
          onSelectFirm={openSaved}
          onRefresh={() => {
            // Seed row refresh → send to profile generator prefilled
            if (typeof savedRow === "string" && savedRow.startsWith("seed-")) {
              const seed = SEED_FIRMS.find(f => f.id === savedRow);
              if (seed) goNew({
                firm_name: seed.firm_name,
                geography: seed.geography_focus,
                sector_focus: seed.sectors,
                stage_focus: seed.stages,
              });
              return;
            }
            goNew({
            firm_name: savedRow.firm_name,
            geography: savedRow.geography_focus,
            sector_focus: savedRow.sectors,
            stage_focus: savedRow.stages,
          })}
        />
      )}

      <footer className="ftr no-print">
        <div>
          <b style={{ color: "var(--text-dim)" }}>Meridian</b> ·
          {" "}India &amp; SEA private-markets intelligence ·
          {" "}<span className="badge">v0.3</span>
        </div>
        <div className="colophon">
          FastAPI · LangGraph · Tavily · SSE · SQLAlchemy · Vite + React
        </div>
      </footer>
    </div>
  );
}
