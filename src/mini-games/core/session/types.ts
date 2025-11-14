import type { GameStatus, ValidationResult } from "@/app/types/game";
import type {
  AstronautSelectionRuntime,
  AstronautSelectionSummary,
} from "@/lib/mini-games/modes/astronaut-selection/session-types";
import type { CaptchaChallengeDefinition } from "@/lib/mini-games/modes/captcha/types";
import type { CaptchaSessionState } from "@/lib/mini-games/modes/captcha/session-types";
import type { RoundSummary } from "@/lib/mini-games/logic/cosmic-poker/types";
import type { MiniGameDefinition, MiniGameMode } from "@/lib/mini-games/types";

type MiniGameSessionCommon = {
  mode: MiniGameMode;
  definition: MiniGameDefinition | null;
  status: GameStatus;
  isLoaded: boolean;
  isStarted: boolean;
  start: () => void;
  reset: () => void;
};

export type CaptchaMiniGameSession = MiniGameSessionCommon & {
  mode: "captcha";
  challengeIndex: number;
  totalChallenges: number;
  state: CaptchaSessionState;
  validation: ValidationResult | null;
  hasNext: boolean;
  isComplete: boolean;
  totalScore: number;
  lastChallengeScore: number;
  completedChallenges: number;
  accuracyPercent: number;
  elapsedMs: number;
  isChallengeLoading: boolean;
  challengeError: string | null;
  currentChallenge: CaptchaChallengeDefinition | null;
  timeRemainingSeconds: number;
  baseDurationSeconds: number;
  timerExpired: boolean;
  totalAttempts: number;
  prefetchProgress: number;
  isEndless: boolean;
  isInitialLoadComplete: boolean;
  submit: () => void;
  next: () => void;
  retry: () => void;
  challengeTitle: string;
  challengePrompt: string;
  challengeImage: string;
  correctCells: Set<number>;
  gridSize: number;
  toggleCell: (cell: number) => void;
};

export type AstronautSelectionMiniGameSession = MiniGameSessionCommon & {
  mode: "astronaut-selection";
  summary: AstronautSelectionSummary | null;
  runtime: AstronautSelectionRuntime;
  recordCompletion: (summary: AstronautSelectionSummary) => void;
};

export type CosmicPokerMiniGameSession = MiniGameSessionCommon & {
  mode: "constellation-memory";
  lastRound: RoundSummary | null;
  recordRound: (summary: RoundSummary) => void;
};

export type MiniGameSession =
  | CaptchaMiniGameSession
  | AstronautSelectionMiniGameSession
  | CosmicPokerMiniGameSession;
