import * as Phaser from "phaser";
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PADDLE_WIDTH,
  PADDLE_HEIGHT,
  BALL_SIZE,
  MAX_SCORE,
  SCORE_FONT_SIZE,
  MESSAGE_FONT_SIZE,
  UI_FONT_FAMILY,
  UI_PRIMARY_COLOR,
  FIELD_LINE_COLOR,
  POPUP_BG_COLOR,
  POPUP_BG_ALPHA,
  POPUP_BORDER_COLOR,
  POPUP_BORDER_WIDTH,
} from "../lib/constants";
import {
  updatePlayerPaddle,
  updateAIPaddle,
  checkScore,
  resetBallState,
} from "../lib/gameLogic";

export class PongSinglePlayerScene extends Phaser.Scene {
  // Game objects
  protected ball!: Phaser.Physics.Arcade.Image;
  protected playerPaddle!: Phaser.Physics.Arcade.Image;
  protected aiPaddle!: Phaser.Physics.Arcade.Image;

  // Game state
  protected playerScore: number = 0;
  protected aiScore: number = 0;
  protected gameStarted: boolean = false;
  protected gameOver: boolean = false;
  protected lastScorer?: "player" | "ai"; // Track who scored last for serve direction
  protected aiDifficulty: number = 0.8; // AI difficulty (0-1)
  protected isPaused: boolean = false;

  // UI elements
  protected playerScoreText!: Phaser.GameObjects.Text;
  protected aiScoreText!: Phaser.GameObjects.Text;
  protected messageText!: Phaser.GameObjects.Text;
  protected popup!: Phaser.GameObjects.Container;

  // Input
  protected cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  protected wKey!: Phaser.Input.Keyboard.Key;
  protected sKey!: Phaser.Input.Keyboard.Key;
  protected spaceKey!: Phaser.Input.Keyboard.Key;
  protected touchHandler: Phaser.Input.Pointer | null = null; // For mobile touch controls

  constructor() {
    super({ key: "PongSinglePlayerScene" });
  }

  preload() {
    // Load assets
    this.load.image("ball", "/assets/ball.svg");
    this.load.image("paddle", "/assets/paddle.svg");
    this.load.image("fullscreen", "/assets/fullscreen.svg");
  }

  create() {
    // Create central dividing line
    this.createCenterLine();

    // Create paddles and ball
    this.createGameObjects();

    // Create UI elements
    this.createUI();

    // Set up input handlers
    this.setupInputHandlers();

    // Set up physics
    this.setupPhysics();

    // Display welcome message
    this.showMessage("Press SPACE to start");
  }

  update() {
    if (this.isPaused || this.gameOver) return;

    if (this.gameStarted) {
      this.updatePaddles();
      this.updateBall();
    } else if (this.spaceKey.isDown) {
      this.startGame();
    }
  }

  private createCenterLine() {
    const centerLine = this.add.graphics();
    centerLine.lineStyle(4, FIELD_LINE_COLOR, 0.6);
    centerLine.beginPath();
    centerLine.moveTo(CANVAS_WIDTH / 2, 0);
    centerLine.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
    centerLine.closePath();
    centerLine.stroke();

    // Add center circle
    const centerCircle = this.add.circle(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2,
      100,
      FIELD_LINE_COLOR,
      0.2
    );
    centerCircle.setStrokeStyle(4, FIELD_LINE_COLOR, 0.6);
  }

  private createGameObjects() {
    // Create player paddle
    this.playerPaddle = this.physics.add.image(
      PADDLE_WIDTH * 2,
      CANVAS_HEIGHT / 2,
      "paddle"
    );
    this.playerPaddle.setDisplaySize(PADDLE_WIDTH, PADDLE_HEIGHT);
    this.playerPaddle.setTint(0x00c6ff); // Player color
    this.playerPaddle.setImmovable(true);
    this.playerPaddle.setCollideWorldBounds(true);
    this.playerPaddle.setData("dy", 0);

    // Create AI paddle
    this.aiPaddle = this.physics.add.image(
      CANVAS_WIDTH - PADDLE_WIDTH * 2,
      CANVAS_HEIGHT / 2,
      "paddle"
    );
    this.aiPaddle.setDisplaySize(PADDLE_WIDTH, PADDLE_HEIGHT);
    this.aiPaddle.setTint(0xff4d4d); // AI color
    this.aiPaddle.setImmovable(true);
    this.aiPaddle.setCollideWorldBounds(true);
    this.aiPaddle.setData("dy", 0);

    // Create ball
    this.ball = this.physics.add.image(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2,
      "ball"
    );
    this.ball.setDisplaySize(BALL_SIZE, BALL_SIZE);
    this.ball.setCircle(BALL_SIZE / 2, 8, 8);
    this.ball.setCollideWorldBounds(true);
    this.ball.setBounce(1);

    // Set initial state
    const ballState = resetBallState();
    this.ball.setVelocity(0, 0);
    this.ball.setData("dx", ballState.dx);
    this.ball.setData("dy", ballState.dy);
  }

  private createUI() {
    // Player score
    this.playerScoreText = this.add
      .text(CANVAS_WIDTH / 4, 60, "0", {
        fontSize: SCORE_FONT_SIZE,
        fontFamily: UI_FONT_FAMILY,
        color: UI_PRIMARY_COLOR,
      })
      .setOrigin(0.5);

    // AI score
    this.aiScoreText = this.add
      .text((CANVAS_WIDTH / 4) * 3, 60, "0", {
        fontSize: SCORE_FONT_SIZE,
        fontFamily: UI_FONT_FAMILY,
        color: UI_PRIMARY_COLOR,
      })
      .setOrigin(0.5);

    // Message text
    this.messageText = this.add
      .text(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, "", {
        fontSize: MESSAGE_FONT_SIZE,
        fontFamily: UI_FONT_FAMILY,
        color: UI_PRIMARY_COLOR,
        align: "center",
      })
      .setOrigin(0.5);
    this.messageText.setVisible(false);

    // Create empty popup container
    this.popup = this.add.container(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    this.popup.setVisible(false);
  }

  private setupInputHandlers() {
    if (!this.input.keyboard) {
      console.warn("Keyboard input not available");
      return;
    }

    // Keyboard input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.spaceKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );

    // Mobile touch support
    if (this.sys.game.device.input.touch) {
      this.setupTouchControls();
    }

    // Pause game when window loses focus
    this.game.events.on("blur", () => {
      if (this.gameStarted && !this.gameOver) {
        this.pauseGame();
      }
    });

    // Resume game when spacebar is pressed and game is paused
    if (this.input.keyboard) {
      this.input.keyboard.on("keydown-SPACE", () => {
        if (this.isPaused && !this.gameOver) {
          this.resumeGame();
        }
      });
    }
  }

  private setupTouchControls() {
    // Create touch areas and handlers for mobile play
    const touchAreaHeight = CANVAS_HEIGHT / 2;

    // Create invisible touch zones
    const topHalf = this.add.zone(0, 0, CANVAS_WIDTH, touchAreaHeight);
    const bottomHalf = this.add.zone(
      0,
      touchAreaHeight,
      CANVAS_WIDTH,
      touchAreaHeight
    );

    topHalf.setOrigin(0);
    bottomHalf.setOrigin(0);

    topHalf.setInteractive();
    bottomHalf.setInteractive();

    // Set data for tracking touches
    this.input.setPollAlways();
    this.data.set("touchUp", false);
    this.data.set("touchDown", false);

    // Handle top half touches
    topHalf.on("pointerdown", () => {
      this.data.set("touchUp", true);

      if (!this.gameStarted && !this.gameOver) {
        this.startGame();
      } else if (this.isPaused) {
        this.resumeGame();
      }
    });

    topHalf.on("pointerup", () => {
      this.data.set("touchUp", false);
    });

    // Handle bottom half touches
    bottomHalf.on("pointerdown", () => {
      this.data.set("touchDown", true);

      if (!this.gameStarted && !this.gameOver) {
        this.startGame();
      } else if (this.isPaused) {
        this.resumeGame();
      }
    });

    bottomHalf.on("pointerup", () => {
      this.data.set("touchDown", false);
    });
  }

  private setupPhysics() {
    // Set up collisions
    this.physics.add.collider(
      this.ball!,
      this.playerPaddle!,
      (obj1, obj2) =>
        this.handlePaddleCollision(
          obj1 as Phaser.Physics.Arcade.Image,
          obj2 as Phaser.Physics.Arcade.Image
        ),
      undefined,
      this
    );

    this.physics.add.collider(
      this.ball!,
      this.aiPaddle!,
      (obj1, obj2) =>
        this.handlePaddleCollision(
          obj1 as Phaser.Physics.Arcade.Image,
          obj2 as Phaser.Physics.Arcade.Image
        ),
      undefined,
      this
    );
  }

  private startGame() {
    if (this.gameOver) return;

    this.gameStarted = true;
    this.hideMessage();

    // Set initial ball velocity
    const ballState = resetBallState();

    // If there was a previous scorer, send ball in that direction
    if (this.lastScorer === "player") {
      ballState.dx = Math.abs(ballState.dx); // Toward AI
    } else if (this.lastScorer === "ai") {
      ballState.dx = -Math.abs(ballState.dx); // Toward player
    }

    this.ball.setData("dx", ballState.dx);
    this.ball.setData("dy", ballState.dy);

    // Hide any popup if visible
    this.popup.setVisible(false);
  }

  private pauseGame() {
    this.isPaused = true;
    this.showMessage("PAUSED\nPress SPACE to continue");
  }

  private resumeGame() {
    this.isPaused = false;
    this.hideMessage();
  }

  private updatePaddles() {
    // Update player paddle
    const isUpPressed =
      this.cursors.up.isDown || this.wKey.isDown || this.data.get("touchUp");
    const isDownPressed =
      this.cursors.down.isDown ||
      this.sKey.isDown ||
      this.data.get("touchDown");

    const playerPaddleState = updatePlayerPaddle(
      {
        x: this.playerPaddle.x,
        y: this.playerPaddle.y,
        dy: this.playerPaddle.getData("dy"),
      },
      isUpPressed,
      isDownPressed
    );

    this.playerPaddle.y = playerPaddleState.y;
    this.playerPaddle.setData("dy", playerPaddleState.dy);

    // Update AI paddle
    const aiPaddleState = updateAIPaddle(
      {
        x: this.aiPaddle.x,
        y: this.aiPaddle.y,
        dy: 0,
      },
      {
        x: this.ball.x,
        y: this.ball.y,
        dx: this.ball.getData("dx"),
        dy: this.ball.getData("dy"),
      },
      this.aiDifficulty
    );

    this.aiPaddle.y = aiPaddleState.y;
  }

  private updateBall() {
    // Apply velocity
    const dx = this.ball.getData("dx");
    const dy = this.ball.getData("dy");

    this.ball.x += dx;
    this.ball.y += dy;

    // Check for top/bottom wall collision
    if (
      this.ball.y <= BALL_SIZE / 2 ||
      this.ball.y >= CANVAS_HEIGHT - BALL_SIZE / 2
    ) {
      this.ball.setData("dy", -dy);

      // Keep ball in bounds
      this.ball.y = Math.max(
        BALL_SIZE / 2,
        Math.min(CANVAS_HEIGHT - BALL_SIZE / 2, this.ball.y)
      );
    }

    // Check for scoring
    const scorer = checkScore({
      x: this.ball.x,
      y: this.ball.y,
      dx,
      dy,
    });

    if (scorer) {
      this.handleScore(scorer);
    }
  }

  private handlePaddleCollision(
    ball: Phaser.Physics.Arcade.Image,
    paddle: Phaser.Physics.Arcade.Image
  ) {
    // Reverse horizontal direction
    const dx = ball.getData("dx");
    ball.setData("dx", -dx * 1.05); // Speed up slightly on each hit

    // Calculate where on the paddle the ball hit (normalized from -1 to 1)
    const hitPosition = (ball.y - paddle.y) / (PADDLE_HEIGHT / 2);

    // Add some vertical angle based on where the ball hit the paddle
    // Higher on paddle = more upward angle, lower = more downward
    const verticalFactor = 0.75; // Maximum deflection factor
    const newDy = Math.abs(dx) * hitPosition * verticalFactor;

    ball.setData("dy", newDy);

    // Add sound effect
    // this.sound.play('hit');

    // Ensure the ball is clear of the paddle to prevent multiple collisions
    if (paddle === this.playerPaddle) {
      ball.x = this.playerPaddle.x + PADDLE_WIDTH / 2 + BALL_SIZE / 2 + 1;
    } else {
      ball.x = this.aiPaddle.x - PADDLE_WIDTH / 2 - BALL_SIZE / 2 - 1;
    }
  }

  private handleScore(scorer: "player" | "opponent") {
    this.lastScorer = scorer === "opponent" ? "ai" : "player";

    // Update score
    if (scorer === "player") {
      this.playerScore++;
      this.playerScoreText.setText(this.playerScore.toString());
    } else {
      this.aiScore++;
      this.aiScoreText.setText(this.aiScore.toString());
    }

    // Check for game over
    if (this.playerScore >= MAX_SCORE || this.aiScore >= MAX_SCORE) {
      this.endGame();
      return;
    }

    // Reset ball and pause briefly
    this.ball.x = CANVAS_WIDTH / 2;
    this.ball.y = CANVAS_HEIGHT / 2;
    this.ball.setData("dx", 0);
    this.ball.setData("dy", 0);
    this.gameStarted = false;

    // Show message to continue
    this.showMessage("Press SPACE to continue");
  }

  private endGame() {
    this.gameOver = true;
    this.gameStarted = false;

    const winner = this.playerScore > this.aiScore ? "You win!" : "AI wins!";
    const finalScore = `${this.playerScore} - ${this.aiScore}`;

    // Show game over popup
    this.showGameOverPopup(winner, finalScore);
  }

  private showMessage(text: string) {
    this.messageText.setText(text);
    this.messageText.setVisible(true);
  }

  private hideMessage() {
    this.messageText.setVisible(false);
  }

  private showGameOverPopup(result: string, score: string) {
    // Clear previous popup content
    this.popup.removeAll();

    // Create background
    const bg = this.add.rectangle(
      0,
      0,
      CANVAS_WIDTH * 0.6,
      CANVAS_HEIGHT * 0.5,
      POPUP_BG_COLOR,
      POPUP_BG_ALPHA
    );
    bg.setStrokeStyle(POPUP_BORDER_WIDTH, POPUP_BORDER_COLOR);
    bg.setOrigin(0.5);

    // Add content
    const titleText = this.add
      .text(0, -80, "GAME OVER", {
        fontSize: "42px",
        fontFamily: UI_FONT_FAMILY,
        color: UI_PRIMARY_COLOR,
      })
      .setOrigin(0.5);

    const resultText = this.add
      .text(0, -20, result, {
        fontSize: "36px",
        fontFamily: UI_FONT_FAMILY,
        color: UI_PRIMARY_COLOR,
      })
      .setOrigin(0.5);

    const scoreText = this.add
      .text(0, 30, `Final Score: ${score}`, {
        fontSize: "30px",
        fontFamily: UI_FONT_FAMILY,
        color: UI_PRIMARY_COLOR,
      })
      .setOrigin(0.5);

    // Add play again button
    const playAgainBtn = this.add.rectangle(0, 90, 240, 60, 0x3498db);
    playAgainBtn.setInteractive({ useHandCursor: true });

    const playAgainText = this.add
      .text(0, 90, "Play Again", {
        fontSize: "24px",
        fontFamily: UI_FONT_FAMILY,
        color: UI_PRIMARY_COLOR,
      })
      .setOrigin(0.5);

    // Button event
    playAgainBtn.on("pointerdown", () => {
      this.scene.restart();
    });

    // Add all elements to popup
    this.popup.add([
      bg,
      titleText,
      resultText,
      scoreText,
      playAgainBtn,
      playAgainText,
    ]);
    this.popup.setVisible(true);
  }
}
