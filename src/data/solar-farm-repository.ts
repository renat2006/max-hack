import { getSqlClient } from "@/lib/db/postgres";
import type { FarmState, GridTile } from "@/lib/solar-farm/types";

const DEFAULT_LAST_UPDATED = () => new Date().toISOString();

type SqlClient = ReturnType<typeof getSqlClient>;

type SolarFarmRow = {
  user_id: string;
  grid: unknown;
  total_energy: number;
  energy_per_hour: number;
  last_collected_at: Date | string | null;
  last_updated_at: Date | string | null;
};

let schemaReady: Promise<void> | null = null;

const ensureSchema = async (sql: SqlClient): Promise<void> => {
  if (!schemaReady) {
    schemaReady = (async () => {
      try {
        await sql`
          CREATE TABLE IF NOT EXISTS solar_farm_state (
            user_id TEXT PRIMARY KEY,
            grid JSONB NOT NULL,
            total_energy INTEGER NOT NULL DEFAULT 0,
            energy_per_hour INTEGER NOT NULL DEFAULT 0,
            last_collected_at TIMESTAMPTZ,
            last_updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
            created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
          )
        `;

        await sql`CREATE INDEX IF NOT EXISTS idx_solar_farm_state_updated_at ON solar_farm_state(updated_at DESC)`;
      } catch (error) {
        schemaReady = null;
        throw error;
      }
    })();
  }

  await schemaReady;
};

const parseGrid = (grid: unknown): GridTile[] => {
  if (!Array.isArray(grid)) {
    return [];
  }

  const tiles: GridTile[] = [];

  for (const entry of grid) {
    if (!entry || typeof entry !== "object") {
      continue;
    }

    const cast = entry as Partial<GridTile> & { position?: { x: number; y: number } };
    if (
      !cast.position ||
      typeof cast.position.x !== "number" ||
      typeof cast.position.y !== "number"
    ) {
      continue;
    }

    const tile: GridTile = {
      position: {
        x: Math.max(0, Math.trunc(cast.position.x)),
        y: Math.max(0, Math.trunc(cast.position.y)),
      },
      type: cast.type === "foundation" || cast.type === "panel" ? cast.type : "empty",
    };

    if (typeof cast.panelLevel === "number") {
      tile.panelLevel = cast.panelLevel as GridTile["panelLevel"];
    }
    if (typeof cast.lastCollected === "number") {
      tile.lastCollected = cast.lastCollected;
    }

    tiles.push(tile);
  }

  return tiles;
};

const toMillis = (value: Date | string | null | undefined): number => {
  if (!value) {
    return Date.now();
  }
  const parsed = value instanceof Date ? value : new Date(value);
  const time = parsed.getTime();
  return Number.isNaN(time) ? Date.now() : time;
};

export const getSolarFarmState = async (userId: string): Promise<FarmState | null> => {
  const sql = getSqlClient();
  await ensureSchema(sql);

  const rows = await sql<SolarFarmRow[]>`
    SELECT user_id, grid, total_energy, energy_per_hour, last_collected_at, last_updated_at
    FROM solar_farm_state
    WHERE user_id = ${userId}
    LIMIT 1
  `;

  const row = rows[0];
  if (!row) {
    return null;
  }

  const tiles = parseGrid(row.grid);
  const lastUpdated = toMillis(row.last_updated_at ?? row.last_collected_at ?? null);

  return {
    userId: row.user_id,
    tiles,
    totalEnergy: row.total_energy ?? 0,
    energyPerHour: row.energy_per_hour ?? 0,
    lastUpdated,
  } satisfies FarmState;
};

export const upsertSolarFarmState = async (state: FarmState): Promise<void> => {
  if (!state.userId) {
    throw new Error("userId is required to persist solar farm state");
  }

  const sql = getSqlClient();
  await ensureSchema(sql);

  const now = sql`timezone('utc', now())`;
  const lastUpdatedAt = state.lastUpdated
    ? new Date(state.lastUpdated).toISOString()
    : DEFAULT_LAST_UPDATED();

  await sql`
    INSERT INTO solar_farm_state (
      user_id,
      grid,
      total_energy,
      energy_per_hour,
      last_collected_at,
      last_updated_at,
      updated_at
    ) VALUES (
      ${state.userId},
      ${sql.json(state.tiles as never)},
      ${state.totalEnergy},
      ${state.energyPerHour},
      ${lastUpdatedAt},
      ${lastUpdatedAt},
      ${now}
    )
    ON CONFLICT (user_id) DO UPDATE SET
      grid = EXCLUDED.grid,
      total_energy = EXCLUDED.total_energy,
      energy_per_hour = EXCLUDED.energy_per_hour,
      last_collected_at = EXCLUDED.last_collected_at,
      last_updated_at = EXCLUDED.last_updated_at,
      updated_at = ${now}
  `;
};
