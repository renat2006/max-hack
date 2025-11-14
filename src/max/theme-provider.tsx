"use client";

import { useEffect } from "react";

import { applyDesignTheme } from "@/lib/design-system/theme";

export const TelegramThemeProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "dark");
    applyDesignTheme();
  }, []);

  return <>{children}</>;
};
