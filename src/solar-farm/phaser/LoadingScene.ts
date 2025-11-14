import * as Phaser from "phaser";

/**
 * Loading scene displayed during asset initialization
 */
export class LoadingScene extends Phaser.Scene {
  constructor() {
    super({ key: "LoadingScene" });
  }

  public create() {
    console.log("[LoadingScene] Create called");
    const { width, height } = this.cameras.main;

    // Background
    const bg = this.add.rectangle(0, 0, width, height, 0x0a0e27);
    bg.setOrigin(0, 0);

    // Loading text
    const loadingText = this.add.text(width / 2, height / 2 - 40, "Initializing Solar Farm...", {
      fontFamily: "Montserrat, sans-serif",
      fontSize: "20px",
      color: "#61f7ff",
      align: "center",
    });
    loadingText.setOrigin(0.5, 0.5);

    // Progress bar background
    const barWidth = 300;
    const barHeight = 8;
    const barBg = this.add.rectangle(width / 2, height / 2 + 20, barWidth, barHeight, 0x1a1f3a);
    barBg.setOrigin(0.5, 0.5);

    // Progress bar fill
    const barFill = this.add.rectangle(
      width / 2 - barWidth / 2,
      height / 2 + 20,
      0,
      barHeight,
      0x61f7ff,
    );
    barFill.setOrigin(0, 0.5);

    // Animate progress bar
    this.tweens.add({
      targets: barFill,
      width: barWidth,
      duration: 1200,
      ease: "Cubic.easeOut",
      onComplete: () => {
        console.log("[LoadingScene] Starting SolarFarmScene");
        this.scene.start("SolarFarmScene");
      },
    });

    // Pulsing effect on text
    this.tweens.add({
      targets: loadingText,
      alpha: { from: 0.6, to: 1 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }
}
