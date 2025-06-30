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
  },
  input: {
    activePointers: 3, // Support multi-touch
  },
  // Set reasonable FPS for mobile devices too
  fps: {
    target: 60,
    min: 30,
  },
  render: {
    pixelArt: false,
    antialias: true,
    antialiasGL: true,
  },
};

// The actual game instance will be created in the React component
