import * as Phaser from "phaser";
import { SOLAR_FARM_CONFIG } from "../config";
import { cartesianToIso } from "../engine";
import type { GridPosition } from "../types";

export class SolarFarmScene extends Phaser.Scene {
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private selectedTile: GridPosition | null = null;
  private highlightGraphics?: Phaser.GameObjects.Graphics;
  private tiles: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private particles: Map<string, Phaser.GameObjects.Particles.ParticleEmitter> = new Map();
  private onTileClick?: (position: GridPosition) => void;
  private isDragging = false;
  private dragMoved = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private isPaused = false; // Pause game when modal is open

  constructor() {
    super({ key: "SolarFarmScene" });
  }

  public setTileClickHandler(handler: (position: GridPosition) => void) {
    this.onTileClick = handler;
  }

  public setPaused(paused: boolean) {
    this.isPaused = paused;
    // Pause/resume physics and animations
    if (paused) {
      this.scene.pause();
    } else {
      this.scene.resume();
    }
  }

  preload() {
    // Use smaller, optimized particle texture
    this.load.image(
      "particle-glow",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAG0lEQVQYV2NkYGD4z8DAwMgABXAGjgVmQSEFAFbOAwVj/4H4AAAAAElFTkSuQmCC",
    );

    // Load SVGs with specific sizes for better performance
    this.load.svg(
      "tile-grass",
      "/solar-panels-game/no-background----isometric-rhombus-tile--128x64px-.svg",
      {
        width: 128,
        height: 64,
      },
    );
    this.load.svg(
      "tile-foundation",
      "/solar-panels-game/no-background----isometric-reinforced-concrete-til.svg",
      {
        width: 128,
        height: 64,
      },
    );

    this.load.svg(
      "panel-lv1",
      "/solar-panels-game/no-background----isometric-advanced-solar-panel-le.svg",
      {
        width: 128,
        height: 96,
      },
    );
    this.load.svg(
      "panel-lv2",
      "/solar-panels-game/no-background----isometric-advanced-solar-panel-le (1).svg",
      {
        width: 128,
        height: 96,
      },
    );
  }

  create() {
    // Setup camera with optimized settings
    this.cameras.main.setBackgroundColor("#0a1628");

    const corners = [
      cartesianToIso(0, 0),
      cartesianToIso(SOLAR_FARM_CONFIG.gridWidth - 1, 0),
      cartesianToIso(0, SOLAR_FARM_CONFIG.gridHeight - 1),
      cartesianToIso(SOLAR_FARM_CONFIG.gridWidth - 1, SOLAR_FARM_CONFIG.gridHeight - 1),
    ];

    const minX = Math.min(...corners.map((coord) => coord.isoX)) - 300;
    const maxX = Math.max(...corners.map((coord) => coord.isoX)) + 300;
    const minY = Math.min(...corners.map((coord) => coord.isoY)) - 300;
    const maxY = Math.max(...corners.map((coord) => coord.isoY)) + 300;

    this.cameras.main.setBounds(minX, minY, maxX - minX, maxY - minY);

    // Enable pixel perfect rendering for better performance
    this.cameras.main.setRoundPixels(true);

    // Enable keyboard controls
    this.cursors = this.input.keyboard?.createCursorKeys();

    // Render grid
    this.renderGrid();

    // Center camera
    const center = cartesianToIso(
      (SOLAR_FARM_CONFIG.gridWidth - 1) / 2,
      (SOLAR_FARM_CONFIG.gridHeight - 1) / 2,
    );
    const cameraYOffset = SOLAR_FARM_CONFIG.tileHeight;
    this.cameras.main.centerOn(center.isoX, center.isoY - cameraYOffset);

    // Setup camera drag with optimized handling
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (this.isPaused) return;
      this.isDragging = true;
      this.dragMoved = false;
      this.dragStartX = pointer.x;
      this.dragStartY = pointer.y;
    });

    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (!this.isDragging || this.isPaused) return;

      const dx = pointer.x - this.dragStartX;
      const dy = pointer.y - this.dragStartY;

      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        this.dragMoved = true;
      }

      this.cameras.main.scrollX -= (pointer.x - pointer.prevPosition.x) / this.cameras.main.zoom;
      this.cameras.main.scrollY -= (pointer.y - pointer.prevPosition.y) / this.cameras.main.zoom;
    });

    this.input.on("pointerup", () => {
      this.isDragging = false;
    });
  }

  update() {
    // Skip update if paused
    if (this.isPaused) {
      return;
    }

    // Camera movement with arrow keys
    const speed = 10;
    if (this.cursors?.left.isDown) {
      this.cameras.main.scrollX -= speed;
    } else if (this.cursors?.right.isDown) {
      this.cameras.main.scrollX += speed;
    }

    if (this.cursors?.up.isDown) {
      this.cameras.main.scrollY -= speed;
    } else if (this.cursors?.down.isDown) {
      this.cameras.main.scrollY += speed;
    }
  }

  private renderGrid() {
    for (let y = 0; y < SOLAR_FARM_CONFIG.gridHeight; y++) {
      for (let x = 0; x < SOLAR_FARM_CONFIG.gridWidth; x++) {
        this.renderTile({ x, y }, "empty", undefined, true);
      }
    }
  }

  public renderTile(
    position: GridPosition,
    type: "empty" | "foundation" | "panel",
    panelLevel?: number,
    skipAnimation = false,
  ) {
    const { isoX, isoY } = cartesianToIso(position.x, position.y);
    const key = `${position.x},${position.y}`;

    // Clean up existing
    const existingTile = this.tiles.get(key);
    if (existingTile) {
      existingTile.destroy();
    }

    const existingParticles = this.particles.get(key);
    if (existingParticles) {
      existingParticles.destroy();
      this.particles.delete(key);
    }

    // Determine sprite
    let spriteKey = "tile-grass";
    let offsetY = 0;

    if (type === "foundation") {
      spriteKey = "tile-foundation";
      offsetY = 0;
    } else if (type === "panel" && panelLevel) {
      spriteKey = `panel-lv${Math.min(panelLevel, 2)}`;
      offsetY = 0;
    }

    // Create tile sprite
    const tile = this.add.sprite(isoX, isoY + offsetY, spriteKey);
    tile.setOrigin(0.5, 0.5);
    tile.setDepth(position.y * 100 + position.x);
    tile.setInteractive({ useHandCursor: true, pixelPerfect: false });

    // Tile click handler - optimized
    tile.on("pointerdown", () => {
      if (this.isPaused || this.dragMoved) {
        return;
      }

      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred("light");
      }

      this.selectTile(position);
      this.onTileClick?.(position);
    });

    // Hover effects - lightweight
    tile.on("pointerover", () => {
      if (!this.isPaused && !this.isDragging) {
        tile.setTint(0xddffff);
      }
    });

    tile.on("pointerout", () => {
      if (!this.isPaused) {
        tile.clearTint();
      }
    });

    this.tiles.set(key, tile);

    // Ambient effects per tile type
    if (type === "panel" && panelLevel) {
      const isAdvanced = panelLevel > 1;

      // Ambient particle emitter - make it more visible
      const emitter = this.add.particles(isoX, isoY - 40, "particle-glow", {
        speed: isAdvanced ? { min: 25, max: 45 } : { min: 12, max: 24 },
        angle: { min: 250, max: 290 },
        scale: { start: isAdvanced ? 0.5 : 0.35, end: 0 },
        alpha: { start: 1, end: 0 },
        lifespan: isAdvanced ? 1400 : 1000,
        frequency: isAdvanced ? 180 : 300,
        blendMode: "ADD",
        tint: isAdvanced ? 0xfff685 : 0x61f7ff,
        maxParticles: isAdvanced ? 24 : 16,
      });
      emitter.setDepth(position.y * 100 + position.x + 10);
      this.particles.set(key, emitter);

      // Start ambient animations for existing panels (not during initial render)
      if (!skipAnimation) {
        this.startAmbientAnimations(tile, isoY, panelLevel);
      }
    } else if (type === "foundation") {
      const emitter = this.add.particles(isoX, isoY - 12, "particle-glow", {
        speed: { min: -10, max: 10 },
        angle: { min: 200, max: 340 },
        scale: { start: 0.22, end: 0 },
        alpha: { start: 0.45, end: 0 },
        lifespan: 600,
        frequency: 500,
        blendMode: "ADD",
        tint: 0xffc58f,
        maxParticles: 8,
      });
      emitter.setDepth(position.y * 100 + position.x + 6);
      this.particles.set(key, emitter);
    }
  }

  private selectTile(position: GridPosition) {
    this.selectedTile = position;
    this.drawHighlight();
  }

  private drawHighlight() {
    // Clear old highlight
    if (this.highlightGraphics) {
      this.highlightGraphics.clear();
      this.highlightGraphics.destroy();
      this.highlightGraphics = undefined;
    }

    if (!this.selectedTile) return;

    const { isoX, isoY } = cartesianToIso(this.selectedTile.x, this.selectedTile.y);
    const hw = SOLAR_FARM_CONFIG.tileWidth / 2;
    const hh = SOLAR_FARM_CONFIG.tileHeight / 2;

    this.highlightGraphics = this.add.graphics();
    this.highlightGraphics.lineStyle(4, 0x61f7ff, 1);
    this.highlightGraphics.beginPath();
    this.highlightGraphics.moveTo(isoX, isoY - hh);
    this.highlightGraphics.lineTo(isoX + hw, isoY);
    this.highlightGraphics.lineTo(isoX, isoY + hh);
    this.highlightGraphics.lineTo(isoX - hw, isoY);
    this.highlightGraphics.closePath();
    this.highlightGraphics.strokePath();
    this.highlightGraphics.setDepth(10000);

    // Optimized glow animation
    this.tweens.add({
      targets: this.highlightGraphics,
      alpha: { from: 1, to: 0.4 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  public updateTileState(
    position: GridPosition,
    type: "empty" | "foundation" | "panel",
    panelLevel?: number,
  ) {
    const { isoX, isoY } = cartesianToIso(position.x, position.y);
    const key = `${position.x},${position.y}`;
    const existingTile = this.tiles.get(key);

    // Remove existing tweens to prevent conflicts
    if (existingTile) {
      this.tweens.killTweensOf(existingTile);
    }

    this.renderTile(position, type, panelLevel, true); // Skip ambient animations during build

    if (type !== "empty") {
      const tile = this.tiles.get(key);

      if (tile) {
        // Initial state - invisible and positioned above
        tile.setScale(0.3);
        tile.setAlpha(0);
        tile.y = isoY - 80;
        tile.setAngle(-15);

        if (type === "panel") {
          // Panel: dramatic 3D entrance with rotation and bounce
          this.tweens.add({
            targets: tile,
            y: isoY,
            scale: 1,
            alpha: 1,
            angle: 0,
            duration: 600,
            ease: "Back.easeOut",
          });

          // Additional bounce for realism, then start ambient animations
          this.time.delayedCall(600, () => {
            this.tweens.add({
              targets: tile,
              y: isoY - 8,
              duration: 120,
              yoyo: true,
              ease: "Quad.easeOut",
              onComplete: () => {
                // Start ambient animations after build animation completes
                this.startAmbientAnimations(tile, isoY, panelLevel);
              },
            });
          });
        } else if (type === "foundation") {
          // Foundation: powerful slam down effect
          this.tweens.add({
            targets: tile,
            y: isoY,
            scale: 1,
            alpha: 1,
            angle: 0,
            duration: 400,
            ease: "Cubic.easeIn",
          });

          // Impact shake
          this.time.delayedCall(400, () => {
            this.tweens.add({
              targets: tile,
              scale: 1.05,
              duration: 80,
              yoyo: true,
              ease: "Quad.easeOut",
            });
          });
        }

        this.spawnBuildFx({ isoX, isoY }, type, panelLevel);
      }
    }
  }

  private startAmbientAnimations(
    tile: Phaser.GameObjects.Sprite,
    baseY: number,
    panelLevel?: number,
  ) {
    if (!panelLevel) return;

    const isAdvanced = panelLevel > 1;

    // Simple opacity pulse - solar panels "breathe" as they generate energy
    this.tweens.add({
      targets: tile,
      alpha: { from: 1, to: 0.75 },
      duration: isAdvanced ? 1500 : 2000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  public clearSelection() {
    this.selectedTile = null;
    if (this.highlightGraphics) {
      this.highlightGraphics.clear();
      this.highlightGraphics.destroy();
      this.highlightGraphics = undefined;
    }
  }

  public initializeAmbientAnimations() {
    // Initialize ambient animations for all existing panel tiles
    this.tiles.forEach((tile) => {
      const spriteKey = tile.texture.key;
      if (spriteKey.startsWith("panel-lv")) {
        const level = parseInt(spriteKey.replace("panel-lv", ""), 10);
        if (level && level > 0) {
          const { y } = tile;
          this.startAmbientAnimations(tile, y, level);
        }
      }
    });
  }

  private spawnBuildFx(
    isoPosition: { isoX: number; isoY: number },
    type: "foundation" | "panel",
    panelLevel?: number,
  ) {
    const depthBase = isoPosition.isoY;

    if (type === "foundation") {
      // === FOUNDATION BUILD: Construction Site Effect ===

      // 1. Bright flash at impact
      const flash = this.add.circle(isoPosition.isoX, isoPosition.isoY, 60, 0xffffff, 0.9);
      flash.setDepth(depthBase + 20);
      this.tweens.add({
        targets: flash,
        alpha: 0,
        duration: 200,
        ease: "Quad.easeOut",
        onComplete: () => flash.destroy(),
      });

      // 2. Multiple shockwave rings
      for (let i = 0; i < 3; i++) {
        this.time.delayedCall(i * 120, () => {
          const ring = this.add.circle(
            isoPosition.isoX,
            isoPosition.isoY,
            15 + i * 10,
            0xffc58f,
            0,
          );
          ring.setStrokeStyle(4 - i, 0xffd9a6, 0.8);
          ring.setDepth(depthBase + 12);

          this.tweens.add({
            targets: ring,
            scale: 4 + i * 0.5,
            alpha: { from: 0.85, to: 0 },
            duration: 650,
            ease: "Cubic.easeOut",
            onComplete: () => ring.destroy(),
          });
        });
      }

      // 3. Construction dust explosion - radial burst
      const dust = this.add.particles(isoPosition.isoX, isoPosition.isoY, "particle-glow", {
        speed: { min: 40, max: 120 },
        angle: { min: 0, max: 360 },
        scale: { start: 0.6, end: 0 },
        alpha: { start: 0.9, end: 0 },
        lifespan: { min: 500, max: 800 },
        blendMode: "ADD",
        tint: 0xffc58f,
        gravityY: 50,
        maxParticles: 40,
      });
      dust.setDepth(depthBase + 15);
      dust.explode(40);
      this.time.delayedCall(820, () => dust.destroy());

      // 4. Ground cracks/debris shooting out
      const debris = this.add.particles(isoPosition.isoX, isoPosition.isoY, "particle-glow", {
        speed: { min: 60, max: 140 },
        angle: { min: 30, max: 150 },
        scale: { start: 0.4, end: 0.1 },
        alpha: { start: 1, end: 0 },
        lifespan: { min: 400, max: 700 },
        blendMode: "NORMAL",
        tint: 0x8b6f47,
        gravityY: 200,
        maxParticles: 25,
      });
      debris.setDepth(depthBase + 8);
      debris.explode(25);
      this.time.delayedCall(720, () => debris.destroy());

      // 5. Ground impact glow
      const impact = this.add.circle(isoPosition.isoX, isoPosition.isoY, 12, 0xffa94d, 0.8);
      impact.setDepth(depthBase + 8);
      this.tweens.add({
        targets: impact,
        scale: 3.5,
        alpha: 0,
        duration: 500,
        ease: "Quad.easeOut",
        onComplete: () => impact.destroy(),
      });
      return;
    }

    // === PANEL INSTALLATION: High-Tech Energy Effect ===
    const tint = panelLevel && panelLevel > 1 ? 0xfff685 : 0x61f7ff;
    const isAdvanced = panelLevel && panelLevel > 1;

    // 1. Bright installation flash
    const flash = this.add.circle(isoPosition.isoX, isoPosition.isoY - 30, 50, 0xffffff, 0.95);
    flash.setDepth(depthBase + 25);
    this.tweens.add({
      targets: flash,
      scale: 1.8,
      alpha: 0,
      duration: 250,
      ease: "Cubic.easeOut",
      onComplete: () => flash.destroy(),
    });

    // 2. Multiple energy pulse rings
    for (let i = 0; i < (isAdvanced ? 4 : 3); i++) {
      this.time.delayedCall(i * 100, () => {
        const ring = this.add.circle(isoPosition.isoX, isoPosition.isoY - 20, 10 + i * 8, tint, 0);
        ring.setStrokeStyle(isAdvanced ? 4 : 3, tint, 0.9);
        ring.setDepth(depthBase + 18);

        this.tweens.add({
          targets: ring,
          scale: 3.5 + i * 0.3,
          alpha: { from: 0.9, to: 0 },
          duration: 600,
          ease: "Quad.easeOut",
          onComplete: () => ring.destroy(),
        });
      });
    }

    // 3. Energy sparks shooting upward
    const sparks = this.add.particles(isoPosition.isoX, isoPosition.isoY, "particle-glow", {
      speed: { min: 100, max: 200 },
      angle: { min: 240, max: 300 },
      scale: { start: isAdvanced ? 0.6 : 0.45, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: { min: 400, max: 700 },
      blendMode: "ADD",
      tint,
      gravityY: -80,
      maxParticles: isAdvanced ? 50 : 35,
    });
    sparks.setDepth(depthBase + 20);
    sparks.explode(isAdvanced ? 50 : 35);
    this.time.delayedCall(720, () => sparks.destroy());

    // 4. Radial energy burst (omnidirectional)
    const burst = this.add.particles(isoPosition.isoX, isoPosition.isoY - 20, "particle-glow", {
      speed: { min: 60, max: 140 },
      angle: { min: 0, max: 360 },
      scale: { start: isAdvanced ? 0.5 : 0.4, end: 0 },
      alpha: { start: 0.9, end: 0 },
      lifespan: { min: 500, max: 800 },
      blendMode: "ADD",
      tint,
      maxParticles: isAdvanced ? 45 : 30,
    });
    burst.setDepth(depthBase + 16);
    burst.explode(isAdvanced ? 45 : 30);
    this.time.delayedCall(820, () => burst.destroy());

    // 5. Glowing aura that fades in
    const aura = this.add.circle(isoPosition.isoX, isoPosition.isoY - 30, 25, tint, 0.4);
    aura.setDepth(depthBase + 10);
    this.tweens.add({
      targets: aura,
      scale: 2.2,
      alpha: 0,
      duration: 700,
      ease: "Sine.easeOut",
      onComplete: () => aura.destroy(),
    });

    // 6. Trace effect - small glitter particles
    if (isAdvanced) {
      const glitter = this.add.particles(isoPosition.isoX, isoPosition.isoY - 30, "particle-glow", {
        speed: { min: 20, max: 60 },
        angle: { min: 0, max: 360 },
        scale: { start: 0.3, end: 0 },
        alpha: { start: 1, end: 0 },
        lifespan: { min: 600, max: 1000 },
        blendMode: "ADD",
        tint: 0xffffff,
        maxParticles: 30,
      });
      glitter.setDepth(depthBase + 22);
      glitter.explode(30);
      this.time.delayedCall(1020, () => glitter.destroy());
    }
  }
}
