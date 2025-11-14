"use client";

import { type ReactNode, type ButtonHTMLAttributes } from "react";
import { useMaxTheme } from "@/lib/max";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  children,
  ...props
}: ButtonProps): React.ReactElement {
  const { colorScheme } = useMaxTheme();

  const baseStyles =
    "font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantStyles: Record<string, string> = {
    primary: "hover:opacity-90",
    secondary: "hover:opacity-80",
    danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500",
    outline: "border-2 hover:opacity-90",
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const widthStyle = fullWidth ? "w-full" : "";

  const getButtonStyle = (): React.CSSProperties => {
    if (variant === "danger") {
      return {};
    }
    if (variant === "outline") {
      return {
        borderColor: colorScheme.button_color ?? "#3390ec",
        color: colorScheme.button_color ?? "#3390ec",
      };
    }
    if (variant === "secondary") {
      return {
        backgroundColor: colorScheme.secondary_bg_color ?? "#f1f1f1",
        color: colorScheme.text_color ?? "#000000",
      };
    }
    return {
      backgroundColor: colorScheme.button_color ?? "#3390ec",
      color: colorScheme.button_text_color ?? "#ffffff",
    };
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
      style={getButtonStyle()}
      {...props}
    >
      {children}
    </button>
  );
}
