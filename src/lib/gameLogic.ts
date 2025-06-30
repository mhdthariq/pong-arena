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

  // Wall collision (top/bottom)
  if (
    newBall.y - BALL_SIZE / 2 < 0 ||
    newBall.y + BALL_SIZE / 2 > CANVAS_HEIGHT
  ) {
    newBall.dy *= -1;
  }

  // Paddle collision (Player 1 / Left Paddle)
  if (
    newBall.dx < 0 && // Moving left
    newBall.x - BALL_SIZE / 2 <= playerPaddle.x + PADDLE_WIDTH &&
    newBall.x > playerPaddle.x &&
    newBall.y + BALL_SIZE / 2 > playerPaddle.y &&
    newBall.y - BALL_SIZE / 2 < playerPaddle.y + PADDLE_HEIGHT
  ) {
    // Reverse horizontal direction
    newBall.dx *= -1;

    // Calculate vertical angle based on where the ball hit the paddle
    const hitPoint =
      (newBall.y - (playerPaddle.y + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);
    newBall.dy = hitPoint * INITIAL_BALL_SPEED;

    // Increase speed slightly to make game progressively harder
    newBall.dx *= 1.03;
    newBall.dy *= 1.03;

    console.log(
      `Ball hit player paddle at y=${newBall.y}, new dy=${newBall.dy}`
    );
  }

  // Paddle collision (Player 2 / Right Paddle)
  if (
    newBall.dx > 0 && // Moving right
    newBall.x + BALL_SIZE / 2 >= opponentPaddle.x &&
    newBall.x < opponentPaddle.x + PADDLE_WIDTH &&
    newBall.y + BALL_SIZE / 2 > opponentPaddle.y &&
    newBall.y - BALL_SIZE / 2 < opponentPaddle.y + PADDLE_HEIGHT
  ) {
    // Reverse horizontal direction
    newBall.dx *= -1;

    // Calculate vertical angle based on where the ball hit the paddle
    const hitPoint =
      (newBall.y - (opponentPaddle.y + PADDLE_HEIGHT / 2)) /
      (PADDLE_HEIGHT / 2);
    newBall.dy = hitPoint * INITIAL_BALL_SPEED;

    // Increase speed slightly to make game progressively harder
    newBall.dx *= 1.03;
    newBall.dy *= 1.03;

    console.log(`Ball hit AI paddle at y=${newBall.y}, new dy=${newBall.dy}`);
  }

  return newBall;
};

/**
 * Updates AI paddle position to follow the ball.
 * @param {PaddleState} aiPaddle Current AI paddle state.
 * @param {BallState} ball Current ball state.
 * @returns {PaddleState} Updated AI paddle state.
 */
export const updateAIPaddle = (
  aiPaddle: PaddleState,
  ball: BallState
): PaddleState => {
  const newAIPaddle = { ...aiPaddle };
  const aiCenter = newAIPaddle.y + PADDLE_HEIGHT / 2;

  // Only track the ball if it's moving towards the AI paddle
  if (ball.dx > 0) {
    if (aiCenter < ball.y - 10) {
      newAIPaddle.dy = INITIAL_BALL_SPEED * 0.8;
    } else if (aiCenter > ball.y + 10) {
      newAIPaddle.dy = -INITIAL_BALL_SPEED * 0.8;
    } else {
      newAIPaddle.dy = 0; // Stop moving if close to the ball
    }
  } else {
    // Slowly move toward center when ball is going away
    if (aiCenter < CANVAS_HEIGHT / 2 - 20) {
      newAIPaddle.dy = INITIAL_BALL_SPEED * 0.3;
    } else if (aiCenter > CANVAS_HEIGHT / 2 + 20) {
      newAIPaddle.dy = -INITIAL_BALL_SPEED * 0.3;
    } else {
      newAIPaddle.dy = 0;
    }
  }

  return newAIPaddle;
};

/**
 * Handles scoring logic.
 * @param {BallState} ball Current ball state.
 * @param {number} score1 Current score for player 1.
 * @param {number} score2 Current score for player 2.
 * @returns {{ score1: number; score2: number; scored: boolean }} Object containing new scores and a boolean indicating if a score occurred.
 */
export const handleScoring = (
  ball: BallState,
  score1: number,
  score2: number
): { score1: number; score2: number; scored: boolean } => {
  let newScore1 = score1;
  let newScore2 = score2;
  let scored = false;

  if (ball.x + BALL_SIZE / 2 < 0) {
    newScore2 += 1;
    scored = true;
  } else if (ball.x - BALL_SIZE / 2 > CANVAS_WIDTH) {
    newScore1 += 1;
    scored = true;
  }
  return { score1: newScore1, score2: newScore2, scored };
};

/**
 * Draws all game elements on the canvas.
 * @param {CanvasRenderingContext2D} ctx The canvas 2D rendering context.
 * @param {BallState} ball Current ball state.
 * @param {PaddleState} playerPaddle Current player paddle state.
 * @param {PaddleState} opponentPaddle Current opponent paddle state.
 * @param {number} score1 Current score for player 1.
 * @param {number} score2 Current score for player 2.
 */
export const drawGame = (
  ctx: CanvasRenderingContext2D,
  ball: BallState,
  playerPaddle: PaddleState,
  opponentPaddle: PaddleState,
  score1: number,
  score2: number,
  player1Color: string = "#00c6ff", // Default player 1 color
  player2Color: string = "#ff4d4d" // Default player 2 color
) => {
  // Clear canvas
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Draw background
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Draw center line
  ctx.strokeStyle = "#333";
  ctx.beginPath();
  ctx.moveTo(CANVAS_WIDTH / 2, 0);
  ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
  ctx.stroke();

  // Log all positions before drawing
  console.log(
    `Drawing - Player paddle at (${playerPaddle.x}, ${playerPaddle.y})`
  );
  console.log(
    `Drawing - AI paddle at (${opponentPaddle.x}, ${opponentPaddle.y})`
  );
  console.log(
    `Drawing - Ball at (${ball.x}, ${ball.y}) with velocity (${ball.dx}, ${ball.dy})`
  );

  // Draw paddles with specified colors
  ctx.fillStyle = player1Color;
  ctx.fillRect(playerPaddle.x, playerPaddle.y, PADDLE_WIDTH, PADDLE_HEIGHT);
  ctx.fillStyle = player2Color;
  ctx.fillRect(opponentPaddle.x, opponentPaddle.y, PADDLE_WIDTH, PADDLE_HEIGHT);

  // Draw ball
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, BALL_SIZE / 2, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.closePath();

  // Draw scores (This will be handled in the React component for better styling)
};
