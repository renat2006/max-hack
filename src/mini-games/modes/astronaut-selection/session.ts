import { useCallback, useEffect, useMemo, useState } from "react";

import type { GameStatus } from "@/app/types/game";
import type { MiniGameDefinition } from "@/lib/mini-games/types";
import type { AstronautSelectionMiniGameSession } from "@/lib/mini-games/core/session/types";
import type { AstronautSelectionRuntime, AstronautSelectionSummary } from "./session-types";

const createRuntime = (): AstronautSelectionRuntime => ({
  runId: null,
  startedAt: null,
});

const createRunId = () =>
  `astronaut-run-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const deriveStatus = (summary: AstronautSelectionSummary | null): GameStatus => {
  if (!summary) {
    return "idle";
  }
  return summary.score > 0 ? "success" : "error";
};

type UseAstronautSelectionSessionOptions = {
  definition: MiniGameDefinition | null;
  userId?: number;
  isMock: boolean;
};

export const useAstronautSelectionSession = ({
  definition,
  userId,
  isMock,
}: UseAstronautSelectionSessionOptions): AstronautSelectionMiniGameSession => {
  void userId;
  void isMock;

  const normalizedDefinition = useMemo(() => {
    if (definition?.config.mode === "astronaut-selection") {
      return definition;
    }
    return null;
  }, [definition]);

  const [summary, setSummary] = useState<AstronautSelectionSummary | null>(null);
  const [runtime, setRuntime] = useState<AstronautSelectionRuntime>(createRuntime);

  useEffect(() => {
    setSummary(null);
    setRuntime(createRuntime());
  }, [normalizedDefinition?.id]);

  const start = useCallback(() => {
    if (!normalizedDefinition) {
      return;
    }

    setRuntime((prev) => {
      if (prev.startedAt !== null) {
        return prev;
      }

      return {
        runId: prev.runId ?? createRunId(),
        startedAt: Date.now(),
      };
    });
  }, [normalizedDefinition]);

  const reset = useCallback(() => {
    setSummary(null);
    setRuntime(createRuntime());
  }, []);

  const recordCompletion = useCallback((payload: AstronautSelectionSummary) => {
    setSummary(payload);
    setRuntime((prev) => ({
      runId: prev.runId ?? createRunId(),
      startedAt: prev.startedAt ?? Date.now(),
    }));
  }, []);

  const status = useMemo(() => deriveStatus(summary), [summary]);

  return {
    mode: "astronaut-selection",
    definition: normalizedDefinition,
    status,
    isLoaded: Boolean(normalizedDefinition),
    isStarted: runtime.startedAt !== null,
    runtime,
    summary,
    start,
    reset,
    recordCompletion,
  } satisfies AstronautSelectionMiniGameSession;
};
