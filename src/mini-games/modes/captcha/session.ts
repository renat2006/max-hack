import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { GameStatus, ValidationResult } from "@/app/types/game";

import { submitProgressEvent } from "@/lib/mini-games/utils/progress";
import type { MiniGameDefinition } from "@/lib/mini-games/types";
import type { CaptchaMiniGameSession } from "@/lib/mini-games/core/session/types";

import { useChallengePrefetch } from "./hooks/use-challenge-prefetch";
import { useSpritePreload } from "./hooks/use-sprite-preload";
import { computeCaptchaScore, evaluateCaptcha, updateSessionScore } from "./scoring";
import { createCaptchaSessionState, type CaptchaSessionState } from "./session-types";
import { createFullImageChallenges } from "./full-images-challenges";

const DEFAULT_GRID_SIZE = 3;
const DEFAULT_DURATION_SECONDS = 120; // 2 минуты
const TIME_BONUS_CORRECT = 3; // +3 сек за правильный ответ
const TIME_PENALTY_WRONG = 7; // -7 сек за неправильный ответ

const createRunId = () =>
  `captcha-run-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

type UseCaptchaSessionOptions = {
  definition: MiniGameDefinition | null;
  userId?: number;
  isMock: boolean;
};

export const useCaptchaSession = ({
  definition,
  userId,
  isMock,
}: UseCaptchaSessionOptions): CaptchaMiniGameSession => {
  const captchaConfig = useMemo(() => {
    if (definition?.config.mode === "captcha") {
      return definition.config;
    }
    return null;
  }, [definition]);

  const baseDurationSeconds = captchaConfig?.baseDurationSeconds ?? DEFAULT_DURATION_SECONDS;
  const isEndless = captchaConfig ? captchaConfig.challenges.length >= 30 : false;

  const [challengeIndex, setChallengeIndex] = useState(0);
  const [sessionState, setSessionState] = useState<CaptchaSessionState>(() =>
    createCaptchaSessionState(baseDurationSeconds),
  );
  const [started, setStarted] = useState(false);
  const timerSummarySubmittedRef = useRef(false);
  const shouldStartRef = useRef(false);
  const [selectedMode, setSelectedMode] = useState<"sprites" | "full-images" | null>(null);

  // Listen for mode changes
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const savedMode = localStorage.getItem("captcha-selected-mode") as
      | "sprites"
      | "full-images"
      | null;
    if (savedMode) {
      setSelectedMode(savedMode);
    }

    const handleModeChange = (event: Event) => {
      const mode = (event as CustomEvent<"sprites" | "full-images">).detail;
      setSelectedMode(mode);
    };

    window.addEventListener("captcha-mode-changed", handleModeChange);
    return () => {
      window.removeEventListener("captcha-mode-changed", handleModeChange);
    };
  }, []);

  useEffect(() => {
    setChallengeIndex(0);
    setSessionState(createCaptchaSessionState(baseDurationSeconds));
    setStarted(false);
    timerSummarySubmittedRef.current = false;
  }, [definition, baseDurationSeconds]);

  // Reset when mode changes
  useEffect(() => {
    if (!selectedMode) {
      return;
    }

    // Полный сброс сессии при смене режима
    setChallengeIndex(0);
    setSessionState(createCaptchaSessionState(baseDurationSeconds));
    setStarted(false);
    timerSummarySubmittedRef.current = false;
    shouldStartRef.current = false; // Сброс - не стартуем автоматически
  }, [baseDurationSeconds, selectedMode]);

  // Выбираем челленджи в зависимости от режима
  const challenges = useMemo(() => {
    const baseChallenges = captchaConfig?.challenges ?? [];

    if (!selectedMode) {
      return baseChallenges;
    }

    if (selectedMode === "full-images") {
      // Генерируем full-images челленджи
      return createFullImageChallenges(60);
    }

    // Для sprites используем стандартные blueprint-челленджи
    return baseChallenges;
  }, [captchaConfig?.challenges, selectedMode]);

  const {
    getCachedChallenge,
    ensurePrefetched,
    isPreloading,
    initialLoadComplete,
    prefetchProgress,
  } = useChallengePrefetch({
    challenges,
    currentIndex: challengeIndex,
    enabled: challenges.length > 0 && selectedMode !== null,
    scopeKey: `${sessionState.runId ?? "default"}-${selectedMode ?? "none"}`,
    // Для full-images челленджи уже готовы локально, не нужна предзагрузка
    initialBatchSize: selectedMode === "full-images" ? 1 : 5,
    concurrentRequests: selectedMode === "full-images" ? 1 : 2,
  });

  // Предзагрузка спрайтов для sprites режима
  const {
    isLoading: isLoadingSprites,
    isReady: spritesReady,
    progress: spritesProgress,
  } = useSpritePreload({
    challenges,
    enabled: selectedMode === "sprites" && challenges.length > 0,
    batchSize: 5,
    priorityCount: 15,
  });

  const baseChallenge = captchaConfig && selectedMode ? (challenges[challengeIndex] ?? null) : null;
  const currentChallenge = baseChallenge ? getCachedChallenge(baseChallenge) : null;

  // Определяем готовность в зависимости от режима
  const isFullyReady =
    selectedMode === "sprites" ? initialLoadComplete && spritesReady : initialLoadComplete;

  useEffect(() => {
    if (baseChallenge && selectedMode) {
      void ensurePrefetched(baseChallenge);
    }
  }, [baseChallenge, ensurePrefetched, selectedMode]);

  // Auto-start when first challenge is loaded AND all assets are ready
  useEffect(() => {
    if (!selectedMode || !definition || !isFullyReady || started || shouldStartRef.current) {
      return;
    }
    shouldStartRef.current = true;
    const timer = setTimeout(() => {
      setStarted(true);
      setSessionState(() => {
        const now = Date.now();
        const next = createCaptchaSessionState(baseDurationSeconds);
        next.startedAt = now;
        next.runId = createRunId();
        return next;
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [baseDurationSeconds, definition, isFullyReady, selectedMode, started]);

  const correctCells = useMemo(() => {
    if (!currentChallenge) {
      return new Set<number>();
    }
    return new Set(currentChallenge.correctCells);
  }, [currentChallenge]);

  const fallbackGridSize = captchaConfig?.gridSize ?? DEFAULT_GRID_SIZE;
  const currentGridSize =
    currentChallenge?.gridSize && currentChallenge.gridSize > 0
      ? currentChallenge.gridSize
      : fallbackGridSize;
  const totalCells = currentGridSize * currentGridSize;

  const totalChallenges = challenges.length;
  const isChallengeLoading = isPreloading && !initialLoadComplete;

  const start = useCallback(() => {
    if (!definition) {
      return;
    }
    setStarted(true);
    setSessionState(() => {
      const now = Date.now();
      const next = createCaptchaSessionState(baseDurationSeconds);
      next.startedAt = now;
      next.runId = createRunId();
      return next;
    });
    setChallengeIndex(0);
  }, [baseDurationSeconds, definition]);

  const reset = useCallback(() => {
    setSessionState(createCaptchaSessionState(baseDurationSeconds));
    setChallengeIndex(0);
    setStarted(false);
    timerSummarySubmittedRef.current = false;
  }, [baseDurationSeconds]);

  const toggleCell = useCallback(
    (cell: number) => {
      if (
        !currentChallenge ||
        sessionState.status === "success" ||
        isChallengeLoading ||
        sessionState.timerExpired
      ) {
        return;
      }
      if (cell < 0 || cell >= totalCells) {
        return;
      }
      setSessionState((prev) => {
        const nextSelected = new Set(prev.selectedCells);
        if (nextSelected.has(cell)) {
          nextSelected.delete(cell);
        } else {
          nextSelected.add(cell);
        }
        return {
          ...prev,
          selectedCells: nextSelected,
          validation: null,
          status: "idle",
        } satisfies CaptchaSessionState;
      });
    },
    [
      currentChallenge,
      isChallengeLoading,
      sessionState.status,
      sessionState.timerExpired,
      totalCells,
    ],
  );

  const submit = useCallback(() => {
    if (
      !definition ||
      !captchaConfig ||
      !currentChallenge ||
      isChallengeLoading ||
      sessionState.timerExpired
    ) {
      return;
    }

    setSessionState((prev) => {
      const now = Date.now();
      const selected = Array.from(prev.selectedCells).filter(
        (cell) => cell >= 0 && cell < totalCells,
      );
      const evaluation = evaluateCaptcha({
        challenge: currentChallenge,
        selected,
      });

      const status: GameStatus =
        evaluation.missing === 0 && evaluation.extra === 0 ? "success" : "error";
      const score =
        status === "success"
          ? computeCaptchaScore(captchaConfig, evaluation, {
              totalScore: prev.totalScore,
              streak: prev.streak,
            })
          : 0;

      // Изменение времени в зависимости от результата
      const timeAdjustment = status === "success" ? TIME_BONUS_CORRECT : -TIME_PENALTY_WRONG;
      const newTimeRemaining = Math.max(0, prev.timeRemainingSeconds + timeAdjustment);

      const startedAt = prev.startedAt ?? now;
      const totalAttempts = prev.totalAttempts + 1;
      let completedChallenges = prev.completedChallenges;
      let durationMs = prev.durationMs;

      if (status === "success") {
        completedChallenges += 1;
        durationMs = now - startedAt;
      }

      const accuracyPercent =
        totalAttempts === 0 ? 0 : Math.round((completedChallenges / totalAttempts) * 100);

      let totalScoreAfter = prev.totalScore;
      let streakAfter = prev.streak;

      if (status === "success") {
        const updated = updateSessionScore(prev, evaluation, score);
        totalScoreAfter = updated.totalScore;
        streakAfter = updated.streak;
      }

      submitProgressEvent({
        userId,
        game: definition,
        challengeId: currentChallenge.id,
        status,
        score,
        selected,
        missing: evaluation.missing,
        extra: evaluation.extra,
        totalCorrect: currentChallenge.correctCells.length,
        isMock,
        sessionSummary:
          status === "success"
            ? {
                completedChallenges,
                totalChallenges: captchaConfig.challenges.length,
                accuracyPercent,
                durationMs,
                totalScore: totalScoreAfter,
              }
            : undefined,
      });

      if (status !== "success") {
        const validation: ValidationResult = {
          status: "error",
          type:
            evaluation.missing > 0 && evaluation.extra > 0
              ? "both"
              : evaluation.missing > 0
                ? "missing"
                : evaluation.extra > 0
                  ? "extra"
                  : "empty",
          missing: evaluation.missing,
          extra: evaluation.extra,
        };

        return {
          ...prev,
          status,
          selectedCells: new Set(selected),
          validation,
          lastChallengeScore: 0,
          totalAttempts,
          timeRemainingSeconds: newTimeRemaining,
          timerExpired: newTimeRemaining <= 0,
        } satisfies CaptchaSessionState;
      }

      return {
        ...prev,
        status,
        validation: { status: "success" },
        selectedCells: new Set(selected),
        totalScore: totalScoreAfter,
        streak: streakAfter,
        startedAt,
        completedChallenges,
        totalAttempts,
        durationMs,
        lastChallengeScore: score,
        timeRemainingSeconds: newTimeRemaining,
        timerExpired: newTimeRemaining <= 0,
      } satisfies CaptchaSessionState;
    });
  }, [
    captchaConfig,
    currentChallenge,
    definition,
    isChallengeLoading,
    isMock,
    sessionState.timerExpired,
    totalCells,
    userId,
  ]);

  const next = useCallback(() => {
    if (
      !definition ||
      !captchaConfig ||
      !currentChallenge ||
      isChallengeLoading ||
      sessionState.timerExpired
    ) {
      return;
    }

    setSessionState((prev) => {
      if (prev.status !== "success") {
        return prev;
      }

      const hasAnother = challengeIndex + 1 < captchaConfig.challenges.length;
      if (!hasAnother && !isEndless) {
        return prev;
      }

      return {
        ...prev,
        status: "idle",
        validation: null,
        selectedCells: new Set(),
        lastChallengeScore: 0,
      } satisfies CaptchaSessionState;
    });

    setChallengeIndex((prev) => {
      const hasAnother = prev + 1 < captchaConfig.challenges.length;
      if (hasAnother) {
        return prev + 1;
      }
      return isEndless ? 0 : prev;
    });
  }, [
    captchaConfig,
    challengeIndex,
    currentChallenge,
    definition,
    isChallengeLoading,
    isEndless,
    sessionState.timerExpired,
  ]);

  const retry = useCallback(() => {
    if (!captchaConfig || !currentChallenge || isChallengeLoading || sessionState.timerExpired) {
      return;
    }

    setSessionState((prev) => ({
      ...prev,
      status: "idle",
      validation: null,
      selectedCells: new Set(),
      lastChallengeScore: 0,
    }));
  }, [captchaConfig, currentChallenge, isChallengeLoading, sessionState.timerExpired]);

  useEffect(() => {
    if (!started || sessionState.timerExpired || !isFullyReady) {
      return;
    }

    const interval = window.setInterval(() => {
      setSessionState((prev) => {
        if (prev.timerExpired) {
          return prev;
        }

        const nextRemaining = Math.max(0, prev.timeRemainingSeconds - 1);
        const now = Date.now();
        const timerExpired = nextRemaining <= 0;

        if (timerExpired && !prev.timerExpired) {
          return {
            ...prev,
            timeRemainingSeconds: nextRemaining,
            timerExpired: true,
            status: "error",
            durationMs: prev.startedAt ? now - prev.startedAt : prev.durationMs,
          } satisfies CaptchaSessionState;
        }

        return {
          ...prev,
          timeRemainingSeconds: nextRemaining,
          durationMs: prev.startedAt ? now - prev.startedAt : prev.durationMs,
        } satisfies CaptchaSessionState;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [started, sessionState.timerExpired, isFullyReady]);

  useEffect(() => {
    if (
      !sessionState.timerExpired ||
      !definition ||
      !sessionState.runId ||
      timerSummarySubmittedRef.current
    ) {
      return;
    }

    timerSummarySubmittedRef.current = true;

    const accuracyPercent =
      sessionState.totalAttempts === 0
        ? 0
        : Math.round((sessionState.completedChallenges / sessionState.totalAttempts) * 100);

    submitProgressEvent({
      userId,
      game: definition,
      challengeId: sessionState.runId,
      status: sessionState.totalScore > 0 ? "success" : "error",
      score: sessionState.totalScore,
      selected: [],
      missing: Math.max(0, sessionState.totalAttempts - sessionState.completedChallenges),
      extra: 0,
      totalCorrect: sessionState.completedChallenges,
      isMock,
      sessionSummary: {
        completedChallenges: sessionState.completedChallenges,
        totalChallenges: sessionState.totalAttempts,
        accuracyPercent,
        durationMs: sessionState.durationMs,
        totalScore: sessionState.totalScore,
      },
    });
  }, [
    definition,
    isMock,
    sessionState.completedChallenges,
    sessionState.durationMs,
    sessionState.runId,
    sessionState.timerExpired,
    sessionState.totalAttempts,
    sessionState.totalScore,
    userId,
  ]);

  const status: GameStatus = sessionState.status;
  const validation: ValidationResult | null = sessionState.validation;
  const isComplete = sessionState.timerExpired
    ? true
    : totalChallenges > 0
      ? status === "success" && challengeIndex === totalChallenges - 1
      : false;
  const hasNext = sessionState.timerExpired
    ? false
    : isEndless
      ? true
      : challengeIndex + 1 < totalChallenges;
  const accuracyPercent =
    sessionState.totalAttempts === 0
      ? 0
      : Math.round((sessionState.completedChallenges / sessionState.totalAttempts) * 100);

  // Комбинируем прогресс загрузки в зависимости от режима
  const combinedProgress =
    selectedMode === "sprites"
      ? (prefetchProgress + spritesProgress) / 2 // Среднее значение двух прогрессов
      : prefetchProgress;

  return {
    mode: "captcha",
    definition: captchaConfig ? definition : null,
    challengeIndex,
    totalChallenges,
    state: sessionState,
    isStarted: started,
    status,
    validation,
    challengeTitle: currentChallenge?.title ?? "",
    challengePrompt: currentChallenge?.prompt ?? "",
    challengeImage: currentChallenge?.backgroundImage ?? "",
    correctCells,
    gridSize: currentGridSize,
    isLoaded:
      Boolean(currentChallenge) && !isChallengeLoading && selectedMode !== null && isFullyReady,
    hasNext,
    isComplete,
    totalScore: sessionState.totalScore,
    lastChallengeScore: sessionState.lastChallengeScore,
    completedChallenges: sessionState.completedChallenges,
    accuracyPercent,
    elapsedMs: sessionState.durationMs,
    isChallengeLoading: isChallengeLoading || isLoadingSprites,
    challengeError: null,
    currentChallenge,
    timeRemainingSeconds: sessionState.timeRemainingSeconds,
    baseDurationSeconds: sessionState.baseDurationSeconds,
    timerExpired: sessionState.timerExpired,
    totalAttempts: sessionState.totalAttempts,
    prefetchProgress: combinedProgress,
    isEndless,
    isInitialLoadComplete: isFullyReady,
    start,
    reset,
    toggleCell,
    submit,
    next,
    retry,
  } satisfies CaptchaMiniGameSession;
};
