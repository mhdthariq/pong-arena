// Main exports for the Modern Pong Game
export { default as ModernPongGame } from "./components/ModernPongGame";
export { default as PongSettings } from "./components/PongSettings";
export { default as PhaserGame } from "./components/PhaserGame";

// Enhanced game logic exports
export {
  // Core game functions
  createEnhancedBall,
  createEnhancedPaddle,
  updateEnhancedBallPhysics,
  updateAdvancedAI,
  checkEnhancedScore,
  resetEnhancedBall,
  createDefaultAIState,

  // Power-up system
  spawnPowerUp,
  updatePowerUps,
  applyPowerUpEffect,
  updatePowerUpEffects,
  getPowerUpConfig,

  // Particle system
  updateParticles,

  // Utility functions
  calculateGameStats,
  generatePowerUpPosition,
  createScreenShake,
  lerp,
  clamp,

  // Types
  type EnhancedBallState,
  type EnhancedPaddleState,
  type PowerUp,
  type PowerUpEffect,
  type Particle,
  type GamePhysics,
  type AIState,
  type GameEffects,
  type SoundEvent,
  type PowerUpType,
  type ParticleType,
  type AIPersonality,
  type SoundType,
  type TrailPoint,
} from "./lib/enhancedGameLogic";

// Settings types
export type { GameSettings } from "./components/PongSettings";
import type { GameSettings } from "./components/PongSettings";

// Original game logic (for backwards compatibility)
export {
  resetBallState,
  updateBallPhysics,
  updateAIPaddle,
  updatePlayerPaddle,
  checkScore,
} from "./lib/gameLogic";

// Constants
export {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PADDLE_WIDTH,
  PADDLE_HEIGHT,
  BALL_SIZE,
  INITIAL_BALL_SPEED,
  MAX_SCORE,
  UI_PRIMARY_COLOR,
  PLAYER_COLOR,
  AI_COLOR,
  type GameStatus,
  type BallState,
  type PaddleState,
} from "./lib/constants";

// Phaser-related exports
export { phaserConfig } from "./phaser/config";
export { PongSinglePlayerScene } from "./phaser/PongSinglePlayerScene";
export { PongMultiPlayerScene } from "./phaser/PongMultiPlayerScene";

// Default game settings
export const DEFAULT_GAME_SETTINGS: GameSettings = {
  difficulty: "medium",
  paddleSize: "medium",
  ballSpeed: "medium",
  maxScore: 7,
  gameMode: "classic",

  aiPersonality: "balanced",
  aiReactionTime: 0.2,
  aiAccuracy: 0.8,

  enablePowerUps: true,
  powerUpFrequency: "normal",
  powerUpDuration: 5,

  enableParticles: true,
  enableTrails: true,
  enableScreenShake: true,
  ballGlow: true,
  paddleGlow: true,
  theme: "classic",

  soundEnabled: true,
  musicEnabled: false,
  soundVolume: 0.8,
  musicVolume: 0.5,

  targetFPS: 60,
  particleCount: "medium",
  enableVSync: true,

  highContrast: false,
  reduceMotion: false,
  colorBlindMode: "none",

  enablePhysics: true,
  ballBounceDamping: 0.95,
  paddleFriction: 0.8,
  wallBounceSound: true,
  paddleHitSound: true,
};

// Game themes configuration
export const GAME_THEMES = {
  classic: {
    name: "Classic",
    description: "Traditional white on black",
    colors: {
      background: "#000000",
      foreground: "#ffffff",
      player: "#00c6ff",
      ai: "#ff4d4d",
      accent: "#ffff00",
    },
  },
  neon: {
    name: "Neon",
    description: "Bright neon colors with glow effects",
    colors: {
      background: "#0a0a0a",
      foreground: "#00ffff",
      player: "#ff00ff",
      ai: "#00ff00",
      accent: "#ffff00",
    },
  },
  retro: {
    name: "Retro",
    description: "80s-inspired color scheme",
    colors: {
      background: "#1a0a2e",
      foreground: "#ff6b35",
      player: "#f7971e",
      ai: "#ffd700",
      accent: "#06ffa5",
    },
  },
  minimal: {
    name: "Minimal",
    description: "Clean, simple design",
    colors: {
      background: "#f8f9fa",
      foreground: "#343a40",
      player: "#007bff",
      ai: "#dc3545",
      accent: "#28a745",
    },
  },
  cyberpunk: {
    name: "Cyberpunk",
    description: "Futuristic dark theme",
    colors: {
      background: "#0d1117",
      foreground: "#58a6ff",
      player: "#f85149",
      ai: "#7c3aed",
      accent: "#fbbf24",
    },
  },
};

// Power-up descriptions for UI
export const POWERUP_DESCRIPTIONS = {
  speed_boost: {
    name: "Speed Boost",
    description: "Increases ball speed temporarily",
    icon: "⚡",
    rarity: "Common",
  },
  size_increase: {
    name: "Giant Ball",
    description: "Makes the ball larger and easier to hit",
    icon: "🔴",
    rarity: "Common",
  },
  size_decrease: {
    name: "Tiny Ball",
    description: "Makes the ball smaller and harder to track",
    icon: "🟢",
    rarity: "Common",
  },
  multi_ball: {
    name: "Multi Ball",
    description: "Spawns multiple balls for chaos",
    icon: "🟣",
    rarity: "Legendary",
  },
  freeze_opponent: {
    name: "Freeze Ray",
    description: "Temporarily freezes the opponent paddle",
    icon: "❄️",
    rarity: "Rare",
  },
  paddle_extend: {
    name: "Extend Paddle",
    description: "Makes your paddle longer",
    icon: "📏",
    rarity: "Common",
  },
  paddle_shrink: {
    name: "Shrink Ray",
    description: "Makes the opponent paddle smaller",
    icon: "📐",
    rarity: "Uncommon",
  },
  reverse_controls: {
    name: "Control Chaos",
    description: "Reverses opponent movement controls",
    icon: "🔄",
    rarity: "Rare",
  },
  ghost_ball: {
    name: "Ghost Ball",
    description: "Ball phases through paddles occasionally",
    icon: "👻",
    rarity: "Epic",
  },
  magnet_paddle: {
    name: "Magnetic Field",
    description: "Paddle attracts the ball slightly",
    icon: "🧲",
    rarity: "Uncommon",
  },
  lightning_strike: {
    name: "Lightning Strike",
    description: "Brief chance for instant scoring",
    icon: "⚡",
    rarity: "Epic",
  },
  time_warp: {
    name: "Time Warp",
    description: "Slows down time for better precision",
    icon: "⏰",
    rarity: "Legendary",
  },
};

// Difficulty configurations
export const DIFFICULTY_CONFIGS = {
  easy: {
    name: "Easy",
    description: "Perfect for beginners",
    aiSpeed: 3,
    aiAccuracy: 0.6,
    aiReaction: 0.3,
    icon: "🟢",
  },
  medium: {
    name: "Medium",
    description: "Balanced challenge",
    aiSpeed: 4,
    aiAccuracy: 0.8,
    aiReaction: 0.2,
    icon: "🟡",
  },
  hard: {
    name: "Hard",
    description: "For experienced players",
    aiSpeed: 5,
    aiAccuracy: 0.9,
    aiReaction: 0.15,
    icon: "🟠",
  },
  expert: {
    name: "Expert",
    description: "Very challenging",
    aiSpeed: 6,
    aiAccuracy: 0.95,
    aiReaction: 0.1,
    icon: "🔴",
  },
  impossible: {
    name: "Impossible",
    description: "Nearly unbeatable AI",
    aiSpeed: 7,
    aiAccuracy: 0.98,
    aiReaction: 0.05,
    icon: "⚫",
  },
};

// Game mode configurations
export const GAME_MODE_CONFIGS = {
  classic: {
    name: "Classic",
    description: "Traditional Pong gameplay",
    enablePowerUps: false,
    scoreToWin: 11,
    icon: "🏓",
  },
  powerup: {
    name: "Power-up Mode",
    description: "Enhanced gameplay with special abilities",
    enablePowerUps: true,
    scoreToWin: 7,
    icon: "✨",
  },
  survival: {
    name: "Survival",
    description: "AI gets progressively harder",
    enablePowerUps: true,
    scoreToWin: 15,
    icon: "💪",
  },
  tournament: {
    name: "Tournament",
    description: "Best of multiple rounds",
    enablePowerUps: true,
    scoreToWin: 5,
    icon: "🏆",
  },
};

// Version information
export const PONG_VERSION = "2.0.0";
export const PONG_BUILD_DATE = new Date().toISOString();

// Re-export types from components for convenience
import type { GameSettings as PongSettingsType } from "./components/PongSettings";
export type { PongSettingsType };
