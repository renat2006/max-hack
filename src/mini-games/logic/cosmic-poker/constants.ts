import type { ConstellationDefinition, RankDefinition } from "./types";

// Реальная информация о созвездиях для познавательности
export const CONSTELLATION_LORE: Record<
  string,
  {
    realName: string;
    brightestStar: string;
    mythology: string;
    funFact: string;
    visibleFrom: string;
  }
> = {
  "orion-forge": {
    realName: "Орион (Orion)",
    brightestStar: "Ригель (β Ориона) — голубой сверхгигант, в 40,000 раз ярче Солнца",
    mythology:
      "В греческой мифологии — великий охотник, сын Посейдона. Боги поместили его на небо после гибели от скорпиона.",
    funFact:
      "Туманность Ориона (M42) — ближайшая к нам область звездообразования, где прямо сейчас рождаются новые звезды!",
    visibleFrom: "Видно со всей Земли, лучше всего зимой в северном полушарии",
  },
  "lyra-symphony": {
    realName: "Лира (Lyra)",
    brightestStar:
      "Вега (α Лиры) — 5-я по яркости звезда на небе, через 12,000 лет станет Полярной звездой",
    mythology:
      "Лира Орфея — мифического музыканта, чья игра очаровывала даже богов подземного мира.",
    funFact:
      "Около Веги обнаружен пылевой диск — возможно, там формируются планеты! Веге всего 455 миллионов лет (очень молодая звезда).",
    visibleFrom: "Северное полушарие, летом прямо над головой",
  },
  "draco-sentinel": {
    realName: "Дракон (Draco)",
    brightestStar: "Этамин (γ Дракона) — оранжевый гигант в 600 раз ярче Солнца",
    mythology:
      "Дракон Ладон, охранявший золотые яблоки Гесперид. Геракл убил его в своем 11-м подвиге.",
    funFact:
      "4,800 лет назад звезда Тубан (α Дракона) была Полярной звездой — на нее ориентировались строители египетских пирамид!",
    visibleFrom: "Околополярное созвездие, видно круглый год в северном полушарии",
  },
  "phoenix-ascent": {
    realName: "Феникс (Phoenix)",
    brightestStar: "Анкаа (α Феникса) — оранжевый гигант в 2,500 раз ярче Солнца",
    mythology:
      "Мифическая птица, сгорающая и возрождающаяся из пепла каждые 500 лет — символ вечного обновления.",
    funFact:
      "Одно из современных созвездий, введенное в XVI веке голландскими мореплавателями. Содержит галактику NGC 625!",
    visibleFrom: "Южное полушарие, осенью",
  },
};

export const CONSTELLATIONS: ConstellationDefinition[] = [
  {
    id: "orion-forge",
    name: "Orion Forge",
    alias: "Hunter's Foundry",
    quadrant: "core",
    accent: "#6366f1",
    gradient: "linear-gradient(135deg, #312e81, #4f46e5, #818cf8)",
    aura: "radial-gradient(circle at 30% 20%, rgba(129, 140, 248, 0.35), transparent 65%)",
    description:
      "A tactical armada famed for disciplined formations. Orion cards favor balanced, tactical plays and reward patient sequencing.",
  },
  {
    id: "lyra-symphony",
    name: "Lyra Symphony",
    alias: "Resonant Choir",
    quadrant: "spiral",
    accent: "#22d3ee",
    gradient: "linear-gradient(135deg, #0f172a, #0ea5e9, #22d3ee)",
    aura: "radial-gradient(circle at 80% 30%, rgba(34, 211, 238, 0.4), transparent 68%)",
    description:
      "Navigator fleets weaving harmonic flight paths. Lyra cards lean into combo-driven lines and favor flush harmony patterns.",
  },
  {
    id: "draco-sentinel",
    name: "Draco Sentinel",
    alias: "Polar Bastion",
    quadrant: "cluster",
    accent: "#a855f7",
    gradient: "linear-gradient(135deg, #1f2937, #7c3aed, #a855f7)",
    aura: "radial-gradient(circle at 20% 80%, rgba(168, 85, 247, 0.45), transparent 70%)",
    description:
      "Strategic wardens stationed across the polar rims. Draco cards emphasize defensive control and reward quads and fortified sets.",
  },
  {
    id: "phoenix-ascent",
    name: "Phoenix Ascent",
    alias: "Solar Vanguard",
    quadrant: "rim",
    accent: "#fb923c",
    gradient: "linear-gradient(135deg, #451a03, #f97316, #fb923c)",
    aura: "radial-gradient(circle at 50% 50%, rgba(251, 146, 60, 0.4), transparent 72%)",
    description:
      "Experimental squadrons riding thermal updrafts. Phoenix cards reward aggressive tempo, straights, and sudden surges.",
  },
  {
    id: "cassiopeia-crown",
    name: "Cassiopeia Crown",
    alias: "Royal Throne",
    quadrant: "core",
    accent: "#ec4899",
    gradient: "linear-gradient(135deg, #831843, #db2777, #ec4899)",
    aura: "radial-gradient(circle at 50% 20%, rgba(236, 72, 153, 0.4), transparent 70%)",
    description:
      "Regal formations commanding respect across the galaxy. Cassiopeia cards favor strategic positioning and royal flushes.",
  },
  {
    id: "ursa-major-guard",
    name: "Ursa Major Guard",
    alias: "Great Bear",
    quadrant: "cluster",
    accent: "#3b82f6",
    gradient: "linear-gradient(135deg, #1e3a8a, #2563eb, #3b82f6)",
    aura: "radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.35), transparent 68%)",
    description:
      "Mighty guardians of the northern skies. Ursa Major cards provide strong defensive plays and protective formations.",
  },
  {
    id: "cygnus-swift",
    name: "Cygnus Swift",
    alias: "Flying Swan",
    quadrant: "spiral",
    accent: "#06b6d4",
    gradient: "linear-gradient(135deg, #164e63, #0891b2, #06b6d4)",
    aura: "radial-gradient(circle at 70% 30%, rgba(6, 182, 212, 0.4), transparent 70%)",
    description:
      "Graceful formations cutting through stellar winds. Cygnus cards excel in fluid movements and elegant combinations.",
  },
  {
    id: "perseus-strike",
    name: "Perseus Strike",
    alias: "Hero's Blade",
    quadrant: "core",
    accent: "#8b5cf6",
    gradient: "linear-gradient(135deg, #4c1d95, #7c3aed, #8b5cf6)",
    aura: "radial-gradient(circle at 30% 70%, rgba(139, 92, 246, 0.4), transparent 72%)",
    description:
      "Swift strikes from legendary heroes. Perseus cards reward decisive actions and heroic combinations.",
  },
  {
    id: "andromeda-spiral",
    name: "Andromeda Spiral",
    alias: "Galactic Sister",
    quadrant: "spiral",
    accent: "#f59e0b",
    gradient: "linear-gradient(135deg, #78350f, #d97706, #f59e0b)",
    aura: "radial-gradient(circle at 60% 40%, rgba(245, 158, 11, 0.4), transparent 70%)",
    description:
      "Spiral formations mirroring cosmic beauty. Andromeda cards create harmonious patterns and flowing sequences.",
  },
  {
    id: "scorpius-sting",
    name: "Scorpius Sting",
    alias: "Venom Tail",
    quadrant: "rim",
    accent: "#ef4444",
    gradient: "linear-gradient(135deg, #991b1b, #dc2626, #ef4444)",
    aura: "radial-gradient(circle at 80% 80%, rgba(239, 68, 68, 0.45), transparent 72%)",
    description:
      "Deadly precision strikes from the rim. Scorpius cards deliver powerful finishing moves and critical hits.",
  },
  {
    id: "sagittarius-archer",
    name: "Sagittarius Archer",
    alias: "Star Hunter",
    quadrant: "core",
    accent: "#10b981",
    gradient: "linear-gradient(135deg, #064e3b, #059669, #10b981)",
    aura: "radial-gradient(circle at 40% 60%, rgba(16, 185, 129, 0.4), transparent 70%)",
    description:
      "Precise long-range formations. Sagittarius cards excel in targeted strikes and calculated precision plays.",
  },
  {
    id: "capricornus-gate",
    name: "Capricornus Gate",
    alias: "Sea Goat",
    quadrant: "cluster",
    accent: "#14b8a6",
    gradient: "linear-gradient(135deg, #134e4a, #0d9488, #14b8a6)",
    aura: "radial-gradient(circle at 50% 50%, rgba(20, 184, 166, 0.35), transparent 68%)",
    description:
      "Mystical gateways between realms. Capricornus cards bridge different strategies and enable transformative plays.",
  },
  {
    id: "aquarius-flow",
    name: "Aquarius Flow",
    alias: "Water Bearer",
    quadrant: "spiral",
    accent: "#0ea5e9",
    gradient: "linear-gradient(135deg, #0c4a6e, #0284c7, #0ea5e9)",
    aura: "radial-gradient(circle at 50% 30%, rgba(14, 165, 233, 0.4), transparent 70%)",
    description:
      "Flowing currents of cosmic energy. Aquarius cards create dynamic patterns and fluid strategic movements.",
  },
  {
    id: "pisces-twin",
    name: "Pisces Twin",
    alias: "Dual Streams",
    quadrant: "rim",
    accent: "#a78bfa",
    gradient: "linear-gradient(135deg, #5b21b6, #7c3aed, #a78bfa)",
    aura: "radial-gradient(circle at 30% 50%, rgba(167, 139, 250, 0.4), transparent 72%)",
    description:
      "Twin formations moving in harmony. Pisces cards enable dual strategies and synchronized combinations.",
  },
  {
    id: "taurus-bull",
    name: "Taurus Bull",
    alias: "Steadfast",
    quadrant: "cluster",
    accent: "#f97316",
    gradient: "linear-gradient(135deg, #7c2d12, #ea580c, #f97316)",
    aura: "radial-gradient(circle at 40% 40%, rgba(249, 115, 22, 0.4), transparent 70%)",
    description:
      "Unstoppable force and unwavering determination. Taurus cards provide solid foundations and persistent pressure.",
  },
  {
    id: "gemini-twin",
    name: "Gemini Twin",
    alias: "Dual Stars",
    quadrant: "core",
    accent: "#eab308",
    gradient: "linear-gradient(135deg, #713f12, #ca8a04, #eab308)",
    aura: "radial-gradient(circle at 50% 50%, rgba(234, 179, 8, 0.4), transparent 70%)",
    description:
      "Twin stars working in perfect sync. Gemini cards enable dual actions and complementary strategic pairs.",
  },
  {
    id: "cancer-shell",
    name: "Cancer Shell",
    alias: "Protective",
    quadrant: "rim",
    accent: "#84cc16",
    gradient: "linear-gradient(135deg, #365314, #65a30d, #84cc16)",
    aura: "radial-gradient(circle at 60% 60%, rgba(132, 204, 22, 0.35), transparent 68%)",
    description:
      "Defensive formations with hidden strength. Cancer cards provide protection and reveal power when needed.",
  },
  {
    id: "leo-king",
    name: "Leo King",
    alias: "Royal Pride",
    quadrant: "core",
    accent: "#f59e0b",
    gradient: "linear-gradient(135deg, #78350f, #d97706, #f59e0b)",
    aura: "radial-gradient(circle at 50% 20%, rgba(245, 158, 11, 0.45), transparent 72%)",
    description:
      "Majestic formations commanding the cosmic stage. Leo cards deliver powerful displays and regal combinations.",
  },
];

export const RANK_DEFINITIONS: RankDefinition[] = [
  {
    id: "2",
    value: 2,
    label: "Binary Spark",
    shortLabel: "2",
    starName: "Altair",
    spectralClass: "A7 V",
    magnitude: 0.77,
    lore: "Swift courier star used to ignite opening maneuvers.",
  },
  {
    id: "3",
    value: 3,
    label: "Ion Trail",
    shortLabel: "3",
    starName: "Merak",
    spectralClass: "A1 V",
    magnitude: 2.37,
    lore: "Reliable nav-beacon charting safe approach vectors.",
  },
  {
    id: "4",
    value: 4,
    label: "Solar Crest",
    shortLabel: "4",
    starName: "Phecda",
    spectralClass: "A0 V",
    magnitude: 2.43,
    lore: "Stabilises convoys against gravitational shear.",
  },
  {
    id: "5",
    value: 5,
    label: "Nebula Drift",
    shortLabel: "5",
    starName: "Mizar",
    spectralClass: "A2 V",
    magnitude: 2.06,
    lore: "Twin-star liaison enabling precise mid-game pivots.",
  },
  {
    id: "6",
    value: 6,
    label: "Comet Bloom",
    shortLabel: "6",
    starName: "Spica",
    spectralClass: "B1 V",
    magnitude: 0.98,
    lore: "Delicate support luminary boosting tempo lines.",
  },
  {
    id: "7",
    value: 7,
    label: "Quasar Echo",
    shortLabel: "7",
    starName: "Deneb",
    spectralClass: "A2 Ia",
    magnitude: 1.25,
    lore: "Massive flagship radiating stabilising resonance.",
  },
  {
    id: "8",
    value: 8,
    label: "Pulsar Rhythm",
    shortLabel: "8",
    starName: "Rigel",
    spectralClass: "B8 Ia",
    magnitude: 0.13,
    lore: "Pulsing titan keeping pressure across long plays.",
  },
  {
    id: "9",
    value: 9,
    label: "Aurora Veil",
    shortLabel: "9",
    starName: "Vega",
    spectralClass: "A0 V",
    magnitude: 0.03,
    lore: "Magnetic sail guiding fleets through ion storms.",
  },
  {
    id: "10",
    value: 10,
    label: "Stellar Crown",
    shortLabel: "10",
    starName: "Capella",
    spectralClass: "G8 III",
    magnitude: 0.08,
    lore: "Ceremonial escort signaling secured objectives.",
  },
  {
    id: "J",
    value: 11,
    label: "Nova Herald",
    shortLabel: "J",
    starName: "Aldebaran",
    spectralClass: "K5 III",
    magnitude: 0.85,
    lore: "Forwards reconnaissance to set up decisive strikes.",
  },
  {
    id: "Q",
    value: 12,
    label: "Celestial Regent",
    shortLabel: "Q",
    starName: "Betelgeuse",
    spectralClass: "M1 Iab",
    magnitude: 0.5,
    lore: "Red supergiant that anchors alliance leadership.",
  },
  {
    id: "K",
    value: 13,
    label: "Empire Apex",
    shortLabel: "K",
    starName: "Antares",
    spectralClass: "M1.5 Iab",
    magnitude: 1.09,
    lore: "War council nexus coordinating finishing blows.",
  },
  {
    id: "A",
    value: 14,
    label: "Supernova Crown",
    shortLabel: "A",
    starName: "Sirius",
    spectralClass: "A1 V",
    magnitude: -1.46,
    lore: "Brightest beacon signifying mission victory.",
  },
];

export const CONSTELLATION_MAP = new Map(CONSTELLATIONS.map((item) => [item.id, item]));
export const RANK_MAP = new Map(RANK_DEFINITIONS.map((item) => [item.id, item]));
