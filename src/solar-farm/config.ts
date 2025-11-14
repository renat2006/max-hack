import type { PanelDefinition, PanelLevel, SolarFarmConfig } from "./types";

export const PANEL_CATALOG: Record<PanelLevel, PanelDefinition> = {
  1: {
    level: 1,
    name: "Basic Solar Panel",
    description: "Entry-level solar collector",
    energyPerHour: 10,
    upgradeCost: 0,
    sprite: "panel-lv1",
  },
  2: {
    level: 2,
    name: "Improved Panel",
    description: "Enhanced efficiency cells",
    energyPerHour: 25,
    upgradeCost: 100,
    sprite: "panel-lv2",
  },
  3: {
    level: 3,
    name: "Advanced Panel",
    description: "High-tech solar array",
    energyPerHour: 50,
    upgradeCost: 250,
    sprite: "panel-lv3",
  },
  4: {
    level: 4,
    name: "Quantum Panel",
    description: "Quantum-enhanced energy",
    energyPerHour: 100,
    upgradeCost: 500,
    sprite: "panel-lv4",
    unlockLevel: 3,
  },
  5: {
    level: 5,
    name: "Stellar Panel",
    description: "Star-powered collector",
    energyPerHour: 200,
    upgradeCost: 1000,
    sprite: "panel-lv5",
    unlockLevel: 5,
  },
  6: {
    level: 6,
    name: "Fusion Array",
    description: "Fusion energy technology",
    energyPerHour: 400,
    upgradeCost: 2500,
    sprite: "panel-lv6",
    unlockLevel: 8,
  },
  7: {
    level: 7,
    name: "Antimatter Collector",
    description: "Harnesses antimatter",
    energyPerHour: 800,
    upgradeCost: 5000,
    sprite: "panel-lv7",
    unlockLevel: 12,
  },
  8: {
    level: 8,
    name: "Dark Energy Grid",
    description: "Taps into dark energy",
    energyPerHour: 1600,
    upgradeCost: 10000,
    sprite: "panel-lv8",
    unlockLevel: 16,
  },
  9: {
    level: 9,
    name: "Singularity Core",
    description: "Black hole powered",
    energyPerHour: 3200,
    upgradeCost: 25000,
    sprite: "panel-lv9",
    unlockLevel: 20,
  },
  10: {
    level: 10,
    name: "Dyson Sphere",
    description: "Ultimate stellar engine",
    energyPerHour: 10000,
    upgradeCost: 100000,
    sprite: "panel-lv10",
    unlockLevel: 30,
  },
};

export const SOLAR_FARM_CONFIG: SolarFarmConfig = {
  gridWidth: 3,
  gridHeight: 3,
  tileWidth: 128,
  tileHeight: 64,
  tileSpacing: 24,
  maxRenderableLevel: 2,
  panels: PANEL_CATALOG,
};

export const FOUNDATION_COST = 50;
export const MAX_OFFLINE_HOURS = 12;
export const COLLECTION_INTERVAL_MS = 60000; // 1 minute
