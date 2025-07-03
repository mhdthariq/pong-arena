"use client";

import React, { useState } from "react";
import ModernLayout from "../../../../shared/components/ModernLayout";
import ModernPongGame from "../../../../games/pong/components/ModernPongGame";
import GlassmorphicCard from "../../../../shared/components/GlassmorphicCard";
import ModernButton from "../../../../shared/components/ModernButton";
import Link from "next/link";

export default function ModernPongSinglePlayerPage() {
  const [showControls, setShowControls] = useState(true);

  return (
    <ModernLayout
      variant="gaming"
      withBackground={true}
      backgroundParticleColor="#00ff88"
      backgroundParticleCount={200}
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
              {showControls ? "Hide Controls" : "Show Controls"}
            </ModernButton>
          </div>
        </nav>

        {/* Enhanced Hero Section */}
        <div className="text-center px-4 pb-8 lg:pb-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-6 relative">
              <span className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent drop-shadow-2xl">
                MODERN PONG
              </span>
              <div className="absolute -inset-1 bg-gradient-to-r from-green-400/20 via-blue-500/20 to-purple-600/20 blur-3xl -z-10" />
            </h1>

            <p className="text-xl lg:text-2xl text-blue-200/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              Experience the next evolution of the classic arcade game with
              enhanced graphics, dynamic power-ups, and intelligent AI opponents
            </p>

            {/* Game Stats Display */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 max-w-2xl mx-auto mb-8">
              <GlassmorphicCard className="text-center py-4" padding="sm">
                <div className="text-2xl font-bold text-green-400">∞</div>
                <div className="text-sm text-gray-300">Difficulty Levels</div>
              </GlassmorphicCard>
              <GlassmorphicCard className="text-center py-4" padding="sm">
                <div className="text-2xl font-bold text-blue-400">⚡</div>
                <div className="text-sm text-gray-300">Power-ups</div>
              </GlassmorphicCard>
              <GlassmorphicCard className="text-center py-4" padding="sm">
                <div className="text-2xl font-bold text-purple-400">🎯</div>
                <div className="text-sm text-gray-300">Precision AI</div>
              </GlassmorphicCard>
              <GlassmorphicCard className="text-center py-4" padding="sm">
                <div className="text-2xl font-bold text-yellow-400">🏆</div>
                <div className="text-sm text-gray-300">Achievements</div>
              </GlassmorphicCard>
            </div>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="relative z-10 flex flex-col lg:flex-row gap-6 lg:gap-8 px-4 lg:px-6 xl:px-8 pb-8">
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
              {/* Game Canvas Wrapper */}
              <div className="relative bg-black/50 rounded-lg overflow-hidden border-2 border-green-500/30 shadow-2xl shadow-green-500/20">
                <ModernPongGame />

                {/* Game Overlay Effects */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-60" />
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-60" />
                  <div className="absolute top-0 bottom-0 left-0 w-px bg-gradient-to-b from-transparent via-green-400 to-transparent opacity-60" />
                  <div className="absolute top-0 bottom-0 right-0 w-px bg-gradient-to-b from-transparent via-green-400 to-transparent opacity-60" />
                </div>
              </div>
            </div>
          </GlassmorphicCard>
        </div>

        {/* Enhanced Side Panel */}
        {showControls && (
          <div className="lg:w-80 xl:w-96 space-y-6 animate-slide-up">
            {/* Controls Card */}
            <GlassmorphicCard
              opacity="medium"
              blur="lg"
              className="transition-all duration-300 hover:opacity-80"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <span className="mr-2">🎮</span>
                Game Controls
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
                  <span className="text-gray-300">Pause/Start:</span>
                  <kbd className="px-3 py-1 bg-white/20 rounded-md border border-white/30 text-sm font-mono">
                    Space
                  </kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Settings:</span>
                  <kbd className="px-3 py-1 bg-white/20 rounded-md border border-white/30 text-sm font-mono">
                    Esc
                  </kbd>
                </div>
              </div>
            </GlassmorphicCard>

            {/* Game Features Card */}
            <GlassmorphicCard
              opacity="medium"
              blur="lg"
              className="transition-all duration-300 hover:opacity-80"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <span className="mr-2">⚡</span>
                Features
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-gray-300">Dynamic Power-ups</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div
                    className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"
                    style={{ animationDelay: "0.5s" }}
                  />
                  <span className="text-gray-300">Adaptive AI Difficulty</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div
                    className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"
                    style={{ animationDelay: "1s" }}
                  />
                  <span className="text-gray-300">Particle Effects</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div
                    className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"
                    style={{ animationDelay: "1.5s" }}
                  />
                  <span className="text-gray-300">Score Tracking</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div
                    className="w-2 h-2 bg-red-400 rounded-full animate-pulse"
                    style={{ animationDelay: "2s" }}
                  />
                  <span className="text-gray-300">Sound Effects</span>
                </div>
              </div>
            </GlassmorphicCard>

            {/* Quick Actions */}
            <GlassmorphicCard
              opacity="medium"
              blur="lg"
              className="transition-all duration-300 hover:opacity-80"
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
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  New Game
                </ModernButton>
                <ModernButton variant="secondary" fullWidth size="md">
                  Settings
                </ModernButton>
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
            </GlassmorphicCard>
          </div>
        )}
      </div>

      {/* Mobile-only floating controls toggle */}
      <div className="md:hidden fixed bottom-6 right-6 z-30">
        <ModernButton
          variant="glass"
          size="lg"
          onClick={() => setShowControls(!showControls)}
          className="rounded-full w-14 h-14 p-0 shadow-2xl"
        >
          {showControls ? "✕" : "?"}
        </ModernButton>
      </div>

      {/* Enhanced Footer with Pro Tips */}
      <div className="relative z-10 px-4 lg:px-6 xl:px-8 pb-8">
        <GlassmorphicCard opacity="low" blur="md" className="max-w-4xl mx-auto">
          <div className="text-center">
            <h4 className="text-lg font-semibold text-white mb-3">
              💡 Pro Tips
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
              <div>
                <strong className="text-green-400">Anticipate:</strong> Watch
                the ball&apos;s trajectory and position your paddle early
              </div>
              <div>
                <strong className="text-blue-400">Power-ups:</strong> Collect
                glowing orbs for temporary advantages
              </div>
              <div>
                <strong className="text-purple-400">Timing:</strong> Use precise
                movements for better ball control
              </div>
            </div>
          </div>
        </GlassmorphicCard>
      </div>
    </ModernLayout>
  );
}
