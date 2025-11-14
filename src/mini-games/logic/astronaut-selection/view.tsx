"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useThemeColors } from "@/src/max/use-theme-colors";
import { useMax } from "@/src/max/max-context"";
import { triggerHapticFeedback } from "@/lib/mini-games/core";
import { getMiniGameById } from "@/lib/mini-games/catalog";
import { submitProgressEvent } from "@/lib/mini-games/utils/progress";
import type { MiniGameHudState, MiniGameMetricTone } from "@/lib/mini-games/types";
import type { PersonTraits, Rule, GameState } from "./types";
import {
  generateRoundRules,
  selectRandomCandidates,
  checkDecision,
  getImportantFields,
} from "./index";
import { generateDiverseCandidate } from "./person-generator";
import { RulesDisplay } from "./visuals";
import { GAME_CONFIG } from "./constants";
import { CandidateProfileCard, DecisionBar } from "./components";
import { GameRulesModal, useGameRules } from "@/lib/mini-games/components";
import { ASTRONAUT_SELECTION_RULES } from "@/lib/mini-games/game-rules-configs";
import type {
  AstronautSelectionRuntime,
  AstronautSelectionSummary,
} from "@/lib/mini-games/modes/astronaut-selection/session-types";

// Сбалансированная система очков: 50 очков за правильное решение
// Целевое значение: 500-1000 очков за полную игру (10-20 решений)
const SCORE_PER_CORRECT = 50;

interface AstronautSelectionViewProps {
  onComplete: (summary: AstronautSelectionSummary) => void;
  onHudUpdate?: (hud: MiniGameHudState | null) => void;
  onExit?: () => void;
  runtime: AstronautSelectionRuntime;
}

export function AstronautSelectionView({
  onComplete,
  onHudUpdate,
  onExit,
  runtime,
}: AstronautSelectionViewProps) {
  const colors = useThemeColors();
  const { webApp, user, isMock } = useMax();
  const gameDefinition = useMemo(() => getMiniGameById("decision-tree-builder"), []);
  const userId = user?.id;
  const username = user?.username ?? null;
  const fullName = useMemo(() => {
    if (!user) {
      return null;
    }

    const compositeName = [user.first_name, user.last_name].filter(Boolean).join(" ").trim();
    if (compositeName.length > 0) {
      return compositeName;
    }

    return user.username ?? null;
  }, [user]);

  const { showRules: showGameRules, setShowRules: setShowGameRules } =
    useGameRules("astronaut-selection");

  const [showHint, setShowHint] = useState(false);
  const hintTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const gameStartRef = useRef<number>(runtime.startedAt ?? Date.now());
  const runIdRef = useRef<string>(
    runtime.runId ?? `astronaut-run-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  );
  useEffect(() => {
    if (runtime.startedAt) {
      gameStartRef.current = runtime.startedAt;
    }
    if (runtime.runId) {
      runIdRef.current = runtime.runId;
    }
  }, [runtime.runId, runtime.startedAt]);
  const submittedProgressRef = useRef(false);

  const [gameState, setGameState] = useState<GameState>({
    currentRound: 1,
    totalRounds: 1,
    timeLeft: GAME_CONFIG.INITIAL_TIME,
    correctDecisions: 0,
    totalDecisions: 0,
    currentCandidateIndex: 0,
    gameOver: false,
    showFeedback: false,
    lastDecisionCorrect: false,
  });

  const [rules, setRules] = useState<Rule[]>([]);
  const [previousRules, setPreviousRules] = useState<Rule[]>([]);
  const [candidates, setCandidates] = useState<PersonTraits[]>([]);
  const [candidatesUntilRuleChange, setCandidatesUntilRuleChange] = useState(5); // Меняем правила каждые 5 кандидатов
  const [showRulesModal, setShowRulesModal] = useState(false); // Для паузы таймера при показе правил

  // Генерация нового кандидата (для бесконечного режима) с разнообразием
  const generateNewCandidate = useCallback(() => {
    setCandidates((prev) => {
      const newId = prev.length;
      const newCandidate = generateDiverseCandidate(newId, prev);
      return [...prev, newCandidate];
    });
  }, []);

  // Генерация новых правил
  const generateNewRules = useCallback(() => {
    setPreviousRules(rules);
    const newRules = generateRoundRules();
    setRules(newRules);
    setCandidatesUntilRuleChange(5); // Сбрасываем счетчик
  }, [rules]);

  // Инициализация игры - только 1 кандидат для начала
  useEffect(() => {
    const newRules = generateRoundRules();
    const initialCandidate = selectRandomCandidates(1);
    setRules(newRules);
    setCandidates(initialCandidate);
  }, []);

  // Таймер игры - завершается при timeLeft <= 0
  // ОБНОВЛЕНО: останавливается при показе правил (showRulesModal)
  useEffect(() => {
    if (gameState.gameOver || gameState.timeLeft <= 0 || showRulesModal) {
      if (gameState.timeLeft <= 0 && !gameState.gameOver) {
        setGameState((prev) => ({ ...prev, gameOver: true }));
      }
      return;
    }

    const timer = setInterval(() => {
      setGameState((prev) => {
        if (prev.timeLeft <= 1) {
          return { ...prev, timeLeft: 0, gameOver: true };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.gameOver, gameState.timeLeft, showRulesModal]);

  // Telegram WebApp интеграция - BackButton
  useEffect(() => {
    if (!webApp) return;

    // Показываем BackButton
    webApp.BackButton.show();

    const handleBack = () => {
      triggerHapticFeedback(webApp, "light");
      if (onExit) {
        onExit();
      }
    };

    webApp.BackButton.onClick(handleBack);

    return () => {
      webApp.BackButton.offClick(handleBack);
      webApp.BackButton.hide();
    };
  }, [webApp, onExit]);

  // Таймер подсказки (7 секунд)
  useEffect(() => {
    if (gameState.showFeedback || gameState.gameOver) {
      return;
    }

    setShowHint(false);

    hintTimeoutRef.current = setTimeout(() => {
      setShowHint(true);
    }, GAME_CONFIG.HINT_DELAY);

    return () => {
      if (hintTimeoutRef.current) {
        clearTimeout(hintTimeoutRef.current);
      }
    };
  }, [gameState.currentCandidateIndex, gameState.showFeedback, gameState.gameOver]);

  // Отслеживаем актуальные правила, чтобы подсветка новых правил срабатывала один раз
  useEffect(() => {
    if (rules.length === 0) {
      return;
    }
    setPreviousRules(rules);
  }, [rules]);

  const currentCandidate = candidates[gameState.currentCandidateIndex];
  const importantFields = useMemo(() => getImportantFields(rules), [rules]);

  // HUD update - более динамичный с акцентом на время
  useEffect(() => {
    if (!onHudUpdate) {
      return;
    }

    const accuracyPercent =
      gameState.totalDecisions > 0
        ? Math.round((gameState.correctDecisions / gameState.totalDecisions) * 100)
        : 0;

    const accuracyTone: MiniGameMetricTone =
      accuracyPercent >= 80 ? "success" : accuracyPercent <= 50 ? "danger" : "warning";

    const validationFeedback = gameState.showFeedback
      ? {
          type: (gameState.lastDecisionCorrect ? "success" : "error") as "success" | "error",
          timestamp: Date.now(),
        }
      : null;

    onHudUpdate({
      timer: {
        remainingSeconds: gameState.timeLeft,
        totalSeconds: GAME_CONFIG.INITIAL_TIME,
      },
      metrics: [
        {
          label: "Correct",
          value: `${gameState.correctDecisions}/${gameState.totalDecisions}`,
          icon: "score",
          tone: "success",
        },
        {
          label: "Accuracy",
          value: `${accuracyPercent}%`,
          icon: "accuracy",
          tone: accuracyTone,
        },
      ],
      validationFeedback,
    });
  }, [
    gameState.correctDecisions,
    gameState.lastDecisionCorrect,
    gameState.showFeedback,
    gameState.timeLeft,
    gameState.totalDecisions,
    onHudUpdate,
  ]);

  // Сообщаем контейнеру об окончании игры + отправляем итоговое событие один раз
  useEffect(() => {
    if (!gameState.gameOver || submittedProgressRef.current) {
      if (!gameState.gameOver) {
        submittedProgressRef.current = false;
      }
      return;
    }

    const totalDecisions = gameState.totalDecisions;
    const correctDecisions = gameState.correctDecisions;
    const finalScore = correctDecisions * SCORE_PER_CORRECT;
    const accuracyPercent =
      totalDecisions === 0 ? 0 : Math.round((correctDecisions / totalDecisions) * 100);
    const durationMs = Math.max(0, Date.now() - gameStartRef.current);
    const status = finalScore > 0 ? "success" : "error";

    if (gameDefinition) {
      submitProgressEvent({
        userId,
        game: gameDefinition,
        challengeId: runIdRef.current,
        status,
        score: finalScore,
        selected: [],
        missing: Math.max(0, totalDecisions - correctDecisions),
        extra: 0,
        totalCorrect: correctDecisions,
        isMock,
        sessionSummary: {
          completedChallenges: correctDecisions,
          totalChallenges: totalDecisions,
          accuracyPercent,
          durationMs,
          totalScore: finalScore,
        },
        username,
        fullName,
      });
    }

    submittedProgressRef.current = true;
    const summary: AstronautSelectionSummary = {
      score: finalScore,
      accuracyPercent,
      totalDecisions,
      correctDecisions,
      durationMs,
    };
    onComplete(summary);
  }, [
    gameDefinition,
    gameState.correctDecisions,
    gameState.gameOver,
    gameState.totalDecisions,
    fullName,
    isMock,
    onComplete,
    userId,
    username,
  ]);

  const handleDecision = useCallback(
    (decision: "approve" | "reject") => {
      if (gameState.showFeedback || gameState.gameOver || !currentCandidate) {
        return;
      }

      // Немедленный легкий haptic для отклика на нажатие
      triggerHapticFeedback(webApp ?? undefined, "light");

      const result = checkDecision(currentCandidate, rules, decision);

      // Различный haptic для результата (через 50мс для последовательности)
      setTimeout(() => {
        triggerHapticFeedback(webApp ?? undefined, result.correct ? "success" : "error");
      }, 50);

      const timeAdjustment = result.correct
        ? GAME_CONFIG.TIME_BONUS_CORRECT
        : -GAME_CONFIG.TIME_PENALTY_WRONG;
      const challengeId = `astronaut-${currentCandidate.id}`;

      setGameState((prev) => {
        const nextCorrectDecisions = prev.correctDecisions + (result.correct ? 1 : 0);
        const nextTotalDecisions = prev.totalDecisions + 1;
        const accuracyPercent =
          nextTotalDecisions === 0
            ? 0
            : Math.round((nextCorrectDecisions / nextTotalDecisions) * 100);
        const missingCount = result.correct ? 0 : result.expectedDecision === "approve" ? 1 : 0;
        const extraCount = result.correct ? 0 : result.expectedDecision === "reject" ? 1 : 0;

        if (gameDefinition) {
          submitProgressEvent({
            userId,
            game: gameDefinition,
            challengeId,
            status: result.correct ? "success" : "error",
            score: result.correct ? SCORE_PER_CORRECT : 0,
            selected: decision === "approve" ? [1] : [0],
            missing: missingCount,
            extra: extraCount,
            totalCorrect: 1,
            isMock,
            sessionSummary: result.correct
              ? {
                  completedChallenges: nextCorrectDecisions,
                  totalChallenges: nextTotalDecisions,
                  accuracyPercent,
                  durationMs: Math.max(0, Date.now() - gameStartRef.current),
                  totalScore: nextCorrectDecisions * SCORE_PER_CORRECT,
                }
              : undefined,
            username,
            fullName,
          });
        }

        const newTimeLeft = Math.max(
          GAME_CONFIG.MIN_TIME,
          Math.min(GAME_CONFIG.MAX_TIME, prev.timeLeft + timeAdjustment),
        );

        return {
          ...prev,
          showFeedback: true,
          lastDecisionCorrect: result.correct,
          correctDecisions: nextCorrectDecisions,
          totalDecisions: nextTotalDecisions,
          timeLeft: newTimeLeft,
          gameOver: newTimeLeft <= 0,
        };
      });

      setTimeout(() => {
        setGameState((prev) => {
          if (prev.gameOver) {
            return prev;
          }

          return {
            ...prev,
            currentCandidateIndex: prev.currentCandidateIndex + 1,
            showFeedback: false,
          };
        });

        setCandidatesUntilRuleChange((prevCount) => {
          const nextCount = prevCount - 1;
          if (nextCount <= 0) {
            generateNewRules();
            return 5;
          }
          return nextCount;
        });

        if (!gameState.gameOver) {
          generateNewCandidate();
        }
      }, GAME_CONFIG.FEEDBACK_DURATION);
    },
    [
      currentCandidate,
      gameDefinition,
      gameState.gameOver,
      gameState.showFeedback,
      generateNewCandidate,
      generateNewRules,
      isMock,
      rules,
      userId,
      username,
      fullName,
      webApp,
    ],
  );

  if (!currentCandidate) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-sm" style={{ color: colors.textSecondary }}>
          Loading candidates...
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Модальное окно с правилами */}
      <GameRulesModal
        isOpen={showGameRules}
        onClose={() => setShowGameRules(false)}
        gameMode="astronaut-selection"
        config={ASTRONAUT_SELECTION_RULES}
      />

      <div className="flex h-full flex-col gap-2 overflow-hidden p-2">
        {/* Визуальные правила с анимацией */}
        <RulesDisplay
          rules={rules}
          previousRules={previousRules}
          candidatesUntilChange={candidatesUntilRuleChange}
          showModal={showRulesModal}
          onShowModalChange={setShowRulesModal}
        />

        <CandidateProfileCard
          candidate={currentCandidate}
          candidateIndex={gameState.currentCandidateIndex}
          totalCandidates={-1} // -1 = бесконечность
          importantFields={importantFields}
          showHint={showHint}
          showFeedback={gameState.showFeedback}
          lastDecisionCorrect={gameState.lastDecisionCorrect}
        />

        <DecisionBar
          onApprove={() => handleDecision("approve")}
          onReject={() => handleDecision("reject")}
          disabled={gameState.showFeedback}
        />
      </div>
    </>
  );
}
