import { NextRequest, NextResponse } from "next/server";
import { sendBatchNotifications } from "@/src/max/notification-service";
import { getSqlClient } from "@/lib/db/postgres";
import { logger } from "@/lib/utils/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sql = getSqlClient();

    const inactiveUsers = await sql<Array<{ user_id: string }>>`
      SELECT DISTINCT user_id
      FROM progress_events
      WHERE created_at < NOW() - INTERVAL '24 hours'
      AND user_id NOT IN (
        SELECT DISTINCT user_id 
        FROM progress_events 
        WHERE created_at > NOW() - INTERVAL '24 hours'
      )
      LIMIT 100
    `;

    const notifications = inactiveUsers.map((user) => ({
      chatId: user.user_id,
      type: "daily_reminder" as const,
    }));

    await sendBatchNotifications(notifications);

    logger.info("Daily reminders sent", { count: notifications.length });

    return NextResponse.json({
      success: true,
      sent: notifications.length,
    });
  } catch (error) {
    logger.error("Failed to send daily reminders", { error });
    return NextResponse.json({ error: "Failed to send reminders" }, { status: 500 });
  }
}
