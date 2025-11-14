"use client";

import { useMaxBridge, useMaxUser, useMaxTheme } from "@/lib/max";
import type { MaxUser, MaxColorScheme, MaxTheme } from "@/lib/max/types";
import { useMemo, type ReactNode } from "react";
import { createContext, useContext } from "react";

type MaxContextValue = {
  webApp: typeof window.Max | null;
  user: MaxUser | null;
  colorScheme: MaxTheme;
  themeParams: MaxColorScheme | null;
  isReady: boolean;
  isMock: boolean;
  openLink: (url: string) => void;
};

const MaxContext = createContext<MaxContextValue | undefined>(undefined);

export const MaxProvider = ({ children }: { children: ReactNode }) => {
  const maxBridge = useMaxBridge();
  const user = useMaxUser();
  const { theme, colorScheme } = useMaxTheme();

  const value = useMemo<MaxContextValue>(() => {
    const openLink = (url: string) => {
      if (maxBridge.bridge) {
        try {
          maxBridge.openLink(url);
          return;
        } catch (error) {
          console.error("Failed to open link via MAX", error);
        }
      }

      window.open(url, "_blank", "noopener,noreferrer");
    };

    return {
      webApp: maxBridge.bridge,
      user,
      colorScheme: theme,
      themeParams: colorScheme,
      isReady: maxBridge.isReady,
      isMock: !maxBridge.isAvailable,
      openLink,
    };
  }, [maxBridge, user, theme, colorScheme]);

  return <MaxContext.Provider value={value}>{children}</MaxContext.Provider>;
};

export const useMax = () => {
  const context = useContext(MaxContext);
  if (!context) {
    throw new Error("useMax must be used within a MaxProvider");
  }

  return context;
};
