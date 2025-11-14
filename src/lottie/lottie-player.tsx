"use client";

/**
 * Lottie Player Component
 * High-level component with built-in controls and state management
 */

import { memo, useCallback, useState } from "react";

import { LottieAnimation } from "./lottie-animation";
import type { LottieComponentProps } from "./types";

export type LottiePlayerProps = LottieComponentProps & {
  /**
   * Show play/pause controls
   */
  showControls?: boolean;
  /**
   * Control bar position
   */
  controlPosition?: "top" | "bottom" | "overlay";
  /**
   * Enable hover to pause/play
   */
  hoverToPause?: boolean;
  /**
   * Enable click to pause/play
   */
  clickToPause?: boolean;
};

const LottiePlayerComponent = ({
  showControls = false,
  controlPosition = "bottom",
  hoverToPause = false,
  clickToPause = false,
  isPaused: controlledPaused,
  ...lottieProps
}: LottiePlayerProps) => {
  const [internalPaused, setInternalPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isPaused = controlledPaused !== undefined ? controlledPaused : internalPaused;

  const handleClick = useCallback(() => {
    if (clickToPause) {
      setInternalPaused((prev) => !prev);
    }
  }, [clickToPause]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    if (hoverToPause) {
      setInternalPaused(true);
    }
  }, [hoverToPause]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    if (hoverToPause) {
      setInternalPaused(false);
    }
  }, [hoverToPause]);

  const handlePlayPause = useCallback(() => {
    setInternalPaused((prev) => !prev);
  }, []);

  return (
    <div
      style={{ position: "relative", cursor: clickToPause ? "pointer" : "default" }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <LottieAnimation {...lottieProps} isPaused={isPaused} />

      {showControls && (
        <div
          style={{
            position: controlPosition === "overlay" ? "absolute" : "relative",
            bottom: controlPosition === "bottom" || controlPosition === "overlay" ? 0 : "auto",
            top: controlPosition === "top" ? 0 : "auto",
            left: 0,
            right: 0,
            padding: "8px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background:
              controlPosition === "overlay"
                ? "linear-gradient(to top, rgba(0,0,0,0.5), transparent)"
                : "transparent",
            opacity: controlPosition === "overlay" ? (isHovered ? 1 : 0) : 1,
            transition: "opacity 0.3s ease",
            pointerEvents: controlPosition === "overlay" && !isHovered ? "none" : "auto",
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePlayPause();
            }}
            style={{
              background: "rgba(255, 255, 255, 0.9)",
              border: "none",
              borderRadius: "50%",
              width: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: "18px",
            }}
            aria-label={isPaused ? "Play" : "Pause"}
          >
            {isPaused ? "▶" : "⏸"}
          </button>
        </div>
      )}
    </div>
  );
};

export const LottiePlayer = memo(LottiePlayerComponent);

LottiePlayer.displayName = "LottiePlayer";
