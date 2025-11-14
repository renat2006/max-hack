// Core Mini-Game Engine
// Единая система для всех мини-игр: очки, прогресс, обратная связь

export type MiniGameStatus = "idle" | "playing" | "success" | "failure" | "completed";

export type MiniGameScore = {
  current: number;
  max: number;
  multiplier: number;
};

export type MiniGameProgress = {
  currentStep: number;
  totalSteps: number;
  correctAnswers: number;
  totalAnswers: number;
  accuracy: number;
};

export type MiniGameFeedback = {
  type: "success" | "error" | "warning" | "info";
  message: string;
  duration?: number;
};

export type MiniGameVibration = "light" | "medium" | "heavy" | "success" | "error" | "warning";

export interface IMiniGameEngine {
  status: MiniGameStatus;
  score: MiniGameScore;
  progress: MiniGameProgress;

  start(): void;
  reset(): void;
  complete(): void;

  calculateScore(correct: boolean): number;
  updateProgress(correct: boolean): void;

  triggerVibration(type: MiniGameVibration): void;
  showFeedback(feedback: MiniGameFeedback): void;
}

// Базовый класс для всех мини-игр
export abstract class MiniGameEngine implements IMiniGameEngine {
  status: MiniGameStatus = "idle";
  score: MiniGameScore = { current: 0, max: 0, multiplier: 1 };
  progress: MiniGameProgress = {
    currentStep: 0,
    totalSteps: 0,
    correctAnswers: 0,
    totalAnswers: 0,
    accuracy: 0,
  };

  protected baseScore: number;
  protected perCorrectScore: number;
  protected onVibration?: (type: MiniGameVibration) => void;
  protected onFeedback?: (feedback: MiniGameFeedback) => void;

  constructor(config: {
    baseScore: number;
    perCorrectScore: number;
    totalSteps: number;
    onVibration?: (type: MiniGameVibration) => void;
    onFeedback?: (feedback: MiniGameFeedback) => void;
  }) {
    this.baseScore = config.baseScore;
    this.perCorrectScore = config.perCorrectScore;
    this.progress.totalSteps = config.totalSteps;
    this.onVibration = config.onVibration;
    this.onFeedback = config.onFeedback;
  }

  start(): void {
    this.status = "playing";
    this.score = { current: 0, max: this.baseScore * this.progress.totalSteps, multiplier: 1 };
    this.progress = {
      ...this.progress,
      currentStep: 0,
      correctAnswers: 0,
      totalAnswers: 0,
      accuracy: 0,
    };
  }

  reset(): void {
    this.status = "idle";
    this.start();
  }

  complete(): void {
    this.status = "completed";
    this.calculateFinalScore();
  }

  calculateScore(correct: boolean): number {
    if (!correct) return 0;
    return this.perCorrectScore * this.score.multiplier;
  }

  updateProgress(correct: boolean): void {
    this.progress.totalAnswers++;
    if (correct) {
      this.progress.correctAnswers++;
    }
    this.progress.currentStep++;
    this.progress.accuracy =
      this.progress.totalAnswers > 0
        ? (this.progress.correctAnswers / this.progress.totalAnswers) * 100
        : 0;

    const earnedScore = this.calculateScore(correct);
    this.score.current += earnedScore;
  }

  triggerVibration(type: MiniGameVibration): void {
    this.onVibration?.(type);
  }

  showFeedback(feedback: MiniGameFeedback): void {
    this.onFeedback?.(feedback);
  }

  protected calculateFinalScore(): void {
    // Бонус за высокую точность
    if (this.progress.accuracy >= 90) {
      this.score.current += this.baseScore;
    } else if (this.progress.accuracy >= 70) {
      this.score.current += Math.floor(this.baseScore * 0.5);
    }
  }

  abstract validate(answer: unknown): boolean;
}
