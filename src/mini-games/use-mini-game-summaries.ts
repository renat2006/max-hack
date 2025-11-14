import { useEffect, useMemo, useState } from "react";

import { mapMiniGameToSummary, listMiniGames } from "./catalog";
import type { MiniGameStats, MiniGameSummary } from "./types";

type StatsResponse = {
  stats: MiniGameStats[];
};

export const useMiniGameSummaries = () => {
  const [stats, setStats] = useState<Record<string, MiniGameStats>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/mini-games/stats", {
          headers: { "Cache-Control": "no-store" },
        });

        if (!response.ok) {
          throw new Error(`Failed to load mini-game stats: ${response.status}`);
        }

        const body = (await response.json()) as StatsResponse;
        if (!isMounted) {
          return;
        }

        const record = body.stats.reduce<Record<string, MiniGameStats>>((acc, entry) => {
          acc[entry.gameId] = entry;
          return acc;
        }, {});
        setStats(record);
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error("Unknown error"));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void fetchStats();

    return () => {
      isMounted = false;
    };
  }, []);

  const summaries = useMemo<MiniGameSummary[]>(() => {
    return listMiniGames().map((game) => mapMiniGameToSummary(game, stats[game.id]));
  }, [stats]);

  return { summaries, loading, error };
};
