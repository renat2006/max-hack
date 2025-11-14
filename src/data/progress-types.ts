export type ProgressEventInput = {
  userId: string;
  gameId?: string | null;
  challengeId: string;
  status: string;
  score: number;
  selected: number[];
  missing: number;
  extra: number;
  totalCorrect: number;
  errorType?: string;
  username?: string | null;
  fullName?: string | null;
  sessionSummary?: {
    completedChallenges: number;
    totalChallenges: number;
    accuracyPercent: number;
    durationMs: number;
    totalScore: number;
  };
};

export type ProgressSummary = {
  score: number;
  totalAttempts: number;
  totalSuccess: number;
  weeklySuccess: number;
  accuracyPercent: number;
  streakDays: number;
  lastSuccessAt: string | null;
  lastAttemptAt: string | null;
};
