import { getSqlClient } from "@/lib/db/postgres";

import type { ProgressEventInput, ProgressSummary } from "./progress-types";
import {
  EventType,
  type AggregateStatsRow,
  type ProgressEventMetadata,
  type SuccessDateRow,
} from "./database-types";

export type { ProgressEventInput, ProgressSummary } from "./progress-types";

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

const mapStatusToEventType = (status: string): EventType => {
  return status === EventType.Success ? EventType.Success : EventType.Attempt;
};

export const saveProgressEvent = async (input: ProgressEventInput): Promise<void> => {
  const sql = getSqlClient();
  await ensureSchema(sql);

  const eventType = mapStatusToEventType(input.status);

  const metadata: ProgressEventMetadata = {
    challengeId: input.challengeId,
    selected: input.selected,
    missing: input.missing,
    extra: input.extra,
    totalCorrect: input.totalCorrect,
    errorType: input.errorType,
    username: input.username,
    fullName: input.fullName,
    status: input.status,
    sessionSummary: input.sessionSummary,
  };

  await sql`
    INSERT INTO progress_events (
      user_id,
      game_id,
      event_type,
      score,
      metadata
    ) VALUES (
      ${input.userId},
      ${input.gameId ?? null},
      ${eventType},
      ${input.score},
      ${sql.json(metadata as never)}
    )
  `;
};

const computeStreakFromDates = (dates: readonly string[]): number => {
  if (dates.length === 0) {
    return 0;
  }

  const dateSet = new Set(dates);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  let streak = 0;
  const cursor = new Date(today);

  while (true) {
    const isoDay = cursor.toISOString().slice(0, 10);
    if (!dateSet.has(isoDay)) {
      break;
    }

    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return streak;
};

const normaliseIsoDate = (value: Date | string): string | null => {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  if (/^\d{4}-\d{2}-\d{2}$/u.test(value)) {
    return value;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString().slice(0, 10);
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

const MAX_ACCURACY_PERCENT = 100;

export const getProgressSummary = async (userId: string): Promise<ProgressSummary> => {
  const sql = getSqlClient();
  await ensureSchema(sql);

  const [aggregate] = await sql<AggregateStatsRow[]>`
    SELECT
      SUM(score) AS latest_score,
      COUNT(*) FILTER (WHERE event_type = 'success') AS total_success,
      COUNT(*) AS total_attempts,
      COUNT(*) FILTER (WHERE event_type = 'success' AND created_at >= timezone('utc', now()) - interval '7 days') AS weekly_success,
      MAX(created_at) FILTER (WHERE event_type = 'success') AS last_success_at,
      MAX(created_at) AS last_attempt_at
    FROM progress_events
    WHERE user_id = ${userId}
  `;

  const successDates = await sql<SuccessDateRow[]>`
    SELECT DISTINCT date(created_at) AS day
    FROM progress_events
    WHERE user_id = ${userId} AND event_type = 'success'
    ORDER BY day DESC
    LIMIT 32
  `;

  const streakDays = computeStreakFromDates(
    successDates
      .map((entry) => normaliseIsoDate(entry.day))
      .filter((day): day is string => Boolean(day)),
  );

  const totalAttempts = Number(aggregate?.total_attempts ?? 0);
  const totalSuccess = Number(aggregate?.total_success ?? 0);
  const weeklySuccess = Number(aggregate?.weekly_success ?? 0);

  const accuracyPercent =
    totalAttempts === 0
      ? 0
      : Math.min(MAX_ACCURACY_PERCENT, Math.round((totalSuccess / totalAttempts) * 100));

  return {
    score: Number(aggregate?.latest_score ?? 0),
    totalAttempts,
    totalSuccess,
    weeklySuccess,
    accuracyPercent,
    streakDays,
    lastSuccessAt: toIsoTimestamp(aggregate?.last_success_at ?? null),
    lastAttemptAt: toIsoTimestamp(aggregate?.last_attempt_at ?? null),
  };
};
