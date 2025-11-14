import type { Metadata } from "next";
import "./globals.css";
import { MaxProvider } from "@/lib/max";

export const metadata: Metadata = {
  title: "Спутник",
  description: "Спутник - современное веб-приложение",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <html lang="ru">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (window.Max) return;
                window.Max = {
                  init: function() {},
                  ready: function() {},
                  expand: function() {},
                  close: function() {},
                  sendData: function() {},
                  openLink: function() {},
                  showAlert: function() {},
                  showConfirm: function() {},
                  showPopup: function() {},
                  version: "1.0.0",
                  platform: "web",
                  colorScheme: "light",
                  themeParams: {},
                  isExpanded: false,
                  viewportHeight: window.innerHeight,
                  viewportStableHeight: window.innerHeight,
                  headerColor: "#ffffff",
                  backgroundColor: "#ffffff",
                  initData: "",
                  initDataUnsafe: {},
                  BackButton: { is_visible: false },
                  MainButton: {
                    text: "",
                    color: "",
                    text_color: "",
                    is_active: false,
                    is_visible: false,
                    is_progress_visible: false
                  },
                  HapticFeedback: {
                    impactOccurred: function() {},
                    notificationOccurred: function() {},
                    selectionChanged: function() {}
                  },
                  CloudStorage: {
                    setItem: function() {},
                    getItem: function() {},
                    getItems: function() {},
                    removeItem: function() {},
                    removeItems: function() {},
                    getKeys: function() {}
                  },
                  onEvent: function() {},
                  offEvent: function() {},
                  sendEvent: function() {}
                };
              })();
            `,
          }}
        />
      </head>
      <body>
        <MaxProvider>{children}</MaxProvider>
      </body>
    </html>
  );
}
