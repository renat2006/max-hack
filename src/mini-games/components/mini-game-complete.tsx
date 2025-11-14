"use client";

import { Trophy, Target, ArrowClockwise, House, Sparkle } from "@phosphor-icons/react/dist/ssr";
import { useThemeColors } from "@/src/max/use-theme-colors";

interface MiniGameCompleteProps {
  show: boolean;
  score: number;
  accuracy: number;
  totalQuestions?: number;
  correctAnswers?: number;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
  gameTitle?: string;
}

export function MiniGameComplete({
  show,
  score,
  accuracy,
  totalQuestions,
  correctAnswers,
  onPlayAgain,
  onBackToMenu,
  gameTitle = "Mission Complete",
}: MiniGameCompleteProps) {
  const colors = useThemeColors();

  if (!show) return null;

  const isHighScore = accuracy >= 80;
  const isPerfect = accuracy === 100;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4"
      style={{
        background: "rgba(6, 10, 26, 0.85)",
        backdropFilter: "blur(20px)",
        animation: "fadeIn 0.3s ease-out",
      }}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl sm:rounded-3xl"
        style={{
          background:
            "linear-gradient(165deg, rgba(16, 28, 52, 0.98) 0%, rgba(8, 16, 36, 0.98) 100%)",
          border: `1px solid ${colors.lineAccent}`,
          boxShadow: "0 32px 64px rgba(0, 0, 0, 0.7), 0 0 100px rgba(97, 247, 255, 0.2)",
          animation: "slideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        {/* Glow эффект сверху */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 opacity-40 blur-3xl pointer-events-none"
          style={{
            background: isPerfect
              ? "radial-gradient(ellipse, rgba(120, 67, 255, 0.5), transparent)"
              : isHighScore
                ? "radial-gradient(ellipse, rgba(34, 197, 94, 0.5), transparent)"
                : "radial-gradient(ellipse, rgba(97, 247, 255, 0.5), transparent)",
          }}
        />

        {/* Header с градиентом и улучшенным дизайном */}
        <div
          className="relative overflow-hidden px-4 py-6 sm:px-6 sm:py-8"
          style={{
            background: isPerfect
              ? "linear-gradient(135deg, rgba(120, 67, 255, 0.25), rgba(97, 247, 255, 0.15))"
              : isHighScore
                ? "linear-gradient(135deg, rgba(34, 197, 94, 0.25), rgba(16, 185, 129, 0.15))"
                : "linear-gradient(135deg, rgba(97, 247, 255, 0.2), rgba(29, 78, 255, 0.15))",
            borderBottom: `1px solid ${isPerfect ? "rgba(120, 67, 255, 0.3)" : isHighScore ? "rgba(34, 197, 94, 0.3)" : colors.lineAccent}`,
          }}
        >
          {/* Декоративный фон */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.12) 0%, transparent 50%),
                                radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.08) 0%, transparent 50%)`,
            }}
          />

          {/* Анимированный shimmer эффект */}
          <div
            className="absolute inset-0 opacity-40"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent)",
              backgroundSize: "200% 100%",
              animation: "shimmer 3s infinite",
            }}
          />

          {/* Иконка */}
          <div className="relative z-10 mb-3 sm:mb-4 flex justify-center">
            <div
              className="inline-flex items-center justify-center rounded-xl sm:rounded-2xl p-3 sm:p-4"
              style={{
                background: isPerfect
                  ? "linear-gradient(135deg, rgba(120, 67, 255, 0.5), rgba(97, 247, 255, 0.4))"
                  : isHighScore
                    ? "linear-gradient(135deg, rgba(34, 197, 94, 0.5), rgba(16, 185, 129, 0.4))"
                    : "linear-gradient(135deg, rgba(97, 247, 255, 0.4), rgba(29, 78, 255, 0.35))",
                border: `2px solid ${isPerfect ? "#9b7dff" : isHighScore ? "#4ade80" : colors.accent}`,
                boxShadow: isPerfect
                  ? "0 8px 32px rgba(120, 67, 255, 0.5), inset 0 2px 12px rgba(255, 255, 255, 0.15)"
                  : isHighScore
                    ? "0 8px 32px rgba(34, 197, 94, 0.5), inset 0 2px 12px rgba(255, 255, 255, 0.15)"
                    : `0 8px 32px ${colors.accent}60, inset 0 2px 12px rgba(255, 255, 255, 0.15)`,
                animation: "scaleIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both",
              }}
            >
              {isPerfect ? (
                <Sparkle
                  size={32}
                  weight="fill"
                  style={{
                    color: "#fff",
                    filter: "drop-shadow(0 2px 12px rgba(120, 67, 255, 0.8))",
                  }}
                />
              ) : (
                <Trophy
                  size={32}
                  weight="fill"
                  style={{
                    color: "#fff",
                    filter: `drop-shadow(0 2px 12px ${isHighScore ? "rgba(34, 197, 94, 0.8)" : colors.accent + "cc"})`,
                  }}
                />
              )}
            </div>
          </div>

          {/* Заголовок */}
          <h2
            className="relative z-10 text-center text-lg sm:text-xl font-bold mb-1"
            style={{
              color: "#fff",
              textShadow: "0 2px 16px rgba(0, 0, 0, 0.6), 0 4px 24px rgba(97, 247, 255, 0.3)",
            }}
          >
            {isPerfect ? "🎯 Perfect Score!" : isHighScore ? "🌟 Great Job!" : gameTitle}
          </h2>

          {isPerfect && (
            <p
              className="relative z-10 text-center text-xs sm:text-sm font-medium"
              style={{
                color: "rgba(255, 255, 255, 0.9)",
                textShadow: "0 1px 8px rgba(0, 0, 0, 0.4)",
              }}
            >
              Flawless execution!
            </p>
          )}
        </div>

        {/* Статистика */}
        <div className="space-y-2.5 sm:space-y-3 p-4 sm:p-6">
          {/* Score */}
          <div
            className="rounded-xl sm:rounded-2xl border p-3 sm:p-4"
            style={{
              background: "linear-gradient(135deg, rgba(16, 28, 52, 0.8), rgba(12, 22, 44, 0.9))",
              borderColor: colors.lineAccent,
              backdropFilter: "blur(12px)",
              boxShadow: `0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)`,
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div
                  className="flex h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 items-center justify-center rounded-lg sm:rounded-xl"
                  style={{
                    background: colors.gradientAccent,
                    boxShadow: `0 0 20px ${colors.accent}50, 0 4px 12px rgba(0, 0, 0, 0.3)`,
                  }}
                >
                  <Trophy size={18} weight="fill" style={{ color: "#fff" }} />
                </div>
                <div>
                  <p
                    className="text-[0.6rem] sm:text-[0.65rem] font-bold uppercase tracking-wider mb-0.5"
                    style={{ color: colors.textMuted }}
                  >
                    Score
                  </p>
                  <p
                    className="text-lg sm:text-xl font-bold"
                    style={{ color: "#fff", textShadow: `0 0 12px ${colors.accent}60` }}
                  >
                    +{score}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Accuracy */}
          <div
            className="rounded-xl sm:rounded-2xl border p-3 sm:p-4"
            style={{
              background: isHighScore
                ? "linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.15))"
                : "linear-gradient(135deg, rgba(16, 28, 52, 0.8), rgba(12, 22, 44, 0.9))",
              borderColor: isHighScore ? "rgba(34, 197, 94, 0.5)" : colors.lineSoft,
              backdropFilter: "blur(12px)",
              boxShadow: isHighScore
                ? "0 4px 16px rgba(34, 197, 94, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)"
                : "0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div
                  className="flex h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 items-center justify-center rounded-lg sm:rounded-xl"
                  style={{
                    background: isHighScore
                      ? "linear-gradient(135deg, rgba(34, 197, 94, 0.5), rgba(16, 185, 129, 0.4))"
                      : "linear-gradient(135deg, rgba(100, 116, 139, 0.4), rgba(71, 85, 105, 0.3))",
                    border: isHighScore
                      ? "1px solid rgba(34, 197, 94, 0.6)"
                      : "1px solid rgba(100, 116, 139, 0.4)",
                    boxShadow: isHighScore
                      ? "0 0 20px rgba(34, 197, 94, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)"
                      : "0 4px 12px rgba(0, 0, 0, 0.3)",
                  }}
                >
                  <Target
                    size={18}
                    weight="fill"
                    style={{ color: isHighScore ? "#fff" : colors.textMuted }}
                  />
                </div>
                <div>
                  <p
                    className="text-[0.6rem] sm:text-[0.65rem] font-bold uppercase tracking-wider mb-0.5"
                    style={{ color: colors.textMuted }}
                  >
                    Accuracy
                  </p>
                  <p
                    className="text-lg sm:text-xl font-bold"
                    style={{
                      color: isHighScore ? "#fff" : colors.textPrimary,
                      textShadow: isHighScore ? "0 0 12px rgba(34, 197, 94, 0.6)" : "none",
                    }}
                  >
                    {accuracy.toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Дополнительная статистика */}
          {totalQuestions !== undefined && correctAnswers !== undefined && (
            <div className="flex gap-2 text-center">
              <div
                className="flex-1 rounded-lg sm:rounded-xl border px-2.5 py-2 sm:px-3 sm:py-2.5"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(16, 28, 52, 0.7), rgba(12, 22, 44, 0.8))",
                  borderColor: colors.lineSoft,
                  boxShadow:
                    "0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.03)",
                }}
              >
                <p
                  className="text-base sm:text-lg font-bold mb-0.5"
                  style={{ color: colors.accent }}
                >
                  {correctAnswers}
                </p>
                <p
                  className="text-[0.6rem] sm:text-[0.65rem] uppercase tracking-wider font-bold"
                  style={{ color: colors.textMuted }}
                >
                  Correct
                </p>
              </div>
              <div
                className="flex-1 rounded-lg sm:rounded-xl border px-2.5 py-2 sm:px-3 sm:py-2.5"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(16, 28, 52, 0.7), rgba(12, 22, 44, 0.8))",
                  borderColor: colors.lineSoft,
                  boxShadow:
                    "0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.03)",
                }}
              >
                <p className="text-base sm:text-lg font-bold mb-0.5" style={{ color: "#fff" }}>
                  {totalQuestions}
                </p>
                <p
                  className="text-[0.6rem] sm:text-[0.65rem] uppercase tracking-wider font-bold"
                  style={{ color: colors.textMuted }}
                >
                  Total
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Кнопки действий */}
        <div className="space-y-2 sm:space-y-2.5 p-4 pt-0 sm:p-6 sm:pt-0">
          <button
            onClick={onPlayAgain}
            className="flex w-full items-center justify-center gap-2 rounded-xl sm:rounded-2xl border px-5 py-3 sm:px-6 sm:py-3.5 font-bold transition-all active:scale-95 hover:brightness-110"
            style={{
              background: colors.gradientAccent,
              borderColor: colors.accent,
              color: "#fff",
              boxShadow: `0 8px 24px ${colors.accent}50, 0 4px 12px rgba(0, 0, 0, 0.3)`,
              textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
            }}
          >
            <ArrowClockwise size={16} weight="bold" />
            <span className="text-sm sm:text-base">Play Again</span>
          </button>

          <button
            onClick={onBackToMenu}
            className="flex w-full items-center justify-center gap-2 rounded-xl sm:rounded-2xl border px-5 py-3 sm:px-6 sm:py-3.5 font-semibold transition-all active:scale-95 hover:brightness-110"
            style={{
              background: "linear-gradient(135deg, rgba(16, 28, 52, 0.8), rgba(12, 22, 44, 0.9))",
              borderColor: colors.lineSoft,
              color: colors.textPrimary,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
            }}
          >
            <House size={16} weight="bold" />
            <span className="text-sm sm:text-base">Back to Menu</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(40px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0) rotate(-180deg);
            opacity: 0;
          }
          to {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
}
