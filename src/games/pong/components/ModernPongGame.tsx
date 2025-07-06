"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import GlassmorphicCard from "../../../shared/components/GlassmorphicCard";
import ModernButton from "../../../shared/components/ModernButton";

// Game constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 12;

// Game types
interface GameSettings {
  difficulty: "easy" | "medium" | "hard" | "expert";
  paddleSize: "small" | "medium" | "large";
  ballSpeed: "slow" | "medium" | "fast";
  maxScore: number;
  enablePowerUps: boolean;
  soundEnabled: boolean;
}

interface GameStats {
  playerScore: number;
  aiScore: number;
  ballHits: number;
  longestRally: number;
  gameTime: number;
  powerUpsCollected: number;
}

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  trail: { x: number; y: number; alpha: number }[];
}

interface Paddle {
  x: number;
  y: number;
  vy: number;
  height: number;
}

interface PowerUp {
  x: number;
  y: number;
  type: "speed" | "size" | "multi" | "freeze";
  active: boolean;
  timer: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

const ModernPongGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  // Game state
  const [gameState, setGameState] = useState<
    "menu" | "playing" | "paused" | "gameOver"
  >("menu");
  const [settings, setSettings] = useState<GameSettings>({
    difficulty: "medium",
    paddleSize: "medium",
    ballSpeed: "medium",
    maxScore: 7,
    enablePowerUps: true,
    soundEnabled: true,
  });

  const [stats, setStats] = useState<GameStats>({
    playerScore: 0,
    aiScore: 0,
    ballHits: 0,
    longestRally: 0,
    gameTime: 0,
    powerUpsCollected: 0,
  });

  const [gameHistory, setGameHistory] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [currentRally, setCurrentRally] = useState(0);
  const [gameStartTime, setGameStartTime] = useState(0);

  // Game objects
  const ballRef = useRef<Ball>({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT / 2,
    vx: 4,
    vy: 2,
    trail: [],
  });

  const playerPaddleRef = useRef<Paddle>({
    x: 20,
    y: CANVAS_HEIGHT / 2,
    vy: 0,
    height: PADDLE_HEIGHT,
  });

  const aiPaddleRef = useRef<Paddle>({
    x: CANVAS_WIDTH - 32,
    y: CANVAS_HEIGHT / 2,
    vy: 0,
    height: PADDLE_HEIGHT,
  });

  const powerUpsRef = useRef<PowerUp[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const keysRef = useRef<{ [key: string]: boolean }>({});

  // Input handling will be moved after startGame definition

  // Game initialization
  const initializeGame = useCallback(() => {
    const ball = ballRef.current;
    const playerPaddle = playerPaddleRef.current;
    const aiPaddle = aiPaddleRef.current;

    // Reset ball
    ball.x = CANVAS_WIDTH / 2;
    ball.y = CANVAS_HEIGHT / 2;
    const speed =
      settings.ballSpeed === "slow"
        ? 3
        : settings.ballSpeed === "fast"
          ? 6
          : 4.5;
    ball.vx = speed * (Math.random() > 0.5 ? 1 : -1);
    ball.vy = speed * 0.5 * (Math.random() > 0.5 ? 1 : -1);
    ball.trail = [];

    // Reset paddles
    playerPaddle.y = CANVAS_HEIGHT / 2;
    aiPaddle.y = CANVAS_HEIGHT / 2;
    playerPaddle.vy = 0;
    aiPaddle.vy = 0;

    // Set paddle sizes
    const height =
      settings.paddleSize === "small"
        ? 60
        : settings.paddleSize === "large"
          ? 100
          : 80;
    playerPaddle.height = height;
    aiPaddle.height = height;

    // Clear power-ups and particles
    powerUpsRef.current = [];
    particlesRef.current = [];

    // Reset rally counter
    setCurrentRally(0);
  }, [settings]);

  // Start game
  const startGame = useCallback(() => {
    initializeGame();
    setGameState("playing");
    setStats((prev) => ({
      ...prev,
      playerScore: 0,
      aiScore: 0,
      ballHits: 0,
      gameTime: 0,
      powerUpsCollected: 0,
    }));
    setGameStartTime(Date.now());
  }, [initializeGame]);

  // Add startGame to the input effect dependencies
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = true;

      if (e.key === " ") {
        e.preventDefault();
        if (gameState === "playing") {
          setGameState("paused");
        } else if (gameState === "paused") {
          setGameState("playing");
        } else if (gameState === "menu") {
          startGame();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameState, startGame]);

  // Helper functions
  const resetBall = useCallback(() => {
    const ball = ballRef.current;
    ball.x = CANVAS_WIDTH / 2;
    ball.y = CANVAS_HEIGHT / 2;
    const speed =
      settings.ballSpeed === "slow"
        ? 3
        : settings.ballSpeed === "fast"
          ? 6
          : 4.5;
    ball.vx = speed * (Math.random() > 0.5 ? 1 : -1);
    ball.vy = speed * 0.5 * (Math.random() > 0.5 ? 1 : -1);
    ball.trail = [];
  }, [settings.ballSpeed]);

  const updatePowerUps = useCallback(() => {
    const ball = ballRef.current;
    powerUpsRef.current = powerUpsRef.current.filter((powerUp) => {
      if (!powerUp.active) return false;

      // Check collision with ball
      const dx = ball.x - powerUp.x;
      const dy = ball.y - powerUp.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 20) {
        // Activate power-up effect
        activatePowerUp(powerUp.type);
        setStats((prev) => ({
          ...prev,
          powerUpsCollected: prev.powerUpsCollected + 1,
        }));
        createParticles(powerUp.x, powerUp.y, "#ffff00", 12);
        return false;
      }

      return true;
    });
  }, []);

  // Game logic
  const updateGame = useCallback(() => {
    if (gameState !== "playing") return;

    const ball = ballRef.current;
    const playerPaddle = playerPaddleRef.current;
    const aiPaddle = aiPaddleRef.current;
    const keys = keysRef.current;

    // Update game time
    setStats((prev) => ({
      ...prev,
      gameTime: Math.floor((Date.now() - gameStartTime) / 1000),
    }));

    // Update player paddle
    const paddleSpeed = 6;
    if (keys["w"] || keys["arrowup"]) {
      playerPaddle.vy = -paddleSpeed;
    } else if (keys["s"] || keys["arrowdown"]) {
      playerPaddle.vy = paddleSpeed;
    } else {
      playerPaddle.vy *= 0.8; // Friction
    }

    playerPaddle.y += playerPaddle.vy;
    playerPaddle.y = Math.max(
      playerPaddle.height / 2,
      Math.min(CANVAS_HEIGHT - playerPaddle.height / 2, playerPaddle.y),
    );

    // Update AI paddle
    const aiSpeed =
      settings.difficulty === "easy"
        ? 3
        : settings.difficulty === "hard"
          ? 5
          : settings.difficulty === "expert"
            ? 6
            : 4;
    const aiReaction =
      settings.difficulty === "easy"
        ? 0.3
        : settings.difficulty === "hard"
          ? 0.8
          : settings.difficulty === "expert"
            ? 0.95
            : 0.6;

    if (ball.vx > 0) {
      // Ball moving towards AI
      const targetY =
        ball.y + ball.vy * ((aiPaddle.x - ball.x) / ball.vx) * aiReaction;
      const diff = targetY - aiPaddle.y;
      aiPaddle.vy = Math.sign(diff) * Math.min(Math.abs(diff) * 0.1, aiSpeed);
    } else {
      aiPaddle.vy *= 0.9; // Return to center slowly
    }

    aiPaddle.y += aiPaddle.vy;
    aiPaddle.y = Math.max(
      aiPaddle.height / 2,
      Math.min(CANVAS_HEIGHT - aiPaddle.height / 2, aiPaddle.y),
    );

    // Update ball trail
    ball.trail.push({ x: ball.x, y: ball.y, alpha: 1 });
    ball.trail = ball.trail.slice(-8);
    ball.trail.forEach((point, i) => {
      point.alpha = ((i + 1) / ball.trail.length) * 0.5;
    });

    // Update ball position
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Ball collision with top/bottom walls
    if (ball.y <= BALL_SIZE / 2 || ball.y >= CANVAS_HEIGHT - BALL_SIZE / 2) {
      ball.vy *= -1;
      ball.y = Math.max(
        BALL_SIZE / 2,
        Math.min(CANVAS_HEIGHT - BALL_SIZE / 2, ball.y),
      );
      createParticles(ball.x, ball.y, "#fff", 5);
    }

    // Ball collision with paddles
    const checkPaddleCollision = (paddle: Paddle, isPlayer: boolean) => {
      if (
        ball.x + BALL_SIZE / 2 > paddle.x - PADDLE_WIDTH / 2 &&
        ball.x - BALL_SIZE / 2 < paddle.x + PADDLE_WIDTH / 2 &&
        ball.y + BALL_SIZE / 2 > paddle.y - paddle.height / 2 &&
        ball.y - BALL_SIZE / 2 < paddle.y + paddle.height / 2
      ) {
        // Reverse ball direction
        ball.vx *= -1.05; // Increase speed slightly

        // Add spin based on paddle movement and hit position
        const hitPos = (ball.y - paddle.y) / (paddle.height / 2);
        ball.vy = ball.vx * hitPos * 0.5 + paddle.vy * 0.1;

        // Ensure ball is outside paddle
        ball.x = isPlayer
          ? paddle.x + PADDLE_WIDTH / 2 + BALL_SIZE / 2 + 1
          : paddle.x - PADDLE_WIDTH / 2 - BALL_SIZE / 2 - 1;

        // Update stats
        setStats((prev) => ({ ...prev, ballHits: prev.ballHits + 1 }));
        setCurrentRally((prev) => {
          const newRally = prev + 1;
          setStats((s) => ({
            ...s,
            longestRally: Math.max(s.longestRally, newRally),
          }));
          return newRally;
        });

        // Create particles
        createParticles(ball.x, ball.y, isPlayer ? "#00c6ff" : "#ff4d4d", 8);

        return true;
      }
      return false;
    };

    checkPaddleCollision(playerPaddle, true);
    checkPaddleCollision(aiPaddle, false);

    // Check scoring
    if (ball.x < 0) {
      setStats((prev) => ({ ...prev, aiScore: prev.aiScore + 1 }));
      setGameHistory((prev) => [...prev, `AI scored! Rally: ${currentRally}`]);
      resetBall();
      setCurrentRally(0);
    } else if (ball.x > CANVAS_WIDTH) {
      setStats((prev) => ({ ...prev, playerScore: prev.playerScore + 1 }));
      setGameHistory((prev) => [
        ...prev,
        `Player scored! Rally: ${currentRally}`,
      ]);
      resetBall();
      setCurrentRally(0);
    }

    // Spawn power-ups randomly
    if (
      settings.enablePowerUps &&
      Math.random() < 0.001 &&
      powerUpsRef.current.length < 2
    ) {
      spawnPowerUp();
    }

    // Update power-ups
    updatePowerUps();

    // Update particles
    updateParticles();

    // Check win condition
    if (
      stats.playerScore >= settings.maxScore ||
      stats.aiScore >= settings.maxScore
    ) {
      setGameState("gameOver");
      const winner = stats.playerScore >= settings.maxScore ? "Player" : "AI";
      setGameHistory((prev) => [
        ...prev,
        `Game Over! ${winner} wins ${stats.playerScore}-${stats.aiScore}`,
      ]);
    }
  }, [
    gameState,
    settings,
    stats,
    currentRally,
    gameStartTime,
    resetBall,
    updatePowerUps,
  ]);

  const createParticles = (
    x: number,
    y: number,
    color: string,
    count: number,
  ) => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 30,
        maxLife: 30,
        color,
      });
    }
  };

  const spawnPowerUp = () => {
    const types: PowerUp["type"][] = ["speed", "size", "multi", "freeze"];
    powerUpsRef.current.push({
      x: CANVAS_WIDTH * 0.3 + Math.random() * CANVAS_WIDTH * 0.4,
      y: 50 + Math.random() * (CANVAS_HEIGHT - 100),
      type: types[Math.floor(Math.random() * types.length)],
      active: true,
      timer: 0,
    });
  };

  const activatePowerUp = (type: PowerUp["type"]) => {
    // Implement power-up effects
    console.log(`Power-up activated: ${type}`);
  };

  const updateParticles = () => {
    particlesRef.current = particlesRef.current.filter((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.2; // Gravity
      particle.life--;
      return particle.life > 0;
    });
  };

  // Rendering
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas with gradient background
    const gradient = ctx.createLinearGradient(
      0,
      0,
      CANVAS_WIDTH,
      CANVAS_HEIGHT,
    );
    gradient.addColorStop(0, "#0f172a");
    gradient.addColorStop(1, "#1e293b");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw center line
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, 0);
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw ball trail
    const ball = ballRef.current;
    ball.trail.forEach((point) => {
      ctx.globalAlpha = point.alpha;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(
        point.x,
        point.y,
        (BALL_SIZE / 2) * (point.alpha + 0.5),
        0,
        Math.PI * 2,
      );
      ctx.fill();
    });

    // Draw ball
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "#ffffff";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw paddles
    const drawPaddle = (paddle: Paddle, color: string) => {
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 5;
      ctx.fillRect(
        paddle.x - PADDLE_WIDTH / 2,
        paddle.y - paddle.height / 2,
        PADDLE_WIDTH,
        paddle.height,
      );
      ctx.shadowBlur = 0;
    };

    drawPaddle(playerPaddleRef.current, "#00c6ff");
    drawPaddle(aiPaddleRef.current, "#ff4d4d");

    // Draw power-ups
    powerUpsRef.current.forEach((powerUp) => {
      const colors = {
        speed: "#ffff00",
        size: "#ff00ff",
        multi: "#00ffff",
        freeze: "#00ff00",
      };

      ctx.fillStyle = colors[powerUp.type];
      ctx.shadowColor = colors[powerUp.type];
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(powerUp.x, powerUp.y, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Draw particles
    particlesRef.current.forEach((particle) => {
      ctx.globalAlpha = particle.life / particle.maxLife;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalAlpha = 1;
  }, []);

  // Game loop
  useEffect(() => {
    const gameLoop = () => {
      updateGame();
      render();
      animationRef.current = requestAnimationFrame(gameLoop);
    };

    if (gameState === "playing") {
      gameLoop();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, updateGame, render]);

  // Settings handlers
  const handleSettingChange = <K extends keyof GameSettings>(
    key: K,
    value: GameSettings[K],
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Game Title */}
      <div className="mb-6 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-white drop-shadow-glow mb-2">
          Modern Pong Arena
        </h1>
        <p className="text-blue-200 text-lg">
          Next-generation Pong with power-ups and modern graphics
        </p>
      </div>

      {/* Game Stats */}
      <div className="mb-4 flex flex-wrap justify-center gap-4 text-sm">
        <GlassmorphicCard
          className="px-4 py-2"
          blur="md"
          opacity="medium"
          padding="none"
        >
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-blue-400 mr-2"></span>
            Player:{" "}
            <span className="ml-1 font-bold text-xl">{stats.playerScore}</span>
          </div>
        </GlassmorphicCard>

        <GlassmorphicCard
          className="px-4 py-2"
          blur="md"
          opacity="medium"
          padding="none"
        >
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-red-400 mr-2"></span>
            AI: <span className="ml-1 font-bold text-xl">{stats.aiScore}</span>
          </div>
        </GlassmorphicCard>

        <GlassmorphicCard
          className="px-4 py-2"
          blur="md"
          opacity="medium"
          padding="none"
        >
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-green-400 mr-2"></span>
            Rally: <span className="ml-1 font-medium">{currentRally}</span>
          </div>
        </GlassmorphicCard>

        <GlassmorphicCard
          className="px-4 py-2"
          blur="md"
          opacity="medium"
          padding="none"
        >
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></span>
            Time:{" "}
            <span className="ml-1 font-medium">
              {formatTime(stats.gameTime)}
            </span>
          </div>
        </GlassmorphicCard>
      </div>

      {/* Game Canvas */}
      <GlassmorphicCard
        className="relative overflow-hidden"
        blur="lg"
        opacity="medium"
        padding="sm"
        rounded="xl"
        shadow="xl"
        border={true}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="block max-w-full h-auto"
        />

        {/* Game State Overlays */}
        {gameState === "menu" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <GlassmorphicCard className="text-center max-w-md" padding="lg">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Play?
              </h2>
              <p className="text-blue-200 mb-6">
                Use W/S or Arrow Keys to control your paddle
              </p>
              <div className="space-y-3">
                <ModernButton
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={startGame}
                >
                  Start Game
                </ModernButton>
                <ModernButton
                  variant="glass"
                  size="md"
                  fullWidth
                  onClick={() => setShowSettings(!showSettings)}
                >
                  Settings
                </ModernButton>
              </div>
            </GlassmorphicCard>
          </div>
        )}

        {gameState === "paused" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <GlassmorphicCard className="text-center" padding="lg">
              <h2 className="text-2xl font-bold text-white mb-4">
                Game Paused
              </h2>
              <ModernButton
                variant="primary"
                onClick={() => setGameState("playing")}
              >
                Resume Game
              </ModernButton>
            </GlassmorphicCard>
          </div>
        )}

        {gameState === "gameOver" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <GlassmorphicCard className="text-center max-w-md" padding="lg">
              <h2 className="text-3xl font-bold text-white mb-2">Game Over!</h2>
              <p className="text-xl text-blue-200 mb-4">
                {stats.playerScore >= settings.maxScore
                  ? "You Win! 🏆"
                  : "AI Wins! 🤖"}
              </p>
              <div className="text-sm text-gray-300 mb-6 space-y-1">
                <p>
                  Final Score: {stats.playerScore} - {stats.aiScore}
                </p>
                <p>Total Ball Hits: {stats.ballHits}</p>
                <p>Longest Rally: {stats.longestRally}</p>
                <p>Game Time: {formatTime(stats.gameTime)}</p>
                {settings.enablePowerUps && (
                  <p>Power-ups Collected: {stats.powerUpsCollected}</p>
                )}
              </div>
              <div className="space-y-3">
                <ModernButton
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={startGame}
                >
                  Play Again
                </ModernButton>
                <ModernButton
                  variant="glass"
                  onClick={() => setGameState("menu")}
                >
                  Main Menu
                </ModernButton>
              </div>
            </GlassmorphicCard>
          </div>
        )}
      </GlassmorphicCard>

      {/* Game Controls */}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {gameState === "playing" && (
          <ModernButton
            variant="glass"
            size="md"
            onClick={() => setGameState("paused")}
          >
            Pause
          </ModernButton>
        )}

        <ModernButton
          variant="glass"
          size="md"
          onClick={() => setShowSettings(!showSettings)}
        >
          Settings
        </ModernButton>

        {gameState !== "menu" && (
          <ModernButton
            variant="danger"
            size="md"
            onClick={() => setGameState("menu")}
          >
            Quit Game
          </ModernButton>
        )}
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <GlassmorphicCard className="mt-6 w-full max-w-md" padding="lg">
          <h3 className="text-xl font-bold text-white mb-4">Game Settings</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-blue-200 mb-2">
                Difficulty
              </label>
              <select
                value={settings.difficulty}
                onChange={(e) =>
                  handleSettingChange(
                    "difficulty",
                    e.target.value as typeof settings.difficulty,
                  )
                }
                className="w-full p-2 rounded bg-white/20 text-white border border-white/20"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="expert">Expert</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-blue-200 mb-2">
                Ball Speed
              </label>
              <select
                value={settings.ballSpeed}
                onChange={(e) =>
                  handleSettingChange(
                    "ballSpeed",
                    e.target.value as typeof settings.ballSpeed,
                  )
                }
                className="w-full p-2 rounded bg-white/20 text-white border border-white/20"
              >
                <option value="slow">Slow</option>
                <option value="medium">Medium</option>
                <option value="fast">Fast</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-blue-200 mb-2">
                Paddle Size
              </label>
              <select
                value={settings.paddleSize}
                onChange={(e) =>
                  handleSettingChange(
                    "paddleSize",
                    e.target.value as typeof settings.paddleSize,
                  )
                }
                className="w-full p-2 rounded bg-white/20 text-white border border-white/20"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-blue-200 mb-2">
                Max Score
              </label>
              <select
                value={settings.maxScore}
                onChange={(e) =>
                  handleSettingChange("maxScore", parseInt(e.target.value))
                }
                className="w-full p-2 rounded bg-white/20 text-white border border-white/20"
              >
                <option value={5}>5 Points</option>
                <option value={7}>7 Points</option>
                <option value={10}>10 Points</option>
                <option value={15}>15 Points</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm text-blue-200">Enable Power-ups</label>
              <button
                onClick={() =>
                  handleSettingChange(
                    "enablePowerUps",
                    !settings.enablePowerUps,
                  )
                }
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.enablePowerUps ? "bg-green-500" : "bg-gray-500"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.enablePowerUps
                      ? "translate-x-6"
                      : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm text-blue-200">Sound Effects</label>
              <button
                onClick={() =>
                  handleSettingChange("soundEnabled", !settings.soundEnabled)
                }
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.soundEnabled ? "bg-green-500" : "bg-gray-500"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.soundEnabled ? "translate-x-6" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/20">
            <ModernButton
              variant="glass"
              size="sm"
              fullWidth
              onClick={() => setShowSettings(false)}
            >
              Close Settings
            </ModernButton>
          </div>
        </GlassmorphicCard>
      )}

      {/* Game History */}
      {gameHistory.length > 0 && (
        <GlassmorphicCard className="mt-6 w-full max-w-md" padding="md">
          <h3 className="text-lg font-bold text-white mb-3">Game History</h3>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {gameHistory.slice(-5).map((event, index) => (
              <div
                key={index}
                className="text-sm text-blue-200 py-1 px-2 bg-white/10 rounded"
              >
                {event}
              </div>
            ))}
          </div>
          {gameHistory.length > 5 && (
            <p className="text-xs text-gray-400 mt-2">
              Showing last 5 events of {gameHistory.length} total
            </p>
          )}
        </GlassmorphicCard>
      )}

      {/* Controls Help */}
      <GlassmorphicCard
        className="mt-6 w-full max-w-md text-center"
        padding="sm"
        opacity="low"
      >
        <div className="text-sm text-blue-200 space-y-1">
          <p>
            <strong>Controls:</strong>
          </p>
          <p>W/S or ↑/↓ - Move paddle</p>
          <p>SPACE - Start/Pause game</p>
          {settings.enablePowerUps && (
            <p className="text-yellow-200">Hit glowing orbs for power-ups!</p>
          )}
        </div>
      </GlassmorphicCard>

      {/* Additional Stats */}
      {gameState !== "menu" && (
        <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs text-gray-400">
          <div className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-purple-400 mr-1"></span>
            Hits: {stats.ballHits}
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-orange-400 mr-1"></span>
            Best Rally: {stats.longestRally}
          </div>
          {settings.enablePowerUps && (
            <div className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-yellow-400 mr-1"></span>
              Power-ups: {stats.powerUpsCollected}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ModernPongGame;
