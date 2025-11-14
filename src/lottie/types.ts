/**
 * Lottie Animation Types
 * Type definitions for Lottie animations configuration and control
 */

export type LottieAnimationData = Record<string, unknown>;

export type LottiePlayMode = "normal" | "reverse" | "bounce";

export type LottieRendererSettings = {
  /**
   * Canvas or SVG renderer
   * @default 'svg'
   */
  renderer?: "svg" | "canvas";
  /**
   * Preserve aspect ratio
   * @default 'xMidYMid meet'
   */
  preserveAspectRatio?: string;
  /**
   * Clear canvas on each frame (canvas only)
   * @default true
   */
  clearCanvas?: boolean;
  /**
   * Progressive loading
   * @default true
   */
  progressiveLoad?: boolean;
  /**
   * Hide on transparent background
   * @default false
   */
  hideOnTransparent?: boolean;
};

export type LottieOptions = {
  /**
   * Animation data (JSON)
   */
  animationData?: LottieAnimationData;
  /**
   * Path to animation JSON file
   */
  path?: string;
  /**
   * Loop animation
   * @default true
   */
  loop?: boolean | number;
  /**
   * Autoplay animation
   * @default true
   */
  autoplay?: boolean;
  /**
   * Animation speed (1 = normal)
   * @default 1
   */
  speed?: number;
  /**
   * Play mode
   * @default 'normal'
   */
  direction?: LottiePlayMode;
  /**
   * Renderer settings
   */
  rendererSettings?: LottieRendererSettings;
  /**
   * Initial segment [start, end] in frames
   */
  initialSegment?: [number, number];
};

export type LottieControlProps = {
  /**
   * Animation state
   */
  isPaused?: boolean;
  /**
   * Animation stopped
   */
  isStopped?: boolean;
  /**
   * Animation speed
   */
  speed?: number;
  /**
   * Animation direction
   */
  direction?: 1 | -1;
  /**
   * Play segments
   */
  segments?: [number, number] | [number, number][];
  /**
   * Force segments to play
   */
  forceSegments?: boolean;
};

export type LottieEventHandlers = {
  /**
   * Animation complete callback
   */
  onComplete?: () => void;
  /**
   * Animation loop complete callback
   */
  onLoopComplete?: () => void;
  /**
   * Animation enter frame callback
   */
  onEnterFrame?: () => void;
  /**
   * Animation segment start callback
   */
  onSegmentStart?: () => void;
  /**
   * Animation config ready callback
   */
  onConfigReady?: () => void;
  /**
   * Animation data ready callback
   */
  onDataReady?: () => void;
  /**
   * Animation data failed callback
   */
  onDataFailed?: () => void;
  /**
   * Animation loaded callback
   */
  onLoadedImages?: () => void;
  /**
   * Animation destroy callback
   */
  onDestroy?: () => void;
};

export type LottieSize = {
  width?: number | string;
  height?: number | string;
};

export type LottieComponentProps = LottieOptions &
  LottieControlProps &
  LottieEventHandlers &
  LottieSize & {
    /**
     * CSS class name
     */
    className?: string;
    /**
     * Inline styles
     */
    style?: React.CSSProperties;
    /**
     * Accessibility label
     */
    ariaLabel?: string;
    /**
     * Accessibility role
     */
    ariaRole?: string;
    /**
     * Test ID for testing
     */
    testId?: string;
  };

export type LottiePreset =
  | "loading"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "celebration"
  | "empty-state"
  | "interactive";

export type LottiePresetConfig = {
  loop: boolean;
  autoplay: boolean;
  speed?: number;
  size?: LottieSize;
  className?: string;
};
