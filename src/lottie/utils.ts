/**
 * Lottie Animation Utilities
 * Helper functions for working with Lottie animations
 */

import type { LottieAnimationData } from "./types";

/**
 * Validate Lottie animation data structure
 */
export const isValidLottieData = (data: unknown): data is LottieAnimationData => {
  if (!data || typeof data !== "object") {
    return false;
  }

  const lottieData = data as Record<string, unknown>;

  // Check for required Lottie properties
  return (
    typeof lottieData.v === "string" && // version
    typeof lottieData.fr === "number" && // frame rate
    typeof lottieData.ip === "number" && // in point
    typeof lottieData.op === "number" && // out point
    typeof lottieData.w === "number" && // width
    typeof lottieData.h === "number" && // height
    Array.isArray(lottieData.layers) // layers
  );
};

/**
 * Get animation metadata
 */
export const getAnimationMetadata = (data: LottieAnimationData) => {
  return {
    version: data.v as string,
    frameRate: data.fr as number,
    inPoint: data.ip as number,
    outPoint: data.op as number,
    width: data.w as number,
    height: data.h as number,
    duration: ((data.op as number) - (data.ip as number)) / (data.fr as number),
    totalFrames: (data.op as number) - (data.ip as number),
    aspectRatio: (data.w as number) / (data.h as number),
  };
};

/**
 * Calculate optimal dimensions maintaining aspect ratio
 */
export const calculateDimensions = (
  originalWidth: number,
  originalHeight: number,
  maxWidth?: number,
  maxHeight?: number,
): { width: number; height: number } => {
  if (!maxWidth && !maxHeight) {
    return { width: originalWidth, height: originalHeight };
  }

  const aspectRatio = originalWidth / originalHeight;

  if (maxWidth && !maxHeight) {
    return {
      width: maxWidth,
      height: maxWidth / aspectRatio,
    };
  }

  if (!maxWidth && maxHeight) {
    return {
      width: maxHeight * aspectRatio,
      height: maxHeight,
    };
  }

  // Both maxWidth and maxHeight are provided
  const widthRatio = maxWidth! / originalWidth;
  const heightRatio = maxHeight! / originalHeight;
  const ratio = Math.min(widthRatio, heightRatio);

  return {
    width: originalWidth * ratio,
    height: originalHeight * ratio,
  };
};

/**
 * Convert time to frame number
 */
export const timeToFrame = (timeInSeconds: number, frameRate: number): number => {
  return Math.round(timeInSeconds * frameRate);
};

/**
 * Convert frame number to time
 */
export const frameToTime = (frame: number, frameRate: number): number => {
  return frame / frameRate;
};

/**
 * Create frame segments from time ranges
 */
export const createSegments = (
  timeRanges: Array<[number, number]>,
  frameRate: number,
): Array<[number, number]> => {
  return timeRanges.map(([start, end]) => [
    timeToFrame(start, frameRate),
    timeToFrame(end, frameRate),
  ]);
};

/**
 * Preload animation data
 */
export const preloadAnimation = async (path: string): Promise<LottieAnimationData> => {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load animation from ${path}: ${response.statusText}`);
  }
  const data = await response.json();

  if (!isValidLottieData(data)) {
    throw new Error(`Invalid Lottie animation data from ${path}`);
  }

  return data;
};

/**
 * Batch preload multiple animations
 */
export const preloadAnimations = async (
  paths: string[],
): Promise<Record<string, LottieAnimationData>> => {
  const results = await Promise.allSettled(paths.map((path) => preloadAnimation(path)));

  const animations: Record<string, LottieAnimationData> = {};

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      animations[paths[index]] = result.value;
    } else {
      console.error(`Failed to load animation: ${paths[index]}`, result.reason);
    }
  });

  return animations;
};

/**
 * Optimize animation data by removing unnecessary properties
 */
export const optimizeAnimationData = (data: LottieAnimationData): LottieAnimationData => {
  // Create a shallow copy
  const optimized = { ...data };

  // Remove metadata that's not needed for playback
  delete optimized.meta;
  delete optimized.markers;

  // You can add more optimization logic here based on your needs
  // For example, reducing precision of numbers, removing unused assets, etc.

  return optimized;
};

/**
 * Get animation file size estimate
 */
export const estimateFileSize = (data: LottieAnimationData): number => {
  return new Blob([JSON.stringify(data)]).size;
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

/**
 * Check if animation is suitable for mobile
 */
export const isMobileFriendly = (data: LottieAnimationData): boolean => {
  const metadata = getAnimationMetadata(data);
  const fileSize = estimateFileSize(data);

  // Animation should be:
  // - Less than 500KB
  // - Less than 10 seconds long
  // - Reasonable dimensions (not too large)
  return (
    fileSize < 500 * 1024 && metadata.duration < 10 && metadata.width <= 1000 && metadata.height <= 1000
  );
};

/**
 * Extract color palette from animation
 */
export const extractColorPalette = (data: LottieAnimationData): string[] => {
  const colors = new Set<string>();

  const extractColorsFromLayers = (layers: unknown[]) => {
    layers.forEach((layer) => {
      const layerObj = layer as Record<string, unknown>;
      if (layerObj.shapes && Array.isArray(layerObj.shapes)) {
        layerObj.shapes.forEach((shape: unknown) => {
          const shapeObj = shape as Record<string, unknown>;
          if (shapeObj.c && Array.isArray(shapeObj.c)) {
            const [r, g, b] = shapeObj.c as number[];
            colors.add(`rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`);
          }
        });
      }
      if (layerObj.layers && Array.isArray(layerObj.layers)) {
        extractColorsFromLayers(layerObj.layers);
      }
    });
  };

  if (Array.isArray(data.layers)) {
    extractColorsFromLayers(data.layers as unknown[]);
  }

  return Array.from(colors);
};
