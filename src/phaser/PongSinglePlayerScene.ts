import * as Phaser from "phaser";
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PADDLE_WIDTH,
  PADDLE_HEIGHT,
  BALL_SIZE,
  INITIAL_BALL_SPEED,
  MAX_SCORE,
  PADDLE_SPEED,
  SPECIAL_SERVE_THRESHOLD,
  SCORE_FONT_SIZE,
  MESSAGE_FONT_SIZE,
  UI_FONT_FAMILY,
  UI_PRIMARY_COLOR,
  PLAYER_COLOR,
  AI_COLOR,
  FIELD_LINE_COLOR,
  POPUP_BG_COLOR,
  POPUP_BG_ALPHA,
  POPUP_PADDING,
  POPUP_BORDER_RADIUS,
  POPUP_BORDER_COLOR,
  POPUP_BORDER_WIDTH,
} from "../lib/constants";
import { PongTouchHandler } from "./InputPlugin";

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

  // UI elements
  protected playerScoreText!: Phaser.GameObjects.Text;
  protected aiScoreText!: Phaser.GameObjects.Text;
  protected messageText!: Phaser.GameObjects.Text;

  // Input
  protected cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  protected wKey!: Phaser.Input.Keyboard.Key;
  protected sKey!: Phaser.Input.Keyboard.Key;
  protected spaceKey!: Phaser.Input.Keyboard.Key;
  protected rKey!: Phaser.Input.Keyboard.Key;

  // Touch handler for mobile
  protected touchHandler!: PongTouchHandler;

  constructor() {
    super({ key: "PongSinglePlayerScene" });
  }

  preload() {
    // Create simple graphics for the game objects
    this.createGameTextures();
  }

  create() {
    // Set up input keys
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.sKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.spaceKey = this.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
    this.rKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    // Setup touch handler for mobile controls
    this.touchHandler = new PongTouchHandler(this);

    // Create game objects
    this.createGameObjects();

    // Create UI elements
    this.createUI();

    // Setup physics objects
    this.playerPaddle.setImmovable(true);
    this.aiPaddle.setImmovable(true);

    // We'll handle our own collision detection in the update method

    // Initial message
    this.setMessage("Press SPACE to start the game!");
  }

  /**
   * Main update loop - parameters unused in base class but needed for override in child class
   * @param _time Current game time
   * @param _delta Time delta since last frame
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(_time?: number, _delta?: number) {
    if (!this.gameStarted || this.gameOver) {
      // Only handle input when game is not started/over
      this.handleInput();
      return;
    }

    // Handle input
    this.handleInput();

    // Update AI paddle
    this.updateAI();

    // Custom collision detection
    this.checkCollisions();

    // Handle wall collisions (top and bottom)
    this.handleWallCollisions();

    // Check for scoring (ball goes past left or right edge)
    this.checkScoring();

    // Keep paddles inside the screen bounds
    this.constrainPaddles();
  }

  /**
   * Starts the ball movement from the center.
   * Can be overridden by child classes for different start behaviors.
   */
  public startBall() {
    this.resetBall();
  }

  private handleWallCollisions() {
    if (!this.ball.body) return;

    // Bounce off top and bottom walls
    if (this.ball.y < BALL_SIZE / 2) {
      // Top wall collision
      this.ball.y = BALL_SIZE / 2;
      this.ball.body.velocity.y = Math.abs(this.ball.body.velocity.y);
    } else if (this.ball.y > CANVAS_HEIGHT - BALL_SIZE / 2) {
      // Bottom wall collision
      this.ball.y = CANVAS_HEIGHT - BALL_SIZE / 2;
      this.ball.body.velocity.y = -Math.abs(this.ball.body.velocity.y);
    }
  }

  private checkCollisions() {
    // Check for collision with player paddle
    if (
      Phaser.Geom.Intersects.RectangleToRectangle(
        this.ball.getBounds(),
        this.playerPaddle.getBounds()
      )
    ) {
      const ballVelocityX = this.ball.body ? this.ball.body.velocity.x : 0;
      if (ballVelocityX < 0) {
        // Only if ball is moving towards paddle
        this.handlePaddleCollision(this.ball, this.playerPaddle);
      }
    }

    // Check for collision with AI paddle
    if (
      Phaser.Geom.Intersects.RectangleToRectangle(
        this.ball.getBounds(),
        this.aiPaddle.getBounds()
      )
    ) {
      const ballVelocityX = this.ball.body ? this.ball.body.velocity.x : 0;
      if (ballVelocityX > 0) {
        // Only if ball is moving towards paddle
        this.handlePaddleCollision(this.ball, this.aiPaddle);
      }
    }
  }

  private createGameTextures() {
    // Create ball texture with a gradient effect
    const ballGraphics = this.make.graphics({ x: 0, y: 0 });

    // White glowing ball
    ballGraphics.clear();

    // Outer glow
    const gradientRadius = BALL_SIZE / 2;
    for (let i = 0; i < 5; i++) {
      const alpha = (5 - i) / 15;
      ballGraphics.fillStyle(0xffffff, alpha);
      ballGraphics.fillCircle(
        BALL_SIZE / 2,
        BALL_SIZE / 2,
        gradientRadius + i * 2
      );
    }

    // Main white ball
    ballGraphics.fillStyle(0xffffff, 1);
    ballGraphics.fillCircle(BALL_SIZE / 2, BALL_SIZE / 2, BALL_SIZE / 2);

    ballGraphics.generateTexture("ball", BALL_SIZE + 10, BALL_SIZE + 10);

    // Create player paddle texture (blue)
    const playerGraphics = this.make.graphics({ x: 0, y: 0 });

    // Background glow
    playerGraphics.fillStyle(parseInt(PLAYER_COLOR.replace("#", "0x")), 0.3);
    playerGraphics.fillRect(-2, -2, PADDLE_WIDTH + 4, PADDLE_HEIGHT + 4);

    // Main paddle
    playerGraphics.fillStyle(parseInt(PLAYER_COLOR.replace("#", "0x")), 1);
    playerGraphics.fillRect(0, 0, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Highlight
    playerGraphics.fillStyle(0xffffff, 0.3);
    playerGraphics.fillRect(2, 2, PADDLE_WIDTH - 4, 10);

    playerGraphics.generateTexture(
      "playerPaddle",
      PADDLE_WIDTH + 4,
      PADDLE_HEIGHT + 4
    );

    // Create AI paddle texture (red)
    const aiGraphics = this.make.graphics({ x: 0, y: 0 });

    // Background glow
    aiGraphics.fillStyle(parseInt(AI_COLOR.replace("#", "0x")), 0.3);
    aiGraphics.fillRect(-2, -2, PADDLE_WIDTH + 4, PADDLE_HEIGHT + 4);

    // Main paddle
    aiGraphics.fillStyle(parseInt(AI_COLOR.replace("#", "0x")), 1);
    aiGraphics.fillRect(0, 0, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Highlight
    aiGraphics.fillStyle(0xffffff, 0.3);
    aiGraphics.fillRect(2, 2, PADDLE_WIDTH - 4, 10);

    aiGraphics.generateTexture("aiPaddle", PADDLE_WIDTH + 4, PADDLE_HEIGHT + 4);
  }

  private createGameObjects() {
    try {
      // Create ball
      this.ball = this.physics.add.image(
        CANVAS_WIDTH / 2,
        CANVAS_HEIGHT / 2,
        "ball"
      );
      this.ball.setCircle(BALL_SIZE / 2); // Use circular body for more accurate collisions
      // Don't set collision bounds here - we'll handle that in the update method

      // Create player paddle
      this.playerPaddle = this.physics.add.image(
        10 + PADDLE_WIDTH / 2,
        CANVAS_HEIGHT / 2,
        "playerPaddle"
      );
      this.playerPaddle.setImmovable(true);
      this.playerPaddle.setCollideWorldBounds(true);

      // Create AI paddle
      this.aiPaddle = this.physics.add.image(
        CANVAS_WIDTH - 10 - PADDLE_WIDTH / 2,
        CANVAS_HEIGHT / 2,
        "aiPaddle"
      );
      this.aiPaddle.setImmovable(true);
      this.aiPaddle.setCollideWorldBounds(true);

      // Setup physics objects
      if (this.ball.body) {
        this.ball.body.velocity.x = 0;
        this.ball.body.velocity.y = 0;
      }

      // Setup bounce properties
      this.ball.setBounce(1); // Perfect bounce with no energy loss
    } catch (error) {
      console.error("Error creating game objects:", error);
    }
  }

  private createUI() {
    // Create center line (dashed for better visual appeal)
    const centerLine = this.add.graphics();
    centerLine.lineStyle(3, FIELD_LINE_COLOR, 1);

    // Create dashed center line
    const dashLength = 20;
    const gapLength = 15;
    let y = 0;

    while (y < CANVAS_HEIGHT) {
      centerLine.beginPath();
      centerLine.moveTo(CANVAS_WIDTH / 2, y);
      centerLine.lineTo(
        CANVAS_WIDTH / 2,
        Math.min(y + dashLength, CANVAS_HEIGHT)
      );
      centerLine.closePath();
      centerLine.stroke();
      y += dashLength + gapLength;
    }

    // Add field border
    const border = this.add.graphics();
    border.lineStyle(3, FIELD_LINE_COLOR, 1);
    border.strokeRect(2, 2, CANVAS_WIDTH - 4, CANVAS_HEIGHT - 4);

    // No title text inside the game area (already displayed above)

    // Create score text with improved style
    const scoreConfig = {
      fontSize: SCORE_FONT_SIZE,
      fontFamily: UI_FONT_FAMILY,
      color: UI_PRIMARY_COLOR,
      fontStyle: "bold",
    };

    // Player score (left side)
    this.playerScoreText = this.add
      .text(CANVAS_WIDTH / 4, 100, "0", {
        ...scoreConfig,
        color: PLAYER_COLOR,
      })
      .setOrigin(0.5);

    // AI score (right side)
    this.aiScoreText = this.add
      .text((CANVAS_WIDTH / 4) * 3, 100, "0", {
        ...scoreConfig,
        color: AI_COLOR,
      })
      .setOrigin(0.5);

    // Create a dummy text object to store popup data
    // This isn't actually used for display, just as a data container
    this.messageText = this.add.text(0, 0, "").setVisible(false);

    // No control instructions inside the game area (already displayed below)
  }

  protected handleInput() {
    // Only allow paddle movement after game starts or for testing
    this.playerPaddle.setVelocity(0, 0);

    // Keyboard controls
    if (this.cursors.up.isDown || this.wKey.isDown) {
      this.playerPaddle.setVelocityY(-PADDLE_SPEED * 60);
    } else if (this.cursors.down.isDown || this.sKey.isDown) {
      this.playerPaddle.setVelocityY(PADDLE_SPEED * 60);
    }

    // Touch controls using our custom touch handler
    const touchMovement = this.touchHandler.getVerticalMovement(
      this.playerPaddle.y
    );
    if (touchMovement !== 0) {
      this.playerPaddle.setVelocityY(touchMovement * PADDLE_SPEED * 60);

      // Start game on touch if not started yet
      if (!this.gameStarted && !this.gameOver) {
        this.startGame();
      }
    }

    // Check for tap to start game
    if (this.touchHandler.wasTapped() && !this.gameStarted && !this.gameOver) {
      this.startGame();
    }

    // Space to start or continue game
    if (
      Phaser.Input.Keyboard.JustDown(this.spaceKey) &&
      !this.gameStarted &&
      !this.gameOver
    ) {
      this.startGame();
    }

    // R key to restart game
    if (Phaser.Input.Keyboard.JustDown(this.rKey) && this.gameOver) {
      this.resetGame();
    }
  }

  protected updateAI() {
    if (!this.gameStarted || this.gameOver) {
      this.aiPaddle.setVelocityY(0);
      return;
    }

    const aiPaddleCenter = this.aiPaddle.y;
    const ballY = this.ball.y;

    // Only chase the ball if it's moving towards the AI
    const ballVelocityX = this.ball.body?.velocity?.x || 0;

    if (ballVelocityX > 0) {
      if (aiPaddleCenter < ballY - 10) {
        this.aiPaddle.setVelocityY(PADDLE_SPEED * 50);
      } else if (aiPaddleCenter > ballY + 10) {
        this.aiPaddle.setVelocityY(-PADDLE_SPEED * 50);
      } else {
        this.aiPaddle.setVelocityY(0);
      }
    } else {
      // Move back to center when ball is moving away
      const centerY = CANVAS_HEIGHT / 2;
      if (aiPaddleCenter < centerY - 20) {
        this.aiPaddle.setVelocityY(PADDLE_SPEED * 30);
      } else if (aiPaddleCenter > centerY + 20) {
        this.aiPaddle.setVelocityY(-PADDLE_SPEED * 30);
      } else {
        this.aiPaddle.setVelocityY(0);
      }
    }
  }

  /**
   * Handle collision between ball and paddles
   */
  private handlePaddleCollision(
    ball: Phaser.Physics.Arcade.Image,
    paddle: Phaser.Physics.Arcade.Image
  ) {
    // Calculate new angle based on where the ball hit the paddle
    const paddleCenter = paddle.y;
    const ballCenter = ball.y;
    const hitPosition = (ballCenter - paddleCenter) / (PADDLE_HEIGHT / 2);

    // Calculate new velocity based on hit position
    const angle = (hitPosition * Math.PI) / 4; // Max 45 degree angle

    // Get current velocity and calculate new one
    if (!ball.body) return;

    const vx = ball.body.velocity.x;
    const vy = ball.body.velocity.y;
    const currentVelocity = Math.sqrt(vx * vx + vy * vy);
    const speedMultiplier = 1.05; // Speed increases by 5% on each hit

    let newVelocity = currentVelocity * speedMultiplier;
    newVelocity = Math.min(newVelocity, INITIAL_BALL_SPEED * 3 * 60); // Cap max speed

    // Set new velocity with proper direction based on which paddle was hit
    const directionX = paddle === this.playerPaddle ? 1 : -1;

    // Directly update the velocity components
    if (ball.body) {
      ball.body.velocity.x = directionX * newVelocity * Math.cos(angle);
      ball.body.velocity.y = newVelocity * Math.sin(angle);
    }
  }

  private handleCollision(
    obj1: Phaser.GameObjects.GameObject,
    obj2: Phaser.GameObjects.GameObject
  ) {
    try {
      // Check if this is a ball-paddle collision
      const ball = this.ball;
      const player = this.playerPaddle;
      const ai = this.aiPaddle;

      if (
        (obj1 === ball && (obj2 === player || obj2 === ai)) ||
        (obj2 === ball && (obj1 === player || obj1 === ai))
      ) {
        // Get the paddle
        const paddle =
          obj1 === player || obj1 === ai
            ? (obj1 as Phaser.Physics.Arcade.Image)
            : (obj2 as Phaser.Physics.Arcade.Image);

        this.handlePaddleCollision(ball, paddle);
      }
    } catch (error) {
      console.error("Error in handleCollision:", error);
    }
  }

  protected startGame() {
    if (this.gameStarted) return;
    this.gameStarted = true;
    this.setMessage("");
    this.resetBall();
  }

  protected resetBall() {
    if (!this.ball || !this.ball.body) return;

    this.ball.setPosition(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);

    // Store the last scorer to remember direction when space is pressed
    if (this.lastScorer) {
      // Store as a property to use when starting
      this.lastScorer = this.lastScorer;
    }

    // Set direction based on who scored last (if available)
    const angleRange = Math.PI / 3; // 60 degree cone
    const angle = Math.random() * angleRange - angleRange / 2;

    // Default to random direction if no lastScorer
    let direction = Math.random() > 0.5 ? 1 : -1;

    // Check for special serve threshold rule
    const playerReachedThreshold = this.playerScore >= SPECIAL_SERVE_THRESHOLD;
    const aiReachedThreshold = this.aiScore >= SPECIAL_SERVE_THRESHOLD;

    if (playerReachedThreshold || aiReachedThreshold) {
      // If someone has 10+ points, they always serve (ball goes away from them)
      direction = playerReachedThreshold ? -1 : 1;
    } else {
      // Normal rule: If we have a lastScorer stored, use that for direction
      const scorer = this.lastScorer;
      if (scorer) {
        // Ball always goes TOWARD the side that just lost the point
        // If player scored last (right side scored), serve toward right (AI side)
        // If AI scored last (left side scored), serve toward left (player side)
        // This means the ball goes toward the side that failed to return it
        direction = scorer === "player" ? 1 : -1;
      }
    }

    // Set velocity based on direction
    const xSpeed = direction * INITIAL_BALL_SPEED * 60 * Math.cos(angle);
    const ySpeed = INITIAL_BALL_SPEED * 30 * Math.sin(angle);

    // Make sure the ball has a body before setting velocity
    if (this.ball.body) {
      this.ball.body.velocity.x = xSpeed;
      this.ball.body.velocity.y = ySpeed;
    }

    // Clear the lastScorer after using it
    this.lastScorer = undefined;
  }

  protected checkScoring() {
    if (!this.ball.body) return;

    let scorer: "player" | "ai" | undefined;

    // Player scores
    if (this.ball.x > CANVAS_WIDTH) {
      this.playerScore++;
      scorer = "player";
    } else if (this.ball.x < 0) {
      // AI scores
      this.aiScore++;
      scorer = "ai";
    }

    if (scorer) {
      this.lastScorer = scorer;
      this.playerScoreText.setText(this.playerScore.toString());
      this.aiScoreText.setText(this.aiScore.toString());

      if (this.playerScore >= MAX_SCORE || this.aiScore >= MAX_SCORE) {
        this.endGame();
      } else {
        this.resetBall();
      }
    }
  }

  protected constrainPaddles() {
    const halfPaddleHeight = PADDLE_HEIGHT / 2;

    // Keep paddles within screen bounds
    if (this.playerPaddle.y < halfPaddleHeight) {
      this.playerPaddle.y = halfPaddleHeight;
    } else if (this.playerPaddle.y > CANVAS_HEIGHT - halfPaddleHeight) {
      this.playerPaddle.y = CANVAS_HEIGHT - halfPaddleHeight;
    }

    if (this.aiPaddle.y < halfPaddleHeight) {
      this.aiPaddle.y = halfPaddleHeight;
    } else if (this.aiPaddle.y > CANVAS_HEIGHT - halfPaddleHeight) {
      this.aiPaddle.y = CANVAS_HEIGHT - halfPaddleHeight;
    }
  }

  private endGame() {
    this.gameOver = true;
    let message = "";

    if (this.playerScore >= MAX_SCORE) {
      message = "You Win! Press R to restart";
    } else if (this.aiScore >= MAX_SCORE) {
      message = "AI Wins! Press R to restart";
    }

    this.setMessage(message);
  }

  private resetGame() {
    this.playerScore = 0;
    this.aiScore = 0;
    this.playerScoreText.setText("0");
    this.aiScoreText.setText("0");
    this.gameOver = false;
    this.gameStarted = false;

    this.resetBall();
    this.playerPaddle.setPosition(10 + PADDLE_WIDTH / 2, CANVAS_HEIGHT / 2);
    this.aiPaddle.setPosition(
      CANVAS_WIDTH - 10 - PADDLE_WIDTH / 2,
      CANVAS_HEIGHT / 2
    );

    this.setMessage("Press SPACE to start the game!");
  }

  protected setMessage(message: string) {
    // Safety check: ensure the scene is ready before trying to access add methods
    if (!this.scene.isActive() || !this.sys || !this.add) {
      console.log("Scene not ready for messages yet");
      return;
    }

    // Hide any previous popup
    this.hidePopup();

    if (message === "") {
      // No message to show
      return;
    }

    try {
      // Create a popup container
      const popupContainer = this.add.container(
        CANVAS_WIDTH / 2,
        CANVAS_HEIGHT / 2
      );

      // Create the background
      const bg = this.add.graphics();
      bg.fillStyle(POPUP_BG_COLOR, POPUP_BG_ALPHA);
      bg.lineStyle(POPUP_BORDER_WIDTH, POPUP_BORDER_COLOR);

      // Create the text
      const popupText = this.add
        .text(0, 0, message, {
          fontSize: MESSAGE_FONT_SIZE,
          fontFamily: UI_FONT_FAMILY,
          color: UI_PRIMARY_COLOR,
          align: "center",
          fontStyle: "bold",
          stroke: "#000",
          strokeThickness: 2,
        })
        .setOrigin(0.5);

      // Calculate dimensions
      const width = popupText.width + POPUP_PADDING * 2;
      const height = popupText.height + POPUP_PADDING * 2;

      // Draw the background with border
      bg.fillRoundedRect(
        -width / 2,
        -height / 2,
        width,
        height,
        POPUP_BORDER_RADIUS
      );
      bg.strokeRoundedRect(
        -width / 2,
        -height / 2,
        width,
        height,
        POPUP_BORDER_RADIUS
      );

      // Add elements to container
      popupContainer.add(bg);
      popupContainer.add(popupText);

      // Store the popup for later reference
      this.messageText.setData("popupContainer", popupContainer);

      // Add entrance animation
      popupContainer.setScale(0);
      this.tweens.add({
        targets: popupContainer,
        scale: 1,
        duration: 300,
        ease: "Back.Out",
      });
    } catch (error) {
      console.error("Error in setMessage:", error);
    }
  }

  private hidePopup() {
    const popupContainer = this.messageText.getData("popupContainer");

    if (popupContainer) {
      // Add exit animation
      this.tweens.add({
        targets: popupContainer,
        scale: 0,
        duration: 200,
        ease: "Back.In",
        onComplete: () => {
          popupContainer.destroy();
          this.messageText.setData("popupContainer", null);
        },
      });
    }
  }

  destroy() {
    // Clean up the touch handler to prevent memory leaks
    if (this.touchHandler) {
      this.touchHandler.destroy();
    }

    // Clean up keyboard bindings
    if (this.input && this.input.keyboard) {
      this.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.W);
      this.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.S);
      this.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      this.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.R);
    }
  }
}
