import * as Phaser from "phaser";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "../lib/constants";

export const phaserConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
  backgroundColor: "#0a0a0a",
  parent: "phaser-container",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
  },
  pixelArt: false,
  roundPixels: true,
  antialias: true,
};

// Fullscreen button configuration for responsive games
export const setupFullscreenButton = (
  scene: Phaser.Scene,
  x: number = CANVAS_WIDTH - 40,
  y: number = 40
) => {
  // Create fullscreen button
  const fullscreenButton = scene.add
    .image(x, y, "fullscreen-icon")
    .setOrigin(1, 0)
    .setInteractive()
    .setDepth(1000) // Make sure it's on top
    .setScrollFactor(0); // Fixed to camera

  // Set button properties for better visibility
  fullscreenButton.setAlpha(0.7);
  fullscreenButton.setScale(0.5);

  fullscreenButton.on("pointerover", () => {
    fullscreenButton.setAlpha(1);
  });

  fullscreenButton.on("pointerout", () => {
    fullscreenButton.setAlpha(0.7);
  });

  fullscreenButton.on("pointerup", () => {
    if (scene.scale.isFullscreen) {
      scene.scale.stopFullscreen();
    } else {
      scene.scale.startFullscreen();
    }
  });

  return fullscreenButton;
};
