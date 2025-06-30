"use client";

import React from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// Import Phaser game component with dynamic import to prevent SSR issues
const PhaserGame = dynamic(
  () => import("../../phaser/PhaserGame").then((mod) => mod),
  { ssr: false }
);

const SinglePlayerGamePage = () => {
  const router = useRouter();

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-900 text-white p-4 md:p-8">
      <div className="container max-w-7xl mx-auto">
        <header className="text-center mb-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-wider drop-shadow-glow">Player vs. AI</h1>
        </header>

        {/* Game container - responsive for all devices */}
        <div className="relative mx-auto bg-black border-4 border-blue-700 rounded-lg overflow-hidden shadow-lg shadow-blue-700/30" 
             style={{ 
               width: "min(90vw, 1200px)",
               height: "min(70vh, 675px)",
               aspectRatio: "16/9"
             }}>
          {/* Phaser game container */}
          <div className="h-full w-full relative">
            <PhaserGame isSinglePlayer={true} />
          </div>
        </div>

        {/* Controls - improved responsive design */}
        <div className="mt-4 md:mt-6 flex flex-wrap justify-center gap-3 md:gap-4">
          <button
            onClick={() => window.location.reload()}
            className="px-4 sm:px-6 md:px-8 py-2 md:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 transform hover:scale-105 shadow-lg text-sm sm:text-base"
          >
            Restart Game
          </button>
          <button
            onClick={() => router.push("/")}
            className="px-4 sm:px-6 md:px-8 py-2 md:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg text-sm sm:text-base"
          >
            Back to Menu
          </button>
        </div>

        {/* Game instructions - responsive text sizes */}
        <div className="mt-4 md:mt-6 text-gray-300 text-center">
          <p className="mb-1 md:mb-2 text-sm sm:text-base">Controls: ↑↓ or W/S to move paddle</p>
          <p className="text-sm sm:text-base">Press SPACE to serve | Press R to restart when game is over</p>
        </div>
      </div>
    </main>
  );
};

export default SinglePlayerGamePage;
