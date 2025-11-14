export enum EventType {
  Attempt = "attempt",
  Success = "success",
}

export enum GameStatus {
  Idle = "idle",
  Error = "error",
  Success = "success",
}

export interface ProgressEventMetadata {
  challengeId?: string;
  selected?: number[];
  missing?: number;
  extra?: number;
  totalCorrect?: number;
  errorType?: string | null;
  username?: string | null;
  fullName?: string | null;
  status?: string;
  sessionSummary?: {
    completedChallenges: number;
    totalChallenges: number;
    accuracyPercent: number;
    durationMs: number;
    totalScore: number;
  };
}

export interface ProgressEventRow {
  id: string;
  user_id: string;
  game_id: string | null;
  event_type: EventType;
  score: number;
  metadata: ProgressEventMetadata;
  created_at: Date;
}

export interface AggregateStatsRow {
  latest_score: number | string | null;
  total_success: number | string | null;
  total_attempts: number | string | null;
  weekly_success: number | string | null;
  last_success_at: Date | string | null;
  last_attempt_at: Date | string | null;
}

export interface SuccessDateRow {
  day: Date | string;
}

export interface LeaderboardUserRow {
  user_id: string;
  username: string | null;
  full_name: string | null;
  total_score: number | string;
  total_success: number | string;
  total_attempts: number | string;
  last_activity_at: Date | string | null;
}

export interface GameLeaderboardUserRow {
  user_id: string;
  username: string | null;
  full_name: string | null;
  best_score: number | string;
  total_attempts: number | string;
  success_count: number | string;
  last_played_at: Date | string | null;
}

export interface UserRankRow {
  rank: number | string;
}

export interface MiniGameAggregateRow {
  game_id: string | null;
  total_attempts: string | number | null;
  total_success: string | number | null;
  unique_players: string | number | null;
  average_score: string | number | null;
  average_duration_seconds?: string | number | null;
}
