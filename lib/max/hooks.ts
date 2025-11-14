"use client";

import { useEffect, useState, useCallback } from "react";
import type {
  MaxInitData,
  MaxTheme,
  MaxViewport,
  MaxColorScheme,
  MaxUser,
} from "./types";
import { getMaxBridge, parseInitData, isMaxWebApp } from "./utils";

export function useMaxBridge(): {
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
} {
  const [bridge, setBridge] = useState<typeof window.Max | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [initData, setInitData] = useState<MaxInitData | null>(null);
  const [theme, setTheme] = useState<MaxTheme>("light");
  const [viewport, setViewport] = useState<MaxViewport | null>(null);
  const [colorScheme, setColorScheme] = useState<MaxColorScheme>({});
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const available = isMaxWebApp();
    setIsAvailable(available);

    if (!available) {
      return;
    }

    const maxBridge = getMaxBridge();
    if (!maxBridge) {
      return;
    }

    setBridge(maxBridge);

    maxBridge.init();
    maxBridge.ready();

    const parsedInitData = parseInitData(maxBridge.initData);
    setInitData(parsedInitData);

    setTheme(maxBridge.colorScheme);
    setColorScheme(maxBridge.themeParams);

    const currentViewport: MaxViewport = {
      height: maxBridge.viewportHeight,
      width: window.innerWidth,
      is_expanded: maxBridge.isExpanded,
      is_state_stable: true,
    };
    setViewport(currentViewport);

    setIsReady(true);

    const handleViewportChange = (): void => {
      const newViewport: MaxViewport = {
        height: maxBridge.viewportHeight,
        width: window.innerWidth,
        is_expanded: maxBridge.isExpanded,
        is_state_stable: true,
      };
      setViewport(newViewport);
    };

    const handleThemeChange = (): void => {
      setTheme(maxBridge.colorScheme);
      setColorScheme(maxBridge.themeParams);
    };

    window.addEventListener("resize", handleViewportChange);
    maxBridge.onEvent("viewportChanged", handleViewportChange);
    maxBridge.onEvent("themeChanged", handleThemeChange);

    return () => {
      window.removeEventListener("resize", handleViewportChange);
      maxBridge.offEvent("viewportChanged", handleViewportChange);
      maxBridge.offEvent("themeChanged", handleThemeChange);
    };
  }, []);

  const expand = useCallback(() => {
    bridge?.expand();
  }, [bridge]);

  const close = useCallback(() => {
    bridge?.close();
  }, [bridge]);

  const sendData = useCallback(
    (data: string) => {
      bridge?.sendData(data);
    },
    [bridge]
  );

  const openLink = useCallback(
    (url: string, options?: { try_instant_view?: boolean }) => {
      bridge?.openLink(url, options);
    },
    [bridge]
  );

  const showAlert = useCallback(
    (message: string, callback?: () => void) => {
      bridge?.showAlert(message, callback);
    },
    [bridge]
  );

  const showConfirm = useCallback(
    (message: string, callback?: (confirmed: boolean) => void) => {
      bridge?.showConfirm(message, callback);
    },
    [bridge]
  );

  const showPopup = useCallback(
    (
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
    ) => {
      bridge?.showPopup(params, callback);
    },
    [bridge]
  );

  return {
    bridge,
    isReady,
    isAvailable,
    initData,
    theme,
    viewport,
    colorScheme,
    expand,
    close,
    sendData,
    openLink,
    showAlert,
    showConfirm,
    showPopup,
  };
}

export function useMaxUser(): MaxUser | null {
  const { initData } = useMaxBridge();
  return initData?.user ?? null;
}

export function useMaxTheme(): {
  theme: MaxTheme;
  colorScheme: MaxColorScheme;
} {
  const { theme, colorScheme } = useMaxBridge();
  return { theme, colorScheme };
}

export function useMaxViewport(): MaxViewport | null {
  const { viewport } = useMaxBridge();
  return viewport;
}
