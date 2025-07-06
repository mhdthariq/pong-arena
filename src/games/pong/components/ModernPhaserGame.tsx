import React, { useEffect, useRef } from "react";
import * as Phaser from "phaser";
import { phaserConfig } from "../phaser/config";
import { ModernPongScene, ModernGameSettings } from "../phaser/ModernPongScene";

interface ModernPhaserGameProps {
  settings: ModernGameSettings;
  onGameEnd?: (winner: "player" | "ai") => void;
}

const ModernPhaserGame: React.FC<ModernPhaserGameProps> = ({
  settings,
  onGameEnd,
}) => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!gameContainerRef.current) return;

    // Create modern scene with settings
    const modernScene = new ModernPongScene(settings, onGameEnd);

    // Create game instance with proper configuration
    const gameConfig = {
      ...phaserConfig,
      parent: gameContainerRef.current,
      scene: [modernScene],
    };

    // Initialize the Phaser game
    gameInstanceRef.current = new Phaser.Game(gameConfig);

    // Cleanup function
    return () => {
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy(true);
        gameInstanceRef.current = null;
      }
    };
  }, [settings, onGameEnd]);

  return <div ref={gameContainerRef} className="w-full h-full" />;
};

export default ModernPhaserGame;
