"use client";

/**
 * Lottie Animation Component
 * Wrapper around lottie-react with best practices and optimizations
 */

import { memo, useCallback, useEffect, useRef, useState } from "react";
import Lottie, { type LottieRefCurrentProps } from "lottie-react";

import type { LottieComponentProps } from "./types";
import { DEFAULT_RENDERER_SETTINGS } from "./presets";

const LottieAnimationComponent = ({
  animationData,
  loop = true,
  autoplay = true,
  speed = 1,
  direction,
  rendererSettings = DEFAULT_RENDERER_SETTINGS,
  initialSegment,
  isPaused = false,
  isStopped = false,
  segments,
  forceSegments = false,
  onComplete,
  onLoopComplete,
  onEnterFrame,
  onSegmentStart,
  onConfigReady,
  onDataReady,
  onDataFailed,
  onLoadedImages,
  onDestroy,
  width = "100%",
  height = "100%",
  className,
  style,
  ariaLabel,
  ariaRole = "img",
  testId,
}: LottieComponentProps) => {
  const lottieRef = useRef<LottieRefCurrentProps | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Control playback
  useEffect(() => {
    if (!lottieRef.current || !isReady) return;

    if (isStopped) {
      lottieRef.current.stop();
    } else if (isPaused) {
      lottieRef.current.pause();
    } else {
      lottieRef.current.play();
    }
  }, [isPaused, isStopped, isReady]);

  // Control speed
  useEffect(() => {
    if (!lottieRef.current || !isReady) return;
    lottieRef.current.setSpeed(speed);
  }, [speed, isReady]);

  // Control direction
  useEffect(() => {
    if (!lottieRef.current || !isReady || direction === undefined) return;
    lottieRef.current.setDirection(direction === "reverse" ? -1 : 1);
  }, [direction, isReady]);

  // Control segments
  useEffect(() => {
    if (!lottieRef.current || !isReady || !segments) return;
    lottieRef.current.playSegments(segments, forceSegments);
  }, [segments, forceSegments, isReady]);

  // Handle data ready
  const handleDataReady = useCallback(() => {
    setIsReady(true);
    onDataReady?.();
  }, [onDataReady]);

  // Container style
  const containerStyle: React.CSSProperties = {
    width,
    height,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    ...style,
  };

  return (
    <div
      className={className}
      style={containerStyle}
      role={ariaRole}
      aria-label={ariaLabel}
      data-testid={testId}
    >
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop={loop}
        autoplay={autoplay}
        rendererSettings={rendererSettings}
        initialSegment={initialSegment}
        onComplete={onComplete}
        onLoopComplete={onLoopComplete}
        onEnterFrame={onEnterFrame}
        onSegmentStart={onSegmentStart}
        onConfigReady={onConfigReady}
        onDataReady={handleDataReady}
        onDataFailed={onDataFailed}
        onLoadedImages={onLoadedImages}
        onDestroy={onDestroy}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};

/**
 * Memoized Lottie component to prevent unnecessary re-renders
 */
export const LottieAnimation = memo(LottieAnimationComponent);

LottieAnimation.displayName = "LottieAnimation";
