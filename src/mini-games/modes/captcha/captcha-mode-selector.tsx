"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { GridFour, Images, Sparkle } from "@phosphor-icons/react/dist/ssr";

import { useThemeColors } from "@/lib/max/use-theme-colors";
import { useMax } from "@/lib/max";
import { triggerHapticFeedback } from "@/lib/mini-games/core";

import type { CaptchaGameMode } from "./types";

export const CAPTCHA_MODE_STORAGE_KEY = "captcha-selected-mode";

interface CaptchaModeOption {
  id: CaptchaGameMode;
  title: string;
  tagline: string;
  icon: typeof GridFour;
  accentColor: string;
}

const MODE_OPTIONS: CaptchaModeOption[] = [
  {
    id: "sprites",
    title: "Sprite Hunt",
    tagline: "Find tiny objects in tiles",
    icon: GridFour,
    accentColor: "#61f7ff",
  },
  {
    id: "full-images",
    title: "Image Match",
    tagline: "Match complete pictures",
    icon: Images,
    accentColor: "#b67cff",
  },
];

interface CaptchaModeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (mode: CaptchaGameMode) => void;
  currentMode?: CaptchaGameMode | null;
}

export function CaptchaModeSelector({
  isOpen,
  onClose,
  onSelect,
  currentMode,
}: CaptchaModeSelectorProps) {
  const colors = useThemeColors();
  const { webApp } = useMax();
  const [activeTab, setActiveTab] = useState<CaptchaGameMode>(currentMode ?? "sprites");
  const [isSelecting, setIsSelecting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsSelecting(false);
      return;
    }

    if (typeof document !== "undefined") {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (currentMode) {
      setActiveTab(currentMode);
    }
  }, [currentMode]);

  const handleSelectMode = () => {
    const selected = MODE_OPTIONS.find((opt) => opt.id === activeTab);
    if (!selected) return;

    triggerHapticFeedback(webApp ?? undefined, "medium");
    setIsSelecting(true);

    setTimeout(() => {
      onSelect(selected.id);
      if (typeof window !== "undefined") {
        localStorage.setItem(CAPTCHA_MODE_STORAGE_KEY, selected.id);
        window.dispatchEvent(
          new CustomEvent<CaptchaGameMode>("captcha-mode-changed", { detail: selected.id })
        );
      }
      onClose();
    }, 300);
  };

  if (!isOpen) return null;

  const activeOption = MODE_OPTIONS.find((opt) => opt.id === activeTab) ?? MODE_OPTIONS[0];

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-2 sm:p-4"
      style={{
        zIndex: 2147483647,
        background: "rgba(0, 0, 0, 0.9)",
        backdropFilter: "blur(20px)",
      }}
    >
      <div
        className="w-full max-w-md max-h-[90vh] sm:max-h-[85vh] overflow-y-auto rounded-2xl sm:rounded-3xl border"
        style={{
          background: colors.panel,
          borderColor: colors.lineSoft,
        }}
      >
        {/* Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-5">
          <h2 className="text-lg font-bold sm:text-xl" style={{ color: colors.textPrimary }}>
            Choose Mode
          </h2>
          <p className="mt-1 text-xs sm:text-sm" style={{ color: colors.textSecondary }}>
            {activeOption.tagline}
          </p>
        </div>

        {/* Mode Tabs */}
        <div className="flex gap-2 px-5 pb-4 sm:px-6">
          {MODE_OPTIONS.map((option) => {
            const OptionIcon = option.icon;
            const isActive = activeTab === option.id;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  triggerHapticFeedback(webApp ?? undefined, "light");
                  setActiveTab(option.id);
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition-all active:scale-[0.97] sm:px-4 sm:py-3"
                style={{
                  background: isActive ? `${option.accentColor}15` : "transparent",
                  borderColor: isActive ? option.accentColor : colors.lineSubtle,
                  color: isActive ? option.accentColor : colors.textSecondary,
                }}
              >
                <OptionIcon size={18} weight={isActive ? "fill" : "regular"} />
                <span className="hidden sm:inline">{option.title}</span>
              </button>
            );
          })}
        </div>

        {/* Preview Grid */}
        <div className="relative overflow-hidden px-5 pb-5 sm:px-6 sm:pb-6">
          <div
            className="relative overflow-hidden rounded-2xl border p-2.5 transition-all duration-500 sm:p-3"
            style={{
              background: `linear-gradient(135deg, ${activeOption.accentColor}08, ${colors.panelMuted})`,
              borderColor: `${activeOption.accentColor}25`,
            }}
          >
            {/* Sprite Mode Preview - 3x3 grid with SVG objects as sprites */}
            {activeTab === "sprites" && (
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "rocket-0", sprite: "/captcha/objects/rocket/rocket.svg", isTarget: true },
                  { id: "alien-cat-1", sprite: "/captcha/objects/alien-cat/alien-cat.svg", isTarget: false },
                  { id: "rocket-2", sprite: "/captcha/objects/rocket/rocket.svg", isTarget: true },
                  { id: "crystal-3", sprite: "/captcha/objects/crystal/kristall.svg", isTarget: false },
                  { id: "rocket-4", sprite: "/captcha/objects/rocket/rocket.svg", isTarget: true },
                  { id: "repair-5", sprite: "/captcha/objects/repair-capsule/repair-capsule.svg", isTarget: false },
                  { id: "alien-grey-6", sprite: "/captcha/objects/alien-grey/alien-grey.svg", isTarget: false },
                  { id: "beacon-7", sprite: "/captcha/objects/beacon-drone/beacon-drone.svg", isTarget: false },
                  { id: "laser-8", sprite: "/captcha/objects/laser-sword/laser-sword.svg", isTarget: false },
                ].map((tile, idx) => (
                  <div
                    key={tile.id}
                    className="relative aspect-square overflow-hidden rounded-[16px]"
                    style={{
                      background: `radial-gradient(circle at 50% 50%, rgba(15, 25, 45, 0.95), rgba(5, 10, 20, 0.98))`,
                      boxShadow: tile.isTarget 
                        ? `0 0 20px ${activeOption.accentColor}50, inset 0 0 0 2.5px ${activeOption.accentColor}, inset 0 2px 10px ${activeOption.accentColor}20`
                        : `inset 0 0 0 1.5px rgba(97, 247, 255, 0.25), inset 0 1px 0 rgba(255,255,255,0.05)`,
                    }}
                  >
                    {/* Подложка для контраста */}
                    <div 
                      className="absolute inset-0"
                      style={{
                        background: `radial-gradient(circle at center, rgba(97, 247, 255, 0.08), transparent 60%)`,
                      }}
                    />
                    <Image
                      src={tile.sprite}
                      alt={tile.id}
                      fill
                      className="object-contain p-2"
                      style={{
                        filter: "drop-shadow(0 2px 8px rgba(97, 247, 255, 0.3))",
                      }}
                      sizes="100px"
                      priority={idx < 3}
                      loading={idx < 3 ? "eager" : "lazy"}
                      unoptimized
                    />
                    {tile.isTarget && (
                      <div
                        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold shadow-lg"
                        style={{
                          background: activeOption.accentColor,
                          color: colors.accentText,
                        }}
                      >
                        ✓
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Full Images Mode Preview - single image divided into 3x3 grid (like real reCAPTCHA) */}
            {activeTab === "full-images" && (
              <div className="relative">
                {/* Background full image */}
                <div className="absolute inset-0 overflow-hidden rounded-2xl">
                  <Image
                    src="/mock/mini-games/captcha/rovers.webp"
                    alt=""
                    fill
                    className="object-cover"
                    sizes="400px"
                    priority
                    loading="eager"
                  />
                </div>
                
                {/* Grid overlay */}
                <div className="relative grid grid-cols-3 gap-2">
                  {[
                    { row: 0, col: 0, isTarget: true },  // 0
                    { row: 0, col: 1, isTarget: false }, // 1
                    { row: 0, col: 2, isTarget: true },  // 2
                    { row: 1, col: 0, isTarget: true },  // 3
                    { row: 1, col: 1, isTarget: false }, // 4
                    { row: 1, col: 2, isTarget: false }, // 5
                    { row: 2, col: 0, isTarget: false }, // 6
                    { row: 2, col: 1, isTarget: false }, // 7
                    { row: 2, col: 2, isTarget: false }, // 8
                  ].map((tile, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square overflow-hidden rounded-[16px]"
                      style={{
                        background: "transparent",
                        boxShadow: tile.isTarget 
                          ? `0 0 20px ${activeOption.accentColor}50, inset 0 0 0 2.5px ${activeOption.accentColor}, inset 0 2px 10px ${activeOption.accentColor}20`
                          : `inset 0 0 0 1.5px rgba(97, 247, 255, 0.25), inset 0 1px 0 rgba(255,255,255,0.05)`,
                      }}
                    >
                      {tile.isTarget && (
                        <div
                          className="absolute right-1 top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold shadow-lg"
                          style={{
                            background: activeOption.accentColor,
                            color: colors.accentText,
                          }}
                        >
                          ✓
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Overlay hint */}
            <div
              className="absolute bottom-2 left-2 right-2 rounded-lg px-2.5 py-1.5 text-center backdrop-blur-sm sm:px-3 sm:py-2"
              style={{
                background: `${colors.panel}F5`,
                borderTop: `1px solid ${activeOption.accentColor}40`,
              }}
            >
              <p className="text-[10px] font-medium sm:text-xs" style={{ color: colors.textSecondary }}>
                <Sparkle size={11} weight="fill" style={{ display: "inline", color: activeOption.accentColor }} />{" "}
                {activeTab === "sprites" ? "Find tiny rocket sprites" : "Find rover vehicles"}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 sm:px-6 sm:pb-6">
          <button
            type="button"
            onClick={handleSelectMode}
            disabled={isSelecting}
            className="w-full rounded-2xl px-5 py-3.5 text-sm font-bold transition-all active:scale-[0.98] disabled:opacity-60 sm:text-base"
            style={{
              background: activeOption.accentColor,
              color: colors.accentText,
              boxShadow: `0 8px 24px ${activeOption.accentColor}40`,
            }}
          >
            {isSelecting ? "Starting..." : `Start ${activeOption.title}`}
          </button>
        </div>
      </div>
    </div>
  );
}

export function useCaptchaGameMode() {
  const [showModal, setShowModal] = useState(false);
  const [selectedMode, setSelectedMode] = useState<CaptchaGameMode | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const savedMode = localStorage.getItem(CAPTCHA_MODE_STORAGE_KEY) as CaptchaGameMode | null;
    if (savedMode && (savedMode === "sprites" || savedMode === "full-images")) {
      setSelectedMode(savedMode);
    } else {
      const timer = setTimeout(() => setShowModal(true), 400);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSelectMode = (mode: CaptchaGameMode) => {
    setSelectedMode(mode);
    setShowModal(false);
    if (typeof window !== "undefined") {
      localStorage.setItem(CAPTCHA_MODE_STORAGE_KEY, mode);
      window.dispatchEvent(
        new CustomEvent<CaptchaGameMode>("captcha-mode-changed", { detail: mode })
      );
    }
  };

  const openModeSelector = () => {
    setShowModal(true);
  };

  return {
    showModal,
    setShowModal,
    selectedMode,
    handleSelectMode,
    openModeSelector,
    isReady: selectedMode !== null,
  } as const;
}
