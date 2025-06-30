// We don't need to import Phaser again since we extend PongSinglePlayerScene
import { PongSinglePlayerScene } from "./PongSinglePlayerScene";
import { PADDLE_SPEED } from "../lib/constants";
import { BallState, PaddleState, GameStatus } from "../lib/constants";
import { Firestore } from "firebase/firestore";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import { setPlayerReady } from "../firebase/gameService";

// Define the game state interface for type safety
interface MultiplayerGameState {
  ball: BallState;
  paddle1: PaddleState;
  paddle2: PaddleState;
  score1: number;
  score2: number;
  status: GameStatus;
  player1Id: string;
  player2Id: string | null;
  player1Ready: boolean;
  player2Ready: boolean;
}

type PlayerRole = "player1" | "player2" | "spectator";

export class PongMultiPlayerScene extends PongSinglePlayerScene {
  private db: Firestore;
  private gameId: string;
  private userId: string;
  private role: PlayerRole;
  private networkUpdateTimer: number = 0;
  private networkUpdateInterval: number = 50; // Update every 50ms
  private unsubscribe?: () => void;
  private lastReceivedState: MultiplayerGameState | null = null;
  private isHost: boolean = false;
  private player1Ready: boolean = false;
  private player2Ready: boolean = false;
  private readyText!: Phaser.GameObjects.Text; // Definite assignment in create()
  private readyKey!: Phaser.Input.Keyboard.Key; // Definite assignment in create()
  private gameDataInitialized: boolean = false;

  constructor(db: Firestore, gameId: string, userId: string) {
    super();
    this.db = db;
    this.gameId = gameId;
    this.userId = userId;
    this.role = "spectator"; // Default role, will be set in create()
  }

  preload() {
    super.preload();
  }

  create() {
    // We need to do special initialization for the multiplayer scene
    // Initialize network connection first to get player role
    try {
      // Set a delay before initializing to ensure Phaser scene is ready
      this.time.delayedCall(100, () => {
        this.setupNetworkSync();
      });
    } catch (error) {
      console.error("Error in create method:", error);
    }
  }

  private initializeScene() {
    try {
      // Double-check that the scene is ready before calling super.create()
      if (!this.scene.isActive()) {
        this.time.delayedCall(100, () => this.initializeScene());
        return;
      }

      // Now that we have the role and scene is ready, call the parent create method
      super.create();

      // Stop the ball from moving initially
      if (this.ball && this.ball.body) {
        this.ball.body.stop();
      }

      if (this.ball) {
        this.ball.setData("isStarted", false);
      }

      // Setup controls based on role after a slight delay to ensure scene objects are available
      this.time.delayedCall(100, () => {
        if (this.role === "player1") {
          this.setupPlayer1Controls();
        } else if (this.role === "player2") {
          this.setupPlayer2Controls();
        } else {
          this.setupSpectatorMode();
        }

        // Update UI based on role
        this.updateUIForRole();

        // Add ready text and space key listener - at this point the scene should be fully initialized
        if (this.scene.isActive() && this.add) {
          this.readyText = this.add
            .text(
              this.cameras.main.width / 2,
              this.cameras.main.height / 2 + 60,
              "",
              {
                fontSize: "20px",
                color: "#fff",
                fontFamily: '"Press Start 2P"',
                align: "center",
              }
            )
            .setOrigin(0.5);
        }

        if (this.input && this.input.keyboard) {
          this.readyKey = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.SPACE
          );
        }

        this.gameDataInitialized = true;
        this.updateReadyStatusText();
      });
    } catch (error) {
      console.error("Error in MultiPlayer scene initialization:", error);
    }
  }  update(time: number, delta: number): void {
    if (!this.gameDataInitialized) {
      return; // Don't run update until scene is ready
    }

    // Both players can move their paddles at any time
    this.handleInput();

    // Both players can toggle their ready state
    if (this.readyKey && Phaser.Input.Keyboard.JustDown(this.readyKey)) {
      this.toggleReadyState();
    }

    // The host is responsible for all game logic and state updates
    if (this.isHost) {
      this.networkUpdateTimer += delta;

      // Only run game logic if both players are ready
      if (this.player1Ready && this.player2Ready) {
        // Hide the ready text once the game starts
        if (this.readyText.visible) {
          this.readyText.setVisible(false);
          this.setMessage(""); // Clear any waiting messages
        }

        // Start the ball if it hasn't started yet
        if (!this.ball.getData("isStarted")) {
          this.startBall(); // This gives the ball its initial velocity
          this.ball.setData("isStarted", true);
        }

        // Set game as running but DON'T call super.update() to avoid AI logic
        // Instead, run our own game logic that excludes AI
        this.gameStarted = true; // Ensure game is running
        
        // Custom multiplayer game logic that runs instead of super.update()
        // Handle wall collisions (top and bottom)
        this.handleMultiplayerWallCollisions();
        
        // Custom collision detection
        if (this.ball && this.playerPaddle && this.aiPaddle) {
          // Check for collision with player paddle
          if (Phaser.Geom.Intersects.RectangleToRectangle(
            this.ball.getBounds(),
            this.playerPaddle.getBounds()
          )) {
            const ballVelocityX = this.ball.body ? this.ball.body.velocity.x : 0;
            if (ballVelocityX < 0) {
              // Only if ball is moving towards paddle
              this.handleMultiplayerPaddleCollision(this.ball, this.playerPaddle);
            }
          }

          // Enhanced collision detection for player 2's paddle with a larger detection area
          // Create a slightly larger bounds for more reliable collision detection
          const paddleBounds = this.aiPaddle.getBounds();
          const ballBounds = this.ball.getBounds();
          
          // Expand the paddle bounds slightly for more reliable collision detection
          paddleBounds.width += 4;
          
          if (Phaser.Geom.Intersects.RectangleToRectangle(ballBounds, paddleBounds)) {
            const ballVelocityX = this.ball.body ? this.ball.body.velocity.x : 0;
            if (ballVelocityX > 0) {
              // Only if ball is moving towards paddle
              this.handleMultiplayerPaddleCollision(this.ball, this.aiPaddle);
              console.log("Ball hit player 2 paddle at:", 
                this.ball.x.toFixed(1), this.ball.y.toFixed(1));
            }
          }
        }
        
        // We can still call these methods since they're protected, not private
        this.checkScoring();
        this.constrainPaddles();
      }

      // Host should send updates more frequently for smoothness
      if (this.networkUpdateTimer >= 25) { // Increased frequency (25ms ≈ 40fps)
        const isRunning = this.player1Ready && this.player2Ready;
        this.sendGameState(isRunning);
        this.networkUpdateTimer = 0;
      }
    } else {
      // Client-side logic: send paddle updates very frequently (16ms ≈ 60fps) for smoother movement
      this.networkUpdateTimer += delta;
      if (this.networkUpdateTimer >= 16) { // Even more frequent updates for smooth movement
        this.sendClientPaddleState();
        this.networkUpdateTimer = 0;
      }
    }
  }

  private determinePlayerRole(gameData: MultiplayerGameState) {
    if (gameData.player1Id === this.userId) {
      this.role = "player1";
      this.isHost = true;
    } else if (gameData.player2Id === this.userId) {
      this.role = "player2";
      this.isHost = false;
    } else {
      this.role = "spectator";
      this.isHost = false;
    }

    // Initialize the scene only after the role is determined
    if (!this.gameDataInitialized) {
      this.initializeScene();
    }
  }

  private setupPlayer1Controls() {
    // Player 1 controls the left paddle and is the simulation host
    // This is already set up in the parent class
  }

  private setupPlayer2Controls() {
    // Player 2 controls the right paddle (which is the AI paddle in single player)
    // Set initial paddle position if needed
    if (this.aiPaddle && this.aiPaddle.body) {
      // Make sure the AI paddle is initially stationary 
      this.aiPaddle.setVelocity(0, 0);
      
      // Make sure the paddle is visible and has the right position
      this.aiPaddle.setVisible(true);
      
      // The paddle is fully controlled by player 2's input:
      // 1. We've overridden updateAI() to do nothing
      // 2. We've implemented handleInput() to control this paddle with player 2's inputs
      // 3. We've modified the update() method to not call super.update(), avoiding AI logic
    }
  }

  private setupSpectatorMode() {
    // Spectator just watches, no controls
    // We'll override handleInput and updateAI in our custom update cycle
    this.setMessage("Spectating the game");
  }

  private updateUIForRole() {
    // Safety check: only update UI if scene is fully initialized
    if (!this.scene.isActive() || !this.sys || !this.add) {
      console.log("Scene not ready for UI updates");
      return;
    }

    switch (this.role) {
      case "player1":
        this.setMessage("You are Player 1 (Left)");
        break;
      case "player2":
        this.setMessage("You are Player 2 (Right)");
        break;
      case "spectator":
        this.setMessage("You are spectating");
        break;
    }
  }

  private setupNetworkSync() {
    try {
      // Listen for game state updates from Firestore
      const appId = "default-pong-app-id";
      const gameRef = doc(this.db, `artifacts/${appId}/public/data/games`, this.gameId);

      this.unsubscribe = onSnapshot(gameRef, (doc) => {
        if (!doc.exists()) {
          // Only try to show a message if the scene is fully initialized
          if (this.gameDataInitialized && this.scene.isActive()) {
            this.setMessage("Game has been deleted.");
            // Consider shutting down the scene after a delay
            this.time.delayedCall(2000, () => {
              if (this.scene.isActive()) {
                this.scene.stop();
              }
            });
          }
          return;
        }

        const data = doc.data() as MultiplayerGameState;

        if (!this.gameDataInitialized) {
          if (data) {
            this.determinePlayerRole(data);
          }
        } else {
          // This happens after initialization
          // Update ready states from Firestore for all roles
          this.player1Ready = data.player1Ready;
          this.player2Ready = data.player2Ready;
          this.updateReadyStatusText();

          this.lastReceivedState = data;

          // The host is the source of truth. Other clients just render the state.
          if (!this.isHost) {
            this.updateLocalGameState(data);
          }
        }
      });
    } catch (error) {
      console.error("Error setting up network sync:", error);
    }
  }

  private async toggleReadyState() {
    if (this.role === "spectator" || !this.gameDataInitialized) return;

    const currentReadyState =
      this.role === "player1" ? this.player1Ready : this.player2Ready;
    const newReadyState = !currentReadyState;

    // Update the state in Firestore
    await setPlayerReady(this.db, this.gameId, this.userId, newReadyState);
  }

  private updateReadyStatusText() {
    if (!this.readyText || !this.scene.isActive() || !this.gameDataInitialized) return;

    if (this.player1Ready && this.player2Ready) {
      this.readyText.setText("Game Starting!");
    } else {
      const p1Status = this.player1Ready ? "Ready" : "Not Ready";
      const p2Status = this.player2Ready ? "Ready" : "Not Ready";
      this.readyText.setText(
        `Player 1: ${p1Status}\nPlayer 2: ${p2Status}\n\nPress SPACE when ready`
      );
    }
  }

  private updateLocalGameState(gameState: Partial<MultiplayerGameState>) {
    if (!this.gameDataInitialized) return;

    // The host controls the ball, so clients always accept the host's ball state.
    if (gameState.ball && this.ball && this.ball.body) {
      this.ball.setPosition(gameState.ball.x, gameState.ball.y);
      this.ball.body.velocity.x = gameState.ball.dx;
      this.ball.body.velocity.y = gameState.ball.dy;
    }

    // Clients accept the host's authoritative position for the player1 paddle.
    if (this.role !== "player1" && gameState.paddle1 && this.playerPaddle) {
      this.playerPaddle.setPosition(gameState.paddle1.x, gameState.paddle1.y);
    }

    // Host accepts the client's position for the player2 paddle.
    // This is crucial for ensuring player2's movement is visible to player1
    if (this.isHost && gameState.paddle2 && this.aiPaddle) {
      // Ensure the paddle physics body is active and moving correctly
      this.aiPaddle.setPosition(gameState.paddle2.x, gameState.paddle2.y);
      if (this.aiPaddle.body) {
        // Apply the exact velocity from player2
        this.aiPaddle.body.velocity.y = gameState.paddle2.dy;
      }
      // Log to verify we're receiving updates
      console.log("Host received player2 paddle update:", 
        gameState.paddle2.x.toFixed(1), gameState.paddle2.y.toFixed(1), 
        "velocity:", gameState.paddle2.dy.toFixed(1));
      
      // Apply any constraints to keep paddle in bounds after moving
      this.constrainPaddles();
    }

    // Update scores
    if (gameState.score1 !== undefined && this.playerScore !== gameState.score1) {
      this.playerScore = gameState.score1;
      this.playerScoreText.setText(this.playerScore.toString());
    }

    if (gameState.score2 !== undefined && this.aiScore !== gameState.score2) {
      this.aiScore = gameState.score2;
      this.aiScoreText.setText(this.aiScore.toString());
    }

    // Update game status
    if (gameState.status === "finished") {
      this.gameOver = true;
      const score1 = gameState.score1 ?? 0;
      const score2 = gameState.score2 ?? 0;
      if (score1 > score2) {
        this.setMessage("Player 1 wins!");
      } else {
        this.setMessage("Player 2 wins!");
      }
    }
  }

  private sendGameState(isRunning: boolean) {
    if (!this.db || !this.gameId || !this.gameDataInitialized || !this.isHost) return;

    try {
      const appId = "default-pong-app-id";
      const gameRef = doc(this.db, `artifacts/${appId}/public/data/games`, this.gameId);

      const paddle1State: PaddleState = {
        x: this.playerPaddle.x,
        y: this.playerPaddle.y,
        dy: this.playerPaddle.body?.velocity.y || 0,
      };

      // For the host, aiPaddle is player 2's paddle
      const paddle2State: PaddleState = {
        x: this.aiPaddle.x,
        y: this.aiPaddle.y,
        dy: this.aiPaddle.body?.velocity.y || 0,
      };

      let updatePayload: Partial<MultiplayerGameState> = {
        paddle1: paddle1State,
        paddle2: paddle2State, // Host sends its view of paddle2
      };

      if (isRunning) {
        const ballState: BallState = {
          x: this.ball.x,
          y: this.ball.y,
          dx: this.ball.body?.velocity.x || 0,
          dy: this.ball.body?.velocity.y || 0,
        };
        updatePayload = {
          ...updatePayload,
          ball: ballState,
          score1: this.playerScore,
          score2: this.aiScore,
          status: this.gameOver ? "finished" : "playing",
        };
      }

      updateDoc(gameRef, updatePayload).catch((err) =>
        console.error("Error updating game state:", err)
      );
    } catch (error) {
      console.error("Failed to send game state:", error);
    }
  }

  private sendClientPaddleState() {
    if (this.role !== "player2" || !this.db || !this.gameId || !this.gameDataInitialized) return;

    try {
      const appId = "default-pong-app-id";
      const gameRef = doc(this.db, `artifacts/${appId}/public/data/games`, this.gameId);

      // Make sure the paddle position is sent correctly
      if (this.aiPaddle && this.aiPaddle.body) {
        const paddle2State: PaddleState = {
          x: this.aiPaddle.x,
          y: this.aiPaddle.y,
          dy: this.aiPaddle.body.velocity.y,
        };

        // Client only sends its own paddle data - more frequently for better responsiveness
        console.log("Player 2 sending paddle position:", 
          paddle2State.x.toFixed(1), paddle2State.y.toFixed(1), 
          "velocity:", paddle2State.dy.toFixed(1));
          
        updateDoc(gameRef, { paddle2: paddle2State }).catch((err) =>
          console.error("Error sending client paddle state:", err)
        );
      }
    } catch (error) {
      console.error("Failed to send client paddle state:", error);
    }
  }

  // Multiplayer implementations of private parent class methods
  
  private handleMultiplayerWallCollisions(): void {
    if (!this.ball || !this.ball.body) return;

    // Bounce off top and bottom walls
    if (this.ball.y < this.ball.height / 2) {
      // Top wall collision
      this.ball.y = this.ball.height / 2;
      this.ball.body.velocity.y = Math.abs(this.ball.body.velocity.y);
    } else if (this.ball.y > this.cameras.main.height - this.ball.height / 2) {
      // Bottom wall collision
      this.ball.y = this.cameras.main.height - this.ball.height / 2;
      this.ball.body.velocity.y = -Math.abs(this.ball.body.velocity.y);
    }
  }

  private handleMultiplayerPaddleCollision(ball: Phaser.Physics.Arcade.Image, paddle: Phaser.Physics.Arcade.Image): void {
    if (!ball.body) return;
    
    // Calculate where on the paddle the ball hit (0 = middle, -1 = top, 1 = bottom)
    const relativeImpactPosition = (ball.y - paddle.y) / (paddle.height / 2);
    
    // Fix overlap - push ball outside paddle to prevent sticking
    const isRightPaddle = paddle === this.aiPaddle;
    if (isRightPaddle) {
      // Right paddle (player 2) collision - move ball left
      ball.x = paddle.x - paddle.width/2 - ball.width/2 - 2; // Move further left to ensure no overlap
    } else {
      // Left paddle (player 1) collision - move ball right
      ball.x = paddle.x + paddle.width/2 + ball.width/2 + 2; // Move further right to ensure no overlap
    }
    
    // Reverse the ball's x velocity with a definitive speed
    // Make sure the ball has a strong enough velocity in the opposite direction
    const minBallSpeed = 400; // Fixed ball speed after collision
    
    ball.body.velocity.x = isRightPaddle ? -minBallSpeed : minBallSpeed;
    
    // Add some y velocity based on where the ball hit the paddle
    ball.body.velocity.y = relativeImpactPosition * 300; // Increased y-influence for more dynamic bounces
    
    // Increase speed slightly with each hit
    const currentSpeed = Math.sqrt(Math.pow(ball.body.velocity.x, 2) + Math.pow(ball.body.velocity.y, 2));
    const speedIncreaseFactor = 1.05; // 5% speed increase
    ball.body.velocity.x = ball.body.velocity.x / currentSpeed * currentSpeed * speedIncreaseFactor;
    ball.body.velocity.y = ball.body.velocity.y / currentSpeed * currentSpeed * speedIncreaseFactor;
    
    // Log for debugging with more precise information
    console.log(`Ball hit ${isRightPaddle ? "player2 (right)" : "player1 (left)"} paddle! Ball pos:`, 
      ball.x.toFixed(1), ball.y.toFixed(1), 
      "Paddle pos:", paddle.x.toFixed(1), paddle.y.toFixed(1), 
      "New velocity:", ball.body.velocity.x.toFixed(1), ball.body.velocity.y.toFixed(1));
  }

  // Override base class methods with our multiplayer versions

  // This overrides the handleInput method from the parent class
  protected handleInput(): void {
    if (!this.gameDataInitialized) return;

    // Always stop the AI paddle movement first to prevent any lingering AI movement
    // This ensures paddle only moves when player gives input
    if (this.aiPaddle && this.aiPaddle.body) {
      this.aiPaddle.setVelocity(0, 0);
    }

    if (this.role === "player1") {
      // Player 1 controls the left paddle
      if (this.playerPaddle && this.playerPaddle.body) {
        this.playerPaddle.setVelocity(0, 0);
        
        // Keyboard controls
        if (this.cursors.up.isDown || this.wKey.isDown) {
          this.playerPaddle.setVelocityY(-PADDLE_SPEED * 60);
        } else if (this.cursors.down.isDown || this.sKey.isDown) {
          this.playerPaddle.setVelocityY(PADDLE_SPEED * 60);
        }
        
        // Touch controls
        const touchMovement = this.touchHandler.getVerticalMovement(this.playerPaddle.y);
        if (touchMovement !== 0) {
          this.playerPaddle.setVelocityY(touchMovement * PADDLE_SPEED * 60);
        }
      }
    } else if (this.role === "player2") {
      // Player 2 controls the right paddle (which is the AI paddle in single player)
      if (this.aiPaddle && this.aiPaddle.body) {
        // Keyboard controls for player 2
        if (this.cursors.up.isDown || this.wKey.isDown) {
          this.aiPaddle.setVelocityY(-PADDLE_SPEED * 60);
        } else if (this.cursors.down.isDown || this.sKey.isDown) {
          this.aiPaddle.setVelocityY(PADDLE_SPEED * 60);
        }

        // Touch controls for player 2
        const touchMovement = this.touchHandler.getVerticalMovement(this.aiPaddle.y);
        if (touchMovement !== 0) {
          this.aiPaddle.setVelocityY(touchMovement * PADDLE_SPEED * 60);
        }
      }
    }
    // For spectators, we do nothing - input is ignored
  }

  // This overrides updateAI to completely disable it in multiplayer mode
  protected updateAI(): void {
    // In multiplayer, AI is completely disabled
    // Don't do anything here - this overrides the parent class method that would move the paddle
    return;
  }

  // Override the setMessage method to make it safer in the multiplayer context
  protected setMessage(message: string): void {
    try {
      // Ensure scene is still active and ready before setting message
      if (!this.scene.isActive() || !this.sys || !this.add) {
        console.log("Scene not ready for messages");
        return;
      }
      super.setMessage(message);
    } catch (error) {
      console.log("Error showing message in multiplayer:", error);
    }
  }

  // Override destroy to clean up network resources
  destroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    super.destroy();
  }
}
