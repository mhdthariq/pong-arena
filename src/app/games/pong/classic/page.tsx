"use client";

import React, { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import ModernLayout from "../../../../shared/components/ModernLayout";
import GlassmorphicCard from "../../../../shared/components/GlassmorphicCard";
import ModernButton from "../../../../shared/components/ModernButton";
import GamingCard from "../../../../shared/components/GamingCard";

// Import Phaser game component with dynamic import to prevent SSR issues
const PhaserGame = dynamic(
  () =>
    import("../../../../games/pong/components/PhaserGame").then(
      (mod) => mod.default,
    ),
  { ssr: false },
);

const ClassicPongPage = () => {
  const [showControls, setShowControls] = useState(true);

  return (
    <ModernLayout
      variant="gaming"
      withBackground={true}
      backgroundParticleColor="#3b82f6"
      backgroundParticleCount={150}
      withVerticalCenter={false}
      maxWidth="full"
      withPadding={false}
      className="bg-gradient-to-b from-slate-900 via-gray-900 to-black"
    >
      {/* Enhanced Header Section */}
      <div className="relative z-20 w-full">
        {/* Navigation Bar */}
        <nav className="flex items-center justify-between p-4 lg:p-6 xl:p-8">
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
            <ModernButton
              variant="glass"
              size="sm"
              onClick={() => setShowControls(!showControls)}
              className="hidden md:flex"
            >
              {showControls ? "Hide Info" : "Show Info"}
            </ModernButton>
          </div>
        </nav>

        {/* Enhanced Hero Section */}
        <div className="text-center px-4 pb-8 lg:pb-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-6 relative">
              <span className="bg-gradient-to-r from-blue-400 via-cyan-500 to-blue-600 bg-clip-text text-transparent drop-shadow-2xl">
                CLASSIC PONG
              </span>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-400/20 via-cyan-500/20 to-blue-600/20 blur-3xl -z-10" />
            </h1>

            <p className="text-xl lg:text-2xl text-blue-200/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              Experience the original retro arcade classic with pixel-perfect
              graphics and nostalgic gameplay
            </p>

            {/* Game Mode Info */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 max-w-2xl mx-auto mb-8">
              <GlassmorphicCard className="text-center py-4" padding="sm">
                <div className="text-2xl font-bold text-blue-400">🏓</div>
                <div className="text-sm text-gray-300">Classic Mode</div>
              </GlassmorphicCard>
              <GlassmorphicCard className="text-center py-4" padding="sm">
                <div className="text-2xl font-bold text-cyan-400">🤖</div>
                <div className="text-sm text-gray-300">vs AI</div>
              </GlassmorphicCard>
              <GlassmorphicCard className="text-center py-4" padding="sm">
                <div className="text-2xl font-bold text-green-400">🎯</div>
                <div className="text-sm text-gray-300">Pixel Perfect</div>
              </GlassmorphicCard>
              <GlassmorphicCard className="text-center py-4" padding="sm">
                <div className="text-2xl font-bold text-purple-400">🔊</div>
                <div className="text-sm text-gray-300">Retro Sounds</div>
              </GlassmorphicCard>
            </div>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="relative z-10 flex flex-col lg:flex-row gap-6 lg:gap-8 px-4 lg:px-6 xl:px-8 pb-8">
        {/* Game Container - Keeping original resolution and styling */}
        <div className="flex-1 flex flex-col items-center">
          <GlassmorphicCard
            className="w-full max-w-7xl"
            padding="sm"
            blur="lg"
            opacity="medium"
            shadow="xl"
          >
            <div className="relative">
              {/* Original Game Container - Unchanged */}
              <div
                className="relative mx-auto bg-black border-4 border-blue-700 rounded-lg overflow-hidden shadow-lg shadow-blue-700/30"
                style={{
                  width: "min(90vw, 1200px)",
                  height: "min(70vh, 675px)",
                  aspectRatio: "16/9",
                }}
              >
                {/* Phaser game container - Unchanged */}
                <div className="h-full w-full relative">
                  <PhaserGame isSinglePlayer={true} />
                </div>
              </div>

              {/* Enhanced Game Border Effects */}
              <div className="absolute inset-0 pointer-events-none rounded-lg">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-60" />
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-60" />
                <div className="absolute top-0 bottom-0 left-0 w-px bg-gradient-to-b from-transparent via-blue-400 to-transparent opacity-60" />
                <div className="absolute top-0 bottom-0 right-0 w-px bg-gradient-to-b from-transparent via-blue-400 to-transparent opacity-60" />
              </div>
            </div>
          </GlassmorphicCard>
        </div>

        {/* Enhanced Side Panel */}
        {showControls && (
          <div className="lg:w-80 xl:w-96 space-y-6 animate-slide-up">
            {/* Controls Card */}
            <GamingCard
              variant="neon"
              neonColor="blue"
              glowEffect={true}
              hoverEffect={true}
              className="transition-all duration-300"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <span className="mr-2">🎮</span>
                Game Controls
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Move Up:</span>
                  <div className="flex space-x-2">
                    <kbd className="px-3 py-2 bg-white/20 rounded-md border border-white/30 text-sm font-mono shadow-lg">
                      W
                    </kbd>
                    <kbd className="px-3 py-2 bg-white/20 rounded-md border border-white/30 text-sm font-mono shadow-lg">
                      ↑
                    </kbd>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Move Down:</span>
                  <div className="flex space-x-2">
                    <kbd className="px-3 py-2 bg-white/20 rounded-md border border-white/30 text-sm font-mono shadow-lg">
                      S
                    </kbd>
                    <kbd className="px-3 py-2 bg-white/20 rounded-md border border-white/30 text-sm font-mono shadow-lg">
                      ↓
                    </kbd>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Pause/Resume:</span>
                  <kbd className="px-3 py-2 bg-white/20 rounded-md border border-white/30 text-sm font-mono shadow-lg">
                    Space
                  </kbd>
                </div>
              </div>
            </GamingCard>

            {/* Game Rules Card */}
            <GamingCard
              variant="default"
              glowEffect={true}
              hoverEffect={true}
              className="transition-all duration-300"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <span className="mr-2">📋</span>
                Game Rules
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-gray-300">First to 10 points wins</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div
                    className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"
                    style={{ animationDelay: "0.5s" }}
                  />
                  <span className="text-gray-300">
                    Ball speed increases on hits
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div
                    className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"
                    style={{ animationDelay: "1s" }}
                  />
                  <span className="text-gray-300">
                    Hit angle affects ball direction
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div
                    className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"
                    style={{ animationDelay: "1.5s" }}
                  />
                  <span className="text-gray-300">Classic physics engine</span>
                </div>
              </div>
            </GamingCard>

            {/* Features Card */}
            <GamingCard
              variant="default"
              glowEffect={true}
              hoverEffect={true}
              className="transition-all duration-300"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <span className="mr-2">✨</span>
                Retro Features
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                  <span className="text-gray-300">Pixel-perfect graphics</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div
                    className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"
                    style={{ animationDelay: "0.3s" }}
                  />
                  <span className="text-gray-300">Nostalgic sound effects</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div
                    className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"
                    style={{ animationDelay: "0.6s" }}
                  />
                  <span className="text-gray-300">Classic arcade feel</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div
                    className="w-2 h-2 bg-green-400 rounded-full animate-pulse"
                    style={{ animationDelay: "0.9s" }}
                  />
                  <span className="text-gray-300">Smooth gameplay</span>
                </div>
              </div>
            </GamingCard>

            {/* Quick Actions */}
            <GamingCard
              variant="neon"
              neonColor="blue"
              glowEffect={true}
              hoverEffect={true}
              className="transition-all duration-300"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <span className="mr-2">🚀</span>
                Quick Actions
              </h3>
              <div className="space-y-3">
                <ModernButton
                  variant="primary"
                  fullWidth
                  size="md"
                  className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
                >
                  New Game
                </ModernButton>
                <Link href="/games/pong/modern" className="block">
                  <ModernButton
                    variant="success"
                    fullWidth
                    size="md"
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  >
                    Try Modern Mode
                  </ModernButton>
                </Link>
                <Link href="/games/pong/multi-player/lobby" className="block">
                  <ModernButton
                    variant="info"
                    fullWidth
                    size="md"
                    className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                  >
                    Play Multiplayer
                  </ModernButton>
                </Link>
              </div>
            </GamingCard>
          </div>
        )}
      </div>

      {/* Mobile-only floating controls toggle */}
      <div className="md:hidden fixed bottom-6 right-6 z-30">
        <ModernButton
          variant="glass"
          size="lg"
          onClick={() => setShowControls(!showControls)}
          className="rounded-full w-14 h-14 p-0 shadow-2xl border-2 border-blue-400/30"
        >
          {showControls ? "✕" : "ℹ"}
        </ModernButton>
      </div>

      {/* Enhanced Footer with Pro Tips */}
      <div className="relative z-10 px-4 lg:px-6 xl:px-8 pb-8">
        <GlassmorphicCard
          opacity="medium"
          blur="lg"
          className="max-w-4xl mx-auto"
        >
          <div className="text-center">
            <h4 className="text-xl font-semibold text-white mb-4 flex items-center justify-center">
              <span className="mr-2">💡</span>
              Pro Tips for Classic Pong
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-300">
              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <strong className="text-blue-400 block mb-1">
                  Paddle Control:
                </strong>
                Hit the ball with the edges of your paddle for sharper angles
              </div>
              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <strong className="text-cyan-400 block mb-1">
                  AI Strategy:
                </strong>
                Watch the AI&apos;s movement patterns to predict its next move
              </div>
              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <strong className="text-green-400 block mb-1">
                  Center Shots:
                </strong>
                Use the center of your paddle for more controlled shots
              </div>
              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <strong className="text-purple-400 block mb-1">
                  Speed Focus:
                </strong>
                The ball gets faster with each rally - stay focused!
              </div>
            </div>
          </div>
        </GlassmorphicCard>
      </div>

      {/* Decorative Gaming Elements */}
      <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
        {/* Floating retro elements */}
        <div className="absolute top-20 left-10 w-16 h-16 border-2 border-blue-400/20 rounded-lg animate-float opacity-30" />
        <div
          className="absolute top-40 right-20 w-12 h-12 border-2 border-cyan-400/20 rounded-full animate-float opacity-30"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-32 left-16 w-20 h-20 border-2 border-purple-400/20 rounded-lg rotate-45 animate-float opacity-30"
          style={{ animationDelay: "2s" }}
        />
      </div>
    </ModernLayout>
  );
};

export default ClassicPongPage;
