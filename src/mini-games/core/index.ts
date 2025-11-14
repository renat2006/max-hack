// Core Mini-Game Types
// Общие типы для всех мини-игр

export type {
  MiniGameStatus,
  MiniGameScore,
  MiniGameProgress,
  MiniGameFeedback,
  MiniGameVibration,
  IMiniGameEngine,
} from "./engine";

export { MiniGameEngine } from "./engine";

export * from "./utils";
export * from "./session/types";
