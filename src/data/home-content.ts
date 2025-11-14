export type MiniGameSummary = {
  id: string;
  title: string;
  synopsis: string;
  difficulty: "Casual" | "Standard" | "Hard" | "Elite";
  averageDuration: string;
  playerCount: number;
  completionRate: number;
  reward: string;
  thumbnailAccent: string;
  tags: string[];
  isNew?: boolean;
};

export type PrizeVaultItem = {
  id: string;
  title: string;
  collection: string;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  supply: number;
  claimWindow: string;
  claimable: boolean;
  accent: string;
  description: string;
};

export type LiveOperation = {
  id: string;
  title: string;
  startAt: string;
  location: string;
  status: "boarding" | "in-orbit" | "cooldown";
  summary: string;
};

export type CommunitySignal = {
  id: string;
  category: string;
  title: string;
  publishedAt: string;
  summary: string;
  actionLabel: string;
};

export const HOME_TRENDING_GAMES: MiniGameSummary[] = [
  {
    id: "astro-scan",
    title: "Astro Scan",
    synopsis: "Tag the rogue satellites before they breach orbit.",
    difficulty: "Standard",
    averageDuration: "02:30",
    playerCount: 18432,
    completionRate: 87,
    reward: "+120 crystal shards",
    thumbnailAccent: "linear-gradient(135deg, #2563eb, #38bdf8)",
    tags: ["real-time", "co-op"],
    isNew: true,
  },
  {
    id: "quantum-sprint",
    title: "Quantum Sprint",
    synopsis: "Solve phase puzzles while navigating shifting gravity lanes.",
    difficulty: "Hard",
    averageDuration: "04:10",
    playerCount: 11207,
    completionRate: 64,
    reward: "Epic skin cache",
    thumbnailAccent: "linear-gradient(135deg, #10b981, #34d399)",
    tags: ["puzzle", "speedrun"],
  },
  {
    id: "nebula-hunt",
    title: "Nebula Hunt",
    synopsis: "Track cosmic anomalies hiding in procedurally generated storms.",
    difficulty: "Elite",
    averageDuration: "06:50",
    playerCount: 9534,
    completionRate: 48,
    reward: "Nebula artifact drop",
    thumbnailAccent: "linear-gradient(135deg, #c084fc, #8b5cf6)",
    tags: ["raid", "squad"],
  },
  {
    id: "echo-shift",
    title: "Echo Shift",
    synopsis: "Stabilise resonance nodes before the timer collapses.",
    difficulty: "Standard",
    averageDuration: "03:05",
    playerCount: 15012,
    completionRate: 79,
    reward: "Telemetry boost",
    thumbnailAccent: "linear-gradient(135deg, #f97316, #fb923c)",
    tags: ["timed", "solo"],
  },
  {
    id: "drift-lab",
    title: "Drift Lab",
    synopsis: "Calibrate drone swarms under orbital interference.",
    difficulty: "Casual",
    averageDuration: "01:55",
    playerCount: 20945,
    completionRate: 91,
    reward: "+60 mission credits",
    thumbnailAccent: "linear-gradient(135deg, #22d3ee, #38bdf8)",
    tags: ["training", "arcade"],
  },
  {
    id: "vault-gambit",
    title: "Vault Gambit",
    synopsis: "Decrypt layered vaults before counter-measures trigger.",
    difficulty: "Hard",
    averageDuration: "05:20",
    playerCount: 8675,
    completionRate: 55,
    reward: "Legendary mod part",
    thumbnailAccent: "linear-gradient(135deg, #f472b6, #ec4899)",
    tags: ["strategy", "duo"],
  },
];

export const HOME_PRIZE_VAULT: PrizeVaultItem[] = [
  {
    id: "aurora-wing",
    title: "Aurora Wing Mk.II",
    collection: "Flight Archives",
    rarity: "Legendary",
    supply: 12,
    claimWindow: "3h left",
    claimable: true,
    accent: "linear-gradient(160deg, rgba(14,165,233,0.75), rgba(59,130,246,0.95))",
    description: "Reactive booster skin forged from recovered aurora filaments.",
  },
  {
    id: "solstice-badge",
    title: "Solstice Vanguard",
    collection: "Honorary Sigils",
    rarity: "Epic",
    supply: 220,
    claimWindow: "Today",
    claimable: true,
    accent: "linear-gradient(160deg, rgba(234,179,8,0.7), rgba(249,115,22,0.9))",
    description: "Minted for squads that cleared three elite raids in a cycle.",
  },
  {
    id: "echo-loom",
    title: "Echo Loom",
    collection: "Synth Relics",
    rarity: "Rare",
    supply: 580,
    claimWindow: "2 days",
    claimable: false,
    accent: "linear-gradient(160deg, rgba(14,116,144,0.7), rgba(45,212,191,0.9))",
    description: "Chrono-threaded relic that boosts resonance rewards.",
  },
  {
    id: "nova-drift",
    title: "Nova Drift Capsule",
    collection: "Drop Pods",
    rarity: "Epic",
    supply: 64,
    claimWindow: "5h left",
    claimable: true,
    accent: "linear-gradient(160deg, rgba(192,132,252,0.7), rgba(147,51,234,0.9))",
    description: "Contains a rotating roster of limited-time navigation mods.",
  },
  {
    id: "midnight-crest",
    title: "Midnight Crest",
    collection: "Order of the Void",
    rarity: "Legendary",
    supply: 7,
    claimWindow: "Ends tomorrow",
    claimable: false,
    accent: "linear-gradient(160deg, rgba(15,23,42,0.8), rgba(79,70,229,0.85))",
    description: "A crest awarded to captains maintaining perfect mission streaks.",
  },
  {
    id: "lumen-wisp",
    title: "Lumen Wisp",
    collection: "Spectral Companions",
    rarity: "Common",
    supply: 1440,
    claimWindow: "Always on",
    claimable: true,
    accent: "linear-gradient(160deg, rgba(59,130,246,0.4), rgba(14,165,233,0.8))",
    description: "Companion light orb that follows the pilot across missions.",
  },
];

export const HOME_LIVE_OPERATIONS: LiveOperation[] = [
  {
    id: "orbital-rush",
    title: "Orbital Rush 3.2",
    startAt: "21 Oct • 18:00 UTC",
    location: "Low Orbit Deck 07",
    status: "boarding",
    summary: "Teams rush to stabilise cargo drones while weather shifts every 90 seconds.",
  },
  {
    id: "vault-night",
    title: "Vault Night",
    startAt: "22 Oct • 20:30 UTC",
    location: "Deep Space Relay",
    status: "in-orbit",
    summary: "Community-wide heist with rotating encrypted vault objectives.",
  },
  {
    id: "echo-trials",
    title: "Echo Trials",
    startAt: "24 Oct • 16:45 UTC",
    location: "Horizon Field",
    status: "cooldown",
    summary: "Competitive resonance runs with seasonal leaderboard rewards.",
  },
];

export const HOME_COMMUNITY_SIGNALS: CommunitySignal[] = [
  {
    id: "patch-3-4",
    category: "Update",
    title: "Patch 3.4 deployed across all shards",
    publishedAt: "2h ago",
    summary:
      "Balance passes for quantum puzzles, new anti-griefing tools, and expanded squad voice zones.",
    actionLabel: "View changelog",
  },
  {
    id: "creator-calls",
    category: "Creators",
    title: "Creator call: share your best Nebula Hunt clears",
    publishedAt: "5h ago",
    summary: "Submit highlights for a chance to be featured in next week's orbital broadcast.",
    actionLabel: "Submit clip",
  },
  {
    id: "season-brief",
    category: "Season",
    title: "Season VII intel briefing unlocked",
    publishedAt: "Yesterday",
    summary: "Unlocks tiered contract missions and a new line of spectral cosmetics.",
    actionLabel: "Read briefing",
  },
];
