/**
 * Utility functions for managing onboarding state
 */

const ONBOARDING_STORAGE_KEY = "satellite-onboarding-completed";

/**
 * Check if user has completed onboarding
 */
export function isOnboardingCompleted(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(ONBOARDING_STORAGE_KEY) === "true";
}

/**
 * Mark onboarding as completed
 */
export function completeOnboarding(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
}

/**
 * Reset onboarding (useful for testing or re-showing to users)
 */
export function resetOnboarding(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ONBOARDING_STORAGE_KEY);
}

/**
 * Add this to browser console to reset onboarding:
 * window.resetOnboarding()
 */
if (typeof window !== "undefined") {
  (window as Window & { resetOnboarding?: () => void }).resetOnboarding = resetOnboarding;
}
