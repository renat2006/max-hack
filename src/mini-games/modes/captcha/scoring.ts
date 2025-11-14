import type { CaptchaGameConfig } from "@/lib/mini-games/types";
import type { CaptchaEvaluation, CaptchaSubmission, SessionScoreState } from "./types";

export const evaluateCaptcha = ({ challenge, selected }: CaptchaSubmission): CaptchaEvaluation => {
  const uniqueSelected = Array.from(new Set(selected));
  const correctSet = new Set(challenge.correctCells);

  let correctCount = 0;
  for (const cell of uniqueSelected) {
    if (correctSet.has(cell)) {
      correctCount += 1;
    }
  }

  const missing = challenge.correctCells.length - correctCount;
  const extra = uniqueSelected.length - correctCount;

  return {
    correctCount,
    missing: Math.max(0, missing),
    extra: Math.max(0, extra),
  };
};

export const computeCaptchaScore = (
  config: CaptchaGameConfig,
  evaluation: CaptchaEvaluation,
  state: SessionScoreState,
): number => {
  const rules = config.score;

  const base = rules.base;
  const fromCorrect = evaluation.correctCount * rules.perCorrect;
  const penaltyMissing = evaluation.missing * rules.missPenalty;
  const penaltyExtra = evaluation.extra * rules.extraPenalty;

  const challengeScore = Math.max(0, base + fromCorrect - penaltyMissing - penaltyExtra);
  const completionBonus =
    evaluation.missing === 0 && evaluation.extra === 0 ? rules.completionBonus : 0;

  const streakMultiplier =
    evaluation.missing === 0 && evaluation.extra === 0 ? rules.streakMultiplier ** state.streak : 1;
  const total = (challengeScore + completionBonus) * streakMultiplier;

  return Math.round(total);
};

export const updateSessionScore = (
  state: SessionScoreState,
  evaluation: CaptchaEvaluation,
  challengeScore: number,
): SessionScoreState => {
  const wasPerfect = evaluation.missing === 0 && evaluation.extra === 0;
  const nextStreak = wasPerfect ? state.streak + 1 : 0;
  return {
    totalScore: state.totalScore + challengeScore,
    streak: nextStreak,
  };
};
