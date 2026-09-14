import React from "react";
import GradientBlinds from "./GradientBlinds.jsx";
import WorldMap from "./WorldMap.jsx";

/** India + SEA financial hubs (also where the tracked firms operate). */
const CITIES = [
  { name: "Mumbai",       lat: 19.0760, lng:  72.8777, note: "India financial capital" },
  { name: "Bengaluru",    lat: 12.9716, lng:  77.5946, note: "VC & startup hub" },
  { name: "Delhi",        lat: 28.6139, lng:  77.2090, note: "Policy & growth capital" },
  { name: "Singapore",    lat:  1.3521, lng: 103.8198, note: "SEA fund hub" },
  { name: "Jakarta",      lat: -6.2088, lng: 106.8456, note: "Indonesia tech ecosystem" },
  { name: "Ho Chi Minh",  lat: 10.8231, lng: 106.6297, note: "Vietnam growth stage" },
  { name: "Manila",       lat: 14.5995, lng: 120.9842, note: "Philippines emerging" },
  { name: "Bangkok",      lat: 13.7563, lng: 100.5018, note: "Thailand consumer" },
  { name: "Hong Kong",    lat: 22.3193, lng: 114.1694, note: "APAC gateway" },
];

const CONNECTIONS = [
  { start: CITIES[0], end: CITIES[1] },  // Mumbai → Bengaluru
  { start: CITIES[0], end: CITIES[2] },  // Mumbai → Delhi
  { start: CITIES[0], end: CITIES[3] },  // Mumbai → Singapore
  { start: CITIES[3], end: CITIES[4] },  // Singapore → Jakarta
  { start: CITIES[3], end: CITIES[5] },  // Singapore → Ho Chi Minh
  { start: CITIES[3], end: CITIES[6] },  // Singapore → Manila
  { start: CITIES[8], end: CITIES[3] },  // Hong Kong → Singapore
  { start: CITIES[1], end: CITIES[7] },  // Bengaluru → Bangkok
];

export default function Hero({ onProfile, onExplore }) {
  return (
    <section className="hero fade-in">
      <div className="hero-bg no-print">
        <GradientBlinds
          gradientColors={["#3a0a15", "#6b1e2e", "#a94053", "#d4a373", "#f2c46b"]}
          angle={20}
          noise={0.22}
          blindCount={18}
          blindMinWidth={70}
          mouseDampening={0.2}
          spotlightRadius={0.6}
          spotlightSoftness={1.1}
          spotlightOpacity={0.85}
          distortAmount={0.4}
          mirrorGradient={false}
          shineDirection="left"
          mixBlendMode="lighten"
        />
      </div>

      <div className="hero-inner">
        <div style={{ position: "relative", zIndex: 1 }}>
          <h1>
            Structured intelligence on the fund managers <em>quietly shaping</em> India &amp; Southeast Asia.
          </h1>
          <p className="hero-lede">
            Meridian researches, structures, and tracks private-equity and venture-capital
            fund managers across India and Southeast Asia. Every fact is
            {" "}<strong>source-linked</strong>, every field is
            {" "}<strong>confidence-flagged</strong>, and every profile joins a growing
            internal database.
          </p>
          <div className="hero-actions">
            <button className="btn on-dark" onClick={onProfile}>Profile a new firm →</button>
            <button className="btn on-dark ghost" onClick={onExplore}>Explore the tracker</button>
          </div>
        </div>

        <aside className="hero-map fade-in d2" style={{ position: "relative", zIndex: 1 }}>
          <div className="hero-map-hdr">
            <div className="hero-map-title">
              <span>India</span>
              <span className="hero-map-sep">×</span>
              <span>Southeast Asia</span>
            </div>
            <div className="hero-map-sub">{CITIES.length} financial hubs · {CONNECTIONS.length} regional flows</div>
          </div>

          <WorldMap dots={CONNECTIONS} cities={CITIES} lineColor="#ffd7a1" />

          <div className="hero-map-hint">Hover any city to trace its connections.</div>
        </aside>
      </div>
    </section>
  );
}
