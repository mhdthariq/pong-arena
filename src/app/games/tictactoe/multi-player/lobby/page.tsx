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
import ModernLayout from "../../../../../shared/components/ModernLayout";
import GlassmorphicCard from "../../../../../shared/components/GlassmorphicCard";
import ModernButton from "../../../../../shared/components/ModernButton";

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
    <ModernLayout
      withBackground={true}
      backgroundParticleColor="#60a5fa"
      backgroundParticleCount={120}
      withMaxWidth={true}
      maxWidth="2xl"
      withVerticalCenter={false}
    >
      <header className="w-full max-w-7xl mx-auto px-4 py-6 z-10 relative animate-fade-in">
        <nav className="flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold text-white hover:text-blue-400 transition-colors flex items-center group"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-2 transform group-hover:-translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span className="drop-shadow-glow">Game Arena</span>
          </Link>
        </nav>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-center mt-8 mb-8 lg:mb-12 text-white drop-shadow-glow animate-float">
          Tic-Tac-Toe
          <span className="block text-lg sm:text-xl lg:text-2xl mt-2 font-normal text-blue-300 animate-pulse-slow">
            Multiplayer
          </span>
        </h1>
      </header>

      <main className="w-full flex-grow z-10 relative animate-slide-up px-4">
        <div className="max-w-7xl mx-auto">
          <GlassmorphicCard
            blur="lg"
            opacity="medium"
            rounded="xl"
            shadow="xl"
            padding="lg"
            className="w-full"
          >
            {!isAuthReady ? (
              <div className="text-center py-12 lg:py-16">
                <div className="w-16 h-16 border-t-4 border-blue-400 border-solid rounded-full animate-spin mx-auto mb-6"></div>
                <p className="text-lg lg:text-xl text-blue-200">
                  Initializing Firebase for multiplayer...
                </p>
              </div>
            ) : !userId ? (
              <div className="text-center py-12 lg:py-16 text-red-400">
                <p className="text-lg lg:text-xl font-medium mb-2">
                  Failed to authenticate for multiplayer.
                </p>
                <p className="text-blue-200">
                  Please check console for errors or refresh the page.
                </p>
              </div>
            ) : (
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
                {/* Create Game Section */}
                <div className="space-y-6">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mr-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-white"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl lg:text-3xl font-semibold text-white drop-shadow-glow">
                        Create a New Game
                      </h2>
                      <p className="text-blue-200 text-sm mt-1">
                        Start a new game and share the code with a friend
                      </p>
                    </div>
                  </div>
                  <ModernButton
                    variant="primary"
                    size="xl"
                    rounded="lg"
                    fullWidth={true}
                    onClick={createGame}
                    isDisabled={isCreatingGame}
                    className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                    rightIcon={
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    }
                  >
                    {isCreatingGame ? "Creating..." : "Create New Game"}
                  </ModernButton>
                </div>

                {/* Divider for mobile */}
                <div className="relative lg:hidden">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-4 glass text-blue-200 text-lg rounded-full">
                      OR
                    </span>
                  </div>
                </div>

                {/* Join Game Section */}
                <div className="space-y-6">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-teal-600 flex items-center justify-center mr-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-white"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl lg:text-3xl font-semibold text-white drop-shadow-glow">
                        Join a Game
                      </h2>
                      <p className="text-blue-200 text-sm mt-1">
                        Enter a game code to join an existing game
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="gameCode"
                        className="block text-base lg:text-lg font-medium mb-3 text-white"
                      >
                        Game Code
                      </label>
                      <input
                        type="text"
                        id="gameCode"
                        value={gameCode}
                        onChange={(e) =>
                          setGameCode(e.target.value.toUpperCase())
                        }
                        placeholder="e.g. AB123C"
                        className="glass-input w-full px-5 py-4 text-lg lg:text-xl text-white placeholder-blue-300"
                        maxLength={6}
                      />
                    </div>
                    <ModernButton
                      variant="success"
                      size="xl"
                      rounded="lg"
                      fullWidth={true}
                      onClick={joinGame}
                      isDisabled={isJoiningGame || !gameCode.trim()}
                      className="bg-gradient-to-r from-blue-500 to-teal-600 hover:from-blue-600 hover:to-teal-700"
                      rightIcon={
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                          />
                        </svg>
                      }
                    >
                      {isJoiningGame ? "Joining..." : "Join Game"}
                    </ModernButton>
                  </div>
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="mt-8 p-6 bg-red-900/20 border border-red-500/30 rounded-lg text-red-300 text-center backdrop-blur-sm">
                <div className="flex items-center justify-center mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-medium">Error</span>
                </div>
                <p>{errorMessage}</p>
              </div>
            )}
          </GlassmorphicCard>
        </div>
      </main>
    </ModernLayout>
  );
}
