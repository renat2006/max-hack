"use client";

import { memo, useEffect, useState } from "react";
import { LottieAnimation } from "@/lib/lottie/lottie-animation";
import { QUALITY_RENDERER_SETTINGS } from "@/lib/lottie/presets";
import type { LottieAnimationData } from "@/lib/lottie/types";
import { useThemeColors } from "@/lib/max/use-theme-colors";

type PreloaderProps = {
  message?: string;
  showProgress?: boolean;
  progress?: number; // 0-100
  visible?: boolean;
  onHide?: () => void;
};

const ANIMATION_PATH = "/lottie/satellite-animation.json";
const animationCache = new Map<string, LottieAnimationData>();

function formatPercent(n: number) {
  return `${Math.max(0, Math.min(100, Math.round(n)))}%`;
}

function PreloaderComponent({
  message = "Loading…",
  showProgress = false,
  progress = 0,
  visible = true,
  onHide,
}: PreloaderProps) {
  const colors = useThemeColors();
  const [mounted, setMounted] = useState(false);
  const [animationData, setAnimationData] = useState<LottieAnimationData | null>(null);
  const [errored, setErrored] = useState(false);

  const pct = Math.max(0, Math.min(100, progress));

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    const load = async () => {
      try {
        if (animationCache.has(ANIMATION_PATH)) {
          if (!mounted) return;
          const cached = animationCache.get(ANIMATION_PATH);
          if (cached) {
            setAnimationData(cached);
          }
          return;
        }
        const res = await fetch(ANIMATION_PATH, { cache: "force-cache", signal: controller.signal });
        if (!res.ok) throw new Error(`Failed to load ${ANIMATION_PATH}`);
        const json = (await res.json()) as LottieAnimationData;
        animationCache.set(ANIMATION_PATH, json);
        if (!mounted) return;
        setAnimationData(json);
      } catch (e) {
        // Ignore AbortError - это нормальное поведение при размонтировании
        if (e instanceof Error && e.name === "AbortError") {
          return;
        }
        if (mounted) setErrored(true);
        if (process.env.NODE_ENV !== "production") console.error(e);
      }
    };

    void load();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!visible && onHide) {
      const timer = setTimeout(onHide, 300);
      return () => clearTimeout(timer);
    }
  }, [visible, onHide]);

  return (
    <div
      aria-hidden={!visible}
      className={`flex h-full w-full items-center justify-center transition-opacity duration-300 ${
        visible && mounted ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex flex-col items-center gap-4 px-6 max-w-sm">
        {/* Lottie Animation */}
        {!errored && animationData ? (
          <div className="w-24 h-24 sm:w-32 sm:h-32">
            <LottieAnimation
              animationData={animationData}
              loop
              autoplay
              rendererSettings={QUALITY_RENDERER_SETTINGS}
            />
          </div>
        ) : (
          // Fallback spinner если Lottie не загрузилась
          <div className="relative">
            <div
              className="h-16 w-16 sm:h-20 sm:w-20 animate-spin rounded-full"
              style={{
                border: `3px solid ${colors.lineSubtle}`,
                borderTopColor: colors.accent,
                borderRightColor: colors.accent,
              }}
            />
            <div
              className="absolute inset-0 rounded-full animate-pulse"
              style={{
                background: `radial-gradient(circle, ${colors.accent}15, transparent 70%)`,
              }}
            />
          </div>
        )}

        {/* Message */}
        <div className="text-center space-y-2">
          <p className="text-sm font-medium" style={{ color: colors.textPrimary }}>
            {message}
          </p>
          
          {/* Progress */}
          {showProgress && (
            <div className="w-full max-w-[200px] mx-auto">
              <div className="relative h-1.5 overflow-hidden rounded-full" style={{ background: colors.panelMuted }}>
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ 
                    width: `${pct}%`, 
                    background: colors.accent,
                    boxShadow: `0 0 12px ${colors.accent}88` 
                  }}
                />
              </div>
              <p className="mt-2 text-xs font-medium tabular-nums" style={{ color: colors.textSecondary }}>
                {formatPercent(pct)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const Preloader = memo(PreloaderComponent);
Preloader.displayName = "Preloader";

// Legacy export for backward compatibility
export const MiniGamePreloader = Preloader;
