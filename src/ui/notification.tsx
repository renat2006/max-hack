import type { CSSProperties, ReactNode } from "react";

import { useThemeColors } from "@/lib/max/use-theme-colors";

interface StatusBadgeProps {
  icon: ReactNode;
  color: string;
  background: string;
}

export function StatusBadge({ icon, color, background }: StatusBadgeProps) {
  return (
    <div
      className="relative flex h-11 w-11 flex-none items-center justify-center overflow-hidden rounded-full"
      style={{
        background,
        border: `1px solid ${color}`,
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full opacity-70"
        style={{
          background,
          filter: "blur(12px)",
        }}
      />
      <span className="relative z-10" style={{ color }}>
        {icon}
      </span>
    </div>
  );
}

interface NotificationProps {
  status: "success" | "error";
  icon: ReactNode;
  title: string;
  description: string;
}

export function Notification({ status, icon, title, description }: NotificationProps) {
  const colors = useThemeColors();

  const tone = status === "success" ? colors.success : colors.danger;
  const badgeBackground =
    status === "success" ? "rgba(72, 224, 181, 0.16)" : "rgba(255, 122, 154, 0.16)";

  const containerStyles: CSSProperties = {
    borderColor: colors.lineSubtle,
    background: colors.panel,
    boxShadow: "0 18px 30px rgba(4, 12, 24, 0.35)",
    backdropFilter: `blur(${colors.blurSurface})`,
  };

  return (
    <div
      className="relative overflow-hidden rounded-[var(--ds-radius-lg)] border px-4 py-3"
      style={containerStyles}
    >
      <div className="flex items-center gap-3">
        <StatusBadge icon={icon} color={tone} background={badgeBackground} />
        <div className="flex-1">
          <p
            className="font-display text-sm uppercase tracking-[0.14em]"
            style={{ color: colors.textPrimary }}
          >
            {title}
          </p>
          <p
            className="text-xs uppercase tracking-[0.14em]"
            style={{ color: colors.textSecondary }}
          >
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
