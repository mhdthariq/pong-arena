"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Footer from "../../../../../shared/components/Footer";
import {
  getFirebaseClient,
  setupFirebaseAuthListener,
} from "../../../../../shared/firebase/firebaseClient";
import {
  createGame,
  joinGameByCode,
  getActiveGames,
  GameDocument,
} from "../../../../../shared/firebase/pongService";
import MessageBox from "../../../../../shared/components/MessageBox";
import {
  BallState,
  PaddleState,
} from "../../../../../games/pong/lib/constants";

export default function PongMultiPlayerLobby() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [activeGames, setActiveGames] = useState<
    { id: string; data: GameDocument }[]
  >([]);
  const [gameCode, setGameCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [messageBox, setMessageBox] = useState<{
    message: string;
    onConfirm: () => void;
    showCancel?: boolean;
    onCancel?: () => void;
  }>({ message: "", onConfirm: () => {} });

  const router = useRouter();
  const { db } = getFirebaseClient();

  // Define fetchActiveGames before using it in useEffect
  const fetchActiveGames = useCallback(async () => {
    if (!db) return;

    try {
      const games = await getActiveGames(db);
      setActiveGames(games);
    } catch (error) {
      console.error("Error fetching games:", error);
      setErrorMessage("Failed to load active games.");
    }
  }, [db]);

  useEffect(() => {
    // Setup Firebase auth
    const unsubAuth = setupFirebaseAuthListener(
      setUserId,
      setIsAuthReady,
      setMessageBox
    );

    return () => unsubAuth();
  }, []);

  // Fetch active games when auth is ready
  useEffect(() => {
    if (isAuthReady && db) {
      fetchActiveGames();
    }
  }, [isAuthReady, db, fetchActiveGames]);

  const handleCreateGame = async () => {
    if (!db || !userId) {
      setErrorMessage("Firebase not initialized or user not authenticated");
      return;
    }

    setIsLoading(true);

    try {
      // Initial game state
      const initialGameState = {
        ball: {
          x: 600, // CANVAS_WIDTH / 2
          y: 450, // CANVAS_HEIGHT / 2
          dx: 0,
          dy: 0,
        } as BallState,
        paddle1: {
          x: 30, // Left side
          y: 450, // Middle of canvas
          dy: 0,
        } as PaddleState,
        paddle2: {
          x: 1170, // Right side (CANVAS_WIDTH - 30)
          y: 450, // Middle of canvas
          dy: 0,
        } as PaddleState,
        score1: 0,
        score2: 0,
      };

      // Create game in Firebase
      const { gameId } = await createGame(db, userId, initialGameState);

      // Redirect to game page
      router.push(`/games/pong/multi-player/game/${gameId}`);
    } catch (error) {
      console.error("Error creating game:", error);
      setErrorMessage("Failed to create game. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinGame = async (gameId: string) => {
    if (!db || !userId) {
      setErrorMessage("Firebase not initialized or user not authenticated");
      return;
    }

    setIsLoading(true);

    try {
      // Join the selected game
      await joinGameByCode(db, gameId, userId);

      // Redirect to game page
      router.push(`/games/pong/multi-player/game/${gameId}`);
    } catch (error) {
      console.error("Error joining game:", error);
      setErrorMessage("Failed to join game. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinByCode = async () => {
    if (!gameCode.trim()) {
      setErrorMessage("Please enter a valid game code");
      return;
    }

    if (!db || !userId) {
      setErrorMessage("Firebase not initialized or user not authenticated");
      return;
    }

    setIsLoading(true);

    try {
      const gameId = await joinGameByCode(
        db,
        gameCode.trim().toUpperCase(),
        userId
      );

      if (!gameId) {
        setErrorMessage("Invalid game code or game no longer available");
        setIsLoading(false);
        return;
      }

      // Redirect to game page
      router.push(`/games/pong/multi-player/game/${gameId}`);
    } catch (error) {
      console.error("Error joining game by code:", error);
      setErrorMessage("Failed to join game. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-900 text-white">
      <main className="flex-grow flex flex-col p-6">
        <div className="max-w-4xl mx-auto w-full">
          <header className="mb-8">
            <Link
              href="/"
              className="text-xl font-bold text-white hover:text-blue-400 transition-colors"
            >
              ← Back to Game Arena
            </Link>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mt-4">
              Pong Multiplayer Lobby
            </h1>
          </header>

          {errorMessage && (
            <div className="bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-4 mb-6 text-center">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Create or Join Game Section */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4">Create a New Game</h2>
              <p className="text-gray-300 mb-6">
                Start a new multiplayer game and invite a friend to join.
              </p>
              <button
                onClick={handleCreateGame}
                disabled={isLoading || !isAuthReady}
                className="w-full py-3 px-4 rounded-lg font-medium bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Creating Game..." : "Create Game"}
              </button>

              <div className="my-6 border-t border-gray-700"></div>

              <h2 className="text-2xl font-bold mb-4">Join by Game Code</h2>
              <p className="text-gray-300 mb-4">
                Enter a code shared by another player to join their game.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={gameCode}
                  onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                  placeholder="Enter game code"
                  maxLength={6}
                  className="flex-1 bg-gray-700 rounded-lg px-4 py-2 text-lg uppercase placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleJoinByCode}
                  disabled={isLoading || !gameCode || !isAuthReady}
                  className="py-2 px-6 rounded-lg font-medium bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Join
                </button>
              </div>
            </div>

            {/* Available Games Section */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4">Available Games</h2>
              <p className="text-gray-300 mb-4">
                Join an existing game from the list below.
              </p>

              <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
                {activeGames.length > 0 ? (
                  activeGames.map((game) => (
                    <div
                      key={game.id}
                      className="bg-gray-700 rounded-lg p-4 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium">
                          Game Code: {game.data.gameCode}
                        </p>
                        <p className="text-sm text-gray-400">
                          Created by Player {game.data.player1Id.slice(0, 8)}...
                        </p>
                      </div>
                      <button
                        onClick={() => handleJoinGame(game.data.gameCode || "")}
                        disabled={isLoading || !isAuthReady}
                        className="py-2 px-4 rounded-lg font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Join
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-400 py-8">
                    No active games available. Create a new game!
                  </p>
                )}
              </div>

              <button
                onClick={fetchActiveGames}
                disabled={isLoading || !isAuthReady}
                className="mt-4 w-full py-2 px-4 rounded-lg font-medium bg-gray-700 hover:bg-gray-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Refresh Game List
              </button>
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
