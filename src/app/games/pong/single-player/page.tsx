"use client";

import React from "react";
import Link from "next/link";

import Footer from "../../../../shared/components/Footer";

// No longer need PhaserGame import since this page just shows selection

const PongSinglePlayerPage = () => {
  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-900 text-white">
      <main className="flex-grow p-4 md:p-8 flex flex-col items-center justify-center">
        <div className="container max-w-7xl mx-auto">
          <header className="text-center mb-4">
            <Link
              href="/"
              className="text-xl font-bold text-white hover:text-blue-400 transition-colors float-left"
            >
              ← Back to Game Arena
            </Link>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-wider drop-shadow-glow">
              Choose Your Pong Experience
            </h1>
            <p className="text-xl text-blue-200 mb-8">
              Select between the classic retro experience or the enhanced modern
              version
            </p>
          </header>

          {/* Game Version Selection */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Classic Version */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-blue-500/50 rounded-xl p-6 hover:border-blue-400 transition-all duration-300 hover:scale-105">
              <div className="text-center">
                <div className="text-6xl mb-4">🏓</div>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Classic Pong
                </h2>
                <p className="text-gray-300 mb-6">
                  The original retro experience with traditional graphics and
                  gameplay
                </p>
                <ul className="text-sm text-gray-400 mb-6 space-y-1">
                  <li>• Pixel-perfect retro graphics</li>
                  <li>• Classic physics and mechanics</li>
                  <li>• Nostalgic sound effects</li>
                  <li>• Built with Phaser.js</li>
                </ul>
                <Link
                  href="/games/pong/single-player/classic"
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  Play Classic
                </Link>
              </div>
            </div>

            {/* Modern Version */}
            <div className="bg-gradient-to-br from-purple-800 to-blue-900 border-2 border-purple-500/50 rounded-xl p-6 hover:border-purple-400 transition-all duration-300 hover:scale-105">
              <div className="text-center">
                <div className="text-6xl mb-4">✨</div>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Modern Pong
                </h2>
                <p className="text-gray-300 mb-6">
                  Enhanced gameplay with power-ups, advanced AI, and stunning
                  visual effects
                </p>
                <ul className="text-sm text-gray-400 mb-6 space-y-1">
                  <li>• Glassmorphic UI design</li>
                  <li>• 12 unique power-ups</li>
                  <li>• Advanced AI personalities</li>
                  <li>• Particle effects & animations</li>
                </ul>
                <Link
                  href="/games/pong/single-player-modern"
                  className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  Play Modern
                </Link>
              </div>
            </div>
          </div>

          {/* Universal Controls */}
          <div className="mt-12 max-w-2xl mx-auto">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h2 className="text-xl font-bold text-center mb-4 text-white">
                Universal Controls
              </h2>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <h3 className="font-semibold text-blue-400 mb-2">Keyboard</h3>
                  <ul className="text-gray-300 space-y-1">
                    <li>↑ / W - Move paddle up</li>
                    <li>↓ / S - Move paddle down</li>
                    <li>Space - Start/Pause game</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-purple-400 mb-2">
                    Touch (Mobile)
                  </h3>
                  <ul className="text-gray-300 space-y-1">
                    <li>Top half - Move paddle up</li>
                    <li>Bottom half - Move paddle down</li>
                    <li>Tap - Start/Pause game</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PongSinglePlayerPage;
