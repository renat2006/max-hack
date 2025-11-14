import type { FarmState, GridPosition, GridTile } from "./types";
import { SOLAR_FARM_CONFIG, PANEL_CATALOG, MAX_OFFLINE_HOURS } from "./config";

export const cartesianToIso = (x: number, y: number): { isoX: number; isoY: number } => {
  const spacing = SOLAR_FARM_CONFIG.tileSpacing;
  const halfWidth = SOLAR_FARM_CONFIG.tileWidth / 2 + spacing;
  const halfHeight = SOLAR_FARM_CONFIG.tileHeight / 2 + spacing / 2;

  const isoX = (x - y) * halfWidth;
  const isoY = (x + y) * halfHeight;
  return { isoX, isoY };
};

export const isoToCartesian = (isoX: number, isoY: number): GridPosition => {
  const spacing = SOLAR_FARM_CONFIG.tileSpacing;
  const halfWidth = SOLAR_FARM_CONFIG.tileWidth / 2 + spacing;
  const halfHeight = SOLAR_FARM_CONFIG.tileHeight / 2 + spacing / 2;

  const x = Math.floor((isoX / halfWidth + isoY / halfHeight) / 2);
  const y = Math.floor((isoY / halfHeight - isoX / halfWidth) / 2);
  return { x, y };
};

export const calculateEnergyPerHour = (tiles: GridTile[]): number => {
  return tiles.reduce((total, tile) => {
    if (tile.type === "panel" && tile.panelLevel) {
      const panel = PANEL_CATALOG[tile.panelLevel];
      return total + (panel?.energyPerHour ?? 0);
    }
    return total;
  }, 0);
};

export const calculateOfflineEnergy = (farmState: FarmState, currentTime: number): number => {
  const elapsedMs = currentTime - farmState.lastUpdated;
  const elapsedHours = Math.min(elapsedMs / (1000 * 60 * 60), MAX_OFFLINE_HOURS);
  return Math.floor(farmState.energyPerHour * elapsedHours);
};

export const createEmptyFarm = (userId: string): FarmState => {
  const tiles: GridTile[] = [];

  for (let y = 0; y < SOLAR_FARM_CONFIG.gridHeight; y++) {
    for (let x = 0; x < SOLAR_FARM_CONFIG.gridWidth; x++) {
      tiles.push({
        position: { x, y },
        type: "empty",
      });
    }
  }

  return {
    userId,
    tiles,
    totalEnergy: 0,
    energyPerHour: 0,
    lastUpdated: Date.now(),
  };
};

export const getTileAt = (farmState: FarmState, position: GridPosition): GridTile | undefined => {
  return farmState.tiles.find(
    (tile) => tile.position.x === position.x && tile.position.y === position.y,
  );
};

export const updateTile = (
  farmState: FarmState,
  position: GridPosition,
  updates: Partial<GridTile>,
): FarmState => {
  const tiles = farmState.tiles.map((tile) =>
    tile.position.x === position.x && tile.position.y === position.y
      ? { ...tile, ...updates }
      : tile,
  );

  const energyPerHour = calculateEnergyPerHour(tiles);

  return {
    ...farmState,
    tiles,
    energyPerHour,
    lastUpdated: Date.now(),
  };
};

export const canAffordUpgrade = (currentEnergy: number, cost: number): boolean => {
  return currentEnergy >= cost;
};

export const getUpgradeCost = (currentLevel: number | undefined): number => {
  if (!currentLevel) return 0;
  const nextLevel = (currentLevel + 1) as keyof typeof PANEL_CATALOG;
  return PANEL_CATALOG[nextLevel]?.upgradeCost ?? 0;
};
