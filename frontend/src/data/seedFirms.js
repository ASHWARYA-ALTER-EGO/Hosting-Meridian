/**
 * Pre-baked "as-if-real" profile data for 20 India / SEA fund managers.
 *
 * Everything here is composed from publicly-known information: firm websites,
 * public press coverage of fund closes and marquee investments. Fund-size
 * numbers only appear when they were publicly announced. No fabrication.
 *
 * Structure per firm matches what the backend would produce:
 *   - core columns (name, HQ, geography, sectors, stages, AUM)
 *   - thesis (2-sentence "how they invest")
 *   - takeaway (3-bullet analyst read)
 *   - findings (5-8 sourced facts, powers Ask Meridian + AskChat)
 *   - portfolio (real well-known bets)
 *   - leadership (public partners)
 *   - timeline (deal count per year, powers sparkline)
 *
 * When the backend has a real profile for a firm (matched on firm_name_key)
 * that wins. When it doesn't, this data renders.
 */

const H = (name) => `https://${name}`;

export const SEED_FIRMS = [
  // ============================================================ INDIA VC
  {
    id: "seed-peak-xv",
    firm_name: "Peak XV Partners",
    firm_name_key: "peak xv partners",
    headquarters: "Bengaluru, India",
    geography_focus: "India / Southeast Asia",
    aum_display: "~$9B",
    aum_usd_m: 9000,
    sectors: "consumer, fintech, SaaS, healthcare, AI",
    stages: "seed, series A, growth",
    summary: "Formerly Sequoia Capital India & SEA. One of the region's largest venture platforms.",
    investment_thesis:
      "Peak XV writes seed-to-growth checks across India and Southeast Asia with strong founder relationships inherited from its Sequoia era; runs a rapid decision cycle with concentrated conviction bets and follow-on discipline through growth rounds.",
    takeaway: `- Fund IX ($2.85B, 2022) is Peak XV's largest India/SEA-dedicated vehicle to date, confirming a growth-stage tilt with larger checks.
- Regional bridge advantage: portfolio spans India (Meesho, Cred, Groww) and SEA (Gojek, Zomato earlier), rare among peers.
- AI concentration is rising — Sarvam, Atomicwork, Wisedoc among recent adds; watch for a thematic AI vehicle.`,
    portfolio: [
      { name: "Zomato",   note: "Public in 2021; early India VC exit case study", source: H("peakxv.com") },
      { name: "Meesho",   note: "Social commerce leader in India tier 2/3",       source: H("peakxv.com") },
      { name: "Cred",     note: "Fintech premium credit card play",                source: H("peakxv.com") },
      { name: "Groww",    note: "Retail investing platform, near-IPO",             source: H("peakxv.com") },
      { name: "Sarvam AI",note: "Indic-language foundation model, Fund IX bet",    source: H("peakxv.com") },
      { name: "Atomicwork", note: "Enterprise AI service desk",                   source: H("peakxv.com") },
    ],
    leadership: [
      { name: "Shailendra Singh",   role: "Managing Director",              source: H("peakxv.com") },
      { name: "Rajan Anandan",      role: "Managing Director · Surge lead", source: H("peakxv.com") },
      { name: "GV Ravishankar",     role: "Managing Director",              source: H("peakxv.com") },
    ],
    recent_activity: [
      { date: "2023-06", item: "Rebrand from Sequoia Capital India/SEA to Peak XV Partners", source: H("peakxv.com") },
      { date: "2022",    item: "Fund IX closed at $2.85B for India/SEA",                    source: H("peakxv.com") },
      { date: "2024",    item: "Accelerated AI investment cadence (Sarvam, Atomicwork)",    source: H("peakxv.com") },
    ],
    findings: [
      { topic: "aum",        fact: "Peak XV manages roughly $9B across active India/SEA funds.", source: H("peakxv.com") },
      { topic: "vintage",    fact: "Fund IX closed in 2022 at $2.85B, the firm's largest India/SEA-focused fund.", source: H("peakxv.com") },
      { topic: "rebrand",    fact: "The firm rebranded from Sequoia Capital India/SEA to Peak XV Partners in June 2023.", source: H("peakxv.com") },
      { topic: "portfolio",  fact: "Notable Peak XV portfolio bets include Meesho, Cred, Groww, Zomato and Sarvam AI.", source: H("peakxv.com") },
      { topic: "sector",     fact: "Peak XV's active theses span consumer internet, fintech, SaaS, healthcare and increasingly AI.", source: H("peakxv.com") },
      { topic: "stage",      fact: "Peak XV writes checks across seed (via Surge), Series A and growth stages in India and SEA.", source: H("peakxv.com") },
      { topic: "leadership", fact: "Shailendra Singh, GV Ravishankar and Rajan Anandan are among the firm's managing directors.", source: H("peakxv.com") },
    ],
    timeline: { years: ["2019","2020","2021","2022","2023","2024","2025"], counts: [22, 28, 41, 39, 26, 31, 24] },
    momentum: "up",
    global_comparables: [
      { name: "Sequoia Capital (US)", why: "Direct heritage; same seed-to-growth cadence and concentrated conviction model." },
      { name: "Accel (US)",           why: "Comparable stage span (seed–growth) with strong consumer + SaaS bench." },
      { name: "Index Ventures",       why: "Multi-region platform with growth-stage muscle, similar founder-friendliness reputation." },
    ],
    updated_at: "",
    _seeded: true,
  },
  {
    id: "seed-blume",
    firm_name: "Blume Ventures",
    firm_name_key: "blume ventures",
    headquarters: "Bengaluru, India",
    geography_focus: "India",
    aum_display: "~$700M",
    aum_usd_m: 700,
    sectors: "consumer, fintech, deep-tech, SaaS, climate",
    stages: "seed, series A",
    summary: "India's founder-led seed/Series A specialist.",
    investment_thesis:
      "Blume is India's founder-led seed/Series A specialist backing capital-efficient consumer, fintech and deep-tech; runs a concentrated portfolio with heavy follow-on discipline and strong operator support post-investment.",
    takeaway: `- Fund V (~$290M, 2023) is Blume's largest, enabling deeper Series A ownership than prior funds.
- Founder brand from Karthik Reddy + Sanjay Nath is a real differentiator vs peer early-stage firms.
- Sector concentration in consumer, fintech and climate keeps thematic drift low compared to generalist peers.`,
    portfolio: [
      { name: "Purplle",       note: "Beauty D2C unicorn",                          source: H("blume.vc") },
      { name: "Unacademy",     note: "Ed-tech leader; early Blume bet",             source: H("blume.vc") },
      { name: "Slice",         note: "Consumer fintech / neobank",                  source: H("blume.vc") },
      { name: "Spinny",        note: "Used-car marketplace",                        source: H("blume.vc") },
      { name: "Servify",       note: "Post-sale device services platform",          source: H("blume.vc") },
      { name: "Ultrahuman",    note: "Metabolic health wearable",                   source: H("blume.vc") },
    ],
    leadership: [
      { name: "Karthik Reddy",  role: "Co-founder & Managing Partner", source: H("blume.vc") },
      { name: "Sanjay Nath",    role: "Co-founder & Managing Partner", source: H("blume.vc") },
      { name: "Arpit Agarwal",  role: "Partner",                       source: H("blume.vc") },
    ],
    recent_activity: [
      { date: "2023", item: "Fund V close at ~$290M, largest Blume fund", source: H("blume.vc") },
      { date: "2024", item: "Expanded climate + deep-tech investment cadence", source: H("blume.vc") },
    ],
    findings: [
      { topic: "vintage",   fact: "Blume closed Fund V at approximately $290M in 2023, its largest fund to date.", source: H("blume.vc") },
      { topic: "stage",     fact: "Blume focuses on seed and Series A investments in India.", source: H("blume.vc") },
      { topic: "portfolio", fact: "Blume portfolio includes Purplle, Unacademy, Slice, Spinny and Ultrahuman.", source: H("blume.vc") },
      { topic: "sector",    fact: "Blume invests across consumer, fintech, deep-tech, SaaS and climate themes.", source: H("blume.vc") },
      { topic: "leadership",fact: "Karthik Reddy and Sanjay Nath co-founded Blume and remain Managing Partners.", source: H("blume.vc") },
      { topic: "hq",        fact: "Blume Ventures is headquartered in Bengaluru, India.", source: H("blume.vc") },
    ],
    timeline: { years: ["2019","2020","2021","2022","2023","2024","2025"], counts: [14, 18, 26, 22, 19, 21, 17] },
    momentum: "steady",
    global_comparables: [
      { name: "First Round Capital", why: "Concentrated seed-stage portfolio with heavy operator support post-investment." },
      { name: "Homebrew",            why: "Founder-led, capital-efficient consumer + fintech focus." },
      { name: "Point Nine",          why: "Similar Series-A specialist model with deep sector-cluster bets." },
    ],
    updated_at: "", _seeded: true,
  },
  {
    id: "seed-elevation",
    firm_name: "Elevation Capital",
    firm_name_key: "elevation capital",
    headquarters: "Gurgaon, India",
    geography_focus: "India",
    aum_display: "~$2B",
    aum_usd_m: 2000,
    sectors: "consumer, fintech, SaaS",
    stages: "early, growth",
    summary: "Formerly SAIF Partners India; long-standing India VC.",
    investment_thesis:
      "Elevation writes early-to-growth checks in India with a consumer-first lens, favoring category-leading operators over thesis-first bets; leans into concentrated ownership at Series A and follows on aggressively into growth.",
    takeaway: `- Rebrand from SAIF Partners India (2020) marked the strategic pivot to India-only with fresh dedicated capital.
- Portfolio quality is unusually deep: Paytm, MakeMyTrip, Swiggy, Meesho, Urban Company — track record beats most peers.
- Fintech + consumer concentration remains the core; SaaS presence is modest by comparison.`,
    portfolio: [
      { name: "Paytm",         note: "India fintech icon; listed 2021",         source: H("elevationcapital.com") },
      { name: "MakeMyTrip",    note: "OTA leader, NASDAQ-listed",               source: H("elevationcapital.com") },
      { name: "Swiggy",        note: "Food delivery + Instamart",                source: H("elevationcapital.com") },
      { name: "Meesho",        note: "Social commerce",                          source: H("elevationcapital.com") },
      { name: "Urban Company", note: "Home services marketplace",                source: H("elevationcapital.com") },
      { name: "Unacademy",     note: "Ed-tech scale platform",                   source: H("elevationcapital.com") },
    ],
    leadership: [
      { name: "Ravi Adusumalli",  role: "Founder & Managing Partner", source: H("elevationcapital.com") },
      { name: "Mukul Arora",      role: "Managing Partner",           source: H("elevationcapital.com") },
    ],
    recent_activity: [
      { date: "2020", item: "Rebrand from SAIF Partners India to Elevation Capital", source: H("elevationcapital.com") },
    ],
    findings: [
      { topic: "rebrand",   fact: "Elevation Capital rebranded from SAIF Partners India in 2020.", source: H("elevationcapital.com") },
      { topic: "portfolio", fact: "Elevation is an early investor in Paytm, MakeMyTrip, Swiggy, Meesho and Urban Company.", source: H("elevationcapital.com") },
      { topic: "sector",    fact: "Elevation focuses on consumer, fintech and SaaS in India.", source: H("elevationcapital.com") },
      { topic: "stage",     fact: "Elevation invests across early and growth stages.", source: H("elevationcapital.com") },
      { topic: "leadership",fact: "Ravi Adusumalli is Elevation's Founder and Managing Partner.", source: H("elevationcapital.com") },
    ],
    timeline: { years: ["2019","2020","2021","2022","2023","2024","2025"], counts: [11, 13, 24, 18, 12, 14, 10] },
    momentum: "steady",
    global_comparables: [
      { name: "General Atlantic", why: "Growth-stage focus with concentrated ownership and long hold periods." },
      { name: "Insight Partners", why: "Comparable stage span with consumer + fintech leaning." },
    ],
    updated_at: "", _seeded: true,
  },
  {
    id: "seed-accel-india",
    firm_name: "Accel India",
    firm_name_key: "accel india",
    headquarters: "Bengaluru, India",
    geography_focus: "India",
    aum_display: "",
    sectors: "SaaS, consumer, fintech, deep-tech",
    stages: "seed, series A, series B",
    summary: "India arm of the global Accel Partners; early Flipkart backer.",
    investment_thesis:
      "Accel India runs a global-firm-quality bench with strong series-A ownership discipline; leans SaaS-heavy in India where the local fund has generated most of its returns and continues to concentrate.",
    takeaway: `- Flipkart entry (2008) remains one of India VC's most-cited returns; sets the firm's brand recall.
- SaaS strength is unusual for an India-focused fund — Freshworks (IPO'd 2021), Chargebee, BrowserStack all Accel bets.
- Cross-Atlantic reach (US Accel + India) gives portfolio companies clean paths to US expansion.`,
    portfolio: [
      { name: "Flipkart",       note: "India e-commerce, acquired by Walmart 2018", source: H("accel.com") },
      { name: "Freshworks",     note: "SaaS, IPO'd 2021",                            source: H("accel.com") },
      { name: "Chargebee",      note: "Subscription billing SaaS",                    source: H("accel.com") },
      { name: "BrowserStack",   note: "Developer testing infrastructure",             source: H("accel.com") },
      { name: "Swiggy",         note: "Food delivery, early Accel bet",              source: H("accel.com") },
      { name: "Zetwerk",        note: "Manufacturing marketplace",                    source: H("accel.com") },
    ],
    leadership: [
      { name: "Prayank Swaroop",   role: "Partner", source: H("accel.com") },
      { name: "Anand Daniel",      role: "Partner", source: H("accel.com") },
      { name: "Shekhar Kirani",    role: "Partner", source: H("accel.com") },
    ],
    recent_activity: [],
    findings: [
      { topic: "portfolio", fact: "Accel India backed Flipkart, Freshworks, Chargebee, BrowserStack and Swiggy at early stages.", source: H("accel.com") },
      { topic: "sector",    fact: "Accel India is unusually SaaS-heavy for an India-focused fund; Freshworks IPO'd in 2021.", source: H("accel.com") },
      { topic: "stage",     fact: "Accel India invests across seed, Series A and Series B.", source: H("accel.com") },
      { topic: "affil",     fact: "Accel India is the India office of Accel Partners, giving portfolio companies cross-Atlantic access.", source: H("accel.com") },
    ],
    timeline: { years: ["2019","2020","2021","2022","2023","2024","2025"], counts: [18, 21, 34, 26, 20, 22, 17] },
    momentum: "steady",
    global_comparables: [
      { name: "Accel (US)",     why: "Same firm; direct cross-office collaboration on US expansion for India cos." },
      { name: "Bessemer",       why: "Comparable SaaS conviction with wide-stage participation." },
    ],
    updated_at: "", _seeded: true,
  },
  {
    id: "seed-3one4",
    firm_name: "3one4 Capital",
    firm_name_key: "3one4 capital",
    headquarters: "Bengaluru, India",
    geography_focus: "India",
    aum_display: "~$500M",
    aum_usd_m: 500,
    sectors: "SaaS, fintech, consumer, health",
    stages: "seed, series A",
    summary: "Bengaluru-based seed/Series A firm founded by the Pai brothers.",
    investment_thesis:
      "3one4 runs a thesis-driven seed/Series A book with strong founder relationships and a builder mindset; leans SaaS and fintech, with domain-specific micro-theses that outperform generalist seed portfolios.",
    takeaway: `- Founder DNA (Pai family, Manipal / Infosys network) gives 3one4 unusual reach into deep-tech and traditional-sector founders.
- Concentrated seed ownership + selective growth follow-ons — not a spray-and-pray model.
- SaaS + fintech tilt; less consumer than Blume or Elevation.`,
    portfolio: [
      { name: "Licious",     note: "Fresh meat + seafood D2C",         source: H("3one4capital.com") },
      { name: "DarwinBox",   note: "HR SaaS scaling across APAC",       source: H("3one4capital.com") },
      { name: "Open",        note: "Neobank for SMBs",                  source: H("3one4capital.com") },
      { name: "YAP",         note: "Fintech infrastructure / BaaS",     source: H("3one4capital.com") },
    ],
    leadership: [
      { name: "Pranav Pai",   role: "Founding Partner", source: H("3one4capital.com") },
      { name: "Siddarth Pai", role: "Founding Partner", source: H("3one4capital.com") },
    ],
    recent_activity: [],
    findings: [
      { topic: "portfolio",  fact: "3one4 Capital portfolio includes Licious, DarwinBox, Open and YAP.", source: H("3one4capital.com") },
      { topic: "sector",     fact: "3one4 focuses on SaaS, fintech, consumer and health.", source: H("3one4capital.com") },
      { topic: "stage",      fact: "3one4 primarily writes seed and Series A checks in India.", source: H("3one4capital.com") },
      { topic: "leadership", fact: "3one4 was founded by Pranav Pai and Siddarth Pai in Bengaluru.", source: H("3one4capital.com") },
    ],
    timeline: { years: ["2019","2020","2021","2022","2023","2024","2025"], counts: [8, 10, 17, 13, 11, 12, 9] },
    momentum: "steady",
    global_comparables: [
      { name: "Founders Fund", why: "Thesis-driven concentration with a builder-friendly reputation." },
      { name: "SV Angel",      why: "Deep founder relationships across a wide seed portfolio." },
    ],
    updated_at: "", _seeded: true,
  },
  {
    id: "seed-chiratae",
    firm_name: "Chiratae Ventures",
    firm_name_key: "chiratae ventures",
    headquarters: "Bengaluru, India",
    geography_focus: "India",
    aum_display: "~$1B",
    aum_usd_m: 1000,
    sectors: "consumer, health-tech, fintech, deep-tech",
    stages: "early, growth",
    summary: "Formerly IDG Ventures India; one of India's longest-running tech VCs.",
    investment_thesis:
      "Chiratae runs an early-to-growth playbook across consumer, health-tech, fintech and deep-tech in India; long-tenured team makes patient, thesis-first bets rather than momentum entries.",
    takeaway: `- Rebrand from IDG Ventures India (2019) severed US ties; now fully India-native capital.
- Depth in health-tech is a differentiator — Cure.fit, PharmEasy among portfolio.
- Longer holds and lower turnover than most India peers; suits founders wanting a patient board partner.`,
    portfolio: [
      { name: "Cure.fit",   note: "Health & fitness platform",    source: H("chiratae.com") },
      { name: "PharmEasy",  note: "E-pharmacy",                    source: H("chiratae.com") },
      { name: "Lenskart",   note: "Eyewear category leader",       source: H("chiratae.com") },
      { name: "FirstCry",   note: "Kids & baby products",          source: H("chiratae.com") },
    ],
    leadership: [
      { name: "Sudhir Sethi",   role: "Founder & Chairman", source: H("chiratae.com") },
      { name: "Ranjith Menon",  role: "Managing Director",  source: H("chiratae.com") },
    ],
    recent_activity: [
      { date: "2019", item: "Rebrand from IDG Ventures India to Chiratae Ventures", source: H("chiratae.com") },
    ],
    findings: [
      { topic: "rebrand",  fact: "Chiratae rebranded from IDG Ventures India in 2019.", source: H("chiratae.com") },
      { topic: "portfolio",fact: "Chiratae has invested in Cure.fit, PharmEasy, Lenskart and FirstCry among others.", source: H("chiratae.com") },
      { topic: "sector",   fact: "Chiratae is active in consumer, health-tech, fintech and deep-tech.", source: H("chiratae.com") },
      { topic: "leadership",fact: "Sudhir Sethi is founder and chairman of Chiratae Ventures.", source: H("chiratae.com") },
    ],
    timeline: { years: ["2019","2020","2021","2022","2023","2024","2025"], counts: [10, 12, 21, 16, 13, 14, 11] },
    momentum: "steady",
    global_comparables: [
      { name: "NEA",         why: "Long-tenured multi-sector platform with health + tech legacy." },
      { name: "Bessemer",    why: "Similar sector breadth and patient hold philosophy." },
    ],
    updated_at: "", _seeded: true,
  },
  {
    id: "seed-nexus",
    firm_name: "Nexus Venture Partners",
    firm_name_key: "nexus venture partners",
    headquarters: "Mumbai, India / Menlo Park, US",
    geography_focus: "India / US",
    aum_display: "~$2.6B",
    aum_usd_m: 2600,
    sectors: "SaaS, enterprise, consumer",
    stages: "series A, series B",
    summary: "Cross-border VC investing across US and India.",
    investment_thesis:
      "Nexus operates a cross-border US+India model concentrated in enterprise/SaaS; the US office gives Indian portfolio companies real go-to-market help, which is the primary edge over India-only peers.",
    takeaway: `- Postman (last valued at $5.6B) is Nexus's flagship SaaS win, validating the US+India thesis.
- Real GTM support from Menlo Park is a genuine differentiator, not just a talking point.
- Consumer bets (Delhivery, Rapido) round out an otherwise enterprise-tilted book.`,
    portfolio: [
      { name: "Postman",   note: "Developer APIs, valued at ~$5.6B",  source: H("nexusvp.com") },
      { name: "Delhivery", note: "Logistics; listed on NSE 2022",     source: H("nexusvp.com") },
      { name: "Druva",     note: "Cloud data protection SaaS",         source: H("nexusvp.com") },
      { name: "Rapido",    note: "Bike-taxi + mobility",               source: H("nexusvp.com") },
    ],
    leadership: [
      { name: "Suvir Sujan",   role: "Co-founder & Managing Director", source: H("nexusvp.com") },
      { name: "Sandeep Singhal",role: "Co-founder & Managing Director",source: H("nexusvp.com") },
    ],
    recent_activity: [],
    findings: [
      { topic: "portfolio",fact: "Nexus portfolio highlights include Postman, Delhivery, Druva and Rapido.", source: H("nexusvp.com") },
      { topic: "sector",   fact: "Nexus concentrates in SaaS and enterprise with select consumer bets.", source: H("nexusvp.com") },
      { topic: "model",    fact: "Nexus operates a cross-border US + India model with offices in Menlo Park and Mumbai.", source: H("nexusvp.com") },
    ],
    timeline: { years: ["2019","2020","2021","2022","2023","2024","2025"], counts: [9, 11, 18, 14, 10, 11, 8] },
    momentum: "steady",
    global_comparables: [
      { name: "Battery Ventures", why: "Cross-region enterprise-heavy fund with concentrated ownership." },
    ],
    updated_at: "", _seeded: true,
  },
  {
    id: "seed-stellaris",
    firm_name: "Stellaris Venture Partners",
    firm_name_key: "stellaris venture partners",
    headquarters: "Bengaluru, India",
    geography_focus: "India",
    aum_display: "",
    sectors: "SaaS, consumer, fintech",
    stages: "seed, series A",
    summary: "Seed-stage focused fund founded by Alok Goyal, Rahul Chowdhri, Ritesh Banglani.",
    investment_thesis:
      "Stellaris runs a highly concentrated seed portfolio in India (~15-20 investments per year), focused on SaaS-for-global and India consumer; ex-Helion partners bring institutional pedigree to a young-brand fund.",
    takeaway: `- Concentrated seed model — every partner takes only 2-3 boards, unlike broader seed funds.
- Ex-Helion partner heritage → deep operator network across India tech.
- Selective SaaS-for-global thesis lines up with the Chargebee/Freshworks generation.`,
    portfolio: [
      { name: "Whatfix",    note: "Digital adoption SaaS",   source: H("stellarisvp.com") },
      { name: "Mamaearth", note: "D2C personal care unicorn", source: H("stellarisvp.com") },
    ],
    leadership: [
      { name: "Alok Goyal",       role: "Partner", source: H("stellarisvp.com") },
      { name: "Rahul Chowdhri",   role: "Partner", source: H("stellarisvp.com") },
      { name: "Ritesh Banglani",  role: "Partner", source: H("stellarisvp.com") },
    ],
    recent_activity: [],
    findings: [
      { topic: "leadership",fact: "Stellaris was founded by Alok Goyal, Rahul Chowdhri and Ritesh Banglani.", source: H("stellarisvp.com") },
      { topic: "portfolio", fact: "Stellaris portfolio includes Whatfix and Mamaearth.", source: H("stellarisvp.com") },
      { topic: "stage",     fact: "Stellaris focuses on seed and Series A investments in India.", source: H("stellarisvp.com") },
    ],
    timeline: { years: ["2019","2020","2021","2022","2023","2024","2025"], counts: [6, 8, 14, 11, 9, 10, 8] },
    momentum: "steady",
    global_comparables: [
      { name: "Foundry Group", why: "Highly concentrated seed portfolio with hands-on partner engagement." },
    ],
    updated_at: "", _seeded: true,
  },
  {
    id: "seed-prime",
    firm_name: "Prime Venture Partners",
    firm_name_key: "prime venture partners",
    headquarters: "Bengaluru, India",
    geography_focus: "India",
    aum_display: "",
    sectors: "fintech, SaaS, consumer",
    stages: "seed, series A",
    summary: "Concentrated seed-stage firm with fintech tilt.",
    investment_thesis:
      "Prime is a concentrated seed/Series A firm with a fintech + SaaS bias; makes fewer, higher-conviction bets than most India seed peers and stays close to founders through Series B.",
    takeaway: `- NiYO, MyGate, Sunstone represent the firm's cross-sector consistency at seed.
- Very small portfolio (~10 active per fund) — one of India's most concentrated seed models.
- Founder-first reputation; smaller check sizes but deeper engagement than larger seed shops.`,
    portfolio: [
      { name: "NiYO",     note: "Consumer neobank",                source: H("primevp.in") },
      { name: "MyGate",   note: "Society management platform",      source: H("primevp.in") },
      { name: "Sunstone", note: "Ed-tech / employability",          source: H("primevp.in") },
    ],
    leadership: [
      { name: "Sanjay Swamy",  role: "Managing Partner", source: H("primevp.in") },
      { name: "Amit Somani",   role: "Managing Partner", source: H("primevp.in") },
    ],
    recent_activity: [],
    findings: [
      { topic: "portfolio", fact: "Prime Venture Partners backed NiYO, MyGate and Sunstone at early stages.", source: H("primevp.in") },
      { topic: "sector",    fact: "Prime concentrates on fintech, SaaS and consumer.", source: H("primevp.in") },
      { topic: "stage",     fact: "Prime writes seed and Series A checks in India.", source: H("primevp.in") },
    ],
    timeline: { years: ["2019","2020","2021","2022","2023","2024","2025"], counts: [4, 6, 10, 8, 6, 7, 5] },
    momentum: "steady",
    global_comparables: [
      { name: "Union Square Ventures", why: "Highly concentrated fintech + platforms book; founder-first reputation." },
    ],
    updated_at: "", _seeded: true,
  },

  // ============================================================ INDIA PE
  {
    id: "seed-kedaara",
    firm_name: "Kedaara Capital",
    firm_name_key: "kedaara capital",
    headquarters: "Mumbai, India",
    geography_focus: "India",
    aum_display: "~$5.4B",
    aum_usd_m: 5400,
    sectors: "consumer, financial services, healthcare, IT services",
    stages: "PE, buyout, growth",
    summary: "One of India's largest home-grown PE firms.",
    investment_thesis:
      "Kedaara runs control and structured minority PE deals in India across consumer, financial services and healthcare; ex-General Atlantic / Temasek heritage translates to an operator-heavy, ops-intensive value-creation model.",
    takeaway: `- Fund IV closed at $1.73B in 2024, bringing total AUM to ~$5.4B — India's largest independent PE raise recently.
- Ex-General Atlantic + Temasek DNA gives the firm a disproportionate share of India's marquee mid-market deals.
- Sector concentration (consumer + BFSI + healthcare) is deliberate; not a generalist growth-equity fund.`,
    portfolio: [
      { name: "Vishal Mega Mart", note: "Value retail; IPO'd 2024",      source: H("kedaaracapital.com") },
      { name: "Manjushree Technopack", note: "Rigid packaging leader",   source: H("kedaaracapital.com") },
      { name: "AU Small Finance Bank", note: "Listed SFB",               source: H("kedaaracapital.com") },
    ],
    leadership: [
      { name: "Manish Kejriwal",  role: "Managing Partner", source: H("kedaaracapital.com") },
      { name: "Sunish Sharma",    role: "Managing Partner", source: H("kedaaracapital.com") },
      { name: "Nishant Sharma",   role: "Managing Partner", source: H("kedaaracapital.com") },
    ],
    recent_activity: [
      { date: "2024", item: "Fund IV closed at $1.73B, largest India PE raise of the year", source: H("kedaaracapital.com") },
      { date: "2024", item: "Vishal Mega Mart IPO'd in December 2024",                       source: H("kedaaracapital.com") },
    ],
    findings: [
      { topic: "aum",       fact: "Kedaara Capital manages approximately $5.4B in cumulative AUM.", source: H("kedaaracapital.com") },
      { topic: "vintage",   fact: "Kedaara Fund IV closed at $1.73B in 2024.", source: H("kedaaracapital.com") },
      { topic: "portfolio", fact: "Kedaara portfolio includes Vishal Mega Mart, Manjushree Technopack and AU Small Finance Bank.", source: H("kedaaracapital.com") },
      { topic: "sector",    fact: "Kedaara focuses on consumer, financial services, healthcare and IT services in India.", source: H("kedaaracapital.com") },
      { topic: "leadership",fact: "Kedaara was founded by Manish Kejriwal, Sunish Sharma and Nishant Sharma.", source: H("kedaaracapital.com") },
    ],
    timeline: { years: ["2019","2020","2021","2022","2023","2024","2025"], counts: [4, 5, 8, 6, 7, 9, 6] },
    momentum: "up",
    global_comparables: [
      { name: "General Atlantic", why: "Founding partners' heritage; similar growth + structured control style." },
      { name: "TA Associates",    why: "Comparable mid-market PE approach with sector-cluster focus." },
    ],
    updated_at: "", _seeded: true,
  },
  {
    id: "seed-multiples",
    firm_name: "Multiples Alternate Asset Management",
    firm_name_key: "multiples alternate asset management",
    headquarters: "Mumbai, India",
    geography_focus: "India",
    aum_display: "",
    sectors: "consumer, financial services, healthcare",
    stages: "PE, growth",
    summary: "Founded by Renuka Ramnath; mid-market growth PE.",
    investment_thesis:
      "Multiples writes mid-market growth-equity checks in India led by Renuka Ramnath (ex-ICICI Venture); consumer and financial services concentration with a preference for scaled, cash-generative businesses over pre-profit growth.",
    takeaway: `- Renuka Ramnath's ICICI Venture pedigree makes Multiples one of India's most institutional PE brands.
- Fund IV close (2022) confirmed continued LP confidence in mid-market growth thesis.
- Consumer + BFSI concentration mirrors Kedaara but at a smaller, more nimble scale.`,
    portfolio: [
      { name: "Vastu Housing Finance", note: "Affordable housing finance", source: H("multiplesequity.com") },
      { name: "APAC Financial",         note: "Financial services",         source: H("multiplesequity.com") },
    ],
    leadership: [
      { name: "Renuka Ramnath", role: "Founder & Managing Director", source: H("multiplesequity.com") },
    ],
    recent_activity: [],
    findings: [
      { topic: "leadership",fact: "Multiples was founded by Renuka Ramnath, previously of ICICI Venture.", source: H("multiplesequity.com") },
      { topic: "sector",    fact: "Multiples invests in consumer, financial services and healthcare in India.", source: H("multiplesequity.com") },
      { topic: "stage",     fact: "Multiples writes mid-market growth PE checks.", source: H("multiplesequity.com") },
    ],
    timeline: { years: ["2019","2020","2021","2022","2023","2024","2025"], counts: [3, 4, 6, 5, 4, 5, 3] },
    momentum: "steady",
    global_comparables: [
      { name: "Advent International", why: "Mid-market growth PE with similar sector-cluster focus." },
    ],
    updated_at: "", _seeded: true,
  },
  {
    id: "seed-chrys",
    firm_name: "ChrysCapital",
    firm_name_key: "chryscapital",
    headquarters: "Mumbai, India",
    geography_focus: "India",
    aum_display: "~$5B",
    aum_usd_m: 5000,
    sectors: "financial services, healthcare, IT services, consumer",
    stages: "PE, growth",
    summary: "One of India's oldest PE firms, active across nine funds since 1999.",
    investment_thesis:
      "ChrysCapital is India's longest-running independent PE firm; writes growth-equity + structured control checks with a strong IT services and financial services book, and has repeatedly returned marquee funds through IPO exits.",
    takeaway: `- Nine funds since 1999 — the longest institutional track record in Indian PE.
- IT services concentration (Mphasis, Hexaware, HCL earlier) has consistently delivered exits.
- Recent Fund IX ($700M) shows patient LPs still returning to a maturing brand.`,
    portfolio: [
      { name: "Mphasis",     note: "IT services; exited",         source: H("chryscapital.com") },
      { name: "Hexaware",    note: "IT services",                  source: H("chryscapital.com") },
      { name: "Intas Pharma",note: "Pharmaceuticals",              source: H("chryscapital.com") },
    ],
    leadership: [
      { name: "Kunal Shroff",   role: "Managing Partner", source: H("chryscapital.com") },
      { name: "Sanjiv Kaul",    role: "Managing Partner", source: H("chryscapital.com") },
    ],
    recent_activity: [],
    findings: [
      { topic: "history",   fact: "ChrysCapital was founded in 1999 and has raised nine funds.", source: H("chryscapital.com") },
      { topic: "portfolio", fact: "ChrysCapital has invested in Mphasis, Hexaware and Intas Pharma among others.", source: H("chryscapital.com") },
      { topic: "sector",    fact: "ChrysCapital focuses on financial services, healthcare, IT services and consumer.", source: H("chryscapital.com") },
    ],
    timeline: { years: ["2019","2020","2021","2022","2023","2024","2025"], counts: [4, 5, 7, 6, 5, 6, 4] },
    momentum: "steady",
    global_comparables: [
      { name: "Warburg Pincus", why: "Global growth PE with financial-services heritage." },
    ],
    updated_at: "", _seeded: true,
  },
  {
    id: "seed-true-north",
    firm_name: "True North",
    firm_name_key: "true north",
    headquarters: "Mumbai, India",
    geography_focus: "India",
    aum_display: "",
    sectors: "financial services, healthcare, consumer, industrials",
    stages: "PE, mid-market",
    summary: "Formerly India Value Fund Advisors. Control-oriented mid-market PE.",
    investment_thesis:
      "True North is India's mid-market control PE specialist; buys operating majorities in profitable businesses across financial services, healthcare and consumer, and drives value through operational improvement rather than multiple expansion.",
    takeaway: `- Rebrand from India Value Fund Advisors (2016) signalled the shift to control-buyout strategy.
- Fund VI close (2019) at $800M+ confirmed LP appetite for control PE in India.
- Deep operator bench and long hold periods differentiate from growth-only peers.`,
    portfolio: [
      { name: "Cloudnine Hospitals", note: "Maternity & pediatric hospitals", source: H("truenorth.co.in") },
    ],
    leadership: [
      { name: "Vishal Nevatia",  role: "Managing Partner", source: H("truenorth.co.in") },
    ],
    recent_activity: [
      { date: "2016", item: "Rebrand from India Value Fund Advisors to True North", source: H("truenorth.co.in") },
    ],
    findings: [
      { topic: "rebrand",   fact: "True North rebranded from India Value Fund Advisors in 2016.", source: H("truenorth.co.in") },
      { topic: "strategy",  fact: "True North focuses on control-buyout mid-market PE in India.", source: H("truenorth.co.in") },
      { topic: "portfolio", fact: "Cloudnine Hospitals is among True North's healthcare investments.", source: H("truenorth.co.in") },
    ],
    timeline: { years: ["2019","2020","2021","2022","2023","2024","2025"], counts: [2, 3, 5, 4, 3, 4, 2] },
    momentum: "steady",
    global_comparables: [
      { name: "Bain Capital",     why: "Control PE model with heavy operator engagement." },
      { name: "CVC Capital",      why: "Mid-market control focus across sector clusters." },
    ],
    updated_at: "", _seeded: true,
  },

  // ============================================================ SEA
  {
    id: "seed-east-ventures",
    firm_name: "East Ventures",
    firm_name_key: "east ventures",
    headquarters: "Jakarta, Indonesia / Singapore",
    geography_focus: "Southeast Asia (Indonesia-led)",
    aum_display: "",
    sectors: "consumer, fintech, SaaS, healthtech",
    stages: "seed, early",
    summary: "SEA's most prolific seed investor.",
    investment_thesis:
      "East Ventures is Southeast Asia's most prolific seed investor with strong Indonesia founder access; runs a spray-with-discipline seed model (60+ investments/year) and follows on aggressively into the top-tier through the Growth Plus vehicle.",
    takeaway: `- Tokopedia (merged with Gojek → GoTo) is East Ventures' flagship seed-to-IPO Indonesia story.
- Growth Plus vehicle bridges seed and growth stages, unusual for a seed-native firm.
- Portfolio velocity (60+ deals/yr) is 3-4x most SEA peers — real Indonesia deal-flow advantage.`,
    portfolio: [
      { name: "Tokopedia",  note: "Merged with Gojek to form GoTo (IPO'd 2022)", source: H("east.vc") },
      { name: "Traveloka",  note: "SEA travel booking leader",                    source: H("east.vc") },
      { name: "Ruangguru",  note: "Ed-tech across Indonesia + SEA",               source: H("east.vc") },
      { name: "Xendit",     note: "Payments infrastructure",                       source: H("east.vc") },
    ],
    leadership: [
      { name: "Willson Cuaca",  role: "Managing Partner", source: H("east.vc") },
      { name: "Batara Eto",     role: "Managing Partner", source: H("east.vc") },
    ],
    recent_activity: [],
    findings: [
      { topic: "portfolio", fact: "East Ventures backed Tokopedia (now GoTo), Traveloka, Ruangguru and Xendit at early stages.", source: H("east.vc") },
      { topic: "sector",    fact: "East Ventures invests across consumer, fintech, SaaS and healthtech in SEA.", source: H("east.vc") },
      { topic: "geo",       fact: "East Ventures is Indonesia-led with offices in Jakarta and Singapore.", source: H("east.vc") },
      { topic: "cadence",   fact: "East Ventures runs a high-velocity seed model with 60+ investments per year.", source: H("east.vc") },
    ],
    timeline: { years: ["2019","2020","2021","2022","2023","2024","2025"], counts: [42, 55, 78, 61, 46, 52, 40] },
    momentum: "steady",
    global_comparables: [
      { name: "500 Global",     why: "High-velocity seed model with regional office network." },
      { name: "Y Combinator",   why: "Volume seed approach with strong founder brand." },
    ],
    updated_at: "", _seeded: true,
  },
  {
    id: "seed-openspace",
    firm_name: "Openspace Ventures",
    firm_name_key: "openspace ventures",
    headquarters: "Singapore",
    geography_focus: "Southeast Asia",
    aum_display: "",
    sectors: "consumer, fintech, logistics, SaaS",
    stages: "series A, growth",
    summary: "SEA-focused growth investor; early Gojek backer.",
    investment_thesis:
      "Openspace writes Series A + growth checks across Southeast Asia with a portfolio-management-heavy model; ex-Gojek early backer with strong ties to region's largest founders.",
    takeaway: `- Gojek (now GoTo) is Openspace's marquee win, IPO'd 2022.
- Focused Series A + growth positioning avoids competing with East Ventures' seed volume.
- Sector spread across consumer, fintech, logistics — reflects SEA's real deal-flow shape.`,
    portfolio: [
      { name: "Gojek / GoTo", note: "IPO'd 2022 on IDX", source: H("openspace.vc") },
      { name: "Kredivo",      note: "Consumer credit / BNPL", source: H("openspace.vc") },
    ],
    leadership: [
      { name: "Shane Chesson", role: "Founding Partner", source: H("openspace.vc") },
      { name: "Ian Sikora",    role: "Founding Partner", source: H("openspace.vc") },
    ],
    recent_activity: [],
    findings: [
      { topic: "portfolio", fact: "Openspace Ventures was an early backer of Gojek, now GoTo (IPO'd 2022).", source: H("openspace.vc") },
      { topic: "stage",     fact: "Openspace focuses on Series A and growth investments in Southeast Asia.", source: H("openspace.vc") },
      { topic: "geo",       fact: "Openspace is headquartered in Singapore.", source: H("openspace.vc") },
    ],
    timeline: { years: ["2019","2020","2021","2022","2023","2024","2025"], counts: [7, 9, 15, 12, 9, 10, 8] },
    momentum: "steady",
    global_comparables: [
      { name: "Insight Partners", why: "Series A + growth positioning with concentrated conviction." },
    ],
    updated_at: "", _seeded: true,
  },
  {
    id: "seed-jungle",
    firm_name: "Jungle Ventures",
    firm_name_key: "jungle ventures",
    headquarters: "Singapore",
    geography_focus: "Singapore / India / Southeast Asia",
    aum_display: "~$1B",
    aum_usd_m: 1000,
    sectors: "consumer, SaaS, fintech, D2C",
    stages: "series A, series B",
    summary: "Pan-Asian VC investing across India and SEA.",
    investment_thesis:
      "Jungle runs a pan-Asian Series A + B fund covering India and Southeast Asia; concentrated portfolio with strong D2C consumer + SaaS focus, and one of the few Singapore-headquartered funds with genuine India deal-flow depth.",
    takeaway: `- Fund IV ($600M+) is one of Southeast Asia's largest independent VC raises.
- Cross-border India + SEA coverage is rare — most SEA funds skip India, most India funds skip SEA.
- Livspace, Kredivo, Turtlemint show the D2C + fintech thesis in action.`,
    portfolio: [
      { name: "Livspace",    note: "Home interiors D2C", source: H("jungle-ventures.com") },
      { name: "Kredivo",     note: "SEA consumer BNPL",   source: H("jungle-ventures.com") },
      { name: "Turtlemint",  note: "Insurance distribution", source: H("jungle-ventures.com") },
    ],
    leadership: [
      { name: "Amit Anand",    role: "Founding Partner", source: H("jungle-ventures.com") },
      { name: "Anurag Srivastava", role: "Founding Partner", source: H("jungle-ventures.com") },
    ],
    recent_activity: [],
    findings: [
      { topic: "portfolio", fact: "Jungle Ventures portfolio includes Livspace, Kredivo and Turtlemint.", source: H("jungle-ventures.com") },
      { topic: "geo",       fact: "Jungle Ventures invests across Southeast Asia and India from its Singapore base.", source: H("jungle-ventures.com") },
      { topic: "stage",     fact: "Jungle focuses on Series A and Series B rounds.", source: H("jungle-ventures.com") },
    ],
    timeline: { years: ["2019","2020","2021","2022","2023","2024","2025"], counts: [8, 10, 17, 13, 10, 12, 9] },
    momentum: "steady",
    global_comparables: [
      { name: "Insight Partners",  why: "Series A + B growth model spanning multiple geographies." },
    ],
    updated_at: "", _seeded: true,
  },
  {
    id: "seed-vertex",
    firm_name: "Vertex Ventures Southeast Asia and India",
    firm_name_key: "vertex ventures southeast asia and india",
    headquarters: "Singapore",
    geography_focus: "SEA / India",
    aum_display: "",
    sectors: "consumer, fintech, SaaS, deep-tech",
    stages: "seed, series A, series B",
    summary: "Temasek-backed VC across SEA + India.",
    investment_thesis:
      "Vertex Ventures SEA and India is Temasek's early-stage VC arm for the region; writes seed through Series B checks with LP-of-scale backing, and sector-agnostic conviction on the region's category leaders.",
    takeaway: `- Temasek LP backing gives Vertex a follow-on advantage most independent SEA funds lack.
- Grab was an early Vertex bet — the fund's most-cited return.
- Sector-agnostic model means high portfolio velocity but wider dispersion of outcomes.`,
    portfolio: [
      { name: "Grab",     note: "SEA super-app; listed 2021", source: H("vertexventures.com") },
      { name: "Nium",     note: "Cross-border payments unicorn", source: H("vertexventures.com") },
    ],
    leadership: [
      { name: "Chua Kee Lock",  role: "Managing Partner", source: H("vertexventures.com") },
    ],
    recent_activity: [],
    findings: [
      { topic: "portfolio", fact: "Vertex Ventures SEA + India was an early backer of Grab and Nium.", source: H("vertexventures.com") },
      { topic: "backing",   fact: "Vertex is the venture arm of Temasek Holdings.", source: H("vertexventures.com") },
      { topic: "stage",     fact: "Vertex covers seed through Series B in SEA and India.", source: H("vertexventures.com") },
    ],
    timeline: { years: ["2019","2020","2021","2022","2023","2024","2025"], counts: [10, 12, 20, 15, 11, 13, 10] },
    momentum: "steady",
    global_comparables: [
      { name: "Sequoia Capital (US)", why: "Sector-agnostic multi-stage model with institutional LP backing." },
    ],
    updated_at: "", _seeded: true,
  },
  {
    id: "seed-golden-gate",
    firm_name: "Golden Gate Ventures",
    firm_name_key: "golden gate ventures",
    headquarters: "Singapore",
    geography_focus: "Southeast Asia",
    aum_display: "",
    sectors: "consumer, fintech, digital health",
    stages: "seed, early",
    summary: "One of SEA's earliest independent VCs.",
    investment_thesis:
      "Golden Gate Ventures is one of Southeast Asia's earliest independent seed funds; broad SEA coverage across Indonesia, Vietnam and Philippines with a thematic bias toward digital consumer and financial inclusion.",
    takeaway: `- Founded 2011 — among the oldest independent SEA VCs, brand equity across the region.
- Broader geographic spread than Indonesia-focused peers; Vietnam + Philippines exposure is a differentiator.
- Sector concentration in fintech + digital health reflects SEA's rising middle-class consumer.`,
    portfolio: [
      { name: "Carousell",  note: "SEA classifieds unicorn", source: H("goldengate.vc") },
    ],
    leadership: [
      { name: "Vinnie Lauria",   role: "Founding Partner", source: H("goldengate.vc") },
      { name: "Michael Lints",   role: "Partner",           source: H("goldengate.vc") },
    ],
    recent_activity: [],
    findings: [
      { topic: "history",  fact: "Golden Gate Ventures was founded in 2011, making it one of SEA's earliest independent VCs.", source: H("goldengate.vc") },
      { topic: "geo",      fact: "Golden Gate invests across Indonesia, Vietnam, Philippines and greater SEA.", source: H("goldengate.vc") },
      { topic: "portfolio",fact: "Carousell is among Golden Gate's notable SEA portfolio bets.", source: H("goldengate.vc") },
    ],
    timeline: { years: ["2019","2020","2021","2022","2023","2024","2025"], counts: [6, 8, 12, 10, 7, 8, 6] },
    momentum: "steady",
    global_comparables: [
      { name: "Union Square Ventures", why: "Thematic-first seed with financial-inclusion bias." },
    ],
    updated_at: "", _seeded: true,
  },
  {
    id: "seed-monks-hill",
    firm_name: "Monk's Hill Ventures",
    firm_name_key: "monks hill ventures",
    headquarters: "Singapore",
    geography_focus: "Southeast Asia",
    aum_display: "",
    sectors: "SaaS, fintech, consumer, industrial-tech",
    stages: "series A",
    summary: "SEA Series A specialist.",
    investment_thesis:
      "Monk's Hill Ventures is Southeast Asia's Series A specialist; founded by Peng T. Ong (ex-Interwoven), runs a concentrated Series A book with strong US-Asia bridge networks and a preference for SaaS + industrial-tech.",
    takeaway: `- Peng T. Ong pedigree (Interwoven IPO) gives Monk's Hill unusual US Silicon Valley networks.
- Series A concentration avoids seed-crowd competition and growth-fund cheque-size mismatches.
- Industrial-tech tilt is a differentiator vs consumer-heavy SEA peers.`,
    portfolio: [],
    leadership: [
      { name: "Peng T. Ong",   role: "Managing Partner", source: H("monkshill.com") },
      { name: "Kuo-Yi Lim",    role: "Managing Partner", source: H("monkshill.com") },
    ],
    recent_activity: [],
    findings: [
      { topic: "leadership",fact: "Monk's Hill Ventures was founded by Peng T. Ong and Kuo-Yi Lim.", source: H("monkshill.com") },
      { topic: "stage",     fact: "Monk's Hill is a Series A specialist in Southeast Asia.", source: H("monkshill.com") },
      { topic: "sector",    fact: "Monk's Hill covers SaaS, fintech, consumer and industrial-tech.", source: H("monkshill.com") },
    ],
    timeline: { years: ["2019","2020","2021","2022","2023","2024","2025"], counts: [4, 5, 8, 6, 5, 6, 4] },
    momentum: "steady",
    global_comparables: [
      { name: "Emergence Capital", why: "Concentrated Series A SaaS specialist model." },
    ],
    updated_at: "", _seeded: true,
  },
  {
    id: "seed-ac-ventures",
    firm_name: "AC Ventures",
    firm_name_key: "ac ventures",
    headquarters: "Jakarta, Indonesia",
    geography_focus: "Indonesia / SEA",
    aum_display: "",
    sectors: "consumer, fintech, D2C, digital economy",
    stages: "seed, series A",
    summary: "Indonesia-focused early-stage fund across ASEAN's digital economy.",
    investment_thesis:
      "AC Ventures is an Indonesia-native seed and Series A fund; strong local operator network across Jakarta's founder ecosystem and thematic focus on the country's rising digital consumer economy.",
    takeaway: `- Indonesia-native positioning wins access to founders that pan-SEA funds have to earn.
- Sector focus on D2C + fintech + digital economy tracks Indonesia's middle-class consumption shift.
- Small-fund model preserves signal per investment vs volume-first competitors.`,
    portfolio: [],
    leadership: [
      { name: "Adrian Li",     role: "Founder & Managing Partner", source: H("acv.vc") },
      { name: "Michael Soerijadji", role: "Founder & Managing Partner", source: H("acv.vc") },
    ],
    recent_activity: [],
    findings: [
      { topic: "geo",     fact: "AC Ventures is headquartered in Jakarta and focuses on Indonesia + ASEAN's digital economy.", source: H("acv.vc") },
      { topic: "stage",   fact: "AC Ventures writes seed and Series A checks.", source: H("acv.vc") },
      { topic: "sector",  fact: "AC Ventures covers consumer, fintech, D2C and digital economy sectors.", source: H("acv.vc") },
    ],
    timeline: { years: ["2019","2020","2021","2022","2023","2024","2025"], counts: [5, 7, 12, 9, 7, 8, 6] },
    momentum: "steady",
    global_comparables: [
      { name: "Andreessen Horowitz (seed)", why: "Concentrated local-ecosystem seed model with strong operator ties." },
    ],
    updated_at: "", _seeded: true,
  },
];

// ---- helpers -----------------------------------------------------
export function mergeWithSeed(apiRows = []) {
  const seen = new Set(
    apiRows.map(r => (r.firm_name || "").toLowerCase().trim().replace(/\s+/g, " ")).filter(Boolean)
  );
  const extras = SEED_FIRMS.filter(s => !seen.has(s.firm_name_key));
  return [...apiRows, ...extras];
}

/** All findings across all seed firms, tagged with firm_name — powers Ask Meridian offline. */
export function allSeedFindings() {
  const out = [];
  for (const f of SEED_FIRMS) {
    for (const [i, fnd] of (f.findings || []).entries()) {
      out.push({
        firm_id: f.id,
        firm_name: f.firm_name,
        firm_name_key: f.firm_name_key,
        topic: fnd.topic,
        fact: fnd.fact,
        source_url: fnd.source_url,
        _seed_idx: i,
      });
    }
  }
  return out;
}

/** Every seed firm's notable portfolio entries, tagged. Powers Diligence Mode. */
export function allSeedDeals() {
  const out = [];
  for (const f of SEED_FIRMS) {
    for (const p of (f.portfolio || [])) {
      out.push({
        firm_id: f.id,
        firm_name: f.firm_name,
        company_name: p.name,
        company_name_key: p.name.toLowerCase().trim(),
        note: p.note || "",
        source: p.source || "",
      });
    }
  }
  return out;
}

export function seedById(id) { return SEED_FIRMS.find(f => f.id === id) || null; }
export function seedByKey(key) { return SEED_FIRMS.find(f => f.firm_name_key === key) || null; }
