import { createChallengePlaceholders } from "./modes/captcha/blueprints";
import type { MiniGameDefinition, MiniGameRegistry, MiniGameSummary, MiniGameStats } from "./types";

// Generate a pool of blueprint-backed placeholders and rotate through them
const INFINITE_CHALLENGE_COUNT = 60;
const infiniteCaptchaChallenges = createChallengePlaceholders(INFINITE_CHALLENGE_COUNT);

const buildCaptchaDefinition = (): MiniGameDefinition => {
  return {
    id: "orbital-captcha",
    title: "Orbital Captcha",
    synopsis: "Проверяйте телеметрию спутников, отмечая правильные кадры в орбитальной трансляции.",
    difficulty: "standard",
    tags: ["pattern", "focus", "solo"],
    cover: {
      accent: "linear-gradient(135deg, #2563eb, #38bdf8)",
      image: "/mock/mini-games/captcha/rocket.webp",
    },
    reward: {
      label: "Mission credits",
      value: 120,
      unit: "credits",
    },
    analytics: {
      featuredOrder: 1,
      estimatedPlayers: 4800,
    },
    config: {
      mode: "captcha",
      gridSize: 3,
      challenges: infiniteCaptchaChallenges,
      baseDurationSeconds: 120, // 2 минуты
      // Сбалансированная система очков
      // Целевое значение: 300-500 очков за полную игру (3-5 вызовов)
      score: {
        base: 50, // было 100
        perCorrect: 20, // было 25
        missPenalty: 15, // было 20
        extraPenalty: 10, // было 15
        completionBonus: 40, // было 80
        streakMultiplier: 1.05, // было 1.1 - более умеренный рост
      },
    },
  };
};

const buildDecisionTreeDefinition = (): MiniGameDefinition => {
  return {
    id: "decision-tree-builder",
    title: "Astronaut Selection 🚀",
    synopsis:
      "Papers, Please style game. Review candidates and approve/reject based on mission rules.",
    difficulty: "standard",
    tags: ["logic", "speed", "solo"],
    cover: {
      accent: "linear-gradient(135deg, #10b981, #34d399)",
      image: "/mock/mini-games/captcha/rocket.webp",
    },
    reward: {
      label: "Selection XP",
      value: 200,
      unit: "xp",
    },
    analytics: {
      featuredOrder: 2,
      estimatedPlayers: 3200,
    },
    config: {
      mode: "astronaut-selection",
      gridSize: 0,
      challenges: ["astronaut-selection-game"], // Одна игра с рандомными раундами
      baseDurationSeconds: 60,
      score: {
        base: 100,
        perCorrect: 40,
        missPenalty: 0,
        extraPenalty: 0,
        completionBonus: 150,
        streakMultiplier: 1.2,
      },
    },
  };
};

const buildCosmicPokerDefinition = (): MiniGameDefinition => {
  return {
    id: "constellation-memory",
    title: "Constellation Memory",
    synopsis:
      "Find matching pairs of constellations! Test your memory and match all pairs before time runs out.",
    difficulty: "standard",
    tags: ["memory", "cards", "solo"],
    cover: {
      accent: "linear-gradient(135deg, #7c3aed, #22d3ee)",
      image: "/mock/mini-games/captcha/rocket.webp",
    },
    reward: {
      label: "Constellation Chips",
      value: 320,
      unit: "credits",
    },
    analytics: {
      featuredOrder: 3,
      estimatedPlayers: 2100,
    },
    config: {
      mode: "constellation-memory",
      gridSize: 0,
      challenges: ["cosmic-poker-round"],
      baseDurationSeconds: 75,
      score: {
        base: 180,
        perCorrect: 140,
        missPenalty: 80,
        extraPenalty: 60,
        completionBonus: 160,
        streakMultiplier: 1.25,
      },
    },
  };
};

const registry: MiniGameRegistry = {
  "orbital-captcha": buildCaptchaDefinition(),
  "decision-tree-builder": buildDecisionTreeDefinition(),
  "constellation-memory": buildCosmicPokerDefinition(),
};

export const MINI_GAME_REGISTRY: MiniGameRegistry = registry;

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
};

export const listMiniGames = () => Object.values(MINI_GAME_REGISTRY);

export const listFeaturedMiniGames = (limit?: number) =>
  listMiniGames()
    .sort((a, b) => a.analytics.featuredOrder - b.analytics.featuredOrder)
    .slice(0, limit ?? listMiniGames().length);

export const getMiniGameById = (id: string) => MINI_GAME_REGISTRY[id] ?? null;

export const mapMiniGameToSummary = (
  game: MiniGameDefinition,
  stats?: MiniGameStats,
): MiniGameSummary => {
  const attempts = stats?.totalAttempts ?? 0;
  const success = stats?.totalSuccess ?? 0;
  const completionRate = attempts === 0 ? 0 : Math.round((success / attempts) * 100);
  const playerCount = stats?.uniquePlayers ?? 0;

  // Используем реальную среднюю длительность из БД, если есть
  // Иначе используем базовую длительность игры как fallback
  const averageDurationSeconds = stats?.averageDurationSeconds
    ? Math.round(stats.averageDurationSeconds)
    : game.config.baseDurationSeconds;

  return {
    id: game.id,
    title: game.title,
    synopsis: game.synopsis,
    difficulty: game.difficulty,
    tags: game.tags,
    accent: game.cover.accent,
    averageDuration: formatDuration(averageDurationSeconds),
    playerCount,
    completionRate,
    rewardLabel: `${game.reward.value} ${game.reward.label.toLowerCase()}`,
  };
};
