"use client";

import { useEffect, useState } from "react";
import { X } from "@phosphor-icons/react/dist/ssr";
import type { IconProps } from "@phosphor-icons/react";

import { useThemeColors } from "@/src/max/use-theme-colors";
import { useMax } from "@/src/max/max-context"";
import { triggerHapticFeedback } from "@/lib/mini-games/core";

type GameMode = "astronaut-selection" | "captcha" | "constellation-memory";

export type GameRuleDescriptor = {
  icon: React.ComponentType<IconProps>;
  text: string;
};

export type GameRulesConfig = {
  title: string;
  description: string;
  icon: React.ComponentType<IconProps>;
  rules: GameRuleDescriptor[];
};

interface GameRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameMode: GameMode;
  config: GameRulesConfig;
}

const STORAGE_KEY_PREFIX = "mini-game-rules-shown-";

export function GameRulesModal({ isOpen, onClose, gameMode, config }: GameRulesModalProps) {
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

  const IconComponent = config.icon;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center sm:items-center sm:p-4"
      style={{
        background: "rgba(0, 0, 0, 0.8)",
        backdropFilter: "blur(12px)",
        opacity: isVisible ? 1 : 0,
        transition: "opacity 150ms ease-out",
        pointerEvents: isVisible ? "auto" : "none",
      }}
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-t-3xl border sm:rounded-3xl"
        style={{
          background: colors.panel,
          borderColor: colors.lineSoft,
          transform: isVisible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.98)",
          transition: "transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1)",
          maxHeight: "90vh",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative border-b px-5 py-4" style={{ borderColor: colors.lineSoft }}>
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full transition-all"
            style={{
              background: colors.panelMuted,
              color: colors.textMuted,
            }}
            aria-label="Close"
          >
            <X size={18} weight="bold" />
          </button>

          <div className="flex items-start gap-3 pr-10">
            <div
              className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl"
              style={{
                background: `${colors.accent}20`,
                color: colors.accent,
              }}
            >
              <IconComponent size={24} weight="duotone" />
            </div>
            <div className="flex-1 pt-1">
              <h3 className="text-lg font-bold leading-tight" style={{ color: colors.textPrimary }}>
                {config.title}
              </h3>
              <p className="mt-0.5 text-xs leading-relaxed" style={{ color: colors.textSecondary }}>
                {config.description}
              </p>
            </div>
          </div>
        </div>

        {/* Rules List */}
        <div className="max-h-[60vh] space-y-3 overflow-y-auto px-5 py-4 sm:max-h-[50vh]">
          {config.rules.map((rule, index) => {
            const RuleIcon = rule.icon;
            return (
              <div key={`${gameMode}-rule-${index}`} className="flex items-start gap-3">
                <div
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
                  style={{
                    background: `${colors.accent}15`,
                    color: colors.accent,
                  }}
                >
                  <RuleIcon size={18} weight="duotone" />
                </div>
                <div className="flex-1 pt-1.5">
                  <p className="text-sm leading-relaxed" style={{ color: colors.textSecondary }}>
                    {rule.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t px-5 py-4" style={{ borderColor: colors.lineSoft }}>
          <button
            type="button"
            onClick={handleClose}
            className="w-full rounded-xl px-4 py-3 text-sm font-bold transition-all active:scale-[0.98]"
            style={{
              background: colors.accent,
              color: colors.accentText,
            }}
          >
            Got it, let&apos;s go!
          </button>
        </div>
      </div>
    </div>
  );
}

export function useGameRules(gameMode: GameMode) {
  const [showRules, setShowRules] = useState(false);
  const [wasShown, setWasShown] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const shown = localStorage.getItem(`${STORAGE_KEY_PREFIX}${gameMode}`) === "true";
    setWasShown(shown);

    if (!shown) {
      const timer = setTimeout(() => setShowRules(true), 300);
      return () => clearTimeout(timer);
    }
  }, [gameMode]);

  return { showRules, setShowRules, wasShown } as const;
}

export function useGameRulesShown(gameMode: GameMode): boolean {
  const [shown, setShown] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const wasShown = localStorage.getItem(`${STORAGE_KEY_PREFIX}${gameMode}`) === "true";
    setShown(wasShown);
  }, [gameMode]);

  return shown;
}
