"use client";

import { useThemeColors } from "@/src/max/use-theme-colors";
import { CheckCircle, XCircle } from "@phosphor-icons/react/dist/ssr";

interface MiniGameButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "success" | "danger" | "secondary";
  size?: "small" | "medium" | "large";
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export function MiniGameButton({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  size = "medium",
  fullWidth = false,
  icon,
}: MiniGameButtonProps) {
  const colors = useThemeColors();

  const getBackground = () => {
    if (disabled) return colors.panelMuted;
    switch (variant) {
      case "success":
        return "#22c55e";
      case "danger":
        return "#ef4444";
      case "secondary":
        return colors.panel;
      default:
        return colors.accent;
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.textMuted;
    if (variant === "secondary") return colors.textPrimary;
    return "white";
  };

  const getPadding = () => {
    switch (size) {
      case "small":
        return "12px 16px";
      case "large":
        return "18px 24px";
      default:
        return "16px 20px";
    }
  };

  const getFontSize = () => {
    switch (size) {
      case "small":
        return "14px";
      case "large":
        return "18px";
      default:
        return "16px";
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        flex: fullWidth ? 1 : undefined,
        width: fullWidth ? "100%" : undefined,
        background: getBackground(),
        color: getTextColor(),
        padding: getPadding(),
        fontSize: getFontSize(),
        fontWeight: 700,
        borderRadius: "12px",
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        transition: "all 0.2s",
        boxShadow: disabled ? "none" : `0 4px 12px ${getBackground()}40`,
      }}
    >
      {icon && icon}
      {children}
    </button>
  );
}

interface MiniGameActionButtonsProps {
  onApprove: () => void;
  onReject: () => void;
  disabled?: boolean;
  approveLabel?: string;
  rejectLabel?: string;
}

export function MiniGameActionButtons({
  onApprove,
  onReject,
  disabled = false,
  approveLabel = "APPROVE",
  rejectLabel = "REJECT",
}: MiniGameActionButtonsProps) {
  return (
    <div style={{ display: "flex", gap: "12px" }}>
      <MiniGameButton
        onClick={onReject}
        disabled={disabled}
        variant="danger"
        fullWidth
        icon={<XCircle size={24} weight="fill" />}
      >
        {rejectLabel}
      </MiniGameButton>
      <MiniGameButton
        onClick={onApprove}
        disabled={disabled}
        variant="success"
        fullWidth
        icon={<CheckCircle size={24} weight="fill" />}
      >
        {approveLabel}
      </MiniGameButton>
    </div>
  );
}
