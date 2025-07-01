import * as Phaser from "phaser";
import { Firestore } from "firebase/firestore";
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
  POPUP_BORDER_WIDTH,
  POPUP_BORDER_COLOR,
  PaddleState,
} from "../lib/constants";
import {
  subscribeToGame,
  updatePaddlePosition,
  setPlayerReady,
  GameDocument,
} from "../../../shared/firebase/pongService";

export class PongMultiPlayerScene extends Phaser.Scene {
  // Firebase-related
  private db: Firestore;
  private gameId: string;
  private userId: string;
  private unsubscribeFirebase?: () => void;
  private isPlayer1: boolean = false;
  private isPlayer2: boolean = false;
  private gameData?: GameDocument;

  // Game objects
  protected ball!: Phaser.Physics.Arcade.Image;
  protected player1Paddle!: Phaser.Physics.Arcade.Image;
  protected player2Paddle!: Phaser.Physics.Arcade.Image;

  // Game state
  protected player1Score: number = 0;
  protected player2Score: number = 0;
  protected gameStarted: boolean = false;
  protected gameOver: boolean = false;
  protected isPaused: boolean = false;
  protected isReady: boolean = false;

  // UI elements
  protected player1ScoreText!: Phaser.GameObjects.Text;
  protected player2ScoreText!: Phaser.GameObjects.Text;
  protected messageText!: Phaser.GameObjects.Text;
  protected readyButton!: Phaser.GameObjects.Container;
  protected popup!: Phaser.GameObjects.Container;

  // Input
  protected cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  protected wKey!: Phaser.Input.Keyboard.Key;
  protected sKey!: Phaser.Input.Keyboard.Key;
  protected spaceKey!: Phaser.Input.Keyboard.Key;

  constructor(db: Firestore, gameId: string, userId: string) {
    super({ key: "PongMultiPlayerScene" });
    this.db = db;
    this.gameId = gameId;
    this.userId = userId;
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

    // Display initial message
    this.showMessage("Connecting to game server...");

    // Connect to Firebase
    this.connectToFirebase();
  }

  update() {
    if (this.isPaused || this.gameOver || !this.gameData) return;

    // Update player paddle position based on input
    this.updatePlayerPaddlePosition();

    // If game is in progress, update local ball position from Firebase
    if (this.gameStarted && this.gameData) {
      this.updateBallFromFirebase();
      this.updateScoreFromFirebase();
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
    // Create player 1 paddle (left)
    this.player1Paddle = this.physics.add.image(
      PADDLE_WIDTH * 2,
      CANVAS_HEIGHT / 2,
      "paddle"
    );
    this.player1Paddle.setDisplaySize(PADDLE_WIDTH, PADDLE_HEIGHT);
    this.player1Paddle.setTint(0x00c6ff); // Player 1 color
    this.player1Paddle.setImmovable(true);
    this.player1Paddle.setCollideWorldBounds(true);

    // Create player 2 paddle (right)
    this.player2Paddle = this.physics.add.image(
      CANVAS_WIDTH - PADDLE_WIDTH * 2,
      CANVAS_HEIGHT / 2,
      "paddle"
    );
    this.player2Paddle.setDisplaySize(PADDLE_WIDTH, PADDLE_HEIGHT);
    this.player2Paddle.setTint(0xff4d4d); // Player 2 color
    this.player2Paddle.setImmovable(true);
    this.player2Paddle.setCollideWorldBounds(true);

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
  }

  private createUI() {
    // Player 1 score
    this.player1ScoreText = this.add
      .text(CANVAS_WIDTH / 4, 60, "0", {
        fontSize: SCORE_FONT_SIZE,
        fontFamily: UI_FONT_FAMILY,
        color: UI_PRIMARY_COLOR,
      })
      .setOrigin(0.5);

    // Player 2 score
    this.player2ScoreText = this.add
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

    // Create the ready button
    this.createReadyButton();

    // Create empty popup container
    this.popup = this.add.container(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    this.popup.setVisible(false);
  }

  private createReadyButton() {
    this.readyButton = this.add.container(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT - 100
    );

    // Create button background
    const buttonBg = this.add.rectangle(0, 0, 200, 60, 0x3498db);
    buttonBg.setInteractive({ useHandCursor: true });

    // Create button text
    const buttonText = this.add
      .text(0, 0, "Ready", {
        fontSize: "24px",
        fontFamily: UI_FONT_FAMILY,
        color: UI_PRIMARY_COLOR,
      })
      .setOrigin(0.5);

    // Add components to button container
    this.readyButton.add([buttonBg, buttonText]);

    // Set button event
    buttonBg.on("pointerdown", () => {
      this.setPlayerReady();
    });

    // Hide initially
    this.readyButton.setVisible(false);
  }

  private setupInputHandlers() {
    // Keyboard input
    if (!this.input.keyboard) {
      console.warn("Keyboard input not available");
      return;
    }

    this.cursors = this.input.keyboard.createCursorKeys();
    this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.spaceKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
  }

  private connectToFirebase() {
    // Subscribe to game updates from Firebase
    this.unsubscribeFirebase = subscribeToGame(
      this.db,
      this.gameId,
      (gameData) => this.handleGameUpdate(gameData)
    );
  }

  private handleGameUpdate(gameData: GameDocument) {
    // Store the game data
    this.gameData = gameData;

    // Determine player role
    this.isPlayer1 = gameData.player1Id === this.userId;
    this.isPlayer2 = gameData.player2Id === this.userId;

    // Handle waiting state
    if (gameData.status === "waiting") {
      if (this.isPlayer1) {
        this.showMessage("Waiting for opponent to join...");
        this.readyButton.setVisible(false);
      }
    }

    // Handle playing state
    if (gameData.status === "playing") {
      // Update ready status
      const playerReady = this.isPlayer1
        ? gameData.player1Ready
        : gameData.player2Ready;
      this.isReady = playerReady;

      // Update ready button visibility based on player status
      this.readyButton.setVisible(!this.isReady);

      // Check if both players are ready
      if (gameData.player1Ready && gameData.player2Ready) {
        this.hideMessage();
        this.gameStarted = true;
      } else {
        // Show appropriate message based on ready status
        if (this.isReady) {
          this.showMessage("Waiting for other player to be ready...");
        } else {
          this.showMessage("Click 'Ready' to start the game");
        }
      }

      // Update paddle positions from Firebase
      this.updatePaddlesFromFirebase();
    }

    // Handle finished/abandoned states
    if (gameData.status === "finished" || gameData.status === "abandoned") {
      this.gameOver = true;

      if (gameData.status === "abandoned") {
        this.showMessage("Game abandoned. Opponent disconnected.");
      } else {
        // Determine if current player is winner
        const isWinner =
          (this.isPlayer1 && gameData.score1 > gameData.score2) ||
          (this.isPlayer2 && gameData.score2 > gameData.score1);

        this.showGameOverPopup(
          isWinner ? "You Win!" : "You Lose",
          `${gameData.score1} - ${gameData.score2}`
        );
      }
    }
  }

  private updatePaddlesFromFirebase() {
    if (!this.gameData || !this.player1Paddle || !this.player2Paddle) return;

    // Update paddle positions from Firebase
    this.player1Paddle.y = this.gameData.paddle1.y;
    this.player2Paddle.y = this.gameData.paddle2.y;
  }

  private updateBallFromFirebase() {
    if (!this.gameData || !this.ball) return;

    // Update ball position from Firebase
    this.ball.x = this.gameData.ball.x;
    this.ball.y = this.gameData.ball.y;
  }

  private updateScoreFromFirebase() {
    if (!this.gameData) return;

    // Update score display if changed
    if (this.player1Score !== this.gameData.score1) {
      this.player1Score = this.gameData.score1;
      this.player1ScoreText.setText(this.player1Score.toString());
    }

    if (this.player2Score !== this.gameData.score2) {
      this.player2Score = this.gameData.score2;
      this.player2ScoreText.setText(this.player2Score.toString());
    }

    // Check for game over
    if (this.player1Score >= MAX_SCORE || this.player2Score >= MAX_SCORE) {
      this.gameOver = true;
    }
  }

  private updatePlayerPaddlePosition() {
    if (!this.gameData || (!this.isPlayer1 && !this.isPlayer2)) return;

    // Only handle input if the game is in progress and player is ready
    if (!this.gameStarted || !this.isReady) return;

    const isUpPressed = this.cursors.up.isDown || this.wKey.isDown;
    const isDownPressed = this.cursors.down.isDown || this.sKey.isDown;

    if (!isUpPressed && !isDownPressed) return;

    // Calculate new paddle position
    const paddle = this.isPlayer1 ? this.player1Paddle : this.player2Paddle;
    let newY = paddle.y;

    const moveSpeed = 10;
    if (isUpPressed) {
      newY -= moveSpeed;
    } else if (isDownPressed) {
      newY += moveSpeed;
    }

    // Ensure paddle stays within bounds
    newY = Math.max(
      PADDLE_HEIGHT / 2,
      Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT / 2, newY)
    );

    // Only update Firebase if position actually changed
    if (newY !== paddle.y) {
      paddle.y = newY;

      // Send update to Firebase
      const paddleState: PaddleState = {
        x: paddle.x,
        y: paddle.y,
        dy: 0,
      };

      updatePaddlePosition(this.db, this.gameId, this.userId, paddleState.y);
    }
  }

  private setPlayerReady() {
    if (!this.gameData) return;

    this.isReady = true;
    this.readyButton.setVisible(false);

    // Update Firebase
    setPlayerReady(this.db, this.gameId, this.userId, true);

    // Show waiting message
    this.showMessage("Waiting for other player to be ready...");
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

    // Add back to lobby button
    const lobbyBtn = this.add.rectangle(0, 90, 240, 60, 0x3498db);
    lobbyBtn.setInteractive({ useHandCursor: true });

    const lobbyText = this.add
      .text(0, 90, "Back to Lobby", {
        fontSize: "24px",
        fontFamily: UI_FONT_FAMILY,
        color: UI_PRIMARY_COLOR,
      })
      .setOrigin(0.5);

    // Button event
    lobbyBtn.on("pointerdown", () => {
      // Navigate to lobby using browser API since we can't use router here
      window.location.href = "/games/pong/multi-player/lobby";
    });

    // Add all elements to popup
    this.popup.add([bg, titleText, resultText, scoreText, lobbyBtn, lobbyText]);
    this.popup.setVisible(true);
  }

  shutdown() {
    // Clean up Firebase subscription
    if (this.unsubscribeFirebase) {
      this.unsubscribeFirebase();
    }
  }

  destroy() {
    // Clean up Firebase subscription
    if (this.unsubscribeFirebase) {
      this.unsubscribeFirebase();
    }
  }
}
