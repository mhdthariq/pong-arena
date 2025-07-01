"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function MultiPlayerGamePage() {
  const params = useParams();
  const gameId = params?.id as string;

  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-900 text-white">
      <main className="flex-grow p-4 md:p-8 flex flex-col items-center justify-center">
        <div className="container max-w-4xl mx-auto text-center">
          <Link
            href="/"
            className="text-xl font-bold text-white hover:text-blue-400 transition-colors mb-8 inline-block"
          >
            ← Back to Game Arena
          </Link>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 tracking-wider drop-shadow-glow">
            Multiplayer Game
          </h1>

          <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-blue-400">
              Game Session
            </h2>
            <p className="text-gray-300 mb-4">
              Game ID:{" "}
              <span className="font-mono text-blue-300">
                {gameId || "Loading..."}
              </span>
            </p>
            <p className="text-yellow-400 mb-6">
              🚧 Multiplayer functionality is under development
            </p>
            <div className="space-y-4">
              <p className="text-gray-400">
                This feature will allow real-time multiplayer gaming with other
                players.
              </p>
              <Link
                href="/games/pong/single-player-modern"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Try Single Player Instead
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 py-4 text-center text-gray-400">
        <p>© 2025 Pong Arena. Multiplayer features coming soon!</p>
      </footer>
    </div>
  );
}
