"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { getFirebaseClient } from "../../../../firebase/firebaseClient";
import { getGame } from "../../../../firebase/gameService";

// Import Phaser game component with dynamic import to prevent SSR issues
const PhaserGame = dynamic(
  () => import("../../../../phaser/PhaserGame").then((mod) => mod),
  { ssr: false }
);

interface GameClientProps {
  gameId: string;
}

export default function GameClient({ gameId }: GameClientProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [initializing, setInitializing] = useState<boolean>(true);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameCode, setGameCode] = useState<string>("");
  const { db, auth } = getFirebaseClient();

  // Check authentication and join the game
  useEffect(() => {
    if (!db || !auth) return;

    const unsubscribe = auth.onAuthStateChanged(
      async (user: { uid: string } | null) => {
        if (!user) {
          setError("You must be logged in to join a game.");
          setLoading(false);
          return;
        }

        setUserId(user.uid);
        setLoading(false);

        try {
          // Verify game exists and user is allowed
          const game = await getGame(db, gameId);
          if (!game) {
            setError("This game doesn't exist");
            return;
          }

          if (game.player1Id !== user.uid && game.player2Id !== user.uid) {
            // Allow spectators but inform them
            console.log("You are viewing this game as a spectator");
          }

          // Set the game code for display
          if (game.gameCode) {
            setGameCode(game.gameCode);
          }

          setInitializing(false);
          setGameStarted(true);
        } catch (e) {
          console.error("Error initializing game:", e);
          setError(
            `Error loading game: ${
              e instanceof Error ? e.message : "Unknown error"
            }`
          );
          setInitializing(false);
        }
      }
    );

    return () => unsubscribe();
  }, [db, auth, gameId]);

  if (loading) {
    return (
      <main className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-900 text-white p-4 md:p-8">
        <div className="container max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-wider drop-shadow-glow">Loading Game</h1>
          <div className="w-16 h-16 md:w-20 md:h-20 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto mb-8"></div>
          <p className="text-lg md:text-xl">Please wait while we set up your game...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-900 text-white p-4 md:p-8">
        <div className="container max-w-4xl mx-auto">
          <div className="bg-red-900/60 p-6 md:p-8 rounded-lg shadow-lg border-2 border-red-700 text-center mx-auto max-w-lg">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 drop-shadow-glow">Game Error</h2>
            <p className="mb-6 text-lg">{error}</p>
            <Link
              href="/multi-player/lobby"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg inline-block"
            >
              Return to Lobby
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (initializing) {
    return (
      <main className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-900 text-white p-4 md:p-8">
        <div className="container max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 tracking-wider drop-shadow-glow">
            Initializing Game
          </h1>
          <div className="w-16 h-16 md:w-20 md:h-20 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto mb-8"></div>
          <p className="text-lg md:text-xl mb-3">Setting up multiplayer session</p>
          <div className="inline-block bg-gray-800 px-4 py-2 rounded-lg border border-blue-500">
            <p className="text-lg text-blue-400 font-mono">
              Game Code: {gameCode || "Loading..."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-900 text-white p-4 md:p-8">
      <div className="container max-w-7xl mx-auto">
        <header className="text-center mb-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 tracking-wider drop-shadow-glow">
            Multiplayer Match
          </h1>
          <div className="inline-block bg-gray-800 px-3 py-1 rounded-lg border border-blue-500 mb-4">
            <p className="text-md sm:text-lg text-blue-400 font-mono">
              Game Code: {gameCode || "Loading..."}
            </p>
          </div>
        </header>

        {/* Game container - responsive for all devices */}
        <div className="relative mx-auto bg-black border-4 border-blue-700 rounded-lg overflow-hidden shadow-lg shadow-blue-700/30" 
             style={{ 
               width: "min(90vw, 1200px)",
               height: "min(70vh, 675px)",
               aspectRatio: "16/9"
             }}>
          {gameStarted && userId && db && (
            <div className="h-full w-full relative">
              <PhaserGame
                isSinglePlayer={false}
                isMultiplayer={true}
                gameId={gameId}
                userId={userId}
                db={db}
              />
            </div>
          )}
        </div>

        {/* Controls - improved responsive design */}
        <div className="mt-4 md:mt-6 flex flex-wrap justify-center gap-3 md:gap-4">
          <button
            onClick={() => window.location.reload()}
            className="px-4 sm:px-6 md:px-8 py-2 md:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 transform hover:scale-105 shadow-lg text-sm sm:text-base"
          >
            Restart Game
          </button>
          <Link
            href="/multi-player/lobby"
            className="px-4 sm:px-6 md:px-8 py-2 md:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg text-sm sm:text-base"
          >
            Back to Lobby
          </Link>
        </div>

        {/* Game instructions - responsive text sizes */}
        <div className="mt-4 md:mt-6 text-gray-300 text-center">
          <p className="mb-1 md:mb-2 text-sm sm:text-base">Controls: ↑↓ or W/S to move paddle</p>
          <p className="text-sm sm:text-base">Press SPACE to serve | First to 11 points wins</p>
        </div>
      </div>
    </main>
  );
}
