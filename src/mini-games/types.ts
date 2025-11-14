import type { CaptchaChallengeDefinition } from "./modes/captcha/types";

export type MiniGameMode = "captcha" | "astronaut-selection" | "constellation-memory";

type DifficultyScale = "casual" | "standard" | "hard" | "elite";

type RewardUnit = "credits" | "shards" | "xp" | "cache";

type ScoreRule = {
  base: number;
  perCorrect: number;
  missPenalty: number;
  extraPenalty: number;
  completionBonus: number;
  streakMultiplier: number;
};

export type CaptchaGameConfig = {
  mode: "captcha";
  gridSize: number;
  challenges: CaptchaChallengeDefinition[];
  baseDurationSeconds: number;
  score: ScoreRule;
};

export type AstronautSelectionGameConfig = {
  mode: "astronaut-selection";
  gridSize: number;
  challenges: string[];
  baseDurationSeconds: number;
  score: ScoreRule;
};

export type CosmicPokerGameConfig = {
  mode: "cosmic-poker";
  gridSize: number;
  challenges: string[];
  baseDurationSeconds: number;
  score: ScoreRule;
};

export type ConstellationMemoryGameConfig = {
  mode: "constellation-memory";
  gridSize: number;
  challenges: string[];
  baseDurationSeconds: number;
  score: ScoreRule;
};

export type GameConfig =
  | CaptchaGameConfig
  | AstronautSelectionGameConfig
  | CosmicPokerGameConfig
  | ConstellationMemoryGameConfig;

export type MiniGameDefinition = {
  id: string;
  title: string;
  synopsis: string;
  difficulty: DifficultyScale;
  tags: string[];
  cover: {
    accent: string;
    image: string;
  };
  reward: {
    label: string;
    value: number;
    unit: RewardUnit;
  };
  analytics: {
    featuredOrder: number;
    estimatedPlayers: number;
  };
  config: GameConfig;
};

export type MiniGameRegistry = Record<string, MiniGameDefinition>;

export type MiniGameSummary = {
  id: string;
  title: string;
  synopsis: string;
  difficulty: DifficultyScale;
  tags: string[];
  accent: string;
  averageDuration: string;
  playerCount: number;
  completionRate: number;
  rewardLabel: string;
};

export type MiniGameStats = {
  gameId: string;
  totalAttempts: number;
  totalSuccess: number;
  uniquePlayers: number;
  averageScore: number;
  averageDurationSeconds?: number; // Средняя длительность игры в секундах (из БД)
};

export type { CaptchaChallengeDefinition } from "./modes/captcha/types";

export type MiniGameMetricTone = "neutral" | "success" | "warning" | "danger";

export type MiniGameHudMetricIcon = "score" | "delta" | "streak" | "accuracy" | "combo" | "speed";

export type MiniGameHudMetric = {
  label: string;
  value: string;
  tone?: MiniGameMetricTone;
  icon?: MiniGameHudMetricIcon;
};

export type MiniGameHudTimer = {
  remainingSeconds: number;
  totalSeconds?: number;
};

export type MiniGameHudState = {
  metrics?: MiniGameHudMetric[];
  timer?: MiniGameHudTimer | null;
  validationFeedback?: {
    type: "success" | "error";
    timestamp: number;
  } | null;
};
