import { NextResponse } from "next/server";

import { getMiniGameStats } from "@/lib/data/mini-game-stats";

const json = (body: unknown, init?: ResponseInit) =>
  NextResponse.json(body, {
    ...init,
    headers: {
      "Cache-Control": "no-store",
      ...(init?.headers ?? {}),
    },
  });

export const runtime = "nodejs";

export async function GET() {
  try {
    // Добавляем таймаут для запроса к БД (30 секунд)
    const statsPromise = getMiniGameStats();
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Database query timeout")), 30000);
    });

    const stats = await Promise.race([statsPromise, timeoutPromise]);
    return json({ stats });
  } catch (error) {
    console.error("Failed to load mini-game stats", error);

    // Обработка специфичных ошибок
    if (error instanceof Error) {
      if (error.message.includes("timeout") || error.message.includes("ETIMEDOUT")) {
        return json(
          { error: "Database connection timeout. Please try again later." },
          { status: 504 },
        );
      }
    }

    return json({ error: "Unable to load mini-game stats" }, { status: 500 });
  }
}
