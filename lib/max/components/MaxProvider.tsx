"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useMaxBridge } from "../hooks";
import type {
  MaxInitData,
  MaxTheme,
  MaxViewport,
  MaxColorScheme,
} from "../types";

interface MaxContextValue {
  bridge: typeof window.Max | null;
  isReady: boolean;
  isAvailable: boolean;
  initData: MaxInitData | null;
  theme: MaxTheme;
  viewport: MaxViewport | null;
  colorScheme: MaxColorScheme;
  expand: () => void;
  close: () => void;
  sendData: (data: string) => void;
  openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
  showAlert: (message: string, callback?: () => void) => void;
  showConfirm: (
    message: string,
    callback?: (confirmed: boolean) => void
  ) => void;
  showPopup: (
    params: {
      title?: string;
      message: string;
      buttons?: Array<{
        id?: string;
        type?: "default" | "ok" | "close" | "cancel" | "destructive";
        text: string;
      }>;
    },
    callback?: (buttonId: string) => void
  ) => void;
}

const MaxContext = createContext<MaxContextValue | null>(null);

export function MaxProvider({
  children,
}: {
  children: ReactNode;
}): React.ReactElement {
  const maxBridge = useMaxBridge();

  return (
    <MaxContext.Provider value={maxBridge}>{children}</MaxContext.Provider>
  );
}

export function useMax(): MaxContextValue {
  const context = useContext(MaxContext);
  if (!context) {
    throw new Error("useMax must be used within MaxProvider");
  }
  return context;
}
