import type { GameStatus, ValidationResult } from "@/app/types/game";

export type CaptchaSessionState = {
  status: GameStatus;
  validation: ValidationResult | null;
  selectedCells: Set<number>;
  totalScore: number;
  streak: number;
  lastChallengeScore: number;
  startedAt: number | null;
  completedChallenges: number;
  totalAttempts: number;
  durationMs: number;
  timeRemainingSeconds: number;
  baseDurationSeconds: number;
  runId: string | null;
  timerExpired: boolean;
};

const DEFAULT_BASE_DURATION_SECONDS = 120; // 2 минуты

export const createCaptchaSessionState = (baseDurationSeconds = DEFAULT_BASE_DURATION_SECONDS): CaptchaSessionState => ({
  status: "idle",
  validation: null,
  selectedCells: new Set(),
  totalScore: 0,
  streak: 0,
  lastChallengeScore: 0,
  startedAt: null,
  completedChallenges: 0,
  totalAttempts: 0,
  durationMs: 0,
  timeRemainingSeconds: baseDurationSeconds,
  baseDurationSeconds,
  runId: null,
  timerExpired: false,
});
