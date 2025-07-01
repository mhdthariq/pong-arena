"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  getFirebaseClient,
  setupFirebaseAuthListener,
} from "../../../../../../shared/firebase/firebaseClient";
import { getGame } from "../../../../../../shared/firebase/pongService";
import MessageBox from "../../../../../../shared/components/MessageBox";
import Footer from "../../../../../../shared/components/Footer";

// Import Phaser game component with dynamic import to prevent SSR issues
const PhaserGame = dynamic(
  () =>
    import("../../../../../../games/pong/components/PhaserGame").then(
      (mod) => mod.default
    ),
  { ssr: false }
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function PongMultiPlayerGame({ params }: any) {
  const gameId = params.id;

  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messageBox, setMessageBox] = useState<{
    message: string;
    onConfirm: () => void;
    showCancel?: boolean;
    onCancel?: () => void;
  }>({ message: "", onConfirm: () => {} });

  const { db } = getFirebaseClient();

  // Initialize Firebase auth
  useEffect(() => {
    const unsubAuth = setupFirebaseAuthListener(
      setUserId,
      setIsAuthReady,
      setMessageBox
    );

    return () => unsubAuth();
  }, []);

  // Load game data once auth is ready
  useEffect(() => {
    if (isAuthReady && db && userId && gameId) {
      const loadGame = async () => {
        try {
          const gameData = await getGame(db, gameId);

          if (!gameData) {
            setError("Game not found. It may have been deleted or expired.");
            setIsLoading(false);
            return;
          }

          // Check if user is part of this game
          if (gameData.player1Id !== userId && gameData.player2Id !== userId) {
            setError("You are not a participant in this game.");
            setIsLoading(false);
            return;
          }

          // Game is valid, user is a participant
          setIsLoading(false);
        } catch (err) {
          console.error("Error loading game:", err);
          setError("Failed to load the game. Please try again.");
          setIsLoading(false);
        }
      };

      loadGame();
    }
  }, [isAuthReady, db, userId, gameId]);

  // Check if we're missing required parameters
  if (!gameId) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col">
        <main className="flex-grow flex flex-col items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Invalid Game</h1>
            <p className="mb-6">
              Missing game ID. Please return to the lobby and try again.
            </p>
            <Link
              href="/games/pong/multi-player/lobby"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Lobby
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col">
        <main className="flex-grow flex flex-col items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Loading Game</h1>
            <p className="mb-6">Connecting to server...</p>
            <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col">
        <main className="flex-grow flex flex-col items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Error</h1>
            <p className="mb-6">{error}</p>
            <Link
              href="/games/pong/multi-player/lobby"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Lobby
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Game found and user is a participant
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <main className="flex-grow p-4 md:p-8 flex flex-col items-center justify-center">
        <div className="container max-w-7xl mx-auto">
          <header className="text-center mb-4">
            <Link
              href="/games/pong/multi-player/lobby"
              className="text-xl font-bold text-white hover:text-blue-400 transition-colors float-left"
            >
              ← Back to Lobby
            </Link>
            <h1 className="text-3xl font-bold mb-4 tracking-wider drop-shadow-glow">
              Pong - Multiplayer Match
            </h1>
            <p className="text-gray-400 mb-4">Game ID: {gameId}</p>
          </header>

          {/* Game container */}
          <div
            className="relative mx-auto bg-black border-4 border-blue-700 rounded-lg overflow-hidden shadow-lg shadow-blue-700/30"
            style={{
              width: "min(90vw, 1200px)",
              height: "min(70vh, 675px)",
              aspectRatio: "16/9",
            }}
          >
            {/* Phaser game container */}
            <div className="h-full w-full relative">
              <PhaserGame
                isMultiplayer={true}
                isSinglePlayer={false}
                gameId={gameId}
                userId={userId || ""}
                db={db || undefined}
              />
            </div>
          </div>

          {/* Controls and info */}
          <div className="mt-4 md:mt-6 flex flex-wrap justify-center gap-3 md:gap-4">
            <div className="p-4 bg-gray-800 rounded-lg">
              <h2 className="text-lg font-semibold mb-2 text-center">
                Keyboard Controls
              </h2>
              <ul className="text-gray-300">
                <li className="mb-1">↑ / W - Move paddle up</li>
                <li>↓ / S - Move paddle down</li>
              </ul>
            </div>

            <div className="p-4 bg-gray-800 rounded-lg">
              <h2 className="text-lg font-semibold mb-2 text-center">
                Game Rules
              </h2>
              <ul className="text-gray-300">
                <li className="mb-1">First to 10 points wins</li>
                <li className="mb-1">
                  Both players must click &ldquo;Ready&rdquo; to start
                </li>
                <li>Ball speed increases with each hit</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {messageBox.message && (
        <MessageBox
          message={messageBox.message}
          onConfirm={messageBox.onConfirm}
          onCancel={messageBox.onCancel}
          showCancel={messageBox.showCancel}
        />
      )}

      <Footer />
    </div>
  );
}
