import { useCallback, useEffect, useRef, useState } from "react";

import { fetchDynamicChallenge } from "../api";
import type { CaptchaChallengeDefinition } from "../types";

export type UseChallengePrefetchParams = {
  challenges: readonly CaptchaChallengeDefinition[];
  currentIndex: number;
  enabled?: boolean;
  initialBatchSize?: number;
  concurrentRequests?: number;
  scopeKey?: string;
};

type ChallengeCache = Map<string, CaptchaChallengeDefinition>;

const globalChallengeCache: ChallengeCache = new Map();
const DEFAULT_SCOPE = "global";

const toGlobalCacheKey = (scope: string, challengeId: string) => `${scope}::${challengeId}`;

const DEFAULT_INITIAL_BATCH = 10;
const DEFAULT_CONCURRENCY = 3;
const BATCH_DELAY_MS = 200; // Увеличена задержка между батчами
const REQUEST_DELAY_MS = 300; // Задержка между отдельными запросами

export const useChallengePrefetch = ({
  challenges,
  currentIndex,
  enabled = false,
  initialBatchSize = DEFAULT_INITIAL_BATCH,
  concurrentRequests = DEFAULT_CONCURRENCY,
  scopeKey,
}: UseChallengePrefetchParams) => {
  const scope = scopeKey ?? DEFAULT_SCOPE;
  const cacheRef = useRef<ChallengeCache>(new Map());
  const inflightRef = useRef<Set<string>>(new Set());
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());
  const [, setVersion] = useState(0);
  const [isPreloading, setIsPreloading] = useState(false);
  const [initialised, setInitialised] = useState(false);
  const [resolvedConcurrency, setResolvedConcurrency] = useState(() =>
    Math.max(1, concurrentRequests),
  );
  const previousScopeRef = useRef(scope);

  const touch = useCallback(
    () => setVersion((prev) => (prev + 1) % Number.MAX_SAFE_INTEGER),
    [setVersion],
  );

  useEffect(() => {
    if (scope !== previousScopeRef.current) {
      previousScopeRef.current = scope;
      abortControllersRef.current.forEach((controller) => controller.abort());
      abortControllersRef.current.clear();
      inflightRef.current.clear();
      cacheRef.current.clear();
      setInitialised(false);
      setIsPreloading(false);
      touch();
    }
  }, [scope, touch]);

  useEffect(() => {
    if (cacheRef.current.size > 0 || challenges.length === 0) {
      return;
    }

    let populated = false;

    challenges.forEach((challenge) => {
      const cached = globalChallengeCache.get(toGlobalCacheKey(scope, challenge.id));
      if (cached) {
        cacheRef.current.set(challenge.id, cached);
        populated = true;
      }
    });

    if (populated) {
      touch();
      if (cacheRef.current.size >= Math.min(initialBatchSize, challenges.length)) {
        setInitialised(true);
        setIsPreloading(false);
      }
    }
  }, [challenges, initialBatchSize, scope, touch]);

  useEffect(() => {
    setResolvedConcurrency(Math.max(1, concurrentRequests));
  }, [concurrentRequests]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof navigator === "undefined") {
      return;
    }

    const connection = (
      navigator as unknown as {
        connection?: {
          effectiveType?: string;
          addEventListener?: (type: string, listener: () => void) => void;
          removeEventListener?: (type: string, listener: () => void) => void;
        };
      }
    ).connection;

    if (!connection) {
      return;
    }

    const handleChange = () => {
      const effectiveType = connection.effectiveType ?? "";
      if (effectiveType.includes("2g")) {
        setResolvedConcurrency(1);
        return;
      }

      if (effectiveType === "3g") {
        setResolvedConcurrency((current) =>
          Math.max(1, Math.min(current, Math.floor(concurrentRequests / 2))),
        );
        return;
      }

      setResolvedConcurrency(Math.max(1, concurrentRequests));
    };

    handleChange();

    connection.addEventListener?.("change", handleChange);
    return () => connection.removeEventListener?.("change", handleChange);
  }, [concurrentRequests]);

  const getCachedChallenge = useCallback(
    (challenge: CaptchaChallengeDefinition): CaptchaChallengeDefinition => {
      return cacheRef.current.get(challenge.id) ?? challenge;
    },
    [],
  );

  const hydrateChallenge = useCallback(
    async (challenge: CaptchaChallengeDefinition, silent = false) => {
      if (inflightRef.current.has(challenge.id) || cacheRef.current.has(challenge.id)) {
        return;
      }

      // Full-images челленджи уже готовы, не нужен API
      if (challenge.id.startsWith("full-image-challenge-")) {
        cacheRef.current.set(challenge.id, challenge);
        globalChallengeCache.set(toGlobalCacheKey(scope, challenge.id), challenge);
        touch();
        return;
      }

      const controller = new AbortController();
      abortControllersRef.current.set(challenge.id, controller);
      inflightRef.current.add(challenge.id);

      // Добавляем задержку перед запросом для снижения нагрузки
      await new Promise((resolve) => setTimeout(resolve, REQUEST_DELAY_MS));

      try {
        const dynamicChallenge = await fetchDynamicChallenge(
          challenge,
          challenge.metadata.seed ?? undefined,
          {
            signal: controller.signal,
          },
        );
        if (!controller.signal.aborted) {
          cacheRef.current.set(challenge.id, dynamicChallenge);
          globalChallengeCache.set(toGlobalCacheKey(scope, challenge.id), dynamicChallenge);
          touch();
        }
      } catch (error) {
        // Игнорируем ошибки abort и connection reset
        const isAbortError =
          controller.signal.aborted ||
          (error instanceof Error &&
            (error.message.includes("aborted") || error.message.includes("ECONNRESET")));
        if (!silent && !isAbortError) {
          console.warn(`Failed to prefetch captcha challenge ${challenge.id}`, error);
        }
      } finally {
        inflightRef.current.delete(challenge.id);
        abortControllersRef.current.delete(challenge.id);
      }
    },
    [scope, touch],
  );

  useEffect(() => {
    if (!enabled || challenges.length === 0 || initialised) {
      return;
    }

    let cancelled = false;

    const prefetchInitial = async () => {
      setIsPreloading(true);
      const total = Math.min(initialBatchSize, challenges.length);
      const concurrency = Math.max(1, resolvedConcurrency);

      for (let offset = 0; offset < total && !cancelled; offset += concurrency) {
        const slice = challenges.slice(offset, offset + concurrency);
        await Promise.all(slice.map((challenge) => hydrateChallenge(challenge, true)));

        if (offset + concurrency < total) {
          await new Promise((resolve) => {
            const timeout = window.setTimeout(resolve, BATCH_DELAY_MS);
            if (cancelled) {
              window.clearTimeout(timeout);
              resolve(undefined);
            }
          });
        }
      }

      if (!cancelled) {
        setInitialised(true);
        setIsPreloading(false);
      }
    };

    void prefetchInitial();

    const controllers = abortControllersRef.current;
    const inflight = inflightRef.current;

    return () => {
      cancelled = true;
      controllers.forEach((controller) => controller.abort());
      controllers.clear();
      inflight.clear();
    };
  }, [
    challenges,
    concurrentRequests,
    enabled,
    hydrateChallenge,
    initialBatchSize,
    initialised,
    scope,
    resolvedConcurrency,
  ]);

  useEffect(() => {
    if (!enabled || !initialised) {
      return;
    }

    const concurrency = Math.max(1, resolvedConcurrency);
    const nextIndex = currentIndex + concurrency + 2;
    const nextChallenge = challenges[nextIndex];
    if (nextChallenge) {
      void hydrateChallenge(nextChallenge, true);
    }
  }, [challenges, currentIndex, enabled, hydrateChallenge, initialised, resolvedConcurrency]);

  const cacheSnapshot = {
    size: cacheRef.current.size,
    has: (id: string) => cacheRef.current.has(id),
  };

  const progressTarget = Math.min(initialBatchSize, challenges.length);
  const normalizedTarget = progressTarget <= 0 ? 1 : progressTarget;
  const prefetchProgress =
    progressTarget <= 0 ? 1 : Math.min(1, cacheSnapshot.size / normalizedTarget);

  return {
    getCachedChallenge,
    isPreloading,
    initialLoadComplete: initialised,
    cacheSize: cacheSnapshot.size,
    totalChallenges: challenges.length,
    isCached: cacheSnapshot.has,
    ensurePrefetched: (challenge: CaptchaChallengeDefinition) => hydrateChallenge(challenge, true),
    prefetchProgress,
    prefetchedCount: cacheSnapshot.size,
    prefetchTarget: normalizedTarget,
  };
};
