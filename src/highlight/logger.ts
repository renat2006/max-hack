"use client";

import { H } from "@highlight-run/next/client";

import {
  highlightBaseMetadata,
  isHighlightEnabled,
  type HighlightMetadata,
  type HighlightMetadataValue,
} from "./config";

export type HighlightLogLevel = "debug" | "info" | "warn" | "error";

type NormalizedMetadata = Record<string, string | number | boolean | undefined>;

const normalizeMetadataValue = (
  value: HighlightMetadataValue,
): NormalizedMetadata[keyof NormalizedMetadata] => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return "null";
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.length ? JSON.stringify(value) : "[]";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return value;
};

const buildMetadataPayload = (metadata?: HighlightMetadata): NormalizedMetadata => {
  const normalized: NormalizedMetadata = { ...highlightBaseMetadata };

  if (!metadata) {
    return normalized;
  }

  for (const [key, value] of Object.entries(metadata)) {
    const normalizedValue = normalizeMetadataValue(value);

    if (normalizedValue !== undefined) {
      normalized[key] = normalizedValue;
    }
  }

  return normalized;
};

const ensureError = (error: unknown) => {
  if (error instanceof Error) {
    return error;
  }

  if (typeof error === "string") {
    return new Error(error);
  }

  return new Error("Unknown error");
};

const isDevelopment = process.env.NODE_ENV === "development";

export const recordHighlightLog = (
  message: string,
  level: HighlightLogLevel = "info",
  metadata?: HighlightMetadata,
) => {
  const payload = buildMetadataPayload(metadata);

  if (!isHighlightEnabled()) {
    if (isDevelopment) {
      const consoleMethod =
        level === "error"
          ? "error"
          : level === "warn"
            ? "warn"
            : level === "debug"
              ? "debug"
              : "log";
      console[consoleMethod](`[highlight:${level}] ${message}`, payload);
    }
    return;
  }

  H.log(message, level, payload);
};

export const reportHighlightError = (
  error: unknown,
  context?: HighlightMetadata & { source?: string; hint?: string },
) => {
  const { source, hint, ...rest } = context ?? {};
  const payload = buildMetadataPayload(rest as HighlightMetadata);

  if (!isHighlightEnabled()) {
    if (isDevelopment) {
      console.error("[highlight:error]", error, { source, hint, ...payload });
    }
    return;
  }

  const normalized = ensureError(error);
  H.consume(normalized, {
    message: hint ?? normalized.message,
    payload,
    source: source ?? "app",
    type: "React.ErrorBoundary",
  });
};
