import type { GameStatus } from "@/app/types/game";
import type { MiniGameDefinition } from "../types";

export type ProgressEventSummary = {
  completedChallenges: number;
  totalChallenges: number;
  accuracyPercent: number;
  durationMs: number;
  totalScore: number;
};

export type SubmitProgressEventParams = {
  userId?: number;
  game: MiniGameDefinition | null;
  challengeId: string;
  status: GameStatus;
  score: number;
  selected?: number[];
  missing?: number;
  extra?: number;
  totalCorrect?: number;
  isMock: boolean;
  sessionSummary?: ProgressEventSummary;
  username?: string | null;
  fullName?: string | null;
};

const buildRequestBody = ({
  userId,
  game,
  challengeId,
  status,
  score,
  selected,
  missing,
  extra,
  totalCorrect,
  sessionSummary,
  username,
  fullName,
}: SubmitProgressEventParams) => {
  if (!userId || !game) {
    return null;
  }

  return {
    userId,
    gameId: game.id,
    challengeId,
    status,
    score,
    selected: selected ?? [],
    missing: missing ?? 0,
    extra: extra ?? 0,
    totalCorrect: totalCorrect ?? 0,
    sessionSummary,
    username,
    fullName,
  };
};

export const submitProgressEvent = (params: SubmitProgressEventParams): void => {
  if (params.isMock) {
    return;
  }

  const body = buildRequestBody(params);
  if (!body) {
    return;
  }

  fetch("/api/telegram/progress", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    keepalive: true,
  }).catch((error) => {
    console.error("Failed to send progress event", error);
  });
};
