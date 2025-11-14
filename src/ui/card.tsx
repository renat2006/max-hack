import type { HTMLAttributes, ReactNode } from "react";

import { useThemeColors } from "@/lib/max/use-theme-colors";

type CardVariant = "default" | "compact" | "accent";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: CardVariant;
}

export function Card({ children, variant = "default", className = "", ...props }: CardProps): React.ReactElement {
  const colors = useThemeColors();
  const padding = variant === "compact" ? "p-4" : "p-5";

  const backgroundByVariant: Record<CardVariant, string> = {
    default: colors.gradientPanel,
    compact: `linear-gradient(160deg, rgba(14, 30, 58, 0.82) 0%, rgba(6, 16, 32, 0.92) 45%, rgba(2, 6, 14, 0.94) 100%)`,
    accent: `linear-gradient(150deg, rgba(97, 247, 255, 0.16) 0%, rgba(2, 4, 10, 0) 65%), ${colors.panel}`,
  };

  const borderClass = variant === "compact" ? "" : "border";
  const borderColor =
    variant === "accent"
      ? colors.lineAccent
      : variant === "compact"
        ? "transparent"
        : colors.lineSubtle;
  const shadow =
    variant === "accent" ? colors.shadowGlow : "0 26px 55px -38px rgba(4, 14, 34, 0.85)";

  return (
    <div
      className={`relative overflow-hidden rounded-[var(--ds-radius-lg)] ${borderClass} ${padding} ${className}`}
      style={{
        borderColor,
        background: backgroundByVariant[variant],
        boxShadow: shadow,
        backdropFilter: `blur(${colors.blurSurface})`,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
