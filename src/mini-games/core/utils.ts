// Core Mini-Game Utilities
// Общие утилиты для всех мини-игр

import type { MiniGameVibration } from "./engine";

type TelegramHapticFeedback = {
  impactOccurred?: (type: "light" | "medium" | "heavy" | "rigid" | "soft") => void;
  notificationOccurred?: (type: "success" | "error" | "warning") => void;
  selectionChanged?: () => void;
};

type TelegramWebAppLike = {
  HapticFeedback?: TelegramHapticFeedback;
};

// Вибрация через Telegram WebApp
export function triggerHapticFeedback(
  webApp: TelegramWebAppLike | undefined,
  type: MiniGameVibration,
): void {
  if (!webApp?.HapticFeedback) return;

  switch (type) {
    case "light":
      webApp.HapticFeedback.impactOccurred?.("light");
      break;
    case "medium":
      webApp.HapticFeedback.impactOccurred?.("medium");
      break;
    case "heavy":
      webApp.HapticFeedback.impactOccurred?.("heavy");
      break;
    case "success":
      webApp.HapticFeedback.notificationOccurred?.("success");
      break;
    case "error":
      webApp.HapticFeedback.notificationOccurred?.("error");
      break;
    case "warning":
      webApp.HapticFeedback.notificationOccurred?.("warning");
      break;
  }
}

// Генерация случайных элементов из массива
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Выбор N случайных элементов
export function selectRandom<T>(array: T[], count: number): T[] {
  return shuffleArray(array).slice(0, count);
}

// Задержка для анимаций
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Форматирование времени
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

// Форматирование процентов
export function formatPercent(value: number, decimals: number = 0): string {
  return `${value.toFixed(decimals)}%`;
}

// Проверка попадания в диапазон
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}
