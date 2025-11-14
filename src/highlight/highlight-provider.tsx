"use client";

import { H } from "@highlight-run/next/client";
import { useEffect, useRef, type ReactNode } from "react";

import { useMax } from "@/lib/max";
import { logger } from "@/lib/utils/logger";

import { isHighlightEnabled } from "./config";
import { recordHighlightLog } from "./logger";

export const HighlightProvider = ({ children }: { children: ReactNode }) => {
  const { user, isReady, isMock } = useMax();
  const lastIdentifiedUser = useRef<string | null>(null);

  useEffect(() => {
    if (!isHighlightEnabled()) {
      logger.debug("Highlight is disabled: NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID is not configured.");
    }
  }, []);

  useEffect(() => {
    if (!isHighlightEnabled() || !isReady) {
      return;
    }

    const identifier = user?.id ? String(user.id) : (user?.username ?? null);
    if (!identifier || lastIdentifiedUser.current === identifier) {
      return;
    }

    H.identify(identifier, {
      telegram_id: user?.id,
      telegram_username: user?.username,
      telegram_first_name: user?.first_name,
      telegram_last_name: user?.last_name,
      telegram_language: user?.language_code,
      is_premium: user?.is_premium,
      is_mock: isMock,
      platform: "telegram_webapp",
    });

    recordHighlightLog("Telegram user identified in Highlight", "info", {
      telegram_id: user?.id,
      telegram_username: user?.username,
      telegram_first_name: user?.first_name,
      telegram_last_name: user?.last_name,
      is_premium: user?.is_premium,
      is_mock: isMock,
    });

    lastIdentifiedUser.current = identifier;
  }, [user, isReady, isMock]);

  return <>{children}</>;
};
