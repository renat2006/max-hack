import { NextResponse } from "next/server";

import { getGameLeaderboard } from "@/lib/data/leaderboard-repository";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ gameId: string }> }) {
  try {
    const { gameId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get("limit")) || 50;

    const leaderboard = await getGameLeaderboard(gameId, Math.min(limit, 100));

    return NextResponse.json({ gameId, leaderboard, count: leaderboard.length });
  } catch (error) {
    console.error("Failed to fetch game leaderboard:", error);

    return NextResponse.json({ error: "Failed to fetch game leaderboard" }, { status: 500 });
  }
}
