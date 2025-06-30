import React, { useEffect, useRef } from "react";
import * as Phaser from "phaser";
import { phaserConfig } from "./config";
import { PongSinglePlayerScene } from "./PongSinglePlayerScene";
import { PongMultiPlayerScene } from "./PongMultiPlayerScene";
import { Firestore } from "firebase/firestore";

interface PhaserGameProps {
  isSinglePlayer?: boolean;
  isMultiplayer?: boolean;
  gameId?: string;
  userId?: string;
  db?: Firestore;
}

const PhaserGame: React.FC<PhaserGameProps> = ({
  isSinglePlayer = true,
  isMultiplayer = false,
  gameId,
  userId,
  db,
}) => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!gameContainerRef.current) return;

    // Exit early if trying to run multiplayer without required props
    if (isMultiplayer && (!db || !gameId || !userId)) {
      console.error("Missing required props for multiplayer game");
      return;
    }

    // Define scenes based on game mode
    let scenes: (typeof PongSinglePlayerScene | PongMultiPlayerScene)[] = [];

    if (isSinglePlayer) {
      scenes = [PongSinglePlayerScene];
    } else if (isMultiplayer && db && gameId && userId) {
      // For multiplayer, we need to instantiate the scene with Firebase props
      const multiplayerScene = new PongMultiPlayerScene(db, gameId, userId);
      scenes = [multiplayerScene];
    }

    // Create game instance with proper configuration
    const gameConfig = {
      ...phaserConfig,
      parent: gameContainerRef.current,
      scene: scenes,
    };

    // Initialize the game
    gameInstanceRef.current = new Phaser.Game(gameConfig);

    // Cleanup function
    return () => {
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy(true);
        gameInstanceRef.current = null;
      }
    };
  }, [isSinglePlayer, isMultiplayer, gameId, userId, db]); // Re-initialize if these props change

  return (
    <div className="phaser-game-container w-full h-full">
      <div
        id="phaser-container"
        ref={gameContainerRef}
        className="w-full h-full"
        style={{ touchAction: "none" }} // Prevent browser's default touch actions
      />
    </div>
  );
};

export { PhaserGame as default, PhaserGame };
