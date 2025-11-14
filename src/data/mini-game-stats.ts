import { getSqlClient } from "@/lib/db/postgres";

import type { MiniGameStats } from "../mini-games/types";
import { type MiniGameAggregateRow } from "./database-types";
import { logger } from "@/lib/utils/logger";

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

export const getMiniGameStats = async (): Promise<MiniGameStats[]> => {
  const sql = getSqlClient();
  await ensureSchema(sql);

  // Исправленный запрос: averageScore считается только по успешным попыткам
  // averageDuration извлекается из metadata.sessionSummary.durationMs
  const rows = await sql<MiniGameAggregateRow[]>`
    SELECT
      game_id,
      COUNT(*) AS total_attempts,
      COUNT(*) FILTER (WHERE event_type = 'success') AS total_success,
      COUNT(DISTINCT user_id) AS unique_players,
      -- Средний score только по успешным попыткам (не включая ошибки с score=0)
      AVG(score) FILTER (WHERE event_type = 'success' AND score > 0) AS average_score,
      -- Средняя длительность из metadata (в миллисекундах, конвертируем в секунды)
      AVG((metadata->'sessionSummary'->>'durationMs')::numeric / 1000.0) 
        FILTER (WHERE event_type = 'success' AND metadata->'sessionSummary'->>'durationMs' IS NOT NULL) 
        AS average_duration_seconds
    FROM progress_events
    WHERE game_id IS NOT NULL
    GROUP BY game_id
  `;

  const stats = rows
    .filter((row): row is MiniGameAggregateRow & { game_id: string } => Boolean(row.game_id))
    .map(
      (row): MiniGameStats => ({
        gameId: row.game_id!,
        totalAttempts: Number(row.total_attempts ?? 0),
        totalSuccess: Number(row.total_success ?? 0),
        uniquePlayers: Number(row.unique_players ?? 0),
        averageScore: Number(row.average_score ?? 0),
        averageDurationSeconds: row.average_duration_seconds
          ? Number(row.average_duration_seconds)
          : undefined,
      }),
    );

  logger.debug("[Mini-Game Stats]", {
    total_rows: rows.length,
    stats_count: stats.length,
    games: stats.map((s) => ({
      id: s.gameId,
      players: s.uniquePlayers,
      attempts: s.totalAttempts,
      avgScore: s.averageScore,
      avgDuration: s.averageDurationSeconds,
    })),
  });

  return stats;
};
