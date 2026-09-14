/** Client-side keyword-overlap RAG over the pre-baked seed findings.
 *  Used as fallback when the backend has no findings (empty DB / offline). */
import { allSeedFindings, SEED_FIRMS } from "../data/seedFirms.js";

function tok(s) {
  return new Set((s || "").toLowerCase().match(/[a-z][a-z0-9]{2,}/g) || []);
}

export function seedAsk(question, k = 8) {
  const q = (question || "").toLowerCase();
  const qtoks = tok(q);
  const pool = allSeedFindings();

  // Firm-name mention boost: if the question mentions a firm, dupe its findings.
  const boosted = [...pool];
  for (const f of SEED_FIRMS) {
    if (q.includes(f.firm_name.toLowerCase()) || q.includes(f.firm_name_key)) {
      for (const p of pool.filter(x => x.firm_id === f.id)) boosted.push(p, p);
    }
  }

  const scored = boosted.map(f => {
    const ftoks = tok(f.fact + " " + f.topic + " " + f.firm_name);
    let s = 0; for (const t of qtoks) if (ftoks.has(t)) s++;
    return { s, f };
  });
  scored.sort((a, b) => b.s - a.s);

  const seen = new Set();
  const top = [];
  for (const { s, f } of scored) {
    const key = `${f.firm_id}::${f._seed_idx}`;
    if (seen.has(key)) continue;
    if (s === 0 && top.length >= k) break;
    seen.add(key); top.push(f);
    if (top.length >= k) break;
  }

  // Compose a deterministic template answer from the top findings.
  // (When backend RAG is live, its LLM answer beats this. Offline this stays honest.)
  const firmsInAnswer = [...new Set(top.map(t => t.firm_name))].slice(0, 4);
  let answer;
  if (top.length === 0) {
    answer = "The seed dataset doesn't contain findings relevant to that question. Try asking about specific firms (e.g. Peak XV, Blume, East Ventures) or sectors (fintech, SaaS, PE).";
  } else {
    const bullets = top.slice(0, 5).map((t, i) => `[${i + 1}] ${t.firm_name} — ${t.fact}`).join("\n");
    answer =
      `Based on ${top.length} findings across ${firmsInAnswer.length} tracked firms (${firmsInAnswer.join(", ")}):\n\n${bullets}\n\nOpen any firm to explore its full profile.`;
  }

  return {
    answer,
    sources: top.map((t, i) => ({
      n: i + 1, firm_id: t.firm_id, firm_name: t.firm_name,
      topic: t.topic, fact: t.fact, source_url: t.source_url,
    })),
    firms_covered: SEED_FIRMS.length,
    _seed: true,
  };
}
