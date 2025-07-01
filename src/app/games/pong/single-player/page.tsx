"use client";

import React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import Footer from "../../../../shared/components/Footer";

// Import Phaser game component with dynamic import to prevent SSR issues
const PhaserGame = dynamic(
  () =>
    import("../../../../games/pong/components/PhaserGame").then(
      (mod) => mod.default
    ),
  { ssr: false }
);

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
              Pong - Player vs. AI
            </h1>
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

          {/* Controls - improved responsive design */}
          <div className="mt-4 md:mt-6 flex flex-wrap justify-center gap-3 md:gap-4">
            <div className="p-4 bg-gray-800 rounded-lg">
              <h2 className="text-lg font-semibold mb-2 text-center">
                Keyboard Controls
              </h2>
              <ul className="text-gray-300">
                <li className="mb-1">↑ / W - Move paddle up</li>
                <li className="mb-1">↓ / S - Move paddle down</li>
                <li>Space - Pause/Resume game</li>
              </ul>
            </div>

            <div className="p-4 bg-gray-800 rounded-lg">
              <h2 className="text-lg font-semibold mb-2 text-center">
                Game Rules
              </h2>
              <ul className="text-gray-300">
                <li className="mb-1">First to 10 points wins</li>
                <li className="mb-1">Ball speed increases with each hit</li>
                <li>Angle changes based on where the ball hits your paddle</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PongSinglePlayerPage;
