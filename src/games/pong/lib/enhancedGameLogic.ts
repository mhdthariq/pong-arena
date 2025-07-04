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

// Enhanced types for the improved game
export interface EnhancedBallState extends BallState {
  trail: TrailPoint[];
  spin: number;
  size: number;
  glow: boolean;
  powerupEffect?: PowerUpEffect;
  lastHitTime: number;
  speed: number;
}

export interface TrailPoint {
  x: number;
  y: number;
  alpha: number;
  size: number;
  timestamp: number;
}

export interface EnhancedPaddleState extends PaddleState {
  width: number;
  height: number;
  speed: number;
  powerupEffect?: PowerUpEffect;
  lastHitTime: number;
  energy: number;
  temperature: number; // For visual effects
}

export interface PowerUp {
  id: string;
  x: number;
  y: number;
  type: PowerUpType;
  active: boolean;
  timer: number;
  maxTimer: number;
  pulsePhase: number;
  collected: boolean;
}

export interface PowerUpEffect {
  type: PowerUpType;
  duration: number;
  intensity: number;
  startTime: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  alpha: number;
  type: ParticleType;
  gravity: boolean;
}

export interface GamePhysics {
  gravity: number;
  friction: number;
  airResistance: number;
  bounceDamping: number;
  spinFactor: number;
  maxSpeed: number;
  minSpeed: number;
}

export interface AIState {
  difficulty: AIPersonality;
  reactionTime: number;
  accuracy: number;
  predictiveDepth: number;
  lastDecision: number;
  targetY: number;
  confidence: number;
  adaptability: number;
  mistakes: number;
}

export interface GameEffects {
  screenShake: { x: number; y: number; intensity: number; duration: number };
  particles: Particle[];
  sounds: SoundEvent[];
  flashEffect: { intensity: number; color: string; duration: number };
  slowMotion: { active: boolean; factor: number; duration: number };
}

export interface SoundEvent {
  type: SoundType;
  volume: number;
  pitch: number;
  timestamp: number;
  x?: number;
  y?: number;
}

export type PowerUpType =
  | "speed_boost"
  | "size_increase"
  | "size_decrease"
  | "multi_ball"
  | "freeze_opponent"
  | "paddle_extend"
  | "paddle_shrink"
  | "reverse_controls"
  | "ghost_ball"
  | "magnet_paddle"
  | "lightning_strike"
  | "time_warp";

export type ParticleType =
  | "explosion"
  | "trail"
  | "spark"
  | "glow"
  | "smoke"
  | "magic"
  | "electric";

export type AIPersonality =
  | "defensive"
  | "balanced"
  | "aggressive"
  | "unpredictable"
  | "adaptive";

export type SoundType =
  | "paddle_hit"
  | "wall_bounce"
  | "score"
  | "powerup_spawn"
  | "powerup_collect"
  | "powerup_activate"
  | "game_start"
  | "game_end";

// Default physics settings
const DEFAULT_PHYSICS: GamePhysics = {
  gravity: 0,
  friction: 0.98,
  airResistance: 0.999,
  bounceDamping: 0.95,
  spinFactor: 0.3,
  maxSpeed: 12,
  minSpeed: 2,
};

// Power-up configurations
const POWERUP_CONFIGS: Record<
  PowerUpType,
  {
    duration: number;
    rarity: number;
    color: string;
    description: string;
  }
> = {
  speed_boost: {
    duration: 5000,
    rarity: 0.2,
    color: "#ff6b00",
    description: "Increases ball speed",
  },
  size_increase: {
    duration: 8000,
    rarity: 0.15,
    color: "#ff0066",
    description: "Makes ball larger",
  },
  size_decrease: {
    duration: 6000,
    rarity: 0.15,
    color: "#66ff00",
    description: "Makes ball smaller",
  },
  multi_ball: {
    duration: 10000,
    rarity: 0.05,
    color: "#ff00ff",
    description: "Spawns multiple balls",
  },
  freeze_opponent: {
    duration: 3000,
    rarity: 0.1,
    color: "#00ccff",
    description: "Freezes opponent paddle",
  },
  paddle_extend: {
    duration: 7000,
    rarity: 0.12,
    color: "#ffff00",
    description: "Extends your paddle",
  },
  paddle_shrink: {
    duration: 5000,
    rarity: 0.08,
    color: "#ff3300",
    description: "Shrinks opponent paddle",
  },
  reverse_controls: {
    duration: 4000,
    rarity: 0.06,
    color: "#cc00ff",
    description: "Reverses opponent controls",
  },
  ghost_ball: {
    duration: 6000,
    rarity: 0.04,
    color: "#ffffff",
    description: "Ball phases through paddle",
  },
  magnet_paddle: {
    duration: 8000,
    rarity: 0.07,
    color: "#ffcc00",
    description: "Paddle attracts ball",
  },
  lightning_strike: {
    duration: 1000,
    rarity: 0.03,
    color: "#ffff66",
    description: "Instant score chance",
  },
  time_warp: {
    duration: 5000,
    rarity: 0.02,
    color: "#6600ff",
    description: "Slows down time",
  },
};

/**
 * Enhanced ball state management with physics and effects
 */
export const createEnhancedBall = (
  x: number = CANVAS_WIDTH / 2,
  y: number = CANVAS_HEIGHT / 2,
  dx: number = INITIAL_BALL_SPEED,
  dy: number = INITIAL_BALL_SPEED * 0.5,
): EnhancedBallState => {
  return {
    x,
    y,
    dx,
    dy,
    trail: [],
    spin: 0,
    size: BALL_SIZE,
    glow: true,
    lastHitTime: 0,
    speed: Math.sqrt(dx * dx + dy * dy),
  };
};

/**
 * Enhanced paddle state with power-up effects
 */
export const createEnhancedPaddle = (
  x: number,
  y: number = CANVAS_HEIGHT / 2,
  isPlayer: boolean = true,
): EnhancedPaddleState => {
  return {
    x,
    y,
    dy: 0,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    speed: isPlayer ? 8 : 6,
    lastHitTime: 0,
    energy: 100,
    temperature: 0,
  };
};

/**
 * Update ball physics with enhanced collision detection and effects
 */
export const updateEnhancedBallPhysics = (
  ball: EnhancedBallState,
  playerPaddle: EnhancedPaddleState,
  aiPaddle: EnhancedPaddleState,
  physics: GamePhysics = DEFAULT_PHYSICS,
  deltaTime: number = 16.67,
): {
  ball: EnhancedBallState;
  collisions: CollisionEvent[];
  effects: GameEffects;
} => {
  const newBall = { ...ball };
  const collisions: CollisionEvent[] = [];
  const effects: GameEffects = {
    screenShake: { x: 0, y: 0, intensity: 0, duration: 0 },
    particles: [],
    sounds: [],
    flashEffect: { intensity: 0, color: "#ffffff", duration: 0 },
    slowMotion: { active: false, factor: 1, duration: 0 },
  };

  // Apply physics
  newBall.dx *= physics.airResistance;
  newBall.dy *= physics.airResistance;
  newBall.dy += (physics.gravity * deltaTime) / 1000;

  // Apply spin effects
  if (Math.abs(newBall.spin) > 0.1) {
    newBall.dy += newBall.spin * physics.spinFactor;
    newBall.spin *= 0.98; // Spin decay
  }

  // Speed limits
  const currentSpeed = Math.sqrt(
    newBall.dx * newBall.dx + newBall.dy * newBall.dy,
  );
  if (currentSpeed > physics.maxSpeed) {
    const factor = physics.maxSpeed / currentSpeed;
    newBall.dx *= factor;
    newBall.dy *= factor;
  } else if (currentSpeed < physics.minSpeed) {
    const factor = physics.minSpeed / currentSpeed;
    newBall.dx *= factor;
    newBall.dy *= factor;
  }

  newBall.speed = Math.sqrt(newBall.dx * newBall.dx + newBall.dy * newBall.dy);

  // Update position
  newBall.x += (newBall.dx * deltaTime) / 16.67;
  newBall.y += (newBall.dy * deltaTime) / 16.67;

  // Update trail
  updateBallTrail(newBall);

  // Wall collisions
  if (newBall.y - newBall.size / 2 <= 0) {
    newBall.y = newBall.size / 2;
    newBall.dy = Math.abs(newBall.dy) * physics.bounceDamping;
    collisions.push({
      type: "wall",
      x: newBall.x,
      y: 0,
      normal: { x: 0, y: 1 },
      intensity: Math.abs(newBall.dy),
    });
    effects.sounds.push({
      type: "wall_bounce",
      volume: Math.min(1, Math.abs(newBall.dy) / 8),
      pitch: 1 + Math.random() * 0.2,
      timestamp: Date.now(),
      x: newBall.x,
      y: newBall.y,
    });
  }

  if (newBall.y + newBall.size / 2 >= CANVAS_HEIGHT) {
    newBall.y = CANVAS_HEIGHT - newBall.size / 2;
    newBall.dy = -Math.abs(newBall.dy) * physics.bounceDamping;
    collisions.push({
      type: "wall",
      x: newBall.x,
      y: CANVAS_HEIGHT,
      normal: { x: 0, y: -1 },
      intensity: Math.abs(newBall.dy),
    });
    effects.sounds.push({
      type: "wall_bounce",
      volume: Math.min(1, Math.abs(newBall.dy) / 8),
      pitch: 1 + Math.random() * 0.2,
      timestamp: Date.now(),
      x: newBall.x,
      y: newBall.y,
    });
  }

  // Paddle collisions
  const playerCollision = checkEnhancedPaddleCollision(
    newBall,
    playerPaddle,
    true,
  );
  if (playerCollision.hit) {
    applyPaddleCollisionEffects(newBall, playerPaddle, playerCollision);
    collisions.push(playerCollision);
    effects.sounds.push({
      type: "paddle_hit",
      volume: Math.min(1, newBall.speed / 10),
      pitch: 0.8 + Math.random() * 0.4,
      timestamp: Date.now(),
      x: newBall.x,
      y: newBall.y,
    });

    // Screen shake effect
    effects.screenShake = {
      x: Math.random() * 4 - 2,
      y: Math.random() * 4 - 2,
      intensity: Math.min(10, newBall.speed),
      duration: 200,
    };

    // Particle effects
    effects.particles.push(
      ...createPaddleHitParticles(newBall.x, newBall.y, "#00c6ff", 8),
    );
  }

  const aiCollision = checkEnhancedPaddleCollision(newBall, aiPaddle, false);
  if (aiCollision.hit) {
    applyPaddleCollisionEffects(newBall, aiPaddle, aiCollision);
    collisions.push(aiCollision);
    effects.sounds.push({
      type: "paddle_hit",
      volume: Math.min(1, newBall.speed / 10),
      pitch: 0.8 + Math.random() * 0.4,
      timestamp: Date.now(),
      x: newBall.x,
      y: newBall.y,
    });

    effects.screenShake = {
      x: Math.random() * 4 - 2,
      y: Math.random() * 4 - 2,
      intensity: Math.min(10, newBall.speed),
      duration: 200,
    };

    effects.particles.push(
      ...createPaddleHitParticles(newBall.x, newBall.y, "#ff4d4d", 8),
    );
  }

  return { ball: newBall, collisions, effects };
};

interface CollisionEvent {
  type: "wall" | "paddle";
  x: number;
  y: number;
  normal: { x: number; y: number };
  intensity: number;
  hit?: boolean;
  hitPosition?: number;
}

/**
 * Enhanced paddle collision detection with precise hit zones
 */
const checkEnhancedPaddleCollision = (
  ball: EnhancedBallState,
  paddle: EnhancedPaddleState,
  isPlayer: boolean,
): CollisionEvent => {
  const ballLeft = ball.x - ball.size / 2;
  const ballRight = ball.x + ball.size / 2;
  const ballTop = ball.y - ball.size / 2;
  const ballBottom = ball.y + ball.size / 2;

  const paddleLeft = paddle.x - paddle.width / 2;
  const paddleRight = paddle.x + paddle.width / 2;
  const paddleTop = paddle.y - paddle.height / 2;
  const paddleBottom = paddle.y + paddle.height / 2;

  // Check if collision is occurring
  const collision =
    ballRight > paddleLeft &&
    ballLeft < paddleRight &&
    ballBottom > paddleTop &&
    ballTop < paddleBottom;

  if (!collision) {
    return {
      type: "paddle",
      x: ball.x,
      y: ball.y,
      normal: { x: 0, y: 0 },
      intensity: 0,
      hit: false,
    };
  }

  // Calculate hit position (-1 to 1, where 0 is center)
  const hitPosition = (ball.y - paddle.y) / (paddle.height / 2);

  return {
    type: "paddle",
    x: ball.x,
    y: ball.y,
    normal: { x: isPlayer ? 1 : -1, y: 0 },
    intensity: ball.speed,
    hit: true,
    hitPosition: Math.max(-1, Math.min(1, hitPosition)),
  };
};

/**
 * Apply collision effects to ball and paddle
 */
const applyPaddleCollisionEffects = (
  ball: EnhancedBallState,
  paddle: EnhancedPaddleState,
  collision: CollisionEvent,
) => {
  if (!collision.hit || collision.hitPosition === undefined) return;

  // Reverse horizontal direction with speed increase
  ball.dx *= -1.05;

  // Apply vertical deflection based on hit position
  const deflectionStrength = 0.8;
  ball.dy += collision.hitPosition * deflectionStrength * Math.abs(ball.dx);

  // Add spin based on paddle movement and hit position
  ball.spin = paddle.dy * 0.1 + collision.hitPosition * 0.2;

  // Update paddle temperature for visual effects
  paddle.temperature = Math.min(100, paddle.temperature + 20);
  paddle.lastHitTime = Date.now();

  // Ensure ball is outside paddle bounds
  const isPlayer = collision.normal.x > 0;
  ball.x = isPlayer
    ? paddle.x + paddle.width / 2 + ball.size / 2 + 2
    : paddle.x - paddle.width / 2 - ball.size / 2 - 2;
};

/**
 * Update ball trail effect
 */
const updateBallTrail = (ball: EnhancedBallState) => {
  const now = Date.now();

  // Add new trail point
  ball.trail.push({
    x: ball.x,
    y: ball.y,
    alpha: 1,
    size: ball.size,
    timestamp: now,
  });

  // Update existing trail points
  ball.trail = ball.trail
    .map((point) => ({
      ...point,
      alpha: Math.max(0, 1 - (now - point.timestamp) / 500),
      size: point.size * (0.5 + point.alpha * 0.5),
    }))
    .filter((point) => point.alpha > 0.05)
    .slice(-12); // Keep only last 12 points
};

/**
 * Advanced AI with personality and adaptive behavior
 */
export const updateAdvancedAI = (
  paddle: EnhancedPaddleState,
  ball: EnhancedBallState,
  aiState: AIState,
  deltaTime: number = 16.67,
): { paddle: EnhancedPaddleState; aiState: AIState } => {
  const newPaddle = { ...paddle };
  const newAIState = { ...aiState };
  const now = Date.now();

  // Only react if enough time has passed (reaction time)
  if (now - newAIState.lastDecision < newAIState.reactionTime * 1000) {
    return { paddle: newPaddle, aiState: newAIState };
  }

  // Predict ball position
  const timeToReach = Math.abs((newPaddle.x - ball.x) / ball.dx);
  const predictedY =
    ball.y + ball.dy * timeToReach * newAIState.predictiveDepth;

  // Add some randomness based on difficulty
  const errorMargin = (1 - newAIState.accuracy) * 50;
  const randomError = (Math.random() - 0.5) * errorMargin;
  newAIState.targetY = predictedY + randomError;

  // Personality-based behavior modifications
  switch (newAIState.difficulty) {
    case "defensive":
      // Stay closer to center, react more to ball position
      newAIState.targetY = ball.y * 0.7 + (CANVAS_HEIGHT / 2) * 0.3;
      break;

    case "aggressive":
      // Try to hit at extreme angles
      if (Math.abs(ball.dy) < 2) {
        newAIState.targetY += (Math.random() - 0.5) * 30;
      }
      break;

    case "unpredictable":
      // Random behavior occasionally
      if (Math.random() < 0.1) {
        newAIState.targetY += (Math.random() - 0.5) * 100;
      }
      break;

    case "adaptive":
      // Learn from player patterns (simplified)
      newAIState.adaptability += 0.01;
      if (newAIState.mistakes > 3) {
        newAIState.accuracy = Math.min(0.95, newAIState.accuracy + 0.05);
      }
      break;
  }

  // Calculate movement
  const diff = newAIState.targetY - newPaddle.y;
  const maxMove = (newPaddle.speed * deltaTime) / 16.67;

  if (Math.abs(diff) > 5) {
    newPaddle.dy = Math.sign(diff) * Math.min(Math.abs(diff) * 0.1, maxMove);
  } else {
    newPaddle.dy *= 0.8; // Slow down when close
  }

  // Apply movement
  newPaddle.y += newPaddle.dy;
  newPaddle.y = Math.max(
    newPaddle.height / 2,
    Math.min(CANVAS_HEIGHT - newPaddle.height / 2, newPaddle.y),
  );

  // Update confidence based on performance
  const distanceFromTarget = Math.abs(newPaddle.y - newAIState.targetY);
  newAIState.confidence = Math.max(
    0,
    Math.min(1, 1 - distanceFromTarget / 100),
  );

  newAIState.lastDecision = now;

  return { paddle: newPaddle, aiState: newAIState };
};

/**
 * Power-up system management
 */
export const spawnPowerUp = (
  existingPowerUps: PowerUp[],
  frequency: "rare" | "normal" | "frequent" | "chaos" = "normal",
): PowerUp | null => {
  const spawnRates = {
    rare: 0.0005,
    normal: 0.002,
    frequent: 0.005,
    chaos: 0.01,
  };

  if (Math.random() > spawnRates[frequency] || existingPowerUps.length >= 3) {
    return null;
  }

  // Select random power-up type based on rarity
  const availableTypes = Object.entries(POWERUP_CONFIGS);
  const totalRarity = availableTypes.reduce(
    (sum, [, config]) => sum + config.rarity,
    0,
  );
  let random = Math.random() * totalRarity;

  let selectedType: PowerUpType = "speed_boost";
  for (const [type, config] of availableTypes) {
    random -= config.rarity;
    if (random <= 0) {
      selectedType = type as PowerUpType;
      break;
    }
  }

  return {
    id: `powerup_${Date.now()}_${Math.random()}`,
    x: CANVAS_WIDTH * 0.25 + Math.random() * CANVAS_WIDTH * 0.5,
    y: 60 + Math.random() * (CANVAS_HEIGHT - 120),
    type: selectedType,
    active: true,
    timer: 0,
    maxTimer: 15000, // 15 seconds before despawn
    pulsePhase: 0,
    collected: false,
  };
};

/**
 * Update power-up states and check for collection
 */
export const updatePowerUps = (
  powerUps: PowerUp[],
  ball: EnhancedBallState,
  deltaTime: number,
): { powerUps: PowerUp[]; collected: PowerUp[] } => {
  const collected: PowerUp[] = [];

  const updatedPowerUps = powerUps
    .map((powerUp) => {
      const updated = { ...powerUp };
      updated.timer += deltaTime;
      updated.pulsePhase += deltaTime * 0.005;

      // Check collection
      if (!updated.collected) {
        const dx = ball.x - updated.x;
        const dy = ball.y - updated.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 20) {
          updated.collected = true;
          collected.push(updated);
        }
      }

      return updated;
    })
    .filter(
      (powerUp) => !powerUp.collected && powerUp.timer < powerUp.maxTimer,
    );

  return { powerUps: updatedPowerUps, collected };
};

/**
 * Apply power-up effects to game objects
 */
export const applyPowerUpEffect = (
  powerUpType: PowerUpType,
  ball: EnhancedBallState,
  playerPaddle: EnhancedPaddleState,
  aiPaddle: EnhancedPaddleState,
): {
  ball: EnhancedBallState;
  playerPaddle: EnhancedPaddleState;
  aiPaddle: EnhancedPaddleState;
  effects: GameEffects;
} => {
  const effects: GameEffects = {
    screenShake: { x: 0, y: 0, intensity: 0, duration: 0 },
    particles: [],
    sounds: [
      {
        type: "powerup_activate",
        volume: 0.8,
        pitch: 1,
        timestamp: Date.now(),
      },
    ],
    flashEffect: {
      intensity: 0.5,
      color: POWERUP_CONFIGS[powerUpType].color,
      duration: 300,
    },
    slowMotion: { active: false, factor: 1, duration: 0 },
  };

  const config = POWERUP_CONFIGS[powerUpType];
  const startTime = Date.now();

  switch (powerUpType) {
    case "speed_boost":
      ball.dx *= 1.5;
      ball.dy *= 1.5;
      ball.powerupEffect = {
        type: powerUpType,
        duration: config.duration,
        intensity: 1.5,
        startTime,
      };
      break;

    case "size_increase":
      ball.size = Math.min(30, ball.size * 1.5);
      ball.powerupEffect = {
        type: powerUpType,
        duration: config.duration,
        intensity: 1.5,
        startTime,
      };
      break;

    case "size_decrease":
      ball.size = Math.max(6, ball.size * 0.7);
      ball.powerupEffect = {
        type: powerUpType,
        duration: config.duration,
        intensity: 0.7,
        startTime,
      };
      break;

    case "paddle_extend":
      playerPaddle.height = Math.min(150, playerPaddle.height * 1.4);
      playerPaddle.powerupEffect = {
        type: powerUpType,
        duration: config.duration,
        intensity: 1.4,
        startTime,
      };
      break;

    case "freeze_opponent":
      aiPaddle.powerupEffect = {
        type: powerUpType,
        duration: config.duration,
        intensity: 0,
        startTime,
      };
      effects.slowMotion = {
        active: true,
        factor: 0.3,
        duration: config.duration,
      };
      break;

    case "time_warp":
      effects.slowMotion = {
        active: true,
        factor: 0.5,
        duration: config.duration,
      };
      break;

    default:
      console.log(`Power-up ${powerUpType} not implemented yet`);
  }

  return {
    ball: { ...ball },
    playerPaddle: { ...playerPaddle },
    aiPaddle: { ...aiPaddle },
    effects,
  };
};

/**
 * Create particle effects for paddle hits
 */
const createPaddleHitParticles = (
  x: number,
  y: number,
  color: string,
  count: number,
): Particle[] => {
  const particles: Particle[] = [];

  for (let i = 0; i < count; i++) {
    particles.push({
      x: x + (Math.random() - 0.5) * 10,
      y: y + (Math.random() - 0.5) * 10,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8,
      life: 30 + Math.random() * 20,
      maxLife: 30 + Math.random() * 20,
      size: 2 + Math.random() * 3,
      color,
      alpha: 1,
      type: "spark",
      gravity: true,
    });
  }

  return particles;
};

/**
 * Update particle system
 */
export const updateParticles = (
  particles: Particle[],
  deltaTime: number,
): Particle[] => {
  return particles
    .map((particle) => {
      const updated = { ...particle };

      // Update position
      updated.x += (updated.vx * deltaTime) / 16.67;
      updated.y += (updated.vy * deltaTime) / 16.67;

      // Apply gravity
      if (updated.gravity) {
        updated.vy += (0.2 * deltaTime) / 16.67;
      }

      // Apply air resistance
      updated.vx *= 0.98;
      updated.vy *= 0.98;

      // Update life
      updated.life -= deltaTime / 16.67;
      updated.alpha = updated.life / updated.maxLife;

      return updated;
    })
    .filter((particle) => particle.life > 0);
};

/**
 * Check for scoring conditions
 */
export const checkEnhancedScore = (
  ball: EnhancedBallState,
): "player" | "opponent" | null => {
  if (ball.x + ball.size / 2 < 0) {
    return "opponent";
  }

  if (ball.x - ball.size / 2 > CANVAS_WIDTH) {
    return "player";
  }

  return null;
};

/**
 * Reset ball with enhanced properties
 */
export const resetEnhancedBall = (
  lastScorer?: "player" | "opponent",
): EnhancedBallState => {
  const speed = INITIAL_BALL_SPEED;
  let dx = speed * (Math.random() > 0.5 ? 1 : -1);
  const dy = speed * 0.5 * (Math.random() > 0.5 ? 1 : -1);

  // Serve towards the last scorer
  if (lastScorer === "player") {
    dx = Math.abs(dx); // Towards AI
  } else if (lastScorer === "opponent") {
    dx = -Math.abs(dx); // Towards player
  }

  return createEnhancedBall(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, dx, dy);
};

/**
 * Create default AI state
 */
export const createDefaultAIState = (
  difficulty: AIPersonality = "balanced",
): AIState => {
  const configs = {
    defensive: { reactionTime: 0.3, accuracy: 0.7, predictiveDepth: 0.5 },
    balanced: { reactionTime: 0.2, accuracy: 0.8, predictiveDepth: 0.7 },
    aggressive: { reactionTime: 0.15, accuracy: 0.85, predictiveDepth: 0.9 },
    unpredictable: { reactionTime: 0.25, accuracy: 0.6, predictiveDepth: 0.3 },
    adaptive: { reactionTime: 0.2, accuracy: 0.75, predictiveDepth: 0.8 },
  };

  const config = configs[difficulty];

  return {
    difficulty,
    reactionTime: config.reactionTime,
    accuracy: config.accuracy,
    predictiveDepth: config.predictiveDepth,
    lastDecision: 0,
    targetY: CANVAS_HEIGHT / 2,
    confidence: 0.5,
    adaptability: 0,
    mistakes: 0,
  };
};

/**
 * Update power-up effects over time
 */
export const updatePowerUpEffects = (
  ball: EnhancedBallState,
  playerPaddle: EnhancedPaddleState,
  aiPaddle: EnhancedPaddleState,
  deltaTime: number,
): {
  ball: EnhancedBallState;
  playerPaddle: EnhancedPaddleState;
  aiPaddle: EnhancedPaddleState;
} => {
  const now = Date.now();

  // Update ball power-up effects
  if (ball.powerupEffect) {
    const elapsed = now - ball.powerupEffect.startTime;
    if (elapsed >= ball.powerupEffect.duration) {
      // Reset ball properties
      switch (ball.powerupEffect.type) {
        case "speed_boost":
          ball.dx /= ball.powerupEffect.intensity;
          ball.dy /= ball.powerupEffect.intensity;
          break;
        case "size_increase":
        case "size_decrease":
          ball.size = BALL_SIZE;
          break;
      }
      ball.powerupEffect = undefined;
    }
  }

  // Update player paddle power-up effects
  if (playerPaddle.powerupEffect) {
    const elapsed = now - playerPaddle.powerupEffect.startTime;
    if (elapsed >= playerPaddle.powerupEffect.duration) {
      switch (playerPaddle.powerupEffect.type) {
        case "paddle_extend":
          playerPaddle.height = PADDLE_HEIGHT;
          break;
      }
      playerPaddle.powerupEffect = undefined;
    }
  }

  // Update AI paddle power-up effects
  if (aiPaddle.powerupEffect) {
    const elapsed = now - aiPaddle.powerupEffect.startTime;
    if (elapsed >= aiPaddle.powerupEffect.duration) {
      aiPaddle.powerupEffect = undefined;
    }
  }

  // Cool down paddle temperatures
  playerPaddle.temperature = Math.max(
    0,
    playerPaddle.temperature - deltaTime * 0.1,
  );
  aiPaddle.temperature = Math.max(0, aiPaddle.temperature - deltaTime * 0.1);

  return {
    ball: { ...ball },
    playerPaddle: { ...playerPaddle },
    aiPaddle: { ...aiPaddle },
  };
};

/**
 * Calculate game statistics
 */
export const calculateGameStats = (
  gameTime: number,
  ballHits: number,
  longestRally: number,
  powerUpsCollected: number,
  playerScore: number,
  aiScore: number,
) => {
  const accuracy =
    ballHits > 0
      ? (ballHits / (ballHits + Math.max(1, playerScore + aiScore))) * 100
      : 0;
  const avgRallyLength =
    ballHits > 0 ? ballHits / Math.max(1, playerScore + aiScore) : 0;
  const powerUpEfficiency =
    powerUpsCollected > 0 ? (powerUpsCollected / gameTime) * 60 : 0;

  return {
    accuracy: Math.round(accuracy),
    avgRallyLength: Math.round(avgRallyLength * 10) / 10,
    powerUpEfficiency: Math.round(powerUpEfficiency * 10) / 10,
    gameTime,
    totalHits: ballHits,
    longestRally,
    powerUpsCollected,
    finalScore: `${playerScore}-${aiScore}`,
  };
};

/**
 * Generate random power-up spawn position
 */
export const generatePowerUpPosition = (
  existingPowerUps: PowerUp[],
): { x: number; y: number } => {
  const minDistance = 80;
  let attempts = 0;
  let position: { x: number; y: number };

  do {
    position = {
      x: 100 + Math.random() * (CANVAS_WIDTH - 200),
      y: 80 + Math.random() * (CANVAS_HEIGHT - 160),
    };
    attempts++;
  } while (
    attempts < 10 &&
    existingPowerUps.some((powerUp) => {
      const dx = powerUp.x - position.x;
      const dy = powerUp.y - position.y;
      return Math.sqrt(dx * dx + dy * dy) < minDistance;
    })
  );

  return position;
};

/**
 * Create screen shake effect
 */
export const createScreenShake = (intensity: number, duration: number) => {
  return {
    x: (Math.random() - 0.5) * intensity,
    y: (Math.random() - 0.5) * intensity,
    intensity,
    duration,
  };
};

/**
 * Interpolate between two values
 */
export const lerp = (start: number, end: number, factor: number): number => {
  return start + (end - start) * factor;
};

/**
 * Clamp value between min and max
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

/**
 * Get power-up configuration
 */
export const getPowerUpConfig = (type: PowerUpType) => {
  return POWERUP_CONFIGS[type];
};
