"use client";

import React from "react";
import ModernLayout from "../../../../shared/components/ModernLayout";
import ModernPongGame from "../../../../games/pong/components/ModernPongGame";

export default function ModernPongSinglePlayerPage() {
  return (
    <ModernLayout>
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl sm:text-6xl font-bold text-white drop-shadow-glow mb-4">
            Modern Pong Arena
          </h1>
          <p className="text-xl text-blue-200 max-w-2xl mx-auto">
            Experience the next generation of Pong with enhanced graphics, power-ups, and advanced AI
          </p>
        </div>

        {/* Game Component */}
        <div className="w-full max-w-6xl">
          <ModernPongGame />
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-400 max-w-md">
          <p>
            Use <kbd className="px-2 py-1 bg-white/20 rounded">W/S</kbd> or{" "}
            <kbd className="px-2 py-1 bg-white/20 rounded">↑/↓</kbd> to control your paddle.
            Press <kbd className="px-2 py-1 bg-white/20 rounded">Space</kbd> to start or pause.
          </p>
        </div>
      </div>
    </ModernLayout>
  );
}
