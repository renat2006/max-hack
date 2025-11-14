export interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<OnboardingSlideProps>;
}

export interface OnboardingSlideProps {
  isActive: boolean;
  direction: "next" | "prev" | null;
}

export interface OnboardingContextValue {
  currentSlide: number;
  totalSlides: number;
  goToNextSlide: () => void;
  goToPrevSlide: () => void;
  goToSlide: (index: number) => void;
  skipOnboarding: () => void;
  completeOnboarding: () => void;
}
