import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PADDLE_WIDTH,
  PADDLE_HEIGHT,
  BALL_SIZE,
  INITIAL_BALL_SPEED,
  BallState,
  PaddleState,
} from "./constants";

// Define any missing constants
const PADDLE_SPEED = 10; // Paddle movement speed

/**
 * Resets the ball to the center with a random initial direction.
 * @returns {BallState} The new ball state.
 */
export const resetBallState = (): BallState => {
  // Force a guaranteed non-zero velocity in both directions
  const dx = INITIAL_BALL_SPEED * (Math.random() > 0.5 ? 1.0 : -1.0); // Fixed magnitude horizontal
  const dy = INITIAL_BALL_SPEED * 0.5 * (Math.random() > 0.5 ? 0.8 : -0.8); // Fixed magnitude vertical

  // Extra safeguard against zero velocities
  const finalDx = dx === 0 ? INITIAL_BALL_SPEED : dx;
  const finalDy = dy === 0 ? INITIAL_BALL_SPEED * 0.5 : dy;

  console.log(`Resetting ball with velocity: dx=${finalDx}, dy=${finalDy}`);

  return {
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT / 2,
    dx: finalDx,
    dy: finalDy,
  };
};

/**
 * Updates ball position and handles wall/paddle collisions.
 * @param {BallState} ball Current ball state.
 * @param {PaddleState} playerPaddle Current player paddle state.
 * @param {PaddleState} opponentPaddle Current opponent paddle state.
 * @returns {BallState} Updated ball state.
 */
export const updateBallPhysics = (
  ball: BallState,
  playerPaddle: PaddleState,
  opponentPaddle: PaddleState
): BallState => {
  const newBall = { ...ball };

  // Move ball
  newBall.x += newBall.dx;
  newBall.y += newBall.dy;

  // Handle top/bottom wall collision
  if (
    newBall.y - BALL_SIZE / 2 <= 0 ||
    newBall.y + BALL_SIZE / 2 >= CANVAS_HEIGHT
  ) {
    newBall.dy *= -1; // Reverse vertical direction
    // Keep ball in bounds
    newBall.y = Math.max(
      BALL_SIZE / 2,
      Math.min(CANVAS_HEIGHT - BALL_SIZE / 2, newBall.y)
    );
  }

  // Handle paddle collisions
  // Check left paddle (player) collision
  if (
    newBall.dx < 0 && // Ball moving left
    newBall.x - BALL_SIZE / 2 <= playerPaddle.x + PADDLE_WIDTH / 2 && // Ball's left edge is past paddle's right edge
    newBall.x + BALL_SIZE / 2 >= playerPaddle.x - PADDLE_WIDTH / 2 && // Ball's right edge is before paddle's left edge
    newBall.y + BALL_SIZE / 2 >= playerPaddle.y - PADDLE_HEIGHT / 2 && // Ball's bottom is below paddle's top
    newBall.y - BALL_SIZE / 2 <= playerPaddle.y + PADDLE_HEIGHT / 2 // Ball's top is above paddle's bottom
  ) {
    // Handle collision with player paddle
    handlePaddleCollision(newBall, playerPaddle, true);
  }

  // Check right paddle (opponent) collision
  if (
    newBall.dx > 0 && // Ball moving right
    newBall.x + BALL_SIZE / 2 >= opponentPaddle.x - PADDLE_WIDTH / 2 && // Ball's right edge is past paddle's left edge
    newBall.x - BALL_SIZE / 2 <= opponentPaddle.x + PADDLE_WIDTH / 2 && // Ball's left edge is before paddle's right edge
    newBall.y + BALL_SIZE / 2 >= opponentPaddle.y - PADDLE_HEIGHT / 2 && // Ball's bottom is below paddle's top
    newBall.y - BALL_SIZE / 2 <= opponentPaddle.y + PADDLE_HEIGHT / 2 // Ball's top is above paddle's bottom
  ) {
    // Handle collision with opponent paddle
    handlePaddleCollision(newBall, opponentPaddle, false);
  }

  return newBall;
};

/**
 * Handle the physics of a ball colliding with a paddle.
 * @param {BallState} ball The ball state to update.
 * @param {PaddleState} paddle The paddle the ball is colliding with.
 * @param {boolean} isPlayer Whether this is the player's paddle or not.
 */
const handlePaddleCollision = (
  ball: BallState,
  paddle: PaddleState,
  isPlayer: boolean
): void => {
  // Reverse horizontal direction
  ball.dx *= -1;

  // Increase speed slightly on each hit
  const speedIncreaseFactor = 1.05;
  ball.dx *= speedIncreaseFactor;

  // Calculate where on the paddle the ball hit (normalized from -1 to 1)
  const paddleHitPosition = (ball.y - paddle.y) / (PADDLE_HEIGHT / 2);

  // Add some vertical angle based on where the ball hit the paddle
  // Higher on paddle = more upward angle, lower = more downward
  const verticalFactor = 0.75; // Maximum vertical deflection factor
  ball.dy = Math.abs(ball.dx) * paddleHitPosition * verticalFactor;

  // Ensure the ball is clear of the paddle to prevent multiple collisions
  if (isPlayer) {
    ball.x = paddle.x + PADDLE_WIDTH / 2 + BALL_SIZE / 2 + 1;
  } else {
    ball.x = paddle.x - PADDLE_WIDTH / 2 - BALL_SIZE / 2 - 1;
  }

  // Apply a slight randomness for natural feel
  ball.dy += (Math.random() - 0.5) * 2;
};

/**
 * Checks if a point was scored.
 * @param {BallState} ball Current ball state.
 * @returns {'player' | 'opponent' | null} Who scored, or null if no score.
 */
export const checkScore = (ball: BallState): "player" | "opponent" | null => {
  // Ball passed left edge of screen - opponent scores
  if (ball.x - BALL_SIZE / 2 <= 0) {
    return "opponent";
  }

  // Ball passed right edge of screen - player scores
  if (ball.x + BALL_SIZE / 2 >= CANVAS_WIDTH) {
    return "player";
  }

  // No score
  return null;
};

/**
 * Updates AI paddle position based on ball position.
 * @param {PaddleState} paddle AI paddle state.
 * @param {BallState} ball Current ball state.
 * @param {number} difficulty AI difficulty level (0-1).
 * @returns {PaddleState} Updated AI paddle state.
 */
export const updateAIPaddle = (
  paddle: PaddleState,
  ball: BallState,
  difficulty = 0.8
): PaddleState => {
  const newPaddle = { ...paddle };

  // Only react when the ball is moving toward the AI
  if (ball.dx > 0) {
    // Calculate the "perfect" y position
    const perfectY = ball.y;

    // Apply difficulty - higher difficulty means more accurate tracking
    // At difficulty 1, the AI perfectly follows the ball
    // At difficulty 0, the AI hardly moves
    const aiReactionRate = 0.1 * difficulty;
    const targetY = paddle.y + (perfectY - paddle.y) * aiReactionRate;

    // Apply the position, respecting boundary constraints
    newPaddle.y = Math.max(
      PADDLE_HEIGHT / 2,
      Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT / 2, targetY)
    );
  }

  return newPaddle;
};

/**
 * Updates the player paddle based on keyboard input.
 * @param {PaddleState} paddle Current player paddle state.
 * @param {boolean} isUpPressed Is the up key pressed.
 * @param {boolean} isDownPressed Is the down key pressed.
 * @returns {PaddleState} Updated player paddle state.
 */
export const updatePlayerPaddle = (
  paddle: PaddleState,
  isUpPressed: boolean,
  isDownPressed: boolean
): PaddleState => {
  const newPaddle = { ...paddle };

  // Determine direction based on key presses
  if (isUpPressed && !isDownPressed) {
    // Moving up (negative y direction in canvas)
    newPaddle.dy = -PADDLE_SPEED;
  } else if (isDownPressed && !isUpPressed) {
    // Moving down (positive y direction in canvas)
    newPaddle.dy = PADDLE_SPEED;
  } else {
    // No movement or both keys pressed - stop
    newPaddle.dy = 0;
  }

  // Update position
  newPaddle.y += newPaddle.dy;

  // Constrain within canvas bounds
  newPaddle.y = Math.max(
    PADDLE_HEIGHT / 2,
    Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT / 2, newPaddle.y)
  );

  return newPaddle;
};
