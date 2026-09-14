import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import DottedMap from "dotted-map";

/**
 * Region-cropped world map (eastern Europe → Russia → India → SEA).
 * Both the dotted background image and the arc SVG share the same
 * (800×400) coordinate space, so we clip both with a wrapper and
 * translate the bg image while giving the SVG a matching viewBox.
 */

// Full world is projected into 800×400 by projectPoint below.
// This REGION picks a rectangle out of that world: longitude ~15°E → 150°E,
// latitude ~75°N → -15°S. Covers eastern Europe, all of Russia, the Middle
// East, India, and every SEA hub down to Jakarta.
const REGION = { x: 433, y: 33, w: 300, h: 200 };
const FULL_W = 800, FULL_H = 400;

export default function WorldMap({
  dots = [],
  cities = [],
  lineColor = "#ffd7a1",
}) {
  const svgRef = useRef(null);
  const [hoverCity, setHoverCity] = useState(null);

  const svgMap = useMemo(() => {
    const map = new DottedMap({ height: 100, grid: "diagonal" });
    return map.getSVG({
      radius: 0.24,
      color: "#FFFFFF7A",
      shape: "circle",
      backgroundColor: "transparent",
    });
  }, []);

  const projectPoint = (lat, lng) => ({
    x: (lng + 180) * (FULL_W / 360),
    y: (90 - lat)  * (FULL_H / 180),
  });
  const curvedPath = (a, b) => {
    const midX = (a.x + b.x) / 2;
    const midY = Math.min(a.y, b.y) - 34;
    return `M ${a.x} ${a.y} Q ${midX} ${midY} ${b.x} ${b.y}`;
  };
  const eq = (a, b) => a && b && Math.abs(a.lat - b.lat) < 0.5 && Math.abs(a.lng - b.lng) < 0.5;
  const arcActive = (dot) => hoverCity && (eq(dot.start, hoverCity) || eq(dot.end, hoverCity));

  // Positioning math to show only REGION of the full 800×400 background.
  const bgStyle = {
    position: "absolute",
    width:  `${(FULL_W / REGION.w) * 100}%`,
    height: `${(FULL_H / REGION.h) * 100}%`,
    left:   `${-(REGION.x / REGION.w) * 100}%`,
    top:    `${-(REGION.y / REGION.h) * 100}%`,
    pointerEvents: "none",
    userSelect: "none",
  };

  return (
    <div className="worldmap">
      <div className="worldmap-clip">
        <img
          src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`}
          alt="world map"
          draggable={false}
          className="worldmap-bg"
          style={bgStyle}
        />
        <svg
          ref={svgRef}
          viewBox={`${REGION.x} ${REGION.y} ${REGION.w} ${REGION.h}`}
          preserveAspectRatio="xMidYMid slice"
          className="worldmap-svg"
        >
          <defs>
            <linearGradient id="worldmap-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="white" stopOpacity="0" />
              <stop offset="5%"   stopColor={lineColor} stopOpacity="1" />
              <stop offset="95%"  stopColor={lineColor} stopOpacity="1" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {dots.map((dot, i) => {
            const s = projectPoint(dot.start.lat, dot.start.lng);
            const e = projectPoint(dot.end.lat, dot.end.lng);
            const active = arcActive(dot);
            return (
              <motion.path
                key={`p-${i}`}
                d={curvedPath(s, e)}
                fill="none"
                stroke="url(#worldmap-grad)"
                strokeWidth={active ? 1.6 : 0.9}
                style={{
                  opacity: hoverCity ? (active ? 1 : 0.15) : 0.9,
                  filter: active ? "url(#glow)" : "none",
                  transition: "stroke-width .25s, opacity .25s",
                }}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, delay: 0.32 * i, ease: "easeOut" }}
              />
            );
          })}

          {cities.map((c, i) => {
            const p = projectPoint(c.lat, c.lng);
            const active = eq(hoverCity, c);
            return (
              <g key={c.name}
                 onMouseEnter={() => setHoverCity(c)}
                 onMouseLeave={() => setHoverCity(null)}
                 style={{ pointerEvents: "auto", cursor: "pointer" }}>
                <circle cx={p.x} cy={p.y} r="10" fill="transparent" />
                <circle cx={p.x} cy={p.y} r="2.2" fill={lineColor} opacity="0.55">
                  <animate attributeName="r" from="2.2" to={active ? 9 : 6.5} dur="1.6s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.55" to="0" dur="1.6s" repeatCount="indefinite" />
                </circle>
                <motion.circle
                  cx={p.x} cy={p.y}
                  r={active ? 3.2 : 2.2}
                  fill={lineColor}
                  style={{ filter: active ? "url(#glow)" : "none", transition: "r .2s" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.5 + 0.05 * i }}
                />
                <motion.text
                  x={p.x + 5} y={p.y - 4}
                  fill="#fff"
                  fontSize="5.2"
                  fontFamily='"Inter", system-ui'
                  fontWeight={active ? 700 : 500}
                  style={{
                    transition: "opacity .2s, font-weight .2s",
                    paintOrder: "stroke",
                    stroke: "rgba(0,0,0,0.55)",
                    strokeWidth: 1.1,
                    strokeLinejoin: "round",
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: hoverCity && !active ? 0.4 : 0.95 }}
                  transition={{ duration: 0.3, delay: 0.6 + 0.05 * i }}
                >
                  {c.name}
                </motion.text>
                {active && c.note && (
                  <g>
                    <rect
                      x={p.x + 5} y={p.y + 2}
                      width={c.note.length * 2.9 + 8} height="10"
                      rx="3" ry="3"
                      fill="rgba(0,0,0,0.78)"
                      stroke="rgba(255,215,161,0.6)"
                      strokeWidth="0.4"
                    />
                    <text
                      x={p.x + 8.5} y={p.y + 9}
                      fill="#ffd7a1" fontSize="5"
                      fontFamily='"JetBrains Mono", ui-monospace'
                    >
                      {c.note}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
