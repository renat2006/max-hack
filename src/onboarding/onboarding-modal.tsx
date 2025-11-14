"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { ArrowLeft, ArrowRight, X } from "@phosphor-icons/react/dist/ssr";

import { useThemeColors } from "@/lib/max/use-theme-colors";

import { OnboardingProvider } from "./onboarding-context";
import { PaginationDots } from "./components/pagination-dots";
import { AppSectionsSlide } from "./slides/app-sections-slide";
import { AstronautGameSlide } from "./slides/astronaut-game-slide";
import { CaptchaGameSlide } from "./slides/captcha-game-slide";
import { MiniGamesSlide } from "./slides/mini-games-slide";
import { PointsSystemSlide } from "./slides/points-system-slide";
import { SolarFarmSlide } from "./slides/solar-farm-slide";
import { WelcomeSlide } from "./slides/welcome-slide";
import { completeOnboarding, isOnboardingCompleted } from "./utils";

const SLIDES = [
  WelcomeSlide,
  PointsSystemSlide,
  MiniGamesSlide,
  CaptchaGameSlide,
  AstronautGameSlide,
  SolarFarmSlide,
  AppSectionsSlide,
];

export function OnboardingModal() {
  const colors = useThemeColors();
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setIsMounted(true);
    if (!isOnboardingCompleted()) {
      setIsOpen(true);
    }
  }, []);

  useEffect(() => {
    if (!isOpen || typeof document === "undefined") {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setDirection("next");
      setCurrentSlide((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setDirection("prev");
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    completeOnboarding();
    setIsOpen(false);
  };

  const handleDotClick = (index: number) => {
    setDirection(index > currentSlide ? "next" : "prev");
    setCurrentSlide(index);
  };

  if (!isMounted || !isOpen) {
    return null;
  }

  const modal = (
    <OnboardingProvider totalSlides={SLIDES.length} onComplete={handleComplete} onSkip={handleSkip}>
      <div
        className="fixed inset-0 flex flex-col"
        style={{
          zIndex: 2147483647,
          background: colors.canvas,
        }}
      >
        <div
          className="flex h-full w-full max-w-4xl mx-auto flex-col overflow-hidden"
          style={{
            padding: "16px",
          }}
        >
          <div className="flex shrink-0 items-center justify-between pb-4">
            <div className="w-9" />
            <PaginationDots
              total={SLIDES.length}
              current={currentSlide}
              onDotClick={handleDotClick}
            />
            <button
              onClick={handleComplete}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors hover:opacity-80"
              style={{
                color: colors.textMuted,
                background: colors.panelMuted,
              }}
              aria-label="Close onboarding"
            >
              <X size={18} weight="bold" />
            </button>
          </div>

          <div className="relative min-h-0 flex-1">
            {SLIDES.map((SlideComponent, index) => (
              <div
                key={index}
                className="absolute inset-0"
                style={{ pointerEvents: index === currentSlide ? "auto" : "none" }}
              >
                <SlideComponent isActive={index === currentSlide} direction={direction} />
              </div>
            ))}
          </div>

          <div className="flex shrink-0 items-center justify-between gap-3 pt-3">
            <button
              onClick={handlePrev}
              disabled={currentSlide === 0}
              className="flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
              style={{
                background: colors.panelMuted,
                color: colors.textPrimary,
              }}
              aria-label="Previous slide"
            >
              <ArrowLeft size={18} weight="bold" />
              Back
            </button>

            <div
              className="text-xs sm:text-sm font-medium tabular-nums"
              style={{ color: colors.textSecondary }}
            >
              {currentSlide + 1} / {SLIDES.length}
            </div>

            <button
              onClick={handleNext}
              className="flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition-all active:scale-95"
              style={{
                background: colors.accent,
                color: colors.accentText,
              }}
              aria-label={currentSlide === SLIDES.length - 1 ? "Complete onboarding" : "Next slide"}
            >
              {currentSlide === SLIDES.length - 1 ? "Let's go!" : "Next"}
              {currentSlide < SLIDES.length - 1 && <ArrowRight size={18} weight="bold" />}
            </button>
          </div>
        </div>
      </div>
    </OnboardingProvider>
  );

  return createPortal(modal, document.body);
}
