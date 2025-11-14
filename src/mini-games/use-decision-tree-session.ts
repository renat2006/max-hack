"use client";

import { useState, useCallback, useEffect } from "react";
import type { DecisionTreeChallenge } from "./decision-tree-types";
import { DECISION_TREE_CHALLENGES } from "./decision-tree-data";
import { calculateScore } from "./decision-tree-engine";

export interface DecisionTreeSessionState {
  challengeId: string;
  challenge: DecisionTreeChallenge;
  score: number;
  accuracy: number;
  completed: boolean;
  startedAt: number;
  completedAt?: number;
}

export function useDecisionTreeSession(challengeId: string) {
  const [session, setSession] = useState<DecisionTreeSessionState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const challenge = DECISION_TREE_CHALLENGES.find((c) => c.id === challengeId);
    if (!challenge) {
      setLoading(false);
      return;
    }

    setSession({
      challengeId,
      challenge,
      score: 0,
      accuracy: 0,
      completed: false,
      startedAt: Date.now(),
    });
    setLoading(false);
  }, [challengeId]);

  const complete = useCallback(
    (accuracy: number, depth: number, timeSeconds: number) => {
      if (!session || session.completed) return;

      const score = calculateScore(accuracy, depth, session.challenge.targetDepth, timeSeconds);

      setSession((prev) =>
        prev
          ? {
              ...prev,
              score,
              accuracy,
              completed: true,
              completedAt: Date.now(),
            }
          : null,
      );

      return score;
    },
    [session],
  );

  return {
    session,
    loading,
    complete,
  };
}
