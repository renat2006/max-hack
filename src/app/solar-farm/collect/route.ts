import { NextRequest, NextResponse } from "next/server";

import { getSolarFarmState, upsertSolarFarmState } from "@/lib/data/solar-farm-repository";
import { saveProgressEvent, getProgressSummary } from "@/lib/data/progress-repository";
import { touchUserActivity } from "@/lib/data/user-repository";
import { calculateOfflineEnergy } from "@/lib/solar-farm/engine";
import { logger } from "@/lib/utils/logger";

const json = (body: unknown, init?: ResponseInit) =>
  NextResponse.json(body, {
    ...init,
    headers: {
      "Cache-Control": "no-store",
      ...(init?.headers ?? {}),
    },
  });

export const runtime = "nodejs";

const MIN_COLLECT_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

type CollectRequestBody = {
  userId: string | number;
};

export async function POST(request: NextRequest) {
  let body: CollectRequestBody;

  try {
    body = (await request.json()) as CollectRequestBody;
  } catch {
    return json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const { userId } = body;

  if (!userId) {
    return json({ error: "userId is required" }, { status: 400 });
  }

  const normalizedUserId = String(userId);

  try {
    // Ensure user exists
    await touchUserActivity({ userId: normalizedUserId });

    const farmState = await getSolarFarmState(normalizedUserId);

    if (!farmState) {
      return json({ error: "Solar farm not initialized" }, { status: 404 });
    }

    const currentTime = Date.now();
    const offlineEnergy = calculateOfflineEnergy(farmState, currentTime);

    // Check if enough time has passed (minimum 1 hour)
    const timeSinceLastUpdate = currentTime - farmState.lastUpdated;

    if (timeSinceLastUpdate < MIN_COLLECT_INTERVAL_MS) {
      return json({
        collected: 0,
        totalEnergy: farmState.totalEnergy,
        message: "Not enough time has passed since last collection",
        nextCollectIn: MIN_COLLECT_INTERVAL_MS - timeSinceLastUpdate,
      });
    }

    if (offlineEnergy <= 0) {
      return json({
        collected: 0,
        totalEnergy: farmState.totalEnergy,
        message: "No energy to collect",
      });
    }

    // Update farm state with collected energy
    const updatedFarmState = {
      ...farmState,
      totalEnergy: farmState.totalEnergy + offlineEnergy,
      lastUpdated: currentTime,
    };

    await upsertSolarFarmState(updatedFarmState);

    // Record passive income as a progress event
    await saveProgressEvent({
      userId: normalizedUserId,
      challengeId: "solar-farm-passive-income",
      gameId: "solar-farm",
      status: "success",
      score: offlineEnergy,
      selected: [],
      missing: 0,
      extra: 0,
      totalCorrect: 0,
      sessionSummary: {
        completedChallenges: 1,
        totalChallenges: 1,
        accuracyPercent: 100,
        durationMs: timeSinceLastUpdate,
        totalScore: offlineEnergy,
      },
    });

    // Get updated summary
    const summary = await getProgressSummary(normalizedUserId);

    logger.debug("[Solar Farm Passive Income Collected]", {
      user_id: normalizedUserId,
      collected_energy: offlineEnergy,
      offline_hours: (timeSinceLastUpdate / (1000 * 60 * 60)).toFixed(2),
      energy_per_hour: farmState.energyPerHour,
      new_total: updatedFarmState.totalEnergy,
      cumulative_score: summary.score,
    });

    return json({
      collected: offlineEnergy,
      totalEnergy: updatedFarmState.totalEnergy,
      offlineHours: timeSinceLastUpdate / (1000 * 60 * 60),
      energyPerHour: farmState.energyPerHour,
      cumulativeScore: summary.score,
    });
  } catch (error) {
    logger.error("Failed to collect offline energy", { error });
    return json({ error: "Failed to collect energy" }, { status: 500 });
  }
}

// GET endpoint to check available energy without collecting
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");

  if (!userId) {
    return json({ error: "userId query parameter is required" }, { status: 400 });
  }

  try {
    const farmState = await getSolarFarmState(userId);

    if (!farmState) {
      return json({
        available: 0,
        canCollect: false,
        message: "Solar farm not initialized",
      });
    }

    const currentTime = Date.now();
    const offlineEnergy = calculateOfflineEnergy(farmState, currentTime);
    const timeSinceLastUpdate = currentTime - farmState.lastUpdated;
    const canCollect = timeSinceLastUpdate >= MIN_COLLECT_INTERVAL_MS && offlineEnergy > 0;

    return json({
      available: offlineEnergy,
      canCollect,
      offlineHours: timeSinceLastUpdate / (1000 * 60 * 60),
      energyPerHour: farmState.energyPerHour,
      nextCollectIn: canCollect ? 0 : Math.max(0, MIN_COLLECT_INTERVAL_MS - timeSinceLastUpdate),
      lastUpdated: farmState.lastUpdated,
    });
  } catch (error) {
    logger.error("Failed to check available energy", { error });
    return json({ error: "Failed to check energy" }, { status: 500 });
  }
}
