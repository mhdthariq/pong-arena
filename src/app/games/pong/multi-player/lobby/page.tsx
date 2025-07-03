"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ModernLayout from "../../../../../shared/components/ModernLayout";
import GlassmorphicCard from "../../../../../shared/components/GlassmorphicCard";
import ModernButton from "../../../../../shared/components/ModernButton";
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
  const [activeTab, setActiveTab] = useState<"create" | "join" | "browse">(
    "create",
  );

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
      setMessageBox,
    );

    return () => unsubAuth();
  }, []);

  // Fetch active games when auth is ready
  useEffect(() => {
    if (isAuthReady && db) {
      fetchActiveGames();
      // Set up periodic refresh
      const interval = setInterval(fetchActiveGames, 10000);
      return () => clearInterval(interval);
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
        userId,
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
    <ModernLayout
      variant="gaming"
      withBackground={true}
      backgroundParticleColor="#3b82f6"
      backgroundParticleCount={180}
      maxWidth="full"
      withPadding={false}
      className="bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-indigo-900/20"
    >
      {/* Enhanced Header */}
      <div className="relative z-20 w-full">
        {/* Navigation */}
        <nav className="flex items-center justify-between p-6 lg:p-8">
          <Link href="/" className="group flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 group-hover:bg-white/20 transition-all duration-300">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </div>
            <span className="text-lg font-medium text-white/90 group-hover:text-white transition-colors duration-300">
              Back to Arena
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-300">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>{isAuthReady ? "Connected" : "Connecting..."}</span>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="text-center px-6 pb-8 lg:pb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-600 bg-clip-text text-transparent">
              MULTIPLAYER LOBBY
            </span>
          </h1>
          <p className="text-lg lg:text-xl text-blue-200/90 mb-8 max-w-2xl mx-auto">
            Challenge players worldwide or create your own arena for epic Pong
            battles
          </p>

          {/* Connection Status */}
          <div className="flex justify-center items-center space-x-4 mb-8">
            <GlassmorphicCard className="px-4 py-2" padding="none">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${isAuthReady ? "bg-green-400 animate-pulse" : "bg-yellow-400 animate-bounce"}`}
                />
                <span className="text-sm text-white">
                  {isAuthReady
                    ? `Connected as Player ${userId?.slice(0, 8)}...`
                    : "Connecting to server..."}
                </span>
              </div>
            </GlassmorphicCard>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {errorMessage && (
        <div className="px-6 mb-6">
          <div className="max-w-4xl mx-auto">
            <GlassmorphicCard className="border-red-500/50 bg-red-500/10">
              <div className="flex items-center space-x-3">
                <div className="text-red-400 text-xl">⚠️</div>
                <div>
                  <h4 className="text-red-400 font-semibold">Error</h4>
                  <p className="text-red-300">{errorMessage}</p>
                </div>
                <ModernButton
                  variant="danger"
                  size="sm"
                  onClick={() => setErrorMessage("")}
                  className="ml-auto"
                >
                  Dismiss
                </ModernButton>
              </div>
            </GlassmorphicCard>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="px-6 pb-8">
        <div className="max-w-6xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <GlassmorphicCard className="p-2" padding="none">
              <div className="flex space-x-2">
                {[
                  { id: "create", label: "Create Game", icon: "🎮" },
                  { id: "join", label: "Join by Code", icon: "🔗" },
                  { id: "browse", label: "Browse Games", icon: "🔍" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() =>
                      setActiveTab(tab.id as "create" | "join" | "browse")
                    }
                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                      activeTab === tab.id
                        ? "bg-blue-500 text-white shadow-lg"
                        : "text-gray-300 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
            </GlassmorphicCard>
          </div>

          {/* Tab Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-2">
              {activeTab === "create" && (
                <GlassmorphicCard className="animate-fade-in">
                  <div className="text-center">
                    <div className="text-6xl mb-6">🎮</div>
                    <h2 className="text-3xl font-bold text-white mb-4">
                      Create Your Arena
                    </h2>
                    <p className="text-gray-300 mb-8 max-w-md mx-auto">
                      Start a new multiplayer game and share the code with
                      friends or wait for random players to join your battle.
                    </p>

                    <div className="space-y-4 max-w-sm mx-auto">
                      <ModernButton
                        onClick={handleCreateGame}
                        disabled={isLoading || !isAuthReady}
                        variant="primary"
                        size="lg"
                        fullWidth
                        isLoading={isLoading}
                        loadingText="Creating Arena..."
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                      >
                        🚀 Create Game Arena
                      </ModernButton>

                      <div className="text-sm text-gray-400">
                        Your game will be visible to other players immediately
                      </div>
                    </div>
                  </div>
                </GlassmorphicCard>
              )}

              {activeTab === "join" && (
                <GlassmorphicCard className="animate-fade-in">
                  <div className="text-center">
                    <div className="text-6xl mb-6">🔗</div>
                    <h2 className="text-3xl font-bold text-white mb-4">
                      Join by Code
                    </h2>
                    <p className="text-gray-300 mb-8 max-w-md mx-auto">
                      Enter a 6-character game code shared by another player to
                      join their private arena.
                    </p>

                    <div className="space-y-6 max-w-sm mx-auto">
                      <div>
                        <input
                          type="text"
                          value={gameCode}
                          onChange={(e) =>
                            setGameCode(e.target.value.toUpperCase())
                          }
                          placeholder="Enter game code"
                          maxLength={6}
                          className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-4 py-4 text-2xl text-center uppercase font-mono text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        />
                      </div>

                      <ModernButton
                        onClick={handleJoinByCode}
                        disabled={isLoading || !gameCode || !isAuthReady}
                        variant="info"
                        size="lg"
                        fullWidth
                        isLoading={isLoading}
                        loadingText="Joining..."
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                      >
                        🎯 Join Arena
                      </ModernButton>
                    </div>
                  </div>
                </GlassmorphicCard>
              )}

              {activeTab === "browse" && (
                <GlassmorphicCard className="animate-fade-in">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">
                      🔍 Available Arenas
                    </h2>
                    <ModernButton
                      onClick={fetchActiveGames}
                      disabled={isLoading || !isAuthReady}
                      variant="secondary"
                      size="sm"
                    >
                      🔄 Refresh
                    </ModernButton>
                  </div>

                  <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                    {activeGames.length > 0 ? (
                      activeGames.map((game) => (
                        <div
                          key={game.id}
                          className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all duration-300 group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                                <span className="text-lg font-semibold text-white">
                                  Arena {game.data.gameCode}
                                </span>
                              </div>
                              <div className="text-sm text-gray-300">
                                Host: Player {game.data.player1Id.slice(0, 8)}
                                ...
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                Waiting for challenger
                              </div>
                            </div>
                            <ModernButton
                              onClick={() =>
                                handleJoinGame(game.data.gameCode || "")
                              }
                              disabled={isLoading || !isAuthReady}
                              variant="primary"
                              size="sm"
                              className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 group-hover:scale-105 transition-transform duration-300"
                            >
                              ⚔️ Challenge
                            </ModernButton>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4 opacity-50">🎮</div>
                        <p className="text-gray-400 mb-4">
                          No active arenas found
                        </p>
                        <p className="text-sm text-gray-500">
                          Be the first to create a game!
                        </p>
                      </div>
                    )}
                  </div>
                </GlassmorphicCard>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Game Rules */}
              <GlassmorphicCard>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <span className="mr-2">📋</span>
                  Game Rules
                </h3>
                <div className="space-y-3 text-sm text-gray-300">
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    <span>First player to reach 10 points wins</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    <span>Both players must be ready to start</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    <span>Ball speed increases with each rally</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    <span>Use ↑/↓ or W/S to control your paddle</span>
                  </div>
                </div>
              </GlassmorphicCard>

              {/* Statistics */}
              <GlassmorphicCard>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <span className="mr-2">📊</span>
                  Live Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Active Games:</span>
                    <span className="text-green-400 font-bold">
                      {activeGames.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Players Online:</span>
                    <span className="text-blue-400 font-bold">
                      {activeGames.length + 1}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Connection:</span>
                    <span
                      className={`font-bold ${isAuthReady ? "text-green-400" : "text-yellow-400"}`}
                    >
                      {isAuthReady ? "Stable" : "Connecting"}
                    </span>
                  </div>
                </div>
              </GlassmorphicCard>

              {/* Quick Actions */}
              <GlassmorphicCard>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <span className="mr-2">⚡</span>
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <Link
                    href="/games/pong/single-player-modern"
                    className="block"
                  >
                    <ModernButton
                      variant="secondary"
                      fullWidth
                      size="sm"
                      className="justify-start"
                    >
                      🤖 Practice vs AI
                    </ModernButton>
                  </Link>
                  <Link href="/games/pong/single-player" className="block">
                    <ModernButton
                      variant="secondary"
                      fullWidth
                      size="sm"
                      className="justify-start"
                    >
                      🕹️ Classic Pong
                    </ModernButton>
                  </Link>
                  <Link
                    href="/games/tictactoe/multi-player/lobby"
                    className="block"
                  >
                    <ModernButton
                      variant="secondary"
                      fullWidth
                      size="sm"
                      className="justify-start"
                    >
                      ⭕ Tic-Tac-Toe
                    </ModernButton>
                  </Link>
                </div>
              </GlassmorphicCard>
            </div>
          </div>
        </div>
      </div>

      {messageBox.message && (
        <MessageBox
          message={messageBox.message}
          onConfirm={messageBox.onConfirm}
          onCancel={messageBox.onCancel}
          showCancel={messageBox.showCancel}
        />
      )}
    </ModernLayout>
  );
}
