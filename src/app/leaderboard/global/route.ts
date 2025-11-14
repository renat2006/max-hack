import { NextResponse } from "next/server";

import { getGlobalLeaderboard } from "@/lib/data/leaderboard-repository";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get("limit")) || 50;

    const leaderboard = await getGlobalLeaderboard(Math.min(limit, 100));

    return NextResponse.json({ leaderboard, count: leaderboard.length });
  } catch (error) {
    console.error("Failed to fetch global leaderboard:", error);

    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}
