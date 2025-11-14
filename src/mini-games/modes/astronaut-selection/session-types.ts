export type AstronautSelectionSummary = {
  score: number;
  accuracyPercent: number;
  totalDecisions: number;
  correctDecisions: number;
  durationMs: number;
};

export type AstronautSelectionCompletionPayload = AstronautSelectionSummary;

export type AstronautSelectionRuntime = {
  runId: string | null;
  startedAt: number | null;
};
