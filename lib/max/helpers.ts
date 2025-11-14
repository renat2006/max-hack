"use client";

import { useMaxBridge } from "./hooks";

export function useMaxMainButton(): {
  show: () => void;
  hide: () => void;
  enable: () => void;
  disable: () => void;
  setText: (text: string) => void;
  onClick: (handler: () => void) => void;
  offClick: (handler: () => void) => void;
} {
  const { bridge } = useMaxBridge();

  return {
    show: (): void => {
      if (bridge?.MainButton) {
        bridge.MainButton.is_visible = true;
      }
    },
    hide: (): void => {
      if (bridge?.MainButton) {
        bridge.MainButton.is_visible = false;
      }
    },
    enable: (): void => {
      if (bridge?.MainButton) {
        bridge.MainButton.is_active = true;
      }
    },
    disable: (): void => {
      if (bridge?.MainButton) {
        bridge.MainButton.is_active = false;
      }
    },
    setText: (text: string): void => {
      if (bridge?.MainButton) {
        bridge.MainButton.text = text;
      }
    },
    onClick: (handler: () => void): void => {
      bridge?.onEvent("mainButtonClicked", handler);
    },
    offClick: (handler: () => void): void => {
      bridge?.offEvent("mainButtonClicked", handler);
    },
  };
}

export function useMaxBackButton(): {
  show: () => void;
  hide: () => void;
  onClick: (handler: () => void) => void;
  offClick: (handler: () => void) => void;
} {
  const { bridge } = useMaxBridge();

  return {
    show: (): void => {
      if (bridge?.BackButton) {
        bridge.BackButton.is_visible = true;
      }
    },
    hide: (): void => {
      if (bridge?.BackButton) {
        bridge.BackButton.is_visible = false;
      }
    },
    onClick: (handler: () => void): void => {
      bridge?.onEvent("backButtonClicked", handler);
    },
    offClick: (handler: () => void): void => {
      bridge?.offEvent("backButtonClicked", handler);
    },
  };
}

export function triggerMaxHapticFeedback(
  bridge: typeof window.Max | null,
  type: "light" | "medium" | "heavy" | "rigid" | "soft" | "success" | "error" | "warning"
): void {
  if (!bridge?.HapticFeedback) return;

  if (type === "light" || type === "medium" || type === "heavy" || type === "rigid" || type === "soft") {
    bridge.HapticFeedback.impactOccurred(type);
  } else {
    bridge.HapticFeedback.notificationOccurred(type);
  }
}

