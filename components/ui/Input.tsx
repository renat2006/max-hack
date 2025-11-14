"use client";

import { type InputHTMLAttributes, forwardRef } from "react";
import { useMaxTheme } from "@/lib/max";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, fullWidth = false, className = "", ...props },
    ref
  ): React.ReactElement => {
    const { colorScheme } = useMaxTheme();

    const widthStyle = fullWidth ? "w-full" : "";

    return (
      <div className={fullWidth ? "w-full" : ""}>
        {label && (
          <label
            className="block text-sm font-medium mb-1"
            style={{ color: colorScheme.text_color ?? "#000000" }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`px-4 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${widthStyle} ${className} ${
            error ? "border-red-500 focus:ring-red-500" : ""
          }`}
          style={{
            backgroundColor: colorScheme.bg_color ?? "#ffffff",
            color: colorScheme.text_color ?? "#000000",
            borderColor: error
              ? "#ef4444"
              : (colorScheme.secondary_bg_color ?? "#e5e5e5"),
          }}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
