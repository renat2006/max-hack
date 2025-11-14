import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

import { useThemeColors } from "@/src/max/use-theme-colors";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
}

export function Button({ variant = "primary", children, className = "", ...props }: ButtonProps) {
  const colors = useThemeColors();

  const baseClass =
    "relative inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-55";

  const variantStyle: Record<ButtonVariant, CSSProperties> = {
    primary: {
      background: colors.gradientAccent,
      color: colors.accentText,
      border: `1px solid ${colors.lineAccent}`,
      boxShadow: colors.shadowGlow,
      outlineColor: colors.focus,
    },
    secondary: {
      background: colors.panel,
      color: colors.textSecondary,
      border: `1px solid ${colors.lineSubtle}`,
      boxShadow: "0 12px 24px rgba(4, 12, 24, 0.28)",
      outlineColor: colors.focus,
    },
    ghost: {
      background: "transparent",
      color: colors.textSecondary,
      border: `1px solid ${colors.lineSubtle}`,
      outlineColor: colors.focus,
    },
  };

  return (
    <button
      type="button"
      className={`${baseClass} ${className}`}
      style={{
        ...variantStyle[variant],
        ...(variant !== "ghost" ? { backdropFilter: `blur(${colors.blurSurface})` } : {}),
      }}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      {variant === "primary" && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full opacity-70"
          style={{
            background: colors.accentSoft,
            filter: "blur(18px)",
          }}
        />
      )}
    </button>
  );
}
