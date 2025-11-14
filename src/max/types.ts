export type TelegramColorScheme = "light" | "dark";

type TelegramChatType = "private" | "group" | "supergroup" | "channel";

type TelegramEventType =
  | "themeChanged"
  | "viewportChanged"
  | "mainButtonClicked"
  | "backButtonClicked"
  | "settingsButtonClicked"
  | "invoiceClosed"
  | "popupClosed"
  | "qrTextReceived"
  | "clipboardTextReceived";

export interface TelegramThemeParams {
  accent_color?: string;
  bg_color?: string;
  secondary_bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
}

export interface TelegramUser {
  id: number;
  is_bot?: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  added_to_attachment_menu?: boolean;
  allows_write_to_pm?: boolean;
  photo_url?: string;
}

export interface TelegramChat {
  id: number;
  type: TelegramChatType;
  title?: string;
  username?: string;
  photo_url?: string;
}

export interface TelegramInitDataUnsafe {
  query_id?: string;
  user?: TelegramUser;
  receiver?: TelegramUser;
  chat?: TelegramChat;
  chat_instance?: string;
  chat_type?: TelegramChatType;
  start_param?: string;
  can_send_after?: number;
  hash?: string;
  auth_date?: number;
}

export interface TelegramBackButton {
  isVisible: boolean;
  show(): void;
  hide(): void;
  onClick(handler: () => void): void;
  offClick(handler: () => void): void;
}

export interface TelegramMainButton {
  text: string;
  color?: string;
  text_color?: string;
  isVisible: boolean;
  isActive: boolean;
  show(): void;
  hide(): void;
  enable(): void;
  disable(): void;
  setText(text: string): void;
  onClick(handler: () => void): void;
  offClick(handler: () => void): void;
}

export interface TelegramWebApp {
  version: string;
  platform: string;
  colorScheme: TelegramColorScheme;
  themeParams: TelegramThemeParams;
  isExpanded: boolean;
  initData: string;
  initDataUnsafe: TelegramInitDataUnsafe;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor?: string;
  backgroundColor?: string;
  BackButton: TelegramBackButton;
  MainButton: TelegramMainButton;
  HapticFeedback?: {
    impactOccurred(style: "light" | "medium" | "heavy" | "rigid" | "soft"): void;
    notificationOccurred(type: "error" | "success" | "warning"): void;
    selectionChanged(): void;
  };
  ready(): void;
  expand(): void;
  close(): void;
  showAlert(message: string): void;
  showPopup(params: {
    title?: string;
    message: string;
    buttons?: Array<{
      id?: string;
      type?: "default" | "destructive" | "ok" | "close" | "cancel";
      text: string;
    }>;
  }): void;
  sendData(data: string): void;
  openLink(url: string, options?: { try_instant_view?: boolean }): void;
  openTelegramLink(url: string): void;
  onEvent(eventType: TelegramEventType, handler: (...args: unknown[]) => void): void;
  offEvent(eventType: TelegramEventType, handler: (...args: unknown[]) => void): void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}
