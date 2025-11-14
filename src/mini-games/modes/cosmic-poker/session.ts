import { useCallback, useEffect, useMemo, useState } from "react";

import type { GameStatus } from "@/app/types/game";
import type { CosmicPokerMiniGameSession } from "@/lib/mini-games/core/session/types";
import type { GameSummary } from "@/lib/mini-games/logic/cosmic-poker/types";
import type { MiniGameDefinition } from "@/lib/mini-games/types";

const deriveStatus = (summary: GameSummary | null): GameStatus => {
  if (!summary) {
    return "idle";
  }

  return summary.score > 0 ? "success" : "error";
};

type UseCosmicPokerSessionOptions = {
  definition: MiniGameDefinition | null;
  userId?: number;
  isMock: boolean;
};

export const useCosmicPokerSession = ({
  definition,
  userId,
  isMock,
}: UseCosmicPokerSessionOptions): CosmicPokerMiniGameSession => {
  void userId;
  void isMock;

  const normalizedDefinition = useMemo(() => {
    if (definition?.config.mode === "constellation-memory") {
      return definition as MiniGameDefinition & { config: { mode: "constellation-memory" } };
    }
    return null;
  }, [definition]);

  const [lastRound, setLastRound] = useState<GameSummary | null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    setLastRound(null);
    setStarted(false);
  }, [normalizedDefinition?.id]);

  const start = useCallback(() => {
    if (!normalizedDefinition) {
      return;
    }

    setStarted(true);
  }, [normalizedDefinition]);

  const reset = useCallback(() => {
    setLastRound(null);
    setStarted(false);
  }, []);

  const recordRound = useCallback((summary: GameSummary) => {
    setLastRound(summary);
  }, []);

  return {
    mode: "constellation-memory",
    definition: normalizedDefinition,
    status: deriveStatus(lastRound),
    isLoaded: Boolean(normalizedDefinition),
    isStarted: started,
    start,
    reset,
    lastRound,
    recordRound,
  } satisfies CosmicPokerMiniGameSession;
};
