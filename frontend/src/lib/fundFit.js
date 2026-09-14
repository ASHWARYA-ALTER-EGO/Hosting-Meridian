/** Reverse-search: describe a startup, get the top-N most likely investors
 *  from the tracker with a one-line "why". Runs entirely on seed data,
 *  so it works with zero backend. */
import { SEED_FIRMS } from "../data/seedFirms.js";

const SECTOR_KEYWORDS = {
  fintech: ["fintech", "finance", "payment", "banking", "lending", "credit", "insurance", "wealth", "insurtech", "neobank"],
  saas: ["saas", "software", "b2b", "enterprise", "api", "developer", "devops", "platform"],
  consumer: ["consumer", "d2c", "commerce", "marketplace", "retail", "brand"],
  health: ["health", "healthtech", "medical", "pharma", "wellness", "biotech", "diagnostic", "hospital"],
  "deep-tech": ["ai", "ml", "deep-tech", "deeptech", "robotics", "chip", "space", "quantum"],
  climate: ["climate", "clean", "energy", "sustainability", "carbon", "renewable"],
  ed: ["ed-tech", "edtech", "education", "learning"],
  logistics: ["logistics", "supply", "delivery", "mobility", "transport"],
  industrial: ["industrial", "manufacturing", "hardware", "iot"],
};

const STAGE_KEYWORDS = {
  seed:    ["seed", "pre-seed", "angel", "pre-product", "idea"],
  "series a":["series a", "series-a", "seriesa", "early", "post-product-market"],
  "series b":["series b", "series-b", "seriesb", "scale"],
  growth:  ["growth", "series c", "series-c", "seriesc", "series d", "series-d"],
  pe:      ["pe", "buyout", "private equity", "control", "majority"],
};

const GEO_KEYWORDS = {
  india:      ["india", "indian", "mumbai", "bengaluru", "bangalore", "delhi", "gurgaon", "chennai", "hyderabad"],
  indonesia:  ["indonesia", "jakarta", "bali"],
  singapore:  ["singapore", "sg"],
  vietnam:    ["vietnam", "hanoi", "hcmc", "ho chi minh"],
  philippines:["philippines", "manila"],
  thailand:   ["thailand", "bangkok"],
  malaysia:   ["malaysia", "kuala lumpur", "kl"],
  sea:        ["sea", "southeast asia", "south east asia", "south-east asia", "asean", "apac"],
};

function detectFrom(q, dict) {
  const s = (q || "").toLowerCase();
  const hits = new Set();
  for (const [k, kws] of Object.entries(dict)) {
    for (const w of kws) if (s.includes(w)) { hits.add(k); break; }
  }
  return hits;
}

function firmMatches(firm, sectors, stages, geos) {
  const fSectors = (firm.sectors || "").toLowerCase();
  const fStages  = (firm.stages || "").toLowerCase();
  const fGeo     = (firm.geography_focus || "").toLowerCase();

  let score = 0;
  const reasons = [];

  for (const s of sectors) {
    if (fSectors.includes(s.split(" ")[0])) { score += 2; reasons.push(`sector fit (${s})`); }
  }
  for (const st of stages) {
    if (fStages.includes(st.split(" ")[0])) { score += 2; reasons.push(`stage fit (${st})`); }
  }
  for (const g of geos) {
    if (g === "sea" && (fGeo.includes("sea") || fGeo.includes("asia") || fGeo.includes("singapore") || fGeo.includes("indonesia"))) { score += 2; reasons.push("SEA geo fit"); }
    else if (g === "india" && fGeo.includes("india")) { score += 2; reasons.push("India geo fit"); }
    else if (fGeo.includes(g)) { score += 2; reasons.push(`${g} geo fit`); }
  }
  return { score, reasons };
}

export function findFits(description, topN = 5) {
  const q = (description || "").trim();
  if (q.length < 5) return { fits: [], detected: {} };

  const sectors = detectFrom(q, SECTOR_KEYWORDS);
  const stages  = detectFrom(q, STAGE_KEYWORDS);
  const geos    = detectFrom(q, GEO_KEYWORDS);

  const ranked = SEED_FIRMS.map(f => {
    const { score, reasons } = firmMatches(f, sectors, stages, geos);
    return { firm: f, score, reasons };
  })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);

  return {
    detected: {
      sectors: [...sectors],
      stages:  [...stages],
      geographies: [...geos],
    },
    fits: ranked.map(r => ({
      id: r.firm.id,
      firm_name: r.firm.firm_name,
      geography_focus: r.firm.geography_focus,
      stages: r.firm.stages,
      sectors: r.firm.sectors,
      why: r.reasons.slice(0, 3).join(" · ") || "partial profile match",
      score: r.score,
    })),
  };
}
