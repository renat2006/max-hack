"use client";

import { useThemeColors } from "@/lib/max/use-theme-colors";
import type { ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  accentColor?: string;
  isCompact?: boolean;
}

export function FeatureCard({
  icon,
  title,
  description,
  accentColor,
  isCompact = false,
}: FeatureCardProps) {
  const colors = useThemeColors();
  const accent = accentColor || colors.accent;

  return (
    <div
      className={`rounded-xl sm:rounded-2xl border ${isCompact ? "p-3" : "p-4"}`}
      style={{
        background: "linear-gradient(135deg, rgba(16, 28, 52, 0.8), rgba(12, 22, 44, 0.9))",
        borderColor: colors.lineSoft,
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex ${isCompact ? "h-10 w-10" : "h-12 w-12"} flex-shrink-0 items-center justify-center rounded-lg sm:rounded-xl`}
          style={{
            background: `linear-gradient(135deg, ${accent}40, ${accent}25)`,
            border: `1px solid ${accent}60`,
            boxShadow: `0 0 20px ${accent}30`,
          }}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className={`${isCompact ? "text-sm" : "text-sm sm:text-base"} font-bold mb-1`}
            style={{ color: colors.textPrimary }}
          >
            {title}
          </h3>
          <p
            className={`${isCompact ? "text-xs" : "text-xs sm:text-sm"} leading-relaxed`}
            style={{ color: colors.textSecondary }}
          >
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
