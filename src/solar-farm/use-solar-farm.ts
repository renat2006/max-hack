"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as Phaser from "phaser";
import { SolarFarmScene } from "./phaser/SolarFarmScene";
import { LoadingScene } from "./phaser/LoadingScene";
import type { FarmState, GridPosition } from "./types";
import { createEmptyFarm, getTileAt, updateTile, calculateOfflineEnergy } from "./engine";
import { SOLAR_FARM_CONFIG, FOUNDATION_COST, PANEL_CATALOG } from "./config";
import { useMax } from "@/lib/max";

export const useSolarFarm = (): {
  initGame: (container: HTMLDivElement) => void;
  farmState: FarmState;
  selectedPosition: GridPosition | null;
  selectedTile: ReturnType<typeof getTileAt> | null;
  clearSelection: () => void;
  buildFoundation: (position: GridPosition) => void;
  placePanel: (position: GridPosition, panelType: string) => void;
  upgradePanel: (position: GridPosition) => void;
  collectEnergy: () => void;
  collectOfflineEnergy: () => Promise<void>;
  offlineEnergyData: { available: number; offlineHours: number; energyPerHour: number } | null;
  showOfflineModal: boolean;
  closeOfflineModal: () => void;
  sceneReady: boolean;
  isSyncingEnergy: boolean;
} => {
  const { user } = useMax();
  const gameRef = useRef<Phaser.Game | null>(null) as React.MutableRefObject<Phaser.Game | null>;
  const sceneRef = useRef<SolarFarmScene | null>(null);
  const resizeHandlerRef = useRef<(() => void) | null>(null);
  const syncControllerRef = useRef<AbortController | null>(null);
  const lastPersistedStateRef = useRef<string | null>(null);
  const [farmState, setFarmState] = useState<FarmState>(() =>
    createEmptyFarm(user?.id?.toString() ?? "guest"),
  );
  const [selectedPosition, setSelectedPosition] = useState<GridPosition | null>(null);
  const [sceneReady, setSceneReady] = useState(false);
  const [isSyncingEnergy, setIsSyncingEnergy] = useState(false);
  const [offlineEnergyData, setOfflineEnergyData] = useState<{
    available: number;
    offlineHours: number;
    energyPerHour: number;
  } | null>(null);
  const [showOfflineModal, setShowOfflineModal] = useState(false);

  const persistFarmState = useCallback(async (state: FarmState) => {
    if (!state.userId || state.userId === "guest") {
      return;
    }

    const payload = JSON.stringify(state);
    if (lastPersistedStateRef.current === payload) {
      return;
    }

    try {
      const response = await fetch("/api/max/solar-farm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: payload,
        keepalive: true,
      });

      if (!response.ok) {
        throw new Error(`Failed to persist solar farm state: ${response.status}`);
      }

      lastPersistedStateRef.current = payload;
    } catch (error) {
      console.error("Failed to persist solar farm state", error);
    }
  }, []);

  const handleTileClick = useCallback((position: GridPosition) => {
    setSelectedPosition(position);
    // Pause game when modal opens
    sceneRef.current?.setPaused(true);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedPosition(null);
    sceneRef.current?.clearSelection();
    // Resume game when modal closes
    sceneRef.current?.setPaused(false);
  }, []);

  // Initialize Phaser game
  const initGame = useCallback(
    (container: HTMLDivElement) => {
      if (gameRef.current) return;

      setSceneReady(false);

      const { clientWidth, clientHeight } = container;

      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        parent: container,
        backgroundColor: "#0a1628",
        scene: [LoadingScene, SolarFarmScene],
        audio: {
          noAudio: true,
        },
        scale: {
          mode: Phaser.Scale.RESIZE,
          autoCenter: Phaser.Scale.CENTER_BOTH,
          width: clientWidth,
          height: clientHeight,
        },
        render: {
          pixelArt: false,
          antialias: true,
          antialiasGL: true,
          roundPixels: true,
          transparent: false,
          clearBeforeRender: true,
          batchSize: 512,
        },
        fps: {
          target: 60,
          forceSetTimeOut: false,
          smoothStep: true,
        },
        physics: {
          default: "arcade",
          arcade: {
            debug: false,
            fps: 60,
          },
        },
      };

      gameRef.current = new Phaser.Game(config);

      const handleResize = () => {
        if (!gameRef.current) return;
        const { clientWidth: width, clientHeight: height } = container;
        gameRef.current.scale.resize(width, height);
      };

      resizeHandlerRef.current = handleResize;
      window.addEventListener("resize", handleResize);

      // Wait for SolarFarmScene to be ready
      gameRef.current.events.once("ready", () => {
        const scene = gameRef.current?.scene.getScene("SolarFarmScene") as
          | SolarFarmScene
          | undefined;
        if (scene) {
          const attachHandler = (): void => {
            sceneRef.current = scene;
            scene.setTileClickHandler(handleTileClick);
            setSceneReady(true);
          };

          if (scene.sys.isActive()) {
            attachHandler();
          } else {
            scene.events.once(Phaser.Scenes.Events.CREATE, attachHandler);
          }

          // Don't initialize ambient animations here - wait for farm state to load
        }
      });
    },
    [handleTileClick],
  );

  // Build foundation
  const buildFoundation = useCallback(() => {
    if (!selectedPosition) return;
    if (farmState.totalEnergy < FOUNDATION_COST) return;

    const tile = getTileAt(farmState, selectedPosition);
    if (!tile || tile.type !== "empty") return;

    const newState = updateTile(farmState, selectedPosition, {
      type: "foundation",
    });

    const totalEnergy = Math.max(0, newState.totalEnergy - FOUNDATION_COST);
    const updatedState: FarmState = {
      ...newState,
      totalEnergy,
      lastUpdated: Date.now(),
    };

    setFarmState(updatedState);
    void persistFarmState(updatedState);

    // Close modal first, then play animation
    setTimeout(() => {
      clearSelection();
      // After modal closed, play the animation
      setTimeout(() => {
        sceneRef.current?.setPaused(false);
        sceneRef.current?.updateTileState(selectedPosition, "foundation");
      }, 200);
    }, 1000);
  }, [clearSelection, farmState, persistFarmState, selectedPosition]);

  // Place panel
  const placePanel = useCallback(() => {
    if (!selectedPosition) return;

    const tile = getTileAt(farmState, selectedPosition);
    if (!tile || tile.type !== "foundation") return;

    const panel = PANEL_CATALOG[1];
    if (farmState.totalEnergy < panel.upgradeCost) return;

    const newState = updateTile(farmState, selectedPosition, {
      type: "panel",
      panelLevel: 1,
      lastCollected: Date.now(),
    });

    const totalEnergy = Math.max(0, newState.totalEnergy - panel.upgradeCost);
    const updatedState: FarmState = {
      ...newState,
      totalEnergy,
      lastUpdated: Date.now(),
    };

    setFarmState(updatedState);
    void persistFarmState(updatedState);

    // Close modal first, then play animation
    setTimeout(() => {
      clearSelection();
      // After modal closed, play the animation
      setTimeout(() => {
        sceneRef.current?.setPaused(false);
        sceneRef.current?.updateTileState(selectedPosition, "panel", 1);
      }, 200);
    }, 1000);
  }, [clearSelection, farmState, persistFarmState, selectedPosition]);

  // Upgrade panel
  const upgradePanel = useCallback(() => {
    if (!selectedPosition) return;

    const tile = getTileAt(farmState, selectedPosition);
    if (!tile || tile.type !== "panel" || !tile.panelLevel) return;

    const nextLevel = (tile.panelLevel + 1) as keyof typeof PANEL_CATALOG;
    const nextPanel = PANEL_CATALOG[nextLevel];
    if (
      !nextPanel ||
      nextLevel > SOLAR_FARM_CONFIG.maxRenderableLevel ||
      farmState.totalEnergy < nextPanel.upgradeCost
    ) {
      return;
    }

    const newState = updateTile(farmState, selectedPosition, {
      panelLevel: nextLevel,
    });

    const totalEnergy = Math.max(0, newState.totalEnergy - nextPanel.upgradeCost);
    const updatedState: FarmState = {
      ...newState,
      totalEnergy,
      lastUpdated: Date.now(),
    };

    setFarmState(updatedState);
    void persistFarmState(updatedState);

    // Close modal first, then play animation
    setTimeout(() => {
      clearSelection();
      // After modal closed, play the animation
      setTimeout(() => {
        sceneRef.current?.setPaused(false);
        sceneRef.current?.updateTileState(selectedPosition, "panel", nextLevel);
      }, 200);
    }, 1000);
  }, [clearSelection, farmState, persistFarmState, selectedPosition]);

  // Collect energy
  const collectEnergy = useCallback(() => {
    const now = Date.now();
    const offlineEnergy = calculateOfflineEnergy(farmState, now);

    const updatedState: FarmState = {
      ...farmState,
      totalEnergy: farmState.totalEnergy + offlineEnergy,
      lastUpdated: now,
    };

    setFarmState(updatedState);
    void persistFarmState(updatedState);
  }, [farmState, persistFarmState]);

  const collectOfflineEnergy = useCallback(async () => {
    if (!user?.id || !offlineEnergyData) return;

    try {
      const response = await fetch("/api/solar-farm/collect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to collect offline energy: ${response.status}`);
      }

      const data = (await response.json()) as {
        collected: number;
        totalEnergy: number;
        cumulativeScore: number;
      };

      // Update farm state with collected energy
      setFarmState((prev) => ({
        ...prev,
        totalEnergy: data.totalEnergy,
        lastUpdated: Date.now(),
      }));

      // Clear offline data
      setOfflineEnergyData(null);
    } catch (error) {
      console.error("Failed to collect offline energy", error);
      throw error;
    }
  }, [user?.id, offlineEnergyData]);

  useEffect(() => {
    const userId = user?.id;

    if (!userId) {
      if (syncControllerRef.current) {
        syncControllerRef.current.abort();
        syncControllerRef.current = null;
      }
      lastPersistedStateRef.current = null;
      setIsSyncingEnergy(false);
      setFarmState(createEmptyFarm("guest"));
      return;
    }

    if (syncControllerRef.current) {
      syncControllerRef.current.abort();
    }

    const controller = new AbortController();
    syncControllerRef.current = controller;
    setIsSyncingEnergy(true);

    const normalizedUserId = String(userId);

    setFarmState((prev) => {
      if (prev.userId === normalizedUserId) {
        return prev;
      }
      return createEmptyFarm(normalizedUserId);
    });

    const fetchFarmState = async (): Promise<void> => {
      try {
        const response = await fetch(
          `/api/max/solar-farm?userId=${encodeURIComponent(normalizedUserId)}`,
          { signal: controller.signal, cache: "no-store" },
        );

        if (!response.ok) {
          throw new Error(`Failed to load solar farm state: ${response.status}`);
        }

        const data = (await response.json()) as { farm: FarmState };
        setFarmState(data.farm);
        lastPersistedStateRef.current = JSON.stringify(data.farm);

        // Check for offline energy (minimum 1 hour)
        const currentTime = Date.now();
        const timeSinceLastUpdate = currentTime - data.farm.lastUpdated;
        const offlineEnergy = calculateOfflineEnergy(data.farm, currentTime);
        const oneHour = 60 * 60 * 1000;

        if (timeSinceLastUpdate >= oneHour && offlineEnergy > 0) {
          setOfflineEnergyData({
            available: offlineEnergy,
            offlineHours: timeSinceLastUpdate / (1000 * 60 * 60),
            energyPerHour: data.farm.energyPerHour,
          });
          setShowOfflineModal(true);
        }

        // Render loaded tiles in Phaser after state is fetched
        if (sceneRef.current && sceneReady) {
          data.farm.tiles.forEach((tile) => {
            sceneRef.current?.renderTile(tile.position, tile.type, tile.panelLevel, true);
          });

          // Initialize ambient animations after tiles are rendered
          setTimeout(() => {
            sceneRef.current?.initializeAmbientAnimations?.();
          }, 300);
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Failed to load solar farm state", error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSyncingEnergy(false);
        }
      }
    };

    void fetchFarmState();

    return () => {
      controller.abort();
      syncControllerRef.current = null;
    };
  }, [user?.id, sceneReady]);

  // Auto-collect energy every minute
  useEffect(() => {
    const interval = setInterval(() => {
      if (farmState.energyPerHour > 0) {
        const energyPerMinute = farmState.energyPerHour / 60;
        setFarmState((prev: FarmState) => {
          const totalEnergy = Math.floor(prev.totalEnergy + energyPerMinute);
          if (totalEnergy === prev.totalEnergy) {
            return prev;
          }

          const updated: FarmState = {
            ...prev,
            totalEnergy,
            lastUpdated: Date.now(),
          };

          void persistFarmState(updated);
          return updated;
        });
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [farmState.energyPerHour, persistFarmState]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
      if (resizeHandlerRef.current) {
        window.removeEventListener("resize", resizeHandlerRef.current);
        resizeHandlerRef.current = null;
      }
      if (syncControllerRef.current) {
        syncControllerRef.current.abort();
        syncControllerRef.current = null;
      }
    };
  }, [user?.id]);

  return {
    initGame,
    farmState,
    selectedPosition,
    selectedTile: selectedPosition ? (getTileAt(farmState, selectedPosition) ?? null) : null,
    clearSelection,
    buildFoundation,
    placePanel,
    upgradePanel,
    collectEnergy,
    collectOfflineEnergy,
    offlineEnergyData,
    showOfflineModal,
    closeOfflineModal: () => setShowOfflineModal(false),
    sceneReady,
    isSyncingEnergy,
  };
};
