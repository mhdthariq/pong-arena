"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import ModernLayout from "../../../../../../shared/components/ModernLayout";
import GlassmorphicCard from "../../../../../../shared/components/GlassmorphicCard";
import ModernButton from "../../../../../../shared/components/ModernButton";
import {
  getFirebaseClient,
  setupFirebaseAuthListener,
} from "../../../../../../shared/firebase/firebaseClient";
import { getGame } from "../../../../../../shared/firebase/pongService";
import MessageBox from "../../../../../../shared/components/MessageBox";

// Import Phaser game component with dynamic import to prevent SSR issues
const PhaserGame = dynamic(
  () =>
    import("../../../../../../games/pong/components/PhaserGame").then(
      (mod) => mod.default,
    ),
  { ssr: false },
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function PongMultiPlayerGame({ params }: any) {
  const gameId = params.id;

  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameData, setGameData] = useState<{
    player1Id: string;
    player2Id?: string | null;
    gameCode?: string;
  } | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("connecting");
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
      setMessageBox,
    );

    return () => unsubAuth();
  }, []);

  // Load game data once auth is ready
  useEffect(() => {
    if (isAuthReady && db && userId && gameId) {
      const loadGame = async () => {
        try {
          setConnectionStatus("connecting");
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
          setGameData(gameData);
          setConnectionStatus("connected");
          setIsLoading(false);
        } catch (err) {
          console.error("Error loading game:", err);
          setError("Failed to load the game. Please try again.");
          setConnectionStatus("disconnected");
          setIsLoading(false);
        }
      };

      loadGame();
    }
  }, [isAuthReady, db, userId, gameId]);

  // Check if we're missing required parameters
  if (!gameId) {
    return (
      <ModernLayout variant="gaming" withBackground={true}>
        <div className="min-h-screen flex flex-col items-center justify-center">
          <GlassmorphicCard className="text-center max-w-md">
            <div className="text-6xl mb-6">❌</div>
            <h1 className="text-3xl font-bold text-white mb-4">Invalid Game</h1>
            <p className="text-gray-300 mb-6">
              Missing game ID. Please return to the lobby and try again.
            </p>
            <Link href="/games/pong/multi-player/lobby">
              <ModernButton variant="primary" size="lg" fullWidth>
                🔙 Back to Lobby
              </ModernButton>
            </Link>
          </GlassmorphicCard>
        </div>
      </ModernLayout>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <ModernLayout variant="gaming" withBackground={true}>
        <div className="min-h-screen flex flex-col items-center justify-center">
          <GlassmorphicCard className="text-center max-w-md">
            <div className="text-6xl mb-6">🎮</div>
            <h1 className="text-3xl font-bold text-white mb-4">
              Loading Arena
            </h1>
            <p className="text-gray-300 mb-6">
              Connecting to battle servers...
            </p>
            <div className="flex justify-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </GlassmorphicCard>
        </div>
      </ModernLayout>
    );
  }

  // Show error state
  if (error) {
    return (
      <ModernLayout variant="gaming" withBackground={true}>
        <div className="min-h-screen flex flex-col items-center justify-center">
          <GlassmorphicCard className="text-center max-w-md border-red-500/30 bg-red-500/10">
            <div className="text-6xl mb-6">⚠️</div>
            <h1 className="text-3xl font-bold text-red-400 mb-4">
              Arena Error
            </h1>
            <p className="text-gray-300 mb-6">{error}</p>
            <div className="space-y-3">
              <Link href="/games/pong/multi-player/lobby">
                <ModernButton variant="primary" size="lg" fullWidth>
                  🔙 Back to Lobby
                </ModernButton>
              </Link>
              <ModernButton
                variant="secondary"
                size="md"
                fullWidth
                onClick={() => window.location.reload()}
              >
                🔄 Retry Connection
              </ModernButton>
            </div>
          </GlassmorphicCard>
        </div>
      </ModernLayout>
    );
  }

  // Game found and user is a participant
  return (
    <ModernLayout
      variant="gaming"
      withBackground={true}
      backgroundParticleColor="#3b82f6"
      backgroundParticleCount={150}
      maxWidth="full"
      withPadding={false}
      className="bg-gradient-to-b from-slate-900 via-gray-900 to-black"
    >
      {/* Enhanced Header */}
      <div className="relative z-20 w-full">
        {/* Navigation Bar */}
        <nav className="flex items-center justify-between p-4 lg:p-6 border-b border-white/10 backdrop-blur-md bg-black/20">
          <Link
            href="/games/pong/multi-player/lobby"
            className="group flex items-center space-x-3"
          >
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
              Back to Lobby
            </span>
          </Link>

          {/* Game Info */}
          <div className="flex items-center space-x-4">
            <GlassmorphicCard className="px-4 py-2" padding="none">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    connectionStatus === "connected"
                      ? "bg-green-400 animate-pulse"
                      : connectionStatus === "connecting"
                        ? "bg-yellow-400 animate-bounce"
                        : "bg-red-400 animate-pulse"
                  }`}
                />
                <span className="text-sm text-white font-mono">
                  Arena: {gameId.slice(0, 8)}...
                </span>
              </div>
            </GlassmorphicCard>

            <ModernButton
              variant="glass"
              size="sm"
              onClick={() => setShowControls(!showControls)}
              className="hidden md:flex"
            >
              {showControls ? "Hide Panel" : "Show Panel"}
            </ModernButton>
          </div>
        </nav>

        {/* Battle Header */}
        <div className="text-center py-6 lg:py-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-red-400 via-yellow-500 to-blue-500 bg-clip-text text-transparent">
              ⚔️ BATTLE ARENA ⚔️
            </span>
          </h1>
          <div className="flex justify-center items-center space-x-6">
            <div className="text-center">
              <div className="text-blue-400 font-bold">Player 1</div>
              <div className="text-sm text-gray-400 font-mono">
                {gameData?.player1Id?.slice(0, 8)}...
              </div>
            </div>
            <div className="text-2xl text-white animate-pulse">VS</div>
            <div className="text-center">
              <div className="text-red-400 font-bold">
                {gameData?.player2Id ? "Player 2" : "Waiting..."}
              </div>
              <div className="text-sm text-gray-400 font-mono">
                {gameData?.player2Id?.slice(0, 8) || "..."}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="relative z-10 flex flex-col lg:flex-row gap-6 px-4 lg:px-6 pb-8">
        {/* Game Container */}
        <div className="flex-1 flex flex-col items-center">
          <GlassmorphicCard
            className="w-full max-w-7xl"
            padding="sm"
            blur="lg"
            opacity="medium"
            shadow="xl"
          >
            <div className="relative">
              {/* Game Arena */}
              <div
                className="relative bg-black/80 rounded-lg overflow-hidden border-2 border-blue-500/40 shadow-2xl shadow-blue-500/20"
                style={{
                  aspectRatio: "16/9",
                  minHeight: "400px",
                  maxHeight: "calc(100vh - 300px)",
                }}
              >
                <PhaserGame
                  isMultiplayer={true}
                  isSinglePlayer={false}
                  gameId={gameId}
                  userId={userId || ""}
                  db={db || undefined}
                />

                {/* Arena Border Effects */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-80" />
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-80" />
                  <div className="absolute top-0 bottom-0 left-0 w-px bg-gradient-to-b from-transparent via-blue-400 to-transparent opacity-80" />
                  <div className="absolute top-0 bottom-0 right-0 w-px bg-gradient-to-b from-transparent via-blue-400 to-transparent opacity-80" />
                </div>

                {/* Corner Decorations */}
                <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-blue-400/60"></div>
                <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-blue-400/60"></div>
                <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-blue-400/60"></div>
                <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-blue-400/60"></div>
              </div>
            </div>
          </GlassmorphicCard>
        </div>

        {/* Enhanced Side Panel */}
        {showControls && (
          <div className="lg:w-80 xl:w-96 space-y-6 animate-slide-up">
            {/* Match Status */}
            <GlassmorphicCard opacity="medium" blur="lg">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <span className="mr-2">📊</span>
                Match Status
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Game Mode:</span>
                  <span className="text-blue-400 font-semibold">
                    Multiplayer
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Arena ID:</span>
                  <span className="text-green-400 font-mono text-sm">
                    {gameId.slice(0, 8)}...
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Connection:</span>
                  <span
                    className={`font-semibold ${
                      connectionStatus === "connected"
                        ? "text-green-400"
                        : connectionStatus === "connecting"
                          ? "text-yellow-400"
                          : "text-red-400"
                    }`}
                  >
                    {connectionStatus.charAt(0).toUpperCase() +
                      connectionStatus.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Players:</span>
                  <span className="text-purple-400 font-semibold">
                    {gameData?.player2Id ? "2/2" : "1/2"}
                  </span>
                </div>
              </div>
            </GlassmorphicCard>

            {/* Controls */}
            <GlassmorphicCard opacity="medium" blur="lg">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <span className="mr-2">🎮</span>
                Battle Controls
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Move Up:</span>
                  <div className="flex space-x-2">
                    <kbd className="px-3 py-1 bg-white/20 rounded-md border border-white/30 text-sm font-mono">
                      W
                    </kbd>
                    <kbd className="px-3 py-1 bg-white/20 rounded-md border border-white/30 text-sm font-mono">
                      ↑
                    </kbd>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Move Down:</span>
                  <div className="flex space-x-2">
                    <kbd className="px-3 py-1 bg-white/20 rounded-md border border-white/30 text-sm font-mono">
                      S
                    </kbd>
                    <kbd className="px-3 py-1 bg-white/20 rounded-md border border-white/30 text-sm font-mono">
                      ↓
                    </kbd>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Ready/Pause:</span>
                  <kbd className="px-3 py-1 bg-white/20 rounded-md border border-white/30 text-sm font-mono">
                    Space
                  </kbd>
                </div>
              </div>
            </GlassmorphicCard>

            {/* Battle Rules */}
            <GlassmorphicCard opacity="medium" blur="lg">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <span className="mr-2">⚔️</span>
                Battle Rules
              </h3>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-start space-x-2">
                  <span className="text-red-400 mt-0.5">•</span>
                  <span>First to 10 points claims victory</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-yellow-400 mt-0.5">•</span>
                  <span>Both warriors must be ready to begin</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span>Ball velocity increases with each rally</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-green-400 mt-0.5">•</span>
                  <span>Master your timing for victory</span>
                </div>
              </div>
            </GlassmorphicCard>

            {/* Quick Actions */}
            <GlassmorphicCard opacity="medium" blur="lg">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <span className="mr-2">⚡</span>
                Quick Actions
              </h3>
              <div className="space-y-3">
                <ModernButton
                  variant="danger"
                  fullWidth
                  size="md"
                  onClick={() => {
                    if (
                      confirm("Are you sure you want to leave this battle?")
                    ) {
                      window.location.href = "/games/pong/multi-player/lobby";
                    }
                  }}
                >
                  🚪 Forfeit Battle
                </ModernButton>
                <ModernButton
                  variant="secondary"
                  fullWidth
                  size="md"
                  onClick={() => window.location.reload()}
                >
                  🔄 Reconnect
                </ModernButton>
              </div>
            </GlassmorphicCard>
          </div>
        )}
      </div>

      {/* Mobile Controls Toggle */}
      <div className="lg:hidden fixed bottom-6 right-6 z-30">
        <ModernButton
          variant="glass"
          size="lg"
          onClick={() => setShowControls(!showControls)}
          className="rounded-full w-14 h-14 p-0 shadow-2xl"
        >
          {showControls ? "✕" : "📊"}
        </ModernButton>
      </div>

      {/* Battle Tips Footer */}
      <div className="relative z-10 px-4 lg:px-6 pb-8">
        <GlassmorphicCard opacity="low" blur="md" className="max-w-4xl mx-auto">
          <div className="text-center">
            <h4 className="text-lg font-semibold text-white mb-3">
              ⚡ Battle Tactics
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
              <div>
                <strong className="text-red-400">🎯 Precision:</strong> Predict
                your opponent&apos;s moves and position accordingly
              </div>
              <div>
                <strong className="text-yellow-400">⚡ Speed:</strong> React
                quickly as the ball velocity increases
              </div>
              <div>
                <strong className="text-blue-400">🧠 Strategy:</strong> Use
                paddle edges for angled shots
              </div>
            </div>
          </div>
        </GlassmorphicCard>
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
