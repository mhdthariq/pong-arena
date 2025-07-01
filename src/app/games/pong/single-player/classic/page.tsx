"use client";

import React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import Footer from "../../../../../shared/components/Footer";

// Import Phaser game component with dynamic import to prevent SSR issues
const PhaserGame = dynamic(
  () =>
    import("../../../../../games/pong/components/PhaserGame").then(
      (mod) => mod.default,
    ),
  { ssr: false },
);

const ClassicPongPage = () => {
  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-900 text-white">
      <main className="flex-grow p-4 md:p-8 flex flex-col items-center justify-center">
        <div className="container max-w-7xl mx-auto">
          <header className="text-center mb-4">
            <Link
              href="/games/pong/single-player"
              className="text-xl font-bold text-white hover:text-blue-400 transition-colors float-left"
            >
              ← Back to Pong Selection
            </Link>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-wider drop-shadow-glow">
              Classic Pong - Player vs. AI
            </h1>
            <p className="text-lg text-blue-200 mb-4">
              The original retro experience with pixel-perfect graphics
            </p>
          </header>

          {/* Game container - responsive for all devices */}
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
              <PhaserGame isSinglePlayer={true} />
            </div>
          </div>

          {/* Controls and game info */}
          <div className="mt-6 grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
              <h2 className="text-lg font-semibold mb-3 text-center text-blue-400">
                Controls
              </h2>
              <ul className="text-gray-300 space-y-1">
                <li>↑ / W - Move paddle up</li>
                <li>↓ / S - Move paddle down</li>
                <li>Space - Pause/Resume</li>
              </ul>
            </div>

            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
              <h2 className="text-lg font-semibold mb-3 text-center text-green-400">
                Game Rules
              </h2>
              <ul className="text-gray-300 space-y-1">
                <li>First to 10 points wins</li>
                <li>Ball speed increases on hits</li>
                <li>Hit angle affects ball direction</li>
              </ul>
            </div>

            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
              <h2 className="text-lg font-semibold mb-3 text-center text-purple-400">
                Features
              </h2>
              <ul className="text-gray-300 space-y-1">
                <li>Retro pixel graphics</li>
                <li>Classic physics engine</li>
                <li>Nostalgic sound effects</li>
              </ul>
            </div>
          </div>

          {/* Tips */}
          <div className="mt-6 max-w-2xl mx-auto">
            <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-400 mb-2">
                💡 Pro Tips
              </h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>
                  • Hit the ball with the edges of your paddle for sharper
                  angles
                </li>
                <li>
                  • Watch the AI&apos;s movement patterns to predict its
                  strategy
                </li>
                <li>
                  • Use the center of your paddle for more controlled shots
                </li>
                <li>• The ball gets faster with each rally - stay focused!</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ClassicPongPage;
