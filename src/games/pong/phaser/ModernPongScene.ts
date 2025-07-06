import Phaser from "phaser";

// Interfaces for game settings and objects, can be shared with the React component
interface ModernGameSettings {
  difficulty: "easy" | "medium" | "hard" | "expert";
  ballSpeed: "slow" | "medium" | "fast";
  paddleSize: "small" | "medium" | "large";
  maxScore: number;
  enablePowerUps: boolean;
  soundEnabled: boolean;
  theme?: {
    backgroundColor: string;
    playerPaddleColor: number;
    aiPaddleColor: number;
    ballColor: number;
  };
}

// The main game scene
export class ModernPongScene extends Phaser.Scene {
  // Game Objects
  private ball!: Phaser.Physics.Arcade.Sprite;
  private playerPaddle!: Phaser.Physics.Arcade.Sprite;
  private aiPaddle!: Phaser.Physics.Arcade.Sprite;

  // Game State
  private playerScore: number = 0;
  private aiScore: number = 0;
  private gameStarted: boolean = false;
  private gameOver: boolean = false;
  private isPaused: boolean = false;
  private lastScorer?: "Player" | "AI";

  // Settings
  private gameSettings!: ModernGameSettings;

  // Visual Effects
  private ballTrail!: Phaser.GameObjects.Particles.ParticleEmitter;
  private ballGlow!: Phaser.FX.Glow;
  private playerPaddleGlow!: Phaser.FX.Glow;
  private aiPaddleGlow!: Phaser.FX.Glow;
  private screenShakeIntensity: number = 0;

  // UI
  private playerScoreText!: Phaser.GameObjects.Text;
  private aiScoreText!: Phaser.GameObjects.Text;
  private messageText!: Phaser.GameObjects.Text;

  // Input
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wKey!: Phaser.Input.Keyboard.Key;
  private sKey!: Phaser.Input.Keyboard.Key;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private escKey!: Phaser.Input.Keyboard.Key;

  // Audio
  private paddleHitSound!: Phaser.Sound.BaseSound;
  private wallHitSound!: Phaser.Sound.BaseSound;
  private scoreSound!: Phaser.Sound.BaseSound;
  private powerUpSound!: Phaser.Sound.BaseSound;

  constructor() {
    super("ModernPong");
  }

  // Receive settings from the React component
  init(data: { gameSettings: ModernGameSettings }) {
    this.gameSettings = data.gameSettings || {
      difficulty: "medium",
      ballSpeed: "medium",
      paddleSize: "medium",
      maxScore: 7,
      enablePowerUps: true,
      soundEnabled: true,
    };

    // Reset state for a new game
    this.playerScore = 0;
    this.aiScore = 0;
    this.gameStarted = false;
    this.gameOver = false;
    this.isPaused = false;
  }

  preload() {
    // In a real project, you'd load these from an asset pack or file paths
    // For now, we generate textures dynamically in create()
    this.load.audio("paddleHit", "/assets/sounds/paddleHit.wav");
    this.load.audio("wallHit", "/assets/sounds/wallHit.wav");
    this.load.audio("score", "/assets/sounds/score.wav");
    this.load.audio("powerUp", "/assets/sounds/powerUp.wav");
  }

  create() {
    this.createGlowTextures();
    this.applyTheme();
    this.createCenterLine();
    this.createGameObjects();
    this.createVisualEffects();
    this.setupPhysics();
    this.setupInputHandlers();
    this.setupAudio();
    this.createUI();

    this.showMessage("Press SPACE to start");
  }

  update() {
    if (this.gameOver) return;

    if (this.isPaused) {
      // The pause overlay is handled by the togglePause method
      return;
    }

    if (!this.gameStarted) {
      if (this.spaceKey.isDown) {
        this.startGame();
      }
      return;
    }

    this.updatePaddles();
    this.updateAI();
    this.updateBall();
    this.updateScreenShake();
  }

  private createGlowTextures() {
    // Create a white texture for the glow effect
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(0, 0, 16, 16);
    graphics.generateTexture("white", 16, 16);
    graphics.destroy();
  }

  private applyTheme() {
    // Set a dark background
    this.cameras.main.setBackgroundColor(
      this.gameSettings.theme?.backgroundColor || "#000010",
    );
  }

  private createCenterLine() {
    const graphics = this.add.graphics({
      lineStyle: { width: 4, color: 0xffffff, alpha: 0.2 },
    });
    for (let i = 0; i < this.scale.height; i += 20) {
      graphics.lineBetween(
        this.scale.width / 2,
        i,
        this.scale.width / 2,
        i + 10,
      );
    }
  }

  private createGameObjects() {
    // Paddles
    const paddleHeight = this.getPaddleSize();
    this.playerPaddle = this.physics.add
      .sprite(60, this.scale.height / 2, "white")
      .setDisplaySize(20, paddleHeight)
      .setImmovable(true);
    this.aiPaddle = this.physics.add
      .sprite(this.scale.width - 60, this.scale.height / 2, "white")
      .setDisplaySize(20, paddleHeight)
      .setImmovable(true);

    this.playerPaddle.setCollideWorldBounds(true);
    this.aiPaddle.setCollideWorldBounds(true);

    // Ball
    this.ball = this.physics.add
      .sprite(this.scale.width / 2, this.scale.height / 2, "white")
      .setDisplaySize(20, 20);
    this.ball.setCollideWorldBounds(true).setBounce(1, 1);
  }

  private createVisualEffects() {
    // Glows
    this.ballGlow = this.ball.preFX!.addGlow(
      this.gameSettings.theme?.ballColor || 0xffffff,
      2,
    );
    this.playerPaddleGlow = this.playerPaddle.preFX!.addGlow(
      this.gameSettings.theme?.playerPaddleColor || 0x00aaff,
      2,
    );
    this.aiPaddleGlow = this.aiPaddle.preFX!.addGlow(
      this.gameSettings.theme?.aiPaddleColor || 0xff0000,
      2,
    );

    // Ball Trail
    this.ballTrail = this.add.particles(0, 0, "white", {
      speed: 10,
      lifespan: 200,
      scale: { start: 1, end: 0 },
      blendMode: "ADD",
      alpha: { start: 0.5, end: 0 },
      tint: this.gameSettings.theme?.ballColor || 0xffffff,
    });
    this.ballTrail.startFollow(this.ball);
  }

  private createUI() {
    this.playerScoreText = this.add
      .text(this.scale.width * 0.25, 50, "0", {
        font: "80px 'Arial Black', Arial, sans-serif",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 8,
      })
      .setOrigin(0.5);

    this.aiScoreText = this.add
      .text(this.scale.width * 0.75, 50, "0", {
        font: "80px 'Arial Black', Arial, sans-serif",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 8,
      })
      .setOrigin(0.5);

    this.messageText = this.add
      .text(this.scale.width / 2, this.scale.height / 2, "", {
        font: "48px 'Arial Black', Arial, sans-serif",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 6,
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(100);
  }

  private setupInputHandlers() {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.sKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.spaceKey = this.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE,
    );
    this.escKey = this.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.ESC,
    );

    // Pause listener
    this.escKey.on("down", this.togglePause, this);
    this.spaceKey.on("down", () => {
      if (this.gameStarted && !this.gameOver) {
        this.togglePause();
      }
    });
  }

  private setupPhysics() {
    this.physics.world.on("worldbounds", this.onWallHit, this);
    this.physics.add.collider(
      this.ball,
      this.playerPaddle,
      this.onPaddleHit,
      undefined,
      this,
    );
    this.physics.add.collider(
      this.ball,
      this.aiPaddle,
      this.onPaddleHit,
      undefined,
      this,
    );
  }

  private setupAudio() {
    this.paddleHitSound = this.sound.add("paddleHit");
    this.wallHitSound = this.sound.add("wallHit");
    this.scoreSound = this.sound.add("score");
    this.powerUpSound = this.sound.add("powerUp");
  }

  private startGame() {
    if (this.gameStarted) return;
    this.gameStarted = true;
    this.messageText.setVisible(false);
    this.resetBall();
  }

  private resetBall() {
    this.ball.setPosition(this.scale.width / 2, this.scale.height / 2);
    (this.ball.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);

    // Wait a moment before launching
    this.time.delayedCall(1000, () => {
      if (this.gameOver) return;
      const speed = this.getBallSpeed();
      const angle = Phaser.Math.Between(0, 1)
        ? Phaser.Math.DegToRad(Phaser.Math.Between(-30, 30))
        : Phaser.Math.DegToRad(Phaser.Math.Between(150, 210));

      // Serve towards the player who didn't score last
      const direction = this.lastScorer === "Player" ? 1 : -1;
      this.physics.velocityFromAngle(
        Phaser.Math.RadToDeg(angle),
        speed * direction,
        this.ball.body!.velocity,
      );
    });
  }

  private updatePaddles() {
    const paddleSpeed = 800;
    if (this.wKey.isDown || this.cursors.up.isDown) {
      this.playerPaddle.setVelocityY(-paddleSpeed);
    } else if (this.sKey.isDown || this.cursors.down.isDown) {
      this.playerPaddle.setVelocityY(paddleSpeed);
    } else {
      this.playerPaddle.setVelocityY(0);
    }
  }

  private updateAI() {
    const { speed, reaction } = this.getAISpeed();
    const ballIsComing = this.ball.body!.velocity.x > 0;

    if (ballIsComing) {
      // Simple prediction with reaction delay
      const error =
        (Math.random() - 0.5) * (1 - reaction) * this.aiPaddle.displayHeight;
      const targetY = this.ball.y + error;

      const diff = targetY - this.aiPaddle.y;

      if (Math.abs(diff) > 10) {
        this.aiPaddle.setVelocityY(Math.sign(diff) * speed);
      } else {
        this.aiPaddle.setVelocityY(0);
      }
    } else {
      // Return to center
      const diff = this.scale.height / 2 - this.aiPaddle.y;
      if (Math.abs(diff) > 10) {
        this.aiPaddle.setVelocityY(Math.sign(diff) * speed * 0.5);
      } else {
        this.aiPaddle.setVelocityY(0);
      }
    }
  }

  private updateBall() {
    const worldBounds = this.physics.world.bounds;
    if (this.ball.x < worldBounds.x) {
      this.onScore("AI");
    } else if (this.ball.x > worldBounds.right) {
      this.onScore("Player");
    }
  }

  private updateScreenShake() {
    if (this.screenShakeIntensity > 0) {
      this.cameras.main.shake(100, this.screenShakeIntensity);
      this.screenShakeIntensity = 0;
    }
  }

  private onPaddleHit(
    ball: Phaser.GameObjects.GameObject,
    paddle: Phaser.GameObjects.GameObject,
  ) {
    this.playSound("paddleHit");
    this.screenShakeIntensity = 0.005;

    const ballSprite = ball as Phaser.Physics.Arcade.Sprite;
    const paddleSprite = paddle as Phaser.Physics.Arcade.Sprite;

    const diff =
      (ballSprite.y - paddleSprite.y) / (paddleSprite.displayHeight / 2);
    (ballSprite.body as Phaser.Physics.Arcade.Body).velocity.y += diff * 100;

    // Increase ball speed slightly on each hit
    const newVelocity = (ballSprite.body as Phaser.Physics.Arcade.Body).velocity
      .clone()
      .scale(1.05);
    (ballSprite.body as Phaser.Physics.Arcade.Body).velocity.copy(newVelocity);
  }

  private onWallHit(body: Phaser.Physics.Arcade.Body) {
    if (body.gameObject === this.ball) {
      this.playSound("wallHit");
      this.screenShakeIntensity = 0.002;
    }
  }

  private onScore(scorer: "Player" | "AI") {
    if (this.gameOver) return;

    this.playSound("score");
    this.screenShakeIntensity = 0.01;
    this.lastScorer = scorer;

    if (scorer === "Player") {
      this.playerScore++;
    } else {
      this.aiScore++;
    }

    this.updateScoreDisplay();

    // Emit score update event for the React UI
    this.game.events.emit("updateScore", {
      playerScore: this.playerScore,
      aiScore: this.aiScore,
    });

    if (
      this.playerScore >= this.gameSettings.maxScore ||
      this.aiScore >= this.gameSettings.maxScore
    ) {
      this.endGame(scorer);
    } else {
      this.resetBall();
    }
  }

  private updateScoreDisplay() {
    this.playerScoreText.setText(this.playerScore.toString());
    this.aiScoreText.setText(this.aiScore.toString());
  }

  private endGame(winner: "Player" | "AI") {
    this.gameOver = true;
    this.ball.body!.stop();
    this.showMessage(`${winner} Wins!\nPress SPACE to restart`);

    // Emit game over event for the React UI
    this.game.events.emit("gameOver", { winner });

    this.spaceKey.once("down", () => {
      this.scene.restart({ gameSettings: this.gameSettings });
    });
  }

  public togglePause() {
    if (this.gameOver || !this.gameStarted) return;
    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      this.physics.world.pause();
      this.showMessage("Paused");
    } else {
      this.physics.world.resume();
      this.messageText.setVisible(false);
    }

    // Emit pause event for the React UI
    this.game.events.emit("togglePause", this.isPaused);
  }

  private showMessage(text: string) {
    this.messageText.setText(text);
    this.messageText.setVisible(true);
  }

  private playSound(key: "paddleHit" | "wallHit" | "score" | "powerUp") {
    if (this.gameSettings.soundEnabled) {
      switch (key) {
        case "paddleHit":
          this.paddleHitSound.play();
          break;
        case "wallHit":
          this.wallHitSound.play();
          break;
        case "score":
          this.scoreSound.play();
          break;
        case "powerUp":
          this.powerUpSound.play();
          break;
      }
    }
  }

  private getBallSpeed(): number {
    switch (this.gameSettings.ballSpeed) {
      case "slow":
        return 500;
      case "medium":
        return 700;
      case "fast":
        return 900;
      default:
        return 700;
    }
  }

  private getPaddleSize(): number {
    switch (this.gameSettings.paddleSize) {
      case "small":
        return 80;
      case "medium":
        return 120;
      case "large":
        return 160;
      default:
        return 120;
    }
  }

  private getAISpeed(): { speed: number; reaction: number } {
    switch (this.gameSettings.difficulty) {
      case "easy":
        return { speed: 400, reaction: 0.3 };
      case "medium":
        return { speed: 600, reaction: 0.6 };
      case "hard":
        return { speed: 800, reaction: 0.8 };
      case "expert":
        return { speed: 800, reaction: 0.95 };
      default:
        return { speed: 600, reaction: 0.6 };
    }
  }
}
