import { NextRequest, NextResponse } from "next/server";

import { touchUserActivity } from "@/lib/data/user-repository";
import { getSolarFarmState, upsertSolarFarmState } from "@/lib/data/solar-farm-repository";
import { getProgressSummary } from "@/lib/data/progress-repository";
import { calculateEnergyPerHour, createEmptyFarm } from "@/lib/solar-farm/engine";
import { SOLAR_FARM_CONFIG } from "@/lib/solar-farm/config";
import type { FarmState, GridTile, PanelLevel } from "@/lib/solar-farm/types";

const json = (body: unknown, init?: ResponseInit) =>
  NextResponse.json(body, {
    ...init,
    headers: {
      "Cache-Control": "no-store",
      ...(init?.headers ?? {}),
    },
  });

const GRID_WIDTH = SOLAR_FARM_CONFIG.gridWidth;
const GRID_HEIGHT = SOLAR_FARM_CONFIG.gridHeight;

const isPanelLevel = (value: unknown): value is PanelLevel => {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 10;
};

const sanitizeTile = (tile: unknown): GridTile | null => {
  if (!tile || typeof tile !== "object") {
    return null;
  }

  const candidate = tile as {
    position?: { x?: unknown; y?: unknown };
    type?: unknown;
    panelLevel?: unknown;
    lastCollected?: unknown;
  };

  const position = candidate.position;
  const rawX = position?.x;
  const rawY = position?.y;
  if (typeof rawX !== "number" || typeof rawY !== "number") {
    return null;
  }

  const x = Math.trunc(rawX);
  const y = Math.trunc(rawY);
  if (x < 0 || y < 0 || x >= GRID_WIDTH || y >= GRID_HEIGHT) {
    return null;
  }

  const type =
    candidate.type === "foundation" || candidate.type === "panel" ? candidate.type : "empty";

  const tileState: GridTile = {
    position: { x, y },
    type,
  };

  if (type === "panel" && isPanelLevel(candidate.panelLevel)) {
    tileState.panelLevel = candidate.panelLevel;
  }

  if (typeof candidate.lastCollected === "number" && Number.isFinite(candidate.lastCollected)) {
    tileState.lastCollected = Math.max(0, Math.trunc(candidate.lastCollected));
  }

  return tileState;
};

const sanitizeFarmPayload = (payload: unknown): FarmState | null => {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const candidate = payload as {
    userId?: unknown;
    tiles?: unknown;
    totalEnergy?: unknown;
    energyPerHour?: unknown;
    lastUpdated?: unknown;
  };

  const userRaw = candidate.userId;
  const userId =
    typeof userRaw === "string" && userRaw.trim() !== ""
      ? userRaw.trim()
      : typeof userRaw === "number" && Number.isFinite(userRaw)
        ? String(Math.trunc(userRaw))
        : null;

  if (!userId) {
    return null;
  }

  const tilesInput = Array.isArray(candidate.tiles) ? candidate.tiles : [];
  const dedupedTiles = new Map<string, GridTile>();

  for (const entry of tilesInput) {
    const sanitized = sanitizeTile(entry);
    if (!sanitized) continue;
    const key = `${sanitized.position.x}:${sanitized.position.y}`;
    dedupedTiles.set(key, sanitized);
    if (dedupedTiles.size >= GRID_WIDTH * GRID_HEIGHT) {
      break;
    }
  }

  const tiles = Array.from(dedupedTiles.values());

  const totalEnergyValue = Number(candidate.totalEnergy);
  const totalEnergy = Number.isFinite(totalEnergyValue)
    ? Math.max(0, Math.trunc(totalEnergyValue))
    : 0;

  const lastUpdatedValue = Number(candidate.lastUpdated);
  const lastUpdated = Number.isFinite(lastUpdatedValue)
    ? Math.max(0, Math.trunc(lastUpdatedValue))
    : Date.now();

  const computedEnergyPerHour = Math.max(0, Math.round(calculateEnergyPerHour(tiles)));

  return {
    userId,
    tiles,
    totalEnergy,
    energyPerHour: computedEnergyPerHour,
    lastUpdated,
  } satisfies FarmState;
};

const normalizeUserId = (value: string | number): string => {
  return typeof value === "string" ? value : String(value);
};

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const userIdParam = request.nextUrl.searchParams.get("userId");

  if (!userIdParam) {
    return json({ error: "userId query parameter is required" }, { status: 400 });
  }

  const userId = normalizeUserId(userIdParam);

  try {
    await touchUserActivity({ userId });

    const [storedState, summary] = await Promise.all([
      getSolarFarmState(userId),
      getProgressSummary(userId).catch(() => null),
    ]);

    const canonicalState: FarmState = storedState ?? createEmptyFarm(userId);
    const summaryScore = summary?.score ?? 0;
    let shouldPersist = !storedState;

    if (canonicalState.totalEnergy < summaryScore) {
      canonicalState.totalEnergy = summaryScore;
      canonicalState.lastUpdated = Date.now();
      shouldPersist = true;
    }

    const computedEnergyPerHour = Math.max(
      0,
      Math.round(calculateEnergyPerHour(canonicalState.tiles)),
    );
    if (canonicalState.energyPerHour !== computedEnergyPerHour) {
      canonicalState.energyPerHour = computedEnergyPerHour;
      shouldPersist = true;
    }

    if (shouldPersist) {
      await upsertSolarFarmState(canonicalState);
    }

    return json({ farm: canonicalState });
  } catch (error) {
    console.error("Failed to fetch solar farm state", error);
    return json({ error: "Unable to fetch solar farm state" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const farmState = sanitizeFarmPayload(payload);
  if (!farmState) {
    return json({ error: "Invalid farm state" }, { status: 400 });
  }

  const now = Date.now();
  if (farmState.lastUpdated > now + 60_000) {
    farmState.lastUpdated = now;
  }

  try {
    await touchUserActivity({ userId: farmState.userId });
    await upsertSolarFarmState(farmState);
    return json({ ok: true });
  } catch (error) {
    console.error("Failed to persist solar farm state", error);
    return json({ error: "Unable to persist solar farm state" }, { status: 500 });
  }
}
