export interface MaxInitData {
  query_id?: string;
  user?: MaxUser;
  auth_date: number;
  hash: string;
  start_param?: string;
}

export interface MaxUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export type MaxTheme = "light" | "dark";

export interface MaxViewport {
  height: number;
  width: number;
  is_expanded: boolean;
  is_state_stable: boolean;
}

export interface MaxColorScheme {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
}

export interface MaxBackButton {
  is_visible: boolean;
}

export interface MaxMainButton {
  text: string;
  color: string;
  text_color: string;
  is_active: boolean;
  is_visible: boolean;
  is_progress_visible: boolean;
}

export interface MaxHapticFeedback {
  impactOccurred: (
    style: "light" | "medium" | "heavy" | "rigid" | "soft"
  ) => void;
  notificationOccurred: (type: "error" | "success" | "warning") => void;
  selectionChanged: () => void;
}

export interface MaxCloudStorage {
  setItem: (
    key: string,
    value: string,
    callback?: (error: Error | null, success: boolean) => void
  ) => void;
  getItem: (
    key: string,
    callback: (error: Error | null, value: string | null) => void
  ) => void;
  getItems: (
    keys: string[],
    callback: (error: Error | null, values: Record<string, string>) => void
  ) => void;
  removeItem: (
    key: string,
    callback?: (error: Error | null, success: boolean) => void
  ) => void;
  removeItems: (
    keys: string[],
    callback?: (error: Error | null, success: boolean) => void
  ) => void;
  getKeys: (callback: (error: Error | null, keys: string[]) => void) => void;
}

export interface MaxBridge {
  init: (options?: { debug?: boolean }) => void;
  ready: () => void;
  expand: () => void;
  close: () => void;
  sendData: (data: string) => void;
  openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
  openTelegramLink: (url: string) => void;
  openInvoice: (url: string, callback?: (status: string) => void) => void;
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
  showAlert: (message: string, callback?: () => void) => void;
  showConfirm: (
    message: string,
    callback?: (confirmed: boolean) => void
  ) => void;
  showScanQrPopup: (
    params: { text?: string },
    callback?: (data: string | null) => void
  ) => void;
  closeScanQrPopup: () => void;
  readTextFromClipboard: (callback: (text: string) => void) => void;
  requestWriteAccess: (callback: (granted: boolean) => void) => void;
  requestContact: (
    callback: (
      granted: boolean,
      contact?: {
        contact: {
          phone_number: string;
          first_name: string;
          last_name?: string;
          user_id?: number;
        };
      }
    ) => void
  ) => void;
  version: string;
  platform: string;
  colorScheme: MaxTheme;
  themeParams: MaxColorScheme;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  BackButton: MaxBackButton;
  MainButton: MaxMainButton;
  HapticFeedback: MaxHapticFeedback;
  CloudStorage: MaxCloudStorage;
  initData: string;
  initDataUnsafe: MaxInitData;
  isClosingConfirmationEnabled: boolean;
  onEvent: (eventType: string, eventHandler: () => void) => void;
  offEvent: (eventType: string, eventHandler: () => void) => void;
  sendEvent: (eventType: string, eventData: unknown) => void;
}

declare global {
  interface Window {
    Max?: MaxBridge;
  }
}
