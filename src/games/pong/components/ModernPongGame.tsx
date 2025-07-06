"use client";

import React, { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import { ModernPongScene } from "../phaser/ModernPongScene";
import GlassmorphicCard from "../../../shared/components/GlassmorphicCard";
import ModernButton from "../../../shared/components/ModernButton";

// NOTE: These interfaces can be shared between the React component and the Phaser scene
// to ensure type safety when passing settings and emitting events.

interface GameSettings {
  difficulty: "easy" | "medium" | "hard" | "expert";
  ballSpeed: "slow" | "medium" | "fast";
  paddleSize: "small" | "medium" | "large";
  maxScore: number;
  enablePowerUps: boolean;
  soundEnabled: boolean;
}

interface GameStats {
  playerScore: number;
  aiScore: number;
  winner?: "Player" | "AI";
}

const ModernPongGame: React.FC = () => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  const [gameState, setGameState] = useState<
    "menu" | "playing" | "paused" | "gameOver"
  >("menu");
  const [stats, setStats] = useState<GameStats>({
    playerScore: 0,
    aiScore: 0,
  });
  const [settings, setSettings] = useState<GameSettings>({
    difficulty: "medium",
    ballSpeed: "medium",
    paddleSize: "medium",
    maxScore: 7,
    enablePowerUps: true,
    soundEnabled: true,
  });
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (!gameContainerRef.current || gameRef.current) {
      return;
    }

    // This scene instance will be controlled by the Phaser game engine
    const scene = new ModernPongScene();

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 1280,
      height: 720,
      parent: gameContainerRef.current,
      transparent: true,
      physics: {
        default: "arcade",
        arcade: {
          debug: false,
        },
      },
      scene: scene,
    };

    gameRef.current = new Phaser.Game(config);
    const game = gameRef.current;

    // --- Event listeners from Phaser scene ---
    const handleScoreUpdate = (data: {
      playerScore: number;
      aiScore: number;
    }) => {
      setStats((prev) => ({ ...prev, ...data }));
    };

    const handleGameOver = (data: { winner: "Player" | "AI" }) => {
      setStats((prev) => ({ ...prev, winner: data.winner }));
      setGameState("gameOver");
    };

    const handlePauseToggle = (isPaused: boolean) => {
      setGameState(isPaused ? "paused" : "playing");
    };

    game.events.on("updateScore", handleScoreUpdate);
    game.events.on("gameOver", handleGameOver);
    game.events.on("togglePause", handlePauseToggle);

    return () => {
      game.events.off("updateScore", handleScoreUpdate);
      game.events.off("gameOver", handleGameOver);
      game.events.off("togglePause", handlePauseToggle);
      game.destroy(true, false);
      gameRef.current = null;
    };
  }, []);

  const getScene = (): ModernPongScene | undefined => {
    // Scenes are managed by key. Assuming the key is 'ModernPong' as is best practice.
    return gameRef.current?.scene.getScene("ModernPong") as
      | ModernPongScene
      | undefined;
  };

  const handleStartGame = () => {
    const scene = getScene();
    if (scene) {
      setStats({ playerScore: 0, aiScore: 0, winner: undefined });
      setGameState("playing");
      setShowSettings(false);
      // Restart the scene, which will call its shutdown(), init(), preload(), and create() methods.
      // Pass the current settings to the scene's init() method.
      scene.scene.restart({ gameSettings: settings });
    }
  };

  const handleTogglePause = () => {
    getScene()?.togglePause();
  };

  const handleReturnToMenu = () => {
    setGameState("menu");
    // Optionally reset the scene to its initial state
    const scene = getScene();
    if (scene) {
      scene.scene.restart({ gameSettings: settings });
    }
  };

  const handleSettingChange = <K extends keyof GameSettings>(
    key: K,
    value: GameSettings[K],
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Game Stats */}
      <div className="mb-4 flex flex-wrap justify-center gap-4 text-sm">
        <GlassmorphicCard className="px-4 py-2" blur="md" opacity="medium">
          Player:{" "}
          <span className="ml-2 font-bold text-xl text-blue-300">
            {stats.playerScore}
          </span>
        </GlassmorphicCard>
        <GlassmorphicCard className="px-4 py-2" blur="md" opacity="medium">
          AI:{" "}
          <span className="ml-2 font-bold text-xl text-red-300">
            {stats.aiScore}
          </span>
        </GlassmorphicCard>
      </div>

      <GlassmorphicCard
        className="relative overflow-hidden"
        padding="none"
        rounded="lg"
        shadow="xl"
      >
        <div ref={gameContainerRef} className="relative w-full aspect-[16/9]">
          {/* Phaser canvas will be injected here */}
        </div>

        {/* Game State Overlays */}
        {gameState === "menu" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-10">
            <GlassmorphicCard className="text-center max-w-md" padding="lg">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Play?
              </h2>
              <p className="text-blue-200 mb-6">
                Press Start Game to begin the match.
              </p>
              <div className="space-y-3">
                <ModernButton
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleStartGame}
                >
                  Start Game
                </ModernButton>
                <ModernButton
                  variant="glass"
                  size="md"
                  fullWidth
                  onClick={() => setShowSettings(!showSettings)}
                >
                  {showSettings ? "Close Settings" : "Show Settings"}
                </ModernButton>
              </div>
            </GlassmorphicCard>
          </div>
        )}

        {gameState === "paused" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-10">
            <GlassmorphicCard className="text-center" padding="lg">
              <h2 className="text-2xl font-bold text-white mb-4">
                Game Paused
              </h2>
              <ModernButton variant="primary" onClick={handleTogglePause}>
                Resume Game
              </ModernButton>
            </GlassmorphicCard>
          </div>
        )}

        {gameState === "gameOver" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-10">
            <GlassmorphicCard className="text-center max-w-md" padding="lg">
              <h2 className="text-3xl font-bold text-white mb-2">Game Over!</h2>
              <p className="text-xl text-blue-200 mb-4">
                {stats.winner === "Player" ? "You Win! 🏆" : "AI Wins! 🤖"}
              </p>
              <div className="text-lg text-gray-300 mb-6">
                <p>
                  Final Score: {stats.playerScore} - {stats.aiScore}
                </p>
              </div>
              <div className="space-y-3">
                <ModernButton
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleStartGame}
                >
                  Play Again
                </ModernButton>
                <ModernButton variant="glass" onClick={handleReturnToMenu}>
                  Main Menu
                </ModernButton>
              </div>
            </GlassmorphicCard>
          </div>
        )}
      </GlassmorphicCard>

      {/* Settings Panel */}
      {showSettings && (
        <GlassmorphicCard className="mt-6 w-full max-w-md mx-auto" padding="lg">
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
                    e.target.value as GameSettings["difficulty"],
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
            {/* Add other settings controls here, similar to the original file */}
            <div className="flex items-center justify-between">
              <label className="text-sm text-blue-200">Enable Power-ups</label>
              <button
                onClick={() =>
                  handleSettingChange(
                    "enablePowerUps",
                    !settings.enablePowerUps,
                  )
                }
                className={`w-12 h-6 rounded-full transition-colors ${settings.enablePowerUps ? "bg-green-500" : "bg-gray-500"}`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.enablePowerUps ? "translate-x-6" : "translate-x-0.5"}`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-blue-200">Sound</label>
              <button
                onClick={() =>
                  handleSettingChange("soundEnabled", !settings.soundEnabled)
                }
                className={`w-12 h-6 rounded-full transition-colors ${settings.soundEnabled ? "bg-green-500" : "bg-gray-500"}`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.soundEnabled ? "translate-x-6" : "translate-x-0.5"}`}
                />
              </button>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-white/20">
            <ModernButton
              variant="primary"
              size="md"
              fullWidth
              onClick={handleStartGame}
            >
              Start New Game with these Settings
            </ModernButton>
          </div>
        </GlassmorphicCard>
      )}
    </div>
  );
};

export default ModernPongGame;
