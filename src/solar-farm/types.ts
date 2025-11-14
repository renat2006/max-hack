// Solar Farm Types

export type TileType = "empty" | "foundation" | "panel";

export type PanelLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type GridPosition = {
  x: number;
  y: number;
};

export type PanelDefinition = {
  level: PanelLevel;
  name: string;
  description: string;
  energyPerHour: number;
  upgradeCost: number;
  sprite: string;
  unlockLevel?: number;
};

export type GridTile = {
  position: GridPosition;
  type: TileType;
  panelLevel?: PanelLevel;
  lastCollected?: number;
};

export type FarmState = {
  userId: string;
  tiles: GridTile[];
  totalEnergy: number;
  energyPerHour: number;
  lastUpdated: number;
};

export type SolarFarmConfig = {
  gridWidth: number;
  gridHeight: number;
  tileWidth: number;
  tileHeight: number;
  tileSpacing: number;
  maxRenderableLevel: PanelLevel;
  panels: Record<PanelLevel, PanelDefinition>;
};
