/**
 * Lottie Animation Module
 * Main entry point for Lottie animations with best practices
 */

// Components
export { LottieAnimation } from "./lottie-animation";
export { LottiePlayer } from "./lottie-player";

// Hooks
export { useLottie, useLazyLottie } from "./use-lottie";
export type { UseLottieOptions, UseLottieControls } from "./use-lottie";

// Types
export type {
  LottieAnimationData,
  LottiePlayMode,
  LottieRendererSettings,
  LottieOptions,
  LottieControlProps,
  LottieEventHandlers,
  LottieSize,
  LottieComponentProps,
  LottiePreset,
  LottiePresetConfig,
} from "./types";

// Presets
export {
  LOTTIE_PRESETS,
  getPresetConfig,
  mergePresetConfig,
  DEFAULT_RENDERER_SETTINGS,
  PERFORMANCE_RENDERER_SETTINGS,
  QUALITY_RENDERER_SETTINGS,
} from "./presets";

// Utils
export {
  isValidLottieData,
  getAnimationMetadata,
  calculateDimensions,
  timeToFrame,
  frameToTime,
  createSegments,
  preloadAnimation,
  preloadAnimations,
  optimizeAnimationData,
  estimateFileSize,
  formatFileSize,
  isMobileFriendly,
  extractColorPalette,
} from "./utils";

// Re-export LottiePlayer as default component
export { LottiePlayer as default } from "./lottie-player";
