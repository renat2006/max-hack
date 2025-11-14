"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { OnboardingContextValue } from "./types";

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

interface OnboardingProviderProps {
  children: ReactNode;
  totalSlides: number;
  onComplete: () => void;
  onSkip?: () => void;
}

export function OnboardingProvider({
  children,
  totalSlides,
  onComplete,
  onSkip,
}: OnboardingProviderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const goToNextSlide = useCallback(() => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      onComplete();
    }
  }, [currentSlide, totalSlides, onComplete]);

  const goToPrevSlide = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  }, [currentSlide]);

  const goToSlide = useCallback(
    (index: number) => {
      if (index >= 0 && index < totalSlides) {
        setCurrentSlide(index);
      }
    },
    [totalSlides],
  );

  const skipOnboarding = useCallback(() => {
    if (onSkip) {
      onSkip();
    } else {
      onComplete();
    }
  }, [onSkip, onComplete]);

  const completeOnboarding = useCallback(() => {
    onComplete();
  }, [onComplete]);

  return (
    <OnboardingContext.Provider
      value={{
        currentSlide,
        totalSlides,
        goToNextSlide,
        goToPrevSlide,
        goToSlide,
        skipOnboarding,
        completeOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }
  return context;
}
