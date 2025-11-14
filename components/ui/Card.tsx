"use client";

import { type ReactNode } from "react";
import { useMaxTheme } from "@/lib/max";

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
}

export function Card({
  children,
  className = "",
  padding = "md",
}: CardProps): React.ReactElement {
  const { colorScheme } = useMaxTheme();

  const paddingStyles = {
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  return (
    <div
      className={`rounded-lg shadow-sm border ${paddingStyles[padding]} ${className}`}
      style={{
        backgroundColor: colorScheme.bg_color ?? "#ffffff",
        color: colorScheme.text_color ?? "#000000",
        borderColor: colorScheme.secondary_bg_color ?? "#e5e5e5",
      }}
    >
      {children}
    </div>
  );
}
