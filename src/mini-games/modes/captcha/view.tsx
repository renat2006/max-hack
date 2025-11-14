"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowClockwise, Sparkle, Swap } from "@phosphor-icons/react/dist/ssr";

import type { GameStatus, ValidationResult } from "@/app/types/game";
import { CaptchaGrid } from "@/app/components/captcha-grid";
import { MiniGameButton, MiniGameFeedbackOverlay, Preloader } from "@/lib/mini-games/components";
import type {
  MiniGameHudMetric,
  MiniGameHudState,
  MiniGameMetricTone,
} from "@/lib/mini-games/types";
import { triggerHapticFeedback } from "@/lib/mini-games/core";
import { useMax } from "@/src/max/max-context"";
import { useThemeColors } from "@/src/max/use-theme-colors";

import type { CaptchaChallengeDefinition } from "./types";
import { CaptchaModeSelector, useCaptchaGameMode } from "./captcha-mode-selector";

const AUTO_ADVANCE_DELAY_MS = 3000;
const AUTO_ADVANCE_INTERVAL_MS = 16;

export type CaptchaMissionViewProps = {
  challenge: CaptchaChallengeDefinition;
  totalScore: number;
  streak: number;
  status: GameStatus;
  validation: ValidationResult | null;
  isLoaded: boolean;
  canAdvance: boolean;
  selectedCells: Set<number>;
  correctCells: Set<number>;
  gridSize: number;
  totalCells: number;
  isSubmitDisabled: boolean;
  onToggleCell: (index: number) => void;
  onCheck: () => void;
  onNext: () => void;
  onRetry: () => void;
  onHudUpdate?: (hud: MiniGameHudState | null) => void;
  timeRemainingSeconds: number;
  baseDurationSeconds: number;
  timerExpired: boolean;
  prefetchProgress: number;
  isEndless: boolean;
  isInitialLoadComplete: boolean;
};

export function CaptchaMissionView({
  challenge,
  totalScore,
  streak,
  status,
  validation,
  isLoaded,
  canAdvance,
  selectedCells,
  correctCells,
  gridSize,
  totalCells,
  isSubmitDisabled,
  onToggleCell,
  onCheck,
  onNext,
  onRetry,
  onHudUpdate,
  timeRemainingSeconds,
  baseDurationSeconds,
  timerExpired,
  prefetchProgress,
  isEndless,
  isInitialLoadComplete,
}: CaptchaMissionViewProps) {
  const { webApp } = useMax();
  const colors = useThemeColors();
  const { showModal, setShowModal, selectedMode, handleSelectMode, isReady } = useCaptchaGameMode();

  const handleOpenModeSelector = useCallback(() => {
    // Сбрасываем игру перед открытием модалки выбора режима
    onRetry();
    setShowModal(true);
  }, [onRetry, setShowModal]);

  useEffect(() => {
    if (!onHudUpdate || !isReady) return;

    const streakTone: MiniGameMetricTone =
      streak > 2 ? "warning" : streak > 0 ? "success" : "neutral";
    const cachePercent = Math.round(prefetchProgress * 100);
    const metrics: MiniGameHudMetric[] = [
      {
        label: "Score",
        value: totalScore.toString(),
        icon: "score",
        tone: "neutral",
      },
      {
        label: "Streak",
        value: `${streak}`,
        icon: "streak",
        tone: streakTone,
      },
    ];

    if (!isInitialLoadComplete || cachePercent < 100) {
      metrics.push({
        label: "Cache",
        value: `${cachePercent}%`,
        icon: "speed",
        tone: cachePercent >= 80 ? "success" : cachePercent <= 40 ? "warning" : "neutral",
      });
    }

    onHudUpdate({
      metrics,
      timer: {
        remainingSeconds: Math.max(0, Math.floor(timeRemainingSeconds)),
        totalSeconds: baseDurationSeconds,
      },
    });
  }, [
    baseDurationSeconds,
    isEndless,
    isInitialLoadComplete,
    isReady,
    onHudUpdate,
    prefetchProgress,
    streak,
    timeRemainingSeconds,
    totalScore,
  ]);

  const feedbackMessage = useMemo(() => {
    if (timerExpired) {
      return "Mission timer expired. Review your final telemetry summary.";
    }

    if (status === "success") {
      return "Telemetry confirmed. Excellent work!";
    }

    if (status === "error" && validation?.status === "error") {
      const issues: string[] = [];

      if (validation.missing > 0) {
        issues.push(`${validation.missing} required tile${validation.missing > 1 ? "s" : ""}`);
      }

      if (validation.extra > 0) {
        issues.push(`${validation.extra} incorrect tile${validation.extra > 1 ? "s" : ""}`);
      }

      if (issues.length === 0) {
        return "Selection was empty. Tag at least one tile.";
      }

      return `Adjust your selection: ${issues.join(" and ")}.`;
    }

    return "Review the telemetry feed and validate the signal.";
  }, [status, validation, timerExpired]);

  const handleToggleCell = useCallback(
    (index: number) => {
      if (timerExpired) {
        return;
      }
      onToggleCell(index);
    },
    [onToggleCell, timerExpired],
  );

  const handleCheck = useCallback(() => {
    if (timerExpired) {
      return;
    }
    triggerHapticFeedback(webApp ?? undefined, "medium");
    onCheck();
  }, [onCheck, timerExpired, webApp]);

  const handleNext = useCallback(() => {
    triggerHapticFeedback(webApp ?? undefined, "light");
    onNext();
  }, [onNext, webApp]);

  const handleRetry = useCallback(() => {
    if (timerExpired) {
      return;
    }
    triggerHapticFeedback(webApp ?? undefined, "light");
    onRetry();
  }, [onRetry, timerExpired, webApp]);

  const [autoAdvanceProgress, setAutoAdvanceProgress] = useState(0);

  useEffect(() => {
    if (status !== "success" || timerExpired) {
      setAutoAdvanceProgress(0);
      return;
    }

    const startTime = Date.now();
    const interval = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / AUTO_ADVANCE_DELAY_MS) * 100, 100);
      setAutoAdvanceProgress(progress);

      if (progress >= 100) {
        window.clearInterval(interval);
        handleNext();
      }
    }, AUTO_ADVANCE_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [status, handleNext, timerExpired]);

  const actionArea = useMemo(() => {
    if (timerExpired) {
      return (
        <MiniGameButton
          onClick={handleNext}
          fullWidth
          variant="secondary"
          icon={<Sparkle size={20} weight="fill" />}
        >
          View Results
        </MiniGameButton>
      );
    }

    if (status === "success") {
      return (
        <div className="flex gap-3">
          <button
            onClick={handleNext}
            className="relative flex-1 overflow-hidden rounded-2xl border px-6 py-3.5 font-semibold transition-all active:scale-95"
            style={{
              background: colors.success,
              borderColor: colors.success,
              color: "white",
            }}
          >
            <div
              className="absolute inset-0 origin-left bg-white/30"
              style={{
                transform: `scaleX(${autoAdvanceProgress / 100})`,
                transition: "transform 16ms linear",
              }}
            />
            <span className="relative z-10">{canAdvance ? "Continue" : "Finish"}</span>
          </button>
          <MiniGameButton
            onClick={handleRetry}
            variant="secondary"
            icon={<ArrowClockwise size={20} weight="bold" />}
          >
            Retry
          </MiniGameButton>
        </div>
      );
    }

    if (status === "error") {
      return (
        <MiniGameButton
          onClick={handleRetry}
          variant="danger"
          fullWidth
          icon={<ArrowClockwise size={20} weight="bold" />}
        >
          Try Again
        </MiniGameButton>
      );
    }

    return (
      <MiniGameButton
        onClick={handleCheck}
        disabled={isSubmitDisabled || !isLoaded}
        fullWidth
        icon={<Sparkle size={20} weight={isSubmitDisabled || !isLoaded ? "regular" : "fill"} />}
      >
        Validate
      </MiniGameButton>
    );
  }, [
    autoAdvanceProgress,
    canAdvance,
    colors.success,
    handleCheck,
    handleNext,
    handleRetry,
    isLoaded,
    isSubmitDisabled,
    status,
    timerExpired,
  ]);

  // Не показываем игру пока не выбран режим
  if (!isReady) {
    return (
      <>
        <CaptchaModeSelector
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSelect={handleSelectMode}
          currentMode={selectedMode}
        />
        <div className="flex h-full items-center justify-center">
          <div className="text-center" style={{ color: colors.textMuted }}>
            <div className="mb-4 text-4xl">🎮</div>
            <p className="text-sm">Choose game mode to continue</p>
          </div>
        </div>
      </>
    );
  }

  // Показываем встроенный лоадер пока челлендж грузится
  if (!isLoaded || !isInitialLoadComplete) {
    const loadProgress = Math.round(prefetchProgress * 100);
    return (
      <>
        <CaptchaModeSelector
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSelect={handleSelectMode}
          currentMode={selectedMode}
        />
        <Preloader message="Loading mission..." showProgress progress={loadProgress} visible />
      </>
    );
  }

  return (
    <>
      <CaptchaModeSelector
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSelect={handleSelectMode}
        currentMode={selectedMode}
      />

      <div className="flex h-full flex-col gap-1.5 sm:gap-3">
        <div
          className="relative flex flex-1 flex-col gap-1.5 sm:gap-3 rounded-2xl sm:rounded-3xl p-2 sm:p-4 overflow-hidden min-h-0"
          style={{
            background: colors.panel,
          }}
        >
          <MiniGameFeedbackOverlay
            show={status !== "idle"}
            success={status === "success"}
            message={feedbackMessage}
          />

          <div
            className="rounded-xl sm:rounded-2xl px-2 py-1.5 sm:px-4 sm:py-3 text-sm font-medium shadow-sm flex-shrink-0"
            style={{
              background: colors.panelMuted,
              color: colors.textPrimary,
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="flex-1 text-[10px] leading-tight sm:text-sm">
                {challenge.prompt}
              </span>
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <span
                  className="text-[9px] sm:text-xs px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full font-semibold whitespace-nowrap"
                  style={{
                    background: `${colors.accent}20`,
                    color: colors.accent,
                  }}
                >
                  {challenge.metadata.targetLabel}
                </span>
                <button
                  onClick={handleOpenModeSelector}
                  className="flex items-center justify-center rounded-lg p-1 sm:p-1.5 transition-all active:scale-90"
                  style={{
                    background: `${colors.accent}15`,
                    color: colors.accent,
                  }}
                  title="Change mode"
                >
                  <Swap size={13} weight="bold" className="sm:hidden" />
                  <Swap size={16} weight="bold" className="hidden sm:block" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-hidden rounded-xl sm:rounded-2xl min-h-0">
            <CaptchaGrid
              backgroundImage={challenge.backgroundImage}
              gridSize={gridSize}
              totalCells={totalCells}
              selectedCells={selectedCells}
              correctCells={correctCells}
              tileSprites={challenge.tileSprites}
              boardImage={challenge.metadata.renderedImage}
              boardAlt={challenge.alt}
              isLoaded={isLoaded}
              status={status}
              onToggleCell={handleToggleCell}
            />
          </div>
        </div>

        <div className="px-2 sm:px-0 pb-1 flex-shrink-0">{actionArea}</div>
      </div>
    </>
  );
}
