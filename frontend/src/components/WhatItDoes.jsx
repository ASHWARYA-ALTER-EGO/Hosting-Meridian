import React from "react";

/** Clear narrative statement of what the platform actually does.
 *  Sits between the hero and the pipeline explainer. */
export default function WhatItDoes() {
  return (
    <section className="witd fade-in">
      <div className="witd-inner">
        <div className="kicker">The platform in one paragraph</div>
        <p className="witd-lede">
          Meridian is an AI research analyst for private markets. You type a
          fund manager's name; three agents cooperate to read the open web
          about them, structure what they find into a strict comparable schema,
          and file the result as a page in a shared tracker. Every claim is
          <em> sourced</em>. Every field carries <em>confidence</em>.
          Every profile <em>stays current</em> the next time you re-run it.
        </p>

        <div className="witd-grid">
          <div className="witd-cell">
            <div className="witd-num">01</div>
            <div className="witd-h">Type a firm</div>
            <div className="witd-p">Any PE / VC manager active in India or Southeast Asia.</div>
          </div>
          <div className="witd-arrow">→</div>
          <div className="witd-cell">
            <div className="witd-num">02</div>
            <div className="witd-h">Watch it profile itself</div>
            <div className="witd-p">Three agents stream progress live over Server-Sent Events.</div>
          </div>
          <div className="witd-arrow">→</div>
          <div className="witd-cell">
            <div className="witd-num">03</div>
            <div className="witd-h">Get a filed profile</div>
            <div className="witd-p">Sourced fact sheet, one-page narrative, saved to the tracker.</div>
          </div>
        </div>
      </div>
    </section>
  );
}
