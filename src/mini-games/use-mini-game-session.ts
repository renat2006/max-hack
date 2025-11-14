import { useMemo } from "react";

import { getMiniGameById } from "./catalog";
import type { MiniGameDefinition } from "./types";
import type { MiniGameSession } from "./core/session/types";
import { useCaptchaSession } from "./modes/captcha/session";
import { useAstronautSelectionSession } from "./modes/astronaut-selection/session";
import { useCosmicPokerSession } from "./modes/cosmic-poker/session";

export type { MiniGameSession } from "./core/session/types";

type UseMiniGameSessionOptions = {
  gameId: string | null;
  userId?: number;
  isMock: boolean;
};

export const useMiniGameSession = ({
  gameId,
  userId,
  isMock,
}: UseMiniGameSessionOptions): MiniGameSession => {
  const definition = useMemo(() => (gameId ? getMiniGameById(gameId) : null), [gameId]);
  const captchaDefinition = definition?.config.mode === "captcha" ? definition : null;
  const astronautDefinition = definition?.config.mode === "astronaut-selection" ? definition : null;
  const cosmicPokerDefinition =
    definition?.config.mode === "constellation-memory"
      ? (definition as MiniGameDefinition & { config: { mode: "constellation-memory" } })
      : null;

  const captchaSession = useCaptchaSession({ definition: captchaDefinition, userId, isMock });
  const astronautSession = useAstronautSelectionSession({
    definition: astronautDefinition,
    userId,
    isMock,
  });
  const cosmicPokerSession = useCosmicPokerSession({
    definition: cosmicPokerDefinition,
    userId,
    isMock,
  });

  switch (definition?.config.mode) {
    case "astronaut-selection":
      return astronautSession;
    case "constellation-memory":
      return cosmicPokerSession;
    case "captcha":
    default:
      return captchaSession;
  }
};
