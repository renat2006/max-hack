"use client";

/**
 * Lottie Animation Hook
 * Custom hook for programmatic control of Lottie animations
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { LottieRefCurrentProps } from "lottie-react";

export type UseLottieOptions = {
  autoplay?: boolean;
  loop?: boolean;
  speed?: number;
  onComplete?: () => void;
};

export type UseLottieControls = {
  /**
   * Lottie instance ref
   */
  lottieRef: React.RefObject<LottieRefCurrentProps | null>;
  /**
   * Play animation
   */
  play: () => void;
  /**
   * Pause animation
   */
  pause: () => void;
  /**
   * Stop animation and reset
   */
  stop: () => void;
  /**
   * Set animation speed
   */
  setSpeed: (speed: number) => void;
  /**
   * Set animation direction
   */
  setDirection: (direction: 1 | -1) => void;
  /**
   * Go to specific frame
   */
  goToAndStop: (frame: number) => void;
  /**
   * Go to specific frame and play
   */
  goToAndPlay: (frame: number) => void;
  /**
   * Play segments
   */
  playSegments: (segments: [number, number] | [number, number][], forceFlag?: boolean) => void;
  /**
   * Set subframe rendering
   */
  setSubframe: (useSubframes: boolean) => void;
  /**
   * Destroy animation
   */
  destroy: () => void;
  /**
   * Get animation duration
   */
  getDuration: (inFrames?: boolean) => number | undefined;
  /**
   * Check if animation is playing
   */
  isPlaying: boolean;
  /**
   * Check if animation is paused
   */
  isPaused: boolean;
  /**
   * Check if animation is loaded
   */
  isLoaded: boolean;
};

/**
 * Hook for controlling Lottie animations
 */
export const useLottie = (options: UseLottieOptions = {}): UseLottieControls => {
  const { autoplay = true, speed = 1, onComplete } = options;

  const lottieRef = useRef<LottieRefCurrentProps | null>(null);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [isPaused, setIsPaused] = useState(!autoplay);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (lottieRef.current && isLoaded) {
      lottieRef.current.setSpeed(speed);
    }
  }, [speed, isLoaded]);

  const play = useCallback(() => {
    if (lottieRef.current) {
      lottieRef.current.play();
      setIsPlaying(true);
      setIsPaused(false);
    }
  }, []);

  const pause = useCallback(() => {
    if (lottieRef.current) {
      lottieRef.current.pause();
      setIsPlaying(false);
      setIsPaused(true);
    }
  }, []);

  const stop = useCallback(() => {
    if (lottieRef.current) {
      lottieRef.current.stop();
      setIsPlaying(false);
      setIsPaused(false);
    }
  }, []);

  const setSpeed = useCallback((newSpeed: number) => {
    if (lottieRef.current) {
      lottieRef.current.setSpeed(newSpeed);
    }
  }, []);

  const setDirection = useCallback((direction: 1 | -1) => {
    if (lottieRef.current) {
      lottieRef.current.setDirection(direction);
    }
  }, []);

  const goToAndStop = useCallback((frame: number) => {
    if (lottieRef.current) {
      lottieRef.current.goToAndStop(frame, true);
      setIsPlaying(false);
      setIsPaused(true);
    }
  }, []);

  const goToAndPlay = useCallback((frame: number) => {
    if (lottieRef.current) {
      lottieRef.current.goToAndPlay(frame, true);
      setIsPlaying(true);
      setIsPaused(false);
    }
  }, []);

  const playSegments = useCallback(
    (segments: [number, number] | [number, number][], forceFlag = false) => {
      if (lottieRef.current) {
        lottieRef.current.playSegments(segments, forceFlag);
        setIsPlaying(true);
        setIsPaused(false);
      }
    },
    [],
  );

  const setSubframe = useCallback((useSubframes: boolean) => {
    if (lottieRef.current) {
      lottieRef.current.setSubframe(useSubframes);
    }
  }, []);

  const destroy = useCallback(() => {
    if (lottieRef.current) {
      lottieRef.current.destroy();
      setIsPlaying(false);
      setIsPaused(false);
      setIsLoaded(false);
    }
  }, []);

  const getDuration = useCallback((inFrames = false) => {
    if (lottieRef.current) {
      return lottieRef.current.getDuration(inFrames);
    }
    return undefined;
  }, []);

  // Handle completion
  useEffect(() => {
    if (onComplete && lottieRef.current && isLoaded) {
      // Note: Event listener attachment would need to be done via Lottie component props
      return () => {
        // Cleanup if needed
      };
    }
  }, [onComplete, isLoaded]);

  return {
    lottieRef: lottieRef as React.RefObject<LottieRefCurrentProps>,
    play,
    pause,
    stop,
    setSpeed,
    setDirection,
    goToAndStop,
    goToAndPlay,
    playSegments,
    setSubframe,
    destroy,
    getDuration,
    isPlaying,
    isPaused,
    isLoaded,
  };
};

/**
 * Hook for lazy loading Lottie animation data
 */
export const useLazyLottie = (path: string) => {
  const [animationData, setAnimationData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadAnimation = useCallback(async () => {
    if (animationData) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`Failed to load animation: ${response.statusText}`);
      }
      const data = await response.json();
      setAnimationData(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, [path, animationData]);

  return {
    animationData,
    isLoading,
    error,
    loadAnimation,
  };
};
