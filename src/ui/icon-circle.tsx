import type { CSSProperties, ReactNode } from "react";

import { useThemeColors } from "@/lib/max/use-theme-colors";

type IconCircleSize = "sm" | "md" | "lg";
type IconCircleVariant = "outlined" | "filled" | "glow";

interface IconCircleProps {
  children: ReactNode;
  size?: IconCircleSize;
  variant?: IconCircleVariant;
}

export function IconCircle({ children, size = "md", variant = "outlined" }: IconCircleProps) {
  const colors = useThemeColors();

  const sizeClass: Record<IconCircleSize, string> = {
    sm: "h-10 w-10",
    md: "h-14 w-14",
    lg: "h-16 w-16",
  };

  const variantStyle: Record<IconCircleVariant, CSSProperties> = {
    outlined: {
      border: `1px solid rgba(255, 255, 255, 0.12)`,
      background: "linear-gradient(160deg, rgba(14, 28, 52, 0.78), rgba(5, 12, 26, 0.9))",
      color: colors.textPrimary,
      boxShadow: "0 18px 32px -28px rgba(4, 16, 32, 0.85)",
    },
    filled: {
      background: "linear-gradient(155deg, rgba(26, 90, 154, 0.55), rgba(6, 18, 32, 0.92))",
      color: colors.textPrimary,
      border: `1px solid ${colors.lineAccent}`,
      boxShadow: colors.shadowGlow,
    },
    glow: {
      background: colors.gradientAccent,
      color: colors.accentText,
      border: `1px solid ${colors.lineAccent}`,
      boxShadow: colors.shadowGlow,
    },
  };

  return (
    <div
      className={`relative flex flex-none items-center justify-center rounded-full transition-all ${sizeClass[size]}`}
      style={{
        ...variantStyle[variant],
        backdropFilter: `blur(${colors.blurSurface})`,
      }}
    >
      {variant === "glow" && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full opacity-70"
          style={{
            background: colors.accentSoft,
            filter: "blur(16px)",
          }}
        />
      )}
      <span className="relative z-10 flex items-center justify-center">{children}</span>
    </div>
  );
}
