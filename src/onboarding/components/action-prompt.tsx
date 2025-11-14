"use client";

import { useThemeColors } from "@/lib/max/use-theme-colors";
import type { ReactNode } from "react";

interface ActionPromptProps {
  icon: ReactNode;
  text: string;
  accentColor?: string;
}

export function ActionPrompt({ icon, text, accentColor }: ActionPromptProps): React.ReactElement {
  const colors = useThemeColors();
  const accent = accentColor ?? colors.accent;

  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-2 rounded-full"
      style={{
        background: `linear-gradient(135deg, ${accent}20, ${accent}10)`,
        border: `1px solid ${accent}40`,
        boxShadow: `0 0 20px ${accent}20`,
      }}
    >
      <div
        className="flex h-6 w-6 items-center justify-center rounded-full"
        style={{
          background: accent,
          boxShadow: `0 0 12px ${accent}60`,
        }}
      >
        {icon}
      </div>
      <span className="text-xs sm:text-sm font-semibold" style={{ color: colors.textPrimary }}>
        {text}
      </span>
    </div>
  );
}
