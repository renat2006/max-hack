"use client";

import { useMaxTheme } from "@/lib/max";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
}

export function Loading({
  size = "md",
  fullScreen = false,
}: LoadingProps): React.ReactElement {
  const { colorScheme } = useMaxTheme();

  const sizeStyles = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
  };

  const spinner = (
    <div
      className={`${sizeStyles[size]} border-t-transparent rounded-full animate-spin`}
      style={{
        borderColor: colorScheme.button_color ?? "#3390ec",
        borderTopColor: "transparent",
      }}
    />
  );

  if (fullScreen) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{ backgroundColor: colorScheme.bg_color ?? "#ffffff" }}
      >
        {spinner}
      </div>
    );
  }

  return <div className="flex items-center justify-center p-4">{spinner}</div>;
}
