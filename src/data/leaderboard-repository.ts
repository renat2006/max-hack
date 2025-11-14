import { getSqlClient } from "@/lib/db/postgres";

import {
  type GameLeaderboardUserRow,
  type LeaderboardUserRow,
  type UserRankRow,
} from "./database-types";

export type LeaderboardEntry = {
  userId: string;
  username: string | null;
  fullName: string | null;
  totalScore: number;
  totalSuccess: number;
  totalAttempts: number;
  rank: number;
  accuracyPercent: number;
  lastActivityAt: string | null;
};

export type GameLeaderboardEntry = {
  userId: string;
  username: string | null;
  fullName: string | null;
  bestScore: number;
  totalAttempts: number;
  successCount: number;
  rank: number;
  lastPlayedAt: string | null;
};

type SqlClient = ReturnType<typeof getSqlClient>;

let schemaReady: Promise<void> | null = null;

const ensureSchema = async (sql: SqlClient): Promise<void> => {
  if (!schemaReady) {
    schemaReady = (async () => {
      try {
        await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`;

        await sql`
          CREATE TABLE IF NOT EXISTS progress_events (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id text NOT NULL,
            game_id text,
            event_type text NOT NULL CHECK (event_type IN ('attempt', 'success')),
            score integer DEFAULT 0,
            metadata jsonb DEFAULT '{}'::jsonb,
            created_at timestamptz DEFAULT NOW()
          )
        `;

        // Создаём индексы с игнорированием ошибок если уже существуют
        try {
          await sql`CREATE INDEX IF NOT EXISTS idx_progress_events_user_id ON progress_events(user_id)`;
        } catch {
          // Index already exists
        }
        try {
          await sql`CREATE INDEX IF NOT EXISTS idx_progress_events_created_at ON progress_events(created_at)`;
        } catch {
          // Index already exists
        }
        try {
          await sql`CREATE INDEX IF NOT EXISTS idx_progress_events_game_id ON progress_events(game_id)`;
        } catch {
          // Index already exists
        }
      } catch (error) {
        schemaReady = null;
        throw error;
      }
    })();
  }

  await schemaReady;
};

const toIsoTimestamp = (value: Date | string | null): string | null => {
  if (!value) {
    return null;
  }

  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString();
};

const DEFAULT_LEADERBOARD_LIMIT = 50;

export const getGlobalLeaderboard = async (
  limit: number = DEFAULT_LEADERBOARD_LIMIT,
): Promise<LeaderboardEntry[]> => {
  const sql = getSqlClient();
  await ensureSchema(sql);

  const rows = await sql<LeaderboardUserRow[]>`
    SELECT
      user_id,
      MAX((metadata->>'username')::text) as username,
      MAX((metadata->>'fullName')::text) as full_name,
      SUM(score) as total_score,
      COUNT(*) FILTER (WHERE event_type = 'success') as total_success,
      COUNT(*) as total_attempts,
      MAX(created_at) as last_activity_at
    FROM progress_events
    GROUP BY user_id
    ORDER BY total_score DESC, total_success DESC
    LIMIT ${limit}
  `;

  return rows.map((row, index): LeaderboardEntry => {
    const totalAttempts = Number(row.total_attempts);
    const totalSuccess = Number(row.total_success);
    const accuracyPercent =
      totalAttempts === 0 ? 0 : Math.round((totalSuccess / totalAttempts) * 100);

    return {
      userId: row.user_id,
      username: row.username,
      fullName: row.full_name,
      totalScore: Number(row.total_score),
      totalSuccess,
      totalAttempts,
      rank: index + 1,
      accuracyPercent,
      lastActivityAt: toIsoTimestamp(row.last_activity_at),
    };
  });
};

export const getGameLeaderboard = async (
  gameId: string,
  limit: number = DEFAULT_LEADERBOARD_LIMIT,
): Promise<GameLeaderboardEntry[]> => {
  const sql = getSqlClient();
  await ensureSchema(sql);

  const rows = await sql<GameLeaderboardUserRow[]>`
    SELECT
      user_id,
      MAX((metadata->>'username')::text) as username,
      MAX((metadata->>'fullName')::text) as full_name,
      MAX(score) as best_score,
      COUNT(*) as total_attempts,
      COUNT(*) FILTER (WHERE event_type = 'success') as success_count,
      MAX(created_at) as last_played_at
    FROM progress_events
    WHERE game_id = ${gameId}
    GROUP BY user_id
    ORDER BY best_score DESC, success_count DESC
    LIMIT ${limit}
  `;

  return rows.map(
    (row, index): GameLeaderboardEntry => ({
      userId: row.user_id,
      username: row.username,
      fullName: row.full_name,
      bestScore: Number(row.best_score),
      totalAttempts: Number(row.total_attempts),
      successCount: Number(row.success_count),
      rank: index + 1,
      lastPlayedAt: toIsoTimestamp(row.last_played_at),
    }),
  );
};

export const getUserRank = async (userId: string): Promise<number> => {
  const sql = getSqlClient();
  await ensureSchema(sql);

  const [result] = await sql<UserRankRow[]>`
    WITH user_scores AS (
      SELECT
        user_id,
        SUM(score) as total_score,
        COUNT(*) FILTER (WHERE event_type = 'success') as total_success
      FROM progress_events
      GROUP BY user_id
    ),
    ranked AS (
      SELECT
        user_id,
        ROW_NUMBER() OVER (ORDER BY total_score DESC, total_success DESC) as rank
      FROM user_scores
    )
    SELECT rank
    FROM ranked
    WHERE user_id = ${userId}
  `;

  return result ? Number(result.rank) : 0;
};
