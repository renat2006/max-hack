import { NextRequest, NextResponse } from "next/server";

import { createEmptyFarm } from "@/lib/solar-farm/engine";
import { getSolarFarmState, upsertSolarFarmState } from "@/lib/data/solar-farm-repository";
import { touchUserActivity } from "@/lib/data/user-repository";

const json = (body: unknown, init?: ResponseInit) =>
  NextResponse.json(body, {
    ...init,
    headers: {
      "Cache-Control": "no-store",
      ...(init?.headers ?? {}),
    },
  });

const normalizeUserId = (value: unknown): string | null => {
  if (typeof value === "string" && value.trim() !== "") {
    return value.trim();
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(Math.trunc(value));
  }

  return null;
};

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  if (!payload || typeof payload !== "object") {
    return json({ error: "Payload must be an object" }, { status: 400 });
  }

  const candidate = payload as { userId?: unknown };
  const normalizedUserId = normalizeUserId(candidate.userId ?? null);

  if (!normalizedUserId) {
    return json({ error: "userId is required" }, { status: 400 });
  }

  try {
    await touchUserActivity({ userId: normalizedUserId });

    const existingState = await getSolarFarmState(normalizedUserId);

    if (existingState) {
      return json({ farm: existingState });
    }

    const farm = createEmptyFarm(normalizedUserId);
    await upsertSolarFarmState(farm);

    return json({ farm });
  } catch (error) {
    console.error("Failed to initialize solar farm state", error);
    return json({ error: "Unable to initialize solar farm state" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const userIdParam = request.nextUrl.searchParams.get("userId");
  const normalizedUserId = normalizeUserId(userIdParam);

  if (!normalizedUserId) {
    return json({ error: "userId query parameter is required" }, { status: 400 });
  }

  try {
    await touchUserActivity({ userId: normalizedUserId });

    const state = await getSolarFarmState(normalizedUserId);
    if (!state) {
      return json({ error: "Solar farm state not found" }, { status: 404 });
    }

    return json({ farm: state });
  } catch (error) {
    console.error("Failed to fetch solar farm state", error);
    return json({ error: "Unable to fetch solar farm state" }, { status: 500 });
  }
}
