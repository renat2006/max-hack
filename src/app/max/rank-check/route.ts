import { NextRequest, NextResponse } from "next/server";
import { getSqlClient } from "@/lib/db/postgres";
import { sendNotification } from "@/lib/max/notification-service";
import { logger } from "@/lib/utils/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RankCheckResult = {
  userId: string;
  currentRank: number;
  previousRank: number | null;
  score: number;
  rankChanged: boolean;
  rankImproved: boolean;
};

const json = (body: unknown, init?: ResponseInit) =>
  NextResponse.json(body, {
    ...init,
    headers: {
      "Cache-Control": "no-store",
      ...(init?.headers ?? {}),
    },
  });

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return json({ error: "userId is required" }, { status: 400 });
    }

    const sql = getSqlClient();

    const [currentRankData] = await sql<Array<{ rank: number; score: number }>>`
      WITH ranked_users AS (
        SELECT 
          user_id,
          SUM(score) as total_score,
          ROW_NUMBER() OVER (ORDER BY SUM(score) DESC) as rank
        FROM progress_events
        WHERE event_type = 'success'
        GROUP BY user_id
      )
      SELECT rank::int, total_score::int as score
      FROM ranked_users
      WHERE user_id = ${userId}
    `;

    if (!currentRankData) {
      return json({ error: "User not found in rankings" }, { status: 404 });
    }

    const previousRankStr = await sql`
      SELECT metadata->>'lastKnownRank' as last_rank
      FROM progress_events
      WHERE user_id = ${userId}
      AND metadata ? 'lastKnownRank'
      ORDER BY created_at DESC
      LIMIT 1
    `.then((rows) => rows[0]?.last_rank);

    const previousRank = previousRankStr ? parseInt(previousRankStr, 10) : null;
    const rankChanged = previousRank !== null && previousRank !== currentRankData.rank;
    const rankImproved = rankChanged && currentRankData.rank < previousRank;

    if (rankImproved) {
      sendNotification({
        chatId: userId,
        type: "leaderboard_rank",
        params: {
          rank: currentRankData.rank,
          score: currentRankData.score,
        },
      }).catch((error) => logger.error("Rank notification failed", { error }));
    }

    const result: RankCheckResult = {
      userId,
      currentRank: currentRankData.rank,
      previousRank,
      score: currentRankData.score,
      rankChanged,
      rankImproved,
    };

    return json(result);
  } catch (error) {
    logger.error("Rank check failed", { error });
    return json({ error: "Failed to check rank" }, { status: 500 });
  }
}
