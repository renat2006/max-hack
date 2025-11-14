import type { MiniGameHudMetric } from "@/lib/mini-games/types";

export type ConstellationId =
  | "orion-forge"
  | "lyra-symphony"
  | "draco-sentinel"
  | "phoenix-ascent"
  | "cassiopeia-crown"
  | "ursa-major-guard"
  | "cygnus-swift"
  | "perseus-strike"
  | "andromeda-spiral"
  | "scorpius-sting"
  | "sagittarius-archer"
  | "capricornus-gate"
  | "aquarius-flow"
  | "pisces-twin"
  | "taurus-bull"
  | "gemini-twin"
  | "cancer-shell"
  | "leo-king";

export type ConstellationDefinition = {
  id: ConstellationId;
  name: string;
  alias: string;
  quadrant: "core" | "rim" | "spiral" | "cluster";
  accent: string;
  gradient: string;
  aura: string;
  description: string;
};

export type CosmicRankId =
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K"
  | "A";

export type RankDefinition = {
  id: CosmicRankId;
  value: number;
  label: string;
  shortLabel: string;
  starName: string;
  spectralClass: string;
  magnitude: number;
  lore: string;
};

// Типы для Memory игры
export type MatchType = "pair" | "triple" | "quad" | "none";

// Карта для Memory игры
export type MemoryCard = {
  id: string; // constellation-id-index
  uniqueId: number; // Уникальный ID для ключа React
  pairId: string; // Уникальный ID пары для сопоставления (может быть constellationId или constellationId-номер)
  constellationId: ConstellationId;
  constellationName: string;
  constellationAlias: string;
  accent: string;
  gradient: string;
  aura: string;
  quadrant: ConstellationDefinition["quadrant"];
  isFlipped: boolean; // Перевернута ли карта
  isMatched: boolean; // Найдена ли пара
};

export type CosmicCard = {
  id: string;
  constellationId: ConstellationId;
  constellationName: string;
  constellationAlias: string;
  accent: string;
  gradient: string;
  aura: string;
  quadrant: ConstellationDefinition["quadrant"];
  rankId: CosmicRankId;
  rankValue: number;
  rankLabel: string;
  rankShortLabel: string;
  starName: string;
  spectralClass: string;
  magnitude: number;
  lore: string;
};

// Стейт Memory игры
export type GameState = {
  cards: MemoryCard[];
  flippedCards: number[]; // uniqueId перевернутых карт (макс 2)
  matchedPairs: number;
  score: number;
  combo: number;
  timeRemaining: number;
  totalAttempts: number;
  wrongAttempts: number;
  isProcessing: boolean;
  gameOver: boolean;
  showInitialCards: boolean; // Показ карт в начале для запоминания
  level: number; // Текущий уровень
  pairsInLevel: number; // Количество пар в текущем уровне
  levelComplete: boolean; // Уровень завершен
};

export type GameSummary = {
  score: number;
  totalMatches: number;
  bestMatch: MatchType;
  accuracy: number;
  timeBonus: number;
};

export type RoundSummary = GameSummary;

export type PokerHudShape = Pick<MiniGameHudMetric, "label" | "value" | "tone" | "icon">;
