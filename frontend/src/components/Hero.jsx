import React from "react";
import GradientBlinds from "./GradientBlinds.jsx";

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
            internal database — the way a real investment team would run it.
          </p>
          <div className="hero-actions">
            <button className="btn on-dark" onClick={onProfile}>Profile a new firm →</button>
            <button className="btn on-dark ghost" onClick={onExplore}>Explore the tracker</button>
          </div>
          <div className="hero-scroll" aria-hidden>
            <span className="hero-scroll-line" />
            <span>Scroll to explore</span>
          </div>
        </div>

        <aside className="hero-quote fade-in d2" style={{ position: "relative", zIndex: 1 }}>
          <div className="qmark">“</div>
          <blockquote>
            A more independent and timely view of markets, fund managers,
            companies, deals and risks.
          </blockquote>
          <cite>— Lanmea Capital, About page</cite>
          <div className="divider" style={{ margin: "18px 0" }} />
          <div className="hint" style={{ lineHeight: 1.55 }}>
            Meridian is built directly against that mandate: it turns scattered
            public information into a queryable intelligence base, focused on
            the India / SEA private markets Lanmea specialises in.
          </div>
        </aside>
      </div>
    </section>
  );
}
