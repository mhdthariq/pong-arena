"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  setupFirebaseAuthListener,
  getFirebaseClient,
} from "../../../../../shared/firebase/firebaseClient";
import {
  createTicTacToeGame,
  joinTicTacToeGameByCode,
} from "../../../../../shared/firebase/tictactoeService";
import Footer from "../../../../../shared/components/Footer";

export default function TicTacToeMultiPlayerLobbyPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [gameCode, setGameCode] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isCreatingGame, setIsCreatingGame] = useState<boolean>(false);
  const [isJoiningGame, setIsJoiningGame] = useState<boolean>(false);

  const router = useRouter();

  // Setup Firebase
  useEffect(() => {
    const unsubscribeAuth = setupFirebaseAuthListener(
      setUserId,
      setIsAuthReady,
      () => {},
    );
    return () => unsubscribeAuth();
  }, []);

  const createGame = async () => {
    try {
      setIsCreatingGame(true);
      setErrorMessage("");

      const { db } = getFirebaseClient();
      if (!db || !userId) {
        setErrorMessage("Firebase not initialized or user not logged in");
        setIsCreatingGame(false);
        return;
      }

      const { gameId, gameCode } = await createTicTacToeGame(db, userId);

      // Navigate to the game page
      router.push(
        `/games/tictactoe/multi-player/game/${gameId}?code=${gameCode}`,
      );
    } catch (error) {
      console.error("Error creating game:", error);
      setErrorMessage("Failed to create game. Please try again.");
      setIsCreatingGame(false);
    }
  };

  const joinGame = async () => {
    try {
      setIsJoiningGame(true);
      setErrorMessage("");

      if (!gameCode.trim()) {
        setErrorMessage("Please enter a game code");
        setIsJoiningGame(false);
        return;
      }

      const { db } = getFirebaseClient();
      if (!db || !userId) {
        setErrorMessage("Firebase not initialized or user not logged in");
        setIsJoiningGame(false);
        return;
      }

      // Join the game by code
      const gameId = await joinTicTacToeGameByCode(
        db,
        gameCode.trim().toUpperCase(),
        userId,
      );

      if (!gameId) {
        setErrorMessage("Game not found. Please check the code and try again.");
        setIsJoiningGame(false);
        return;
      }

      // Navigate to the game page
      router.push(
        `/games/tictactoe/multi-player/game/${gameId}?code=${gameCode
          .trim()
          .toUpperCase()}`,
      );
    } catch (error) {
      console.error("Error joining game:", error);
      setErrorMessage("Failed to join game. Please try again.");
      setIsJoiningGame(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-900 text-white p-4 flex flex-col">
      <header className="w-full max-w-6xl mx-auto pt-4 pb-6">
        <nav className="flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold text-white hover:text-blue-400 transition-colors"
          >
            ← Back to Game Arena
          </Link>
        </nav>
        <h1 className="text-3xl sm:text-4xl font-bold text-center mt-4 mb-8">
          Tic-Tac-Toe Multiplayer
        </h1>
      </header>

      <main className="w-full max-w-4xl mx-auto flex-grow px-4">
        <div className="bg-gray-800 rounded-xl p-6 sm:p-8 shadow-xl border border-gray-700">
          {!isAuthReady ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 border-t-3 border-blue-500 border-solid rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-lg">
                Initializing Firebase for multiplayer...
              </p>
            </div>
          ) : !userId ? (
            <div className="text-center py-10 text-red-400">
              <p className="text-lg font-medium mb-2">
                Failed to authenticate for multiplayer.
              </p>
              <p>Please check console for errors or refresh the page.</p>
            </div>
          ) : (
            <>
              <div className="mb-10">
                <h2 className="text-2xl font-semibold mb-5">
                  Create a New Game
                </h2>
                <button
                  onClick={createGame}
                  disabled={isCreatingGame}
                  className={`w-full py-4 text-xl font-semibold rounded-lg shadow-md
                    ${
                      isCreatingGame
                        ? "bg-purple-800 cursor-not-allowed"
                        : "bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800"
                    }
                    transition-colors`}
                >
                  {isCreatingGame ? "Creating..." : "Create New Game"}
                </button>
              </div>

              <div className="relative mb-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-gray-800 text-gray-400 text-lg">
                    OR
                  </span>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-semibold mb-5">Join a Game</h2>
                <div className="mb-6">
                  <label
                    htmlFor="gameCode"
                    className="block text-base font-medium mb-3"
                  >
                    Enter Game Code
                  </label>
                  <input
                    type="text"
                    id="gameCode"
                    value={gameCode}
                    onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                    placeholder="e.g. AB123C"
                    className="w-full px-5 py-4 bg-gray-700 border border-gray-600 rounded-lg text-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={6}
                  />
                </div>
                <button
                  onClick={joinGame}
                  disabled={isJoiningGame || !gameCode.trim()}
                  className={`w-full py-4 text-xl font-semibold rounded-lg shadow-md
                    ${
                      isJoiningGame || !gameCode.trim()
                        ? "bg-blue-800 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600"
                    }
                    transition-colors`}
                >
                  {isJoiningGame ? "Joining..." : "Join Game"}
                </button>
              </div>

              {errorMessage && (
                <div className="mt-6 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-center">
                  {errorMessage}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
