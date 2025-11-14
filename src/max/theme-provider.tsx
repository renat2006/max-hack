"use client";

import { useEffect } from "react";
import { useMaxTheme } from "@/lib/max";
import { applyDesignTheme } from "@/lib/design-system/theme";

export const MaxThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { theme, colorScheme } = useMaxTheme();

  useEffect(() => {
    const themeValue = theme === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", themeValue);
    applyDesignTheme();

    if (typeof document !== "undefined") {
      const root = document.documentElement;
      const body = document.body;

      if (colorScheme.bg_color) {
        root.style.setProperty("--background", colorScheme.bg_color);
        body.style.backgroundColor = colorScheme.bg_color;
      }
      if (colorScheme.text_color) {
        root.style.setProperty("--foreground", colorScheme.text_color);
        body.style.color = colorScheme.text_color;
      }
      if (colorScheme.button_color) {
        root.style.setProperty("--button", colorScheme.button_color);
      }
      if (colorScheme.button_text_color) {
        root.style.setProperty("--button-text", colorScheme.button_text_color);
      }
    }
  }, [theme, colorScheme]);

  return <>{children}</>;
};
