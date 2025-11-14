import { NextRequest, NextResponse } from "next/server";

import { getProgressSummary, saveProgressEvent } from "@/lib/data/progress-repository";
import { getSolarFarmState, upsertSolarFarmState } from "@/lib/data/solar-farm-repository";
import { logger } from "@/lib/utils/logger";
import { sendNotification } from "@/lib/max/notification-service";
import { createEmptyFarm } from "@/lib/solar-farm/engine";
import { touchUserActivity } from "@/lib/data/user-repository";

// Дедупликация запросов (React Strict Mode вызывает дважды в dev)
const recentRequests = new Map<string, number>();
const DEDUP_WINDOW_MS = 1000; // 1 секунда

const isDuplicateRequest = (userId: string, challengeId: string, score: number): boolean => {
  const key = `${userId}:${challengeId}:${score}`;
  const now = Date.now();
  const lastTime = recentRequests.get(key);

  if (lastTime && now - lastTime < DEDUP_WINDOW_MS) {
    return true;
  }

  recentRequests.set(key, now);

  // Очистка старых записей
  if (recentRequests.size > 1000) {
    const cutoff = now - DEDUP_WINDOW_MS;
    for (const [k, time] of recentRequests.entries()) {
      if (time < cutoff) {
        recentRequests.delete(k);
      }
    }
  }

  return false;
};

type ProgressRequestBody = {
  userId: number | string;
  gameId?: string | null;
  challengeId: string;
  status: string;
  score: number;
  selected: unknown;
  missing: number;
  extra: number;
  totalCorrect: number;
  errorType?: string;
  username?: string | null;
  fullName?: string | null;
  sessionSummary?: {
    completedChallenges: number;
    totalChallenges: number;
    accuracyPercent: number;
    durationMs: number;
    totalScore: number;
  } | null;
};

const toInt = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.trunc(value);
  }

  if (typeof value === "bigint") {
    return Number(value);
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return Math.trunc(parsed);
    }
  }

  return 0;
};

const toNonNegativeInt = (value: unknown): number => {
  return Math.max(0, toInt(value));
};

const sanitizeSelectedCells = (values: unknown): number[] => {
  if (!Array.isArray(values)) {
    return [];
  }

  const uniqueCells = new Set<number>();
  for (const entry of values) {
    const cell = toNonNegativeInt(entry);
    if (cell >= 0) {
      uniqueCells.add(cell);
    }
  }

  return Array.from(uniqueCells);
};

const formatDuration = (ms: number): string => {
  if (!Number.isFinite(ms) || ms <= 0) {
    return "--";
  }

  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const hours = Math.floor(minutes / 60);
  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m ${seconds.toString().padStart(2, "0")}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
  }
  return `${seconds}s`;
};

const json = (body: unknown, init?: ResponseInit) =>
  NextResponse.json(body, {
    ...init,
    headers: {
      "Cache-Control": "no-store",
      ...(init?.headers ?? {}),
    },
  });

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let body: ProgressRequestBody;

  try {
    body = (await request.json()) as ProgressRequestBody;
  } catch {
    return json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const {
    userId,
    challengeId,
    gameId,
    status,
    score,
    selected,
    missing,
    extra,
    totalCorrect,
    errorType,
    username,
    fullName,
    sessionSummary,
  } = body;

  if (!userId || !challengeId || typeof status !== "string" || typeof score !== "number") {
    return json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!Number.isFinite(score)) {
    return json({ error: "Score must be a finite number" }, { status: 400 });
  }

  const normalizedUserId = String(userId);
  const sanitizedScore = toInt(score);
  const normalizedGameId = typeof gameId === "string" && gameId.trim() !== "" ? gameId : null;

  // Дедупликация (React Strict Mode в dev)
  if (isDuplicateRequest(normalizedUserId, challengeId, sanitizedScore)) {
    logger.debug("[Duplicate request ignored]", {
      user_id: normalizedUserId,
      challenge_id: challengeId,
      score: sanitizedScore,
    });
    return json({ ok: true, deduplicated: true });
  }

  const sanitizedSelected = sanitizeSelectedCells(selected);
  const sanitizedMissing = toNonNegativeInt(missing);
  const sanitizedExtra = toNonNegativeInt(extra);
  const sanitizedTotalCorrect = toNonNegativeInt(totalCorrect);
  const sanitizedSessionSummary = sessionSummary
    ? {
        completedChallenges: toNonNegativeInt(sessionSummary.completedChallenges),
        totalChallenges: toNonNegativeInt(sessionSummary.totalChallenges),
        accuracyPercent: Math.min(
          100,
          Math.max(0, toNonNegativeInt(sessionSummary.accuracyPercent)),
        ),
        durationMs: Math.max(0, toInt(sessionSummary.durationMs)),
        totalScore: toInt(sessionSummary.totalScore),
      }
    : null;

  try {
    await saveProgressEvent({
      userId: normalizedUserId,
      challengeId,
      gameId: normalizedGameId,
      status,
      score: sanitizedScore,
      selected: sanitizedSelected,
      missing: sanitizedMissing,
      extra: sanitizedExtra,
      totalCorrect: sanitizedTotalCorrect,
      errorType: errorType ?? undefined,
      username: username ?? null,
      fullName: fullName ?? null,
      sessionSummary: sanitizedSessionSummary ?? undefined,
    });

    logger.debug("[Progress Event Saved]", {
      user_id: normalizedUserId,
      game_id: gameId,
      challenge_id: challengeId,
      status,
      score: sanitizedScore,
    });

    if (status === "success" && sanitizedScore > 0) {
      const summary = await getProgressSummary(normalizedUserId);
      const isDev = process.env.NODE_ENV === "development";

      // Keep solar farm energy in sync with cumulative score
      try {
        await touchUserActivity({ userId: normalizedUserId });
        const currentFarm = await getSolarFarmState(normalizedUserId);
        const canonicalFarm = currentFarm ?? createEmptyFarm(normalizedUserId);

        if (canonicalFarm.totalEnergy < summary.score) {
          canonicalFarm.totalEnergy = summary.score;
          canonicalFarm.lastUpdated = Date.now();
          await upsertSolarFarmState(canonicalFarm);
        }
      } catch (error) {
        logger.error("Failed to sync solar farm energy", { error });
      }

      logger.debug("[Checking notifications]", {
        totalSuccess: summary.totalSuccess,
        totalScore: summary.score,
        currentScore: sanitizedScore,
        isDev,
      });

      const isFirstGame = summary.totalSuccess === 1;
      const shouldNotifyMilestone = [10, 50, 100, 250, 500, 1000].includes(summary.score);

      // В проде: уведомление каждые 3 успеха (полное прохождение игры)
      const isGameComplete = summary.totalSuccess % 3 === 0;

      const notificationParams: Record<string, string | number> = {
        score: sanitizedScore,
        totalScore: summary.score,
        totalGames: summary.totalSuccess,
      };

      if (normalizedGameId) {
        notificationParams.gameId = normalizedGameId;
      }

      let messageOverride: string | undefined;

      if (sanitizedSessionSummary) {
        notificationParams.accuracyPercent = sanitizedSessionSummary.accuracyPercent;
        notificationParams.accuracy = sanitizedSessionSummary.accuracyPercent;
        notificationParams.duration = formatDuration(sanitizedSessionSummary.durationMs);
        notificationParams.durationMs = sanitizedSessionSummary.durationMs;
        notificationParams.completionTime = Math.floor(sanitizedSessionSummary.durationMs / 1000);

        if (normalizedGameId === "decision-tree-builder") {
          notificationParams.approvedCandidates = sanitizedSessionSummary.completedChallenges;
          notificationParams.reviewedCandidates = sanitizedSessionSummary.totalChallenges;
          messageOverride = [
            "Mission evaluation complete!",
            "Score: +{score} pts (total {totalScore})",
            "Approved: {approvedCandidates}/{reviewedCandidates}",
            "Accuracy: {accuracyPercent}%",
            "Duration: {duration}",
          ].join("\n");
        } else {
          notificationParams.levelsCleared = sanitizedSessionSummary.completedChallenges;
          notificationParams.framesCleared = sanitizedSessionSummary.completedChallenges;
          messageOverride = [
            "Telemetry stabilized!",
            "Score: +{score} pts (total {totalScore})",
            "Frames Cleared: {levelsCleared}",
            "Accuracy: {accuracyPercent}%",
            "Solve Time: {duration}",
          ].join("\n");
        }
      } else {
        notificationParams.accuracyPercent = summary.accuracyPercent;
        notificationParams.accuracy = summary.accuracyPercent;
        notificationParams.duration = "--";
        notificationParams.durationMs = 0;
        notificationParams.completionTime = 0;

        if (normalizedGameId === "decision-tree-builder") {
          messageOverride = [
            "Mission evaluation complete!",
            "Score: +{score} pts (total {totalScore})",
            "Runs logged: {totalGames}",
            "Accuracy: {accuracyPercent}%",
          ].join("\n");
        }
      }

      if (isFirstGame) {
        logger.debug("[Sending first_game notification]", { userId: normalizedUserId });
        sendNotification({
          chatId: normalizedUserId,
          type: "first_game",
          params: { score: sanitizedScore },
        }).catch((error) => logger.error("Notification failed", { error }));
      } else if (isDev) {
        // В dev режиме отправляем уведомление после каждого успешного челленджа
        logger.debug("[Sending game_complete notification (dev only)]", {
          userId: normalizedUserId,
        });
        sendNotification({
          chatId: normalizedUserId,
          type: "game_complete",
          params: notificationParams,
          messageOverride,
        }).catch((error) => logger.error("Notification failed", { error }));
      } else if (isGameComplete && !isFirstGame) {
        // В проде отправляем уведомление после прохождения всех 3 челленджей
        logger.debug("[Sending game_complete notification (prod - full game)]", {
          userId: normalizedUserId,
          totalSuccess: summary.totalSuccess,
        });
        sendNotification({
          chatId: normalizedUserId,
          type: "game_complete",
          params: notificationParams,
          messageOverride,
        }).catch((error) => logger.error("Notification failed", { error }));
      }

      if (shouldNotifyMilestone && summary.score > sanitizedScore) {
        logger.debug("[Sending score_milestone notification]", {
          userId: normalizedUserId,
          milestone: summary.score,
        });
        sendNotification({
          chatId: normalizedUserId,
          type: "score_milestone",
          params: {
            totalScore: summary.score,
          },
        }).catch((error) => logger.error("Notification failed", { error }));
      }
    }
  } catch (error) {
    console.error("Failed to persist progress event", error);
    return json({ error: "Unable to persist progress" }, { status: 500 });
  }

  // Возвращаем быстрый ответ без ожидания summary
  // Клиент сам запросит summary когда понадобится
  return json({ ok: true });
}

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");

  if (!userId) {
    return json({ error: "userId query parameter is required" }, { status: 400 });
  }

  try {
    const summary = await getProgressSummary(userId);
    return json({ summary });
  } catch (error) {
    console.error("Failed to fetch progress summary", error);
    return json({ error: "Unable to fetch progress" }, { status: 500 });
  }
}
