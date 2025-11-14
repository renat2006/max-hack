/**
 * Lottie Animation Presets
 * Pre-configured animation settings for common use cases
 */

import type { LottiePreset, LottiePresetConfig } from "./types";

export const LOTTIE_PRESETS: Record<LottiePreset, LottiePresetConfig> = {
  loading: {
    loop: true,
    autoplay: true,
    speed: 1,
    size: { width: 120, height: 120 },
  },
  success: {
    loop: false,
    autoplay: true,
    speed: 1,
    size: { width: 200, height: 200 },
  },
  error: {
    loop: false,
    autoplay: true,
    speed: 1,
    size: { width: 200, height: 200 },
  },
  warning: {
    loop: false,
    autoplay: true,
    speed: 1,
    size: { width: 200, height: 200 },
  },
  info: {
    loop: false,
    autoplay: true,
    speed: 1,
    size: { width: 180, height: 180 },
  },
  celebration: {
    loop: false,
    autoplay: true,
    speed: 1.2,
    size: { width: 300, height: 300 },
  },
  "empty-state": {
    loop: true,
    autoplay: true,
    speed: 0.8,
    size: { width: 240, height: 240 },
  },
  interactive: {
    loop: false,
    autoplay: false,
    speed: 1,
    size: { width: 160, height: 160 },
  },
};

/**
 * Get preset configuration
 */
export const getPresetConfig = (preset: LottiePreset): LottiePresetConfig => {
  return LOTTIE_PRESETS[preset];
};

/**
 * Merge preset with custom config
 */
export const mergePresetConfig = (
  preset: LottiePreset,
  customConfig: Partial<LottiePresetConfig> = {},
): LottiePresetConfig => {
  const presetConfig = getPresetConfig(preset);
  return {
    ...presetConfig,
    ...customConfig,
    size: {
      ...presetConfig.size,
      ...customConfig.size,
    },
  };
};

/**
 * Common renderer settings for optimal performance
 */
export const DEFAULT_RENDERER_SETTINGS = {
  preserveAspectRatio: "xMidYMid meet",
  clearCanvas: true,
  progressiveLoad: true,
  hideOnTransparent: false,
} as const;

/**
 * Performance optimized settings for large animations
 */
export const PERFORMANCE_RENDERER_SETTINGS = {
  ...DEFAULT_RENDERER_SETTINGS,
  renderer: "canvas" as const,
  clearCanvas: true,
  progressiveLoad: false,
};

/**
 * Quality optimized settings for small animations
 */
export const QUALITY_RENDERER_SETTINGS = {
  ...DEFAULT_RENDERER_SETTINGS,
  renderer: "svg" as const,
  progressiveLoad: true,
};
