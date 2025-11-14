"use client";

import { useThemeColors } from "@/lib/max/use-theme-colors";

interface PaginationDotsProps {
  total: number;
  current: number;
  onDotClick?: (index: number) => void;
}

export function PaginationDots({ total, current, onDotClick }: PaginationDotsProps): React.ReactElement {
  const colors = useThemeColors();

  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-2">
      {Array.from({ length: total }).map((_, index) => {
        const isActive = index === current;
        const isPassed = index < current;

        return (
          <button
            key={index}
            onClick={() => onDotClick?.(index)}
            className="transition-all duration-300 flex-shrink-0"
            style={{
              width: isActive ? "24px" : "8px",
              height: "8px",
              borderRadius: "4px",
              background: isActive
                ? colors.accent
                : isPassed
                  ? `${colors.accent}60`
                  : colors.lineSubtle,
              border: isActive ? "none" : `1px solid ${colors.lineSubtle}`,
              boxShadow: isActive ? `0 0 12px ${colors.accent}60` : "none",
              cursor: onDotClick ? "pointer" : "default",
            }}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={isActive ? "true" : undefined}
          />
        );
      })}
    </div>
  );
}
