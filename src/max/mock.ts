import { logger } from "@/lib/utils/logger";

import type {
  TelegramColorScheme,
  TelegramInitDataUnsafe,
  TelegramMainButton,
  TelegramThemeParams,
  TelegramWebApp,
  TelegramUser,
} from "./types";

type EventHandler = (...args: unknown[]) => void;

type EventRegistry = Record<string, Set<EventHandler>>;

const DEFAULT_USER: TelegramUser = {
  id: 111111111,
  first_name: "Dev",
  last_name: "User",
  username: "devuser",
  language_code: "en",
  is_premium: true,
};

const DARK_THEME: TelegramThemeParams = {
  bg_color: "#0a0e14",
  secondary_bg_color: "#151921",
  text_color: "#e6edf3",
  hint_color: "#8b949e",
  link_color: "#58a6ff",
  button_color: "#1f6feb",
  button_text_color: "#ffffff",
  accent_color: "#58a6ff",
};

const normalizeBoolean = (value: string | undefined): boolean => value?.toLowerCase() === "true";

const parseNumber = (value: string | undefined): number | undefined => {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const loadMockUser = (): TelegramUser => ({
  ...DEFAULT_USER,
  id: parseNumber(process.env.NEXT_PUBLIC_TELEGRAM_DEBUG_USER_ID) ?? DEFAULT_USER.id,
  first_name: process.env.NEXT_PUBLIC_TELEGRAM_DEBUG_USER_FIRST_NAME ?? DEFAULT_USER.first_name,
  last_name: process.env.NEXT_PUBLIC_TELEGRAM_DEBUG_USER_LAST_NAME ?? DEFAULT_USER.last_name,
  username: process.env.NEXT_PUBLIC_TELEGRAM_DEBUG_USERNAME ?? DEFAULT_USER.username,
  language_code: process.env.NEXT_PUBLIC_TELEGRAM_DEBUG_LANGUAGE_CODE ?? DEFAULT_USER.language_code,
  is_premium: normalizeBoolean(process.env.NEXT_PUBLIC_TELEGRAM_DEBUG_IS_PREMIUM ?? "true"),
});

const loadMockTheme = (): TelegramThemeParams => ({
  ...DARK_THEME,
  bg_color: process.env.NEXT_PUBLIC_TELEGRAM_DEBUG_BG_COLOR ?? DARK_THEME.bg_color,
  secondary_bg_color:
    process.env.NEXT_PUBLIC_TELEGRAM_DEBUG_SECONDARY_BG_COLOR ?? DARK_THEME.secondary_bg_color,
  text_color: process.env.NEXT_PUBLIC_TELEGRAM_DEBUG_TEXT_COLOR ?? DARK_THEME.text_color,
  hint_color: process.env.NEXT_PUBLIC_TELEGRAM_DEBUG_HINT_COLOR ?? DARK_THEME.hint_color,
  button_color: process.env.NEXT_PUBLIC_TELEGRAM_DEBUG_BUTTON_COLOR ?? DARK_THEME.button_color,
  button_text_color:
    process.env.NEXT_PUBLIC_TELEGRAM_DEBUG_BUTTON_TEXT_COLOR ?? DARK_THEME.button_text_color,
  accent_color: process.env.NEXT_PUBLIC_TELEGRAM_DEBUG_ACCENT_COLOR ?? DARK_THEME.accent_color,
  link_color: process.env.NEXT_PUBLIC_TELEGRAM_DEBUG_LINK_COLOR ?? DARK_THEME.link_color,
});

const createMainButton = (
  handlers: EventRegistry,
  theme: TelegramThemeParams,
): TelegramMainButton => {
  let text = "Continue";
  let isVisible = false;
  let isActive = true;

  return {
    get text() {
      return text;
    },
    set text(value: string) {
      text = value;
    },
    color: theme.button_color,
    text_color: theme.button_text_color,
    get isVisible() {
      return isVisible;
    },
    get isActive() {
      return isActive;
    },
    show() {
      isVisible = true;
    },
    hide() {
      isVisible = false;
    },
    enable() {
      isActive = true;
    },
    disable() {
      isActive = false;
    },
    setText(value: string) {
      text = value;
    },
    onClick(handler: EventHandler) {
      if (!handlers.mainButtonClicked) {
        handlers.mainButtonClicked = new Set();
      }
      handlers.mainButtonClicked.add(handler);
    },
    offClick(handler: EventHandler) {
      handlers.mainButtonClicked?.delete(handler);
    },
  };
};

const createBackButton = (handlers: EventRegistry) => {
  let isVisible = false;

  return {
    get isVisible() {
      return isVisible;
    },
    show() {
      isVisible = true;
    },
    hide() {
      isVisible = false;
    },
    onClick(handler: EventHandler) {
      if (!handlers.backButtonClicked) {
        handlers.backButtonClicked = new Set();
      }
      handlers.backButtonClicked.add(handler);
    },
    offClick(handler: EventHandler) {
      handlers.backButtonClicked?.delete(handler);
    },
  };
};

export const shouldUseMock = (): boolean =>
  normalizeBoolean(process.env.NEXT_PUBLIC_TELEGRAM_MOCK_MODE ?? "false");

export const createMockWebApp = (): TelegramWebApp => {
  const handlers: EventRegistry = {};
  const user = loadMockUser();
  const colorScheme: TelegramColorScheme = "dark";
  const theme = loadMockTheme();

  const initDataUnsafe: TelegramInitDataUnsafe = {
    user,
    chat_instance: "mock-chat-instance",
    chat_type: "private",
    hash: "debug",
    auth_date: Math.floor(Date.now() / 1000),
  };

  const webApp: TelegramWebApp = {
    version: "debug",
    platform: "web",
    colorScheme,
    themeParams: theme,
    isExpanded: true,
    initData: JSON.stringify(initDataUnsafe),
    initDataUnsafe,
    viewportHeight: window.innerHeight,
    viewportStableHeight: window.innerHeight,
    BackButton: createBackButton(handlers),
    MainButton: createMainButton(handlers, theme),
    HapticFeedback: {
      impactOccurred(style: "light" | "medium" | "heavy" | "rigid" | "soft") {
        logger.debug("Telegram mock HapticFeedback.impactOccurred", style);
        // In real Telegram app this would trigger haptic feedback
      },
      notificationOccurred(type: "error" | "success" | "warning") {
        logger.debug("Telegram mock HapticFeedback.notificationOccurred", type);
        // In real Telegram app this would trigger notification feedback
      },
      selectionChanged() {
        logger.debug("Telegram mock HapticFeedback.selectionChanged");
        // In real Telegram app this would trigger selection feedback
      },
    },
    ready() {
      /* noop */
    },
    expand() {
      /* noop */
    },
    close() {
      /* noop */
    },
    showAlert(message: string) {
      window.alert(message);
    },
    showPopup({ title, message }) {
      window.alert(title ? `${title}\n\n${message}` : message);
    },
    sendData(data: string) {
      logger.debug("Telegram mock sendData", data);
    },
    openLink(url: string) {
      window.open(url, "_blank", "noopener noreferrer");
    },
    openTelegramLink(url: string) {
      window.open(url, "_blank", "noopener noreferrer");
    },
    onEvent(event: string, handler: EventHandler) {
      if (!handlers[event]) {
        handlers[event] = new Set();
      }
      handlers[event]!.add(handler);
    },
    offEvent(event: string, handler: EventHandler) {
      handlers[event]?.delete(handler);
    },
  };

  return webApp;
};
