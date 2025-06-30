import * as Phaser from "phaser";

/**
 * Helper class for touch input in Pong game
 * This is not a plugin but a utility class to handle touch controls
 */
export class PongTouchHandler {
  private touchActive: boolean = false;
  private touchY: number = 0;
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.setupListeners();
  }

  setupListeners() {
    // Set up touch input - handle null checks properly
    if (this.scene.input) {
      this.scene.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
        this.touchActive = true;
        this.touchY = pointer.y;
      });

      this.scene.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
        if (this.touchActive) {
          this.touchY = pointer.y;
        }
      });

      this.scene.input.on("pointerup", () => {
        this.touchActive = false;
      });
    }
  }

  // Get vertical movement from touch (-1 to 1)
  getVerticalMovement(targetY: number): number {
    if (!this.touchActive) return 0;

    const distance = this.touchY - targetY;
    const threshold = 20;

    if (Math.abs(distance) < threshold) return 0;
    return Math.sign(distance) * Math.min(Math.abs(distance) / 100, 1);
  }

  // Check if screen was tapped (useful for starting game)
  wasTapped(): boolean {
    if (this.scene.input && this.scene.input.activePointer) {
      return (
        this.scene.input.activePointer.isDown &&
        this.scene.input.activePointer.downTime > 0 &&
        this.scene.input.activePointer.downTime + 200 > this.scene.time.now
      );
    }
    return false;
  }

  // Clean up
  destroy() {
    if (this.scene.input) {
      this.scene.input.off("pointerdown");
      this.scene.input.off("pointermove");
      this.scene.input.off("pointerup");
    }
  }
}
