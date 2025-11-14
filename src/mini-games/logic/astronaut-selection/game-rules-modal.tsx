"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle, Lightning, Eye, Target } from "@phosphor-icons/react/dist/ssr";
import { useThemeColors } from "@/src/max/use-theme-colors";
import { useMax } from "@/src/max/max-context"";
import { triggerHapticFeedback } from "@/lib/mini-games/core";

interface GameRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameMode: "astronaut-selection" | "captcha";
}

const STORAGE_KEY_PREFIX = "mini-game-rules-shown-";

// Лаконичные правила для каждой игры с иконками
const GAME_RULES = {
  "astronaut-selection": {
    title: "Astronaut Selection",
    icon: Target,
    rules: [
      { icon: Eye, text: "Review candidate profiles carefully" },
      { icon: CheckCircle, text: "Check if they match ALL requirements" },
      { icon: CheckCircle, text: "Approve those who fit, Reject those who don't" },
      { icon: Lightning, text: "Correct: +3 sec • Wrong: -7 sec" },
      { icon: Target, text: "Rules change every 5 candidates" },
    ],
  },
  captcha: {
    title: "Image Captcha",
    icon: Target,
    rules: [
      { icon: Eye, text: "Read the challenge text carefully" },
      { icon: CheckCircle, text: "Select ALL tiles matching the description" },
      { icon: X, text: "Wrong selections reduce your score" },
      { icon: Target, text: "Complete challenges to progress" },
      { icon: Lightning, text: "Speed matters - faster = better score" },
    ],
  },
} as const;

export function GameRulesModal({ isOpen, onClose, gameMode }: GameRulesModalProps) {
  const colors = useThemeColors();
  const { webApp } = useMax();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    triggerHapticFeedback(webApp ?? undefined, "light");
    setIsVisible(false);
    setTimeout(() => {
      onClose();
      if (typeof window !== "undefined") {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}${gameMode}`, "true");
      }
    }, 150);
  };

  if (!isOpen) return null;

  const gameRules = GAME_RULES[gameMode];
  const IconComponent = gameRules.icon;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{
        background: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(8px)",
        opacity: isVisible ? 1 : 0,
        transition: "opacity 150ms ease-out",
        pointerEvents: isVisible ? "auto" : "none",
      }}
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border shadow-2xl"
        style={{
          background: colors.panel,
          borderColor: colors.lineSoft,
          transform: isVisible ? "scale(1)" : "scale(0.95)",
          transition: "transform 150ms ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="border-b px-6 py-5"
          style={{
            borderColor: colors.lineSoft,
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{
                  background: `${colors.accent}20`,
                  color: colors.accent,
                }}
              >
                <IconComponent size={24} weight="duotone" />
              </div>
              <div>
                <h3 className="text-lg font-bold" style={{ color: colors.textPrimary }}>
                  {gameRules.title}
                </h3>
                <p className="text-xs" style={{ color: colors.textSecondary }}>
                  Game Rules
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 hover:bg-opacity-80"
              style={{
                background: colors.panelMuted,
                color: colors.textMuted,
              }}
            >
              <X size={18} weight="bold" />
            </button>
          </div>
        </div>

        {/* Rules List */}
        <div className="space-y-3 px-6 py-5">
          {gameRules.rules.map((rule, index) => {
            const RuleIcon = rule.icon;
            return (
              <div key={index} className="flex gap-3 items-start">
                <div
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                  style={{
                    background: `${colors.accent}15`,
                    color: colors.accent,
                  }}
                >
                  <RuleIcon size={16} weight="duotone" />
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-sm leading-relaxed" style={{ color: colors.textSecondary }}>
                    {rule.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Button */}
        <div className="border-t p-5" style={{ borderColor: colors.lineSoft }}>
          <button
            type="button"
            onClick={handleClose}
            className="w-full rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200 active:scale-95"
            style={{
              background: colors.accent,
              color: colors.accentText,
            }}
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}

// Хук для автоматического показа правил при первом запуске
export function useGameRules(gameMode: "astronaut-selection" | "captcha") {
  const [showRules, setShowRules] = useState(false);
  const [wasShown, setWasShown] = useState(true); // По умолчанию true чтобы не мигало

  useEffect(() => {
    if (typeof window !== "undefined") {
      const shown = localStorage.getItem(`${STORAGE_KEY_PREFIX}${gameMode}`) === "true";
      setWasShown(shown);

      // Показываем правила если еще не показывали
      if (!shown) {
        const timer = setTimeout(() => {
          setShowRules(true);
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [gameMode]);

  return { showRules, setShowRules, wasShown };
}

// Хук для проверки показывались ли правила (оставляем для совместимости)
export function useGameRulesShown(gameMode: "astronaut-selection" | "captcha"): boolean {
  const [shown, setShown] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const wasShown = localStorage.getItem(`${STORAGE_KEY_PREFIX}${gameMode}`) === "true";
      setShown(wasShown);
    }
  }, [gameMode]);

  return shown;
}
