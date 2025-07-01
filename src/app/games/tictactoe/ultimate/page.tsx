"use client";

import React, { useState } from "react";
import Link from "next/link";
import { UltimateTicTacToeGame } from "../../../../games/tictactoe";
import Footer from "../../../../shared/components/Footer";
import { TicTacToePlayer, AIPersonality } from "../../../../games/tictactoe/lib/types";

export default function UltimateTicTacToePage() {
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | "impossible">("medium");
  const [playerSymbol, setPlayerSymbol] = useState<TicTacToePlayer>("X");
  const [aiPersonality, setAiPersonality] = useState<AIPersonality>("strategic");
  const [gameStarted, setGameStarted] = useState(false);
  const [gameResult, setGameResult] = useState<{
    winner: TicTacToePlayer | "draw" | null;
  } | null>(null);

  const startGame = () => {
    setGameStarted(true);
    setGameResult(null);
  };

  const handleGameEnd = (result: {
    winner: TicTacToePlayer | "draw" | null;
  }) => {
    setGameResult(result);
  };

  const playAgain = () => {
    setGameStarted(false);
    setGameResult(null);
  };

  return (
    <div className="w-full min-h-screen bg-gray-900 text-white p-4 flex flex-col">
      <header className="w-full max-w-6xl mx-auto pt-4 pb-6">
        <nav className="flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold text-white hover:text-blue-400 transition-colors"
          >
            ← Back to Game Arena
          </Link>
        </nav>
        <h1 className="text-3xl sm:text-4xl font-bold text-center mt-4 mb-8">
          Ultimate Tic-Tac-Toe
        </h1>
      </header>

      <main className="w-full max-w-6xl mx-auto flex-grow px-4">
        {!gameStarted ? (
          <div className="bg-gray-800 rounded-xl p-6 sm:p-8 shadow-xl border border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Game Settings
            </h2>

            <div className="mb-8">
              <h3 className="text-xl font-medium mb-4">Select Difficulty</h3>
              <div className="grid grid-cols-4 gap-4">
                {(["easy", "medium", "hard", "impossible"] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`py-3 px-4 rounded-lg text-lg font-medium transition-colors
                      ${
                        difficulty === level
                          ? "bg-blue-600 text-white ring-2 ring-blue-400"
                          : "bg-gray-700 hover:bg-gray-600"
                      }`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-medium mb-4">Choose Your Symbol</h3>
              <div className="grid grid-cols-2 gap-6">
                {(["X", "O"] as TicTacToePlayer[]).map((symbol) => (
                  <button
                    key={symbol}
                    onClick={() => setPlayerSymbol(symbol)}
                    className={`py-5 px-4 rounded-lg text-3xl font-bold transition-colors
                      ${
                        playerSymbol === symbol
                          ? "bg-blue-600 text-white ring-2 ring-blue-400"
                          : "bg-gray-700 hover:bg-gray-600"
                      }`}
                  >
                    {symbol}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-10">
              <h3 className="text-xl font-medium mb-4">AI Personality</h3>
              <div className="grid grid-cols-3 gap-3">
                {(
                  [
                    "strategic",
                    "aggressive",
                    "defensive",
                    "balanced",
                    "random",
                    "mimicking",
                  ] as AIPersonality[]
                ).map((personality) => (
                  <button
                    key={personality}
                    onClick={() => setAiPersonality(personality)}
                    className={`py-2 px-3 rounded-lg text-center transition-colors ${
                      aiPersonality === personality
                        ? "bg-purple-700 text-white"
                        : "bg-gray-700 hover:bg-gray-600 text-gray-200"
                    }`}
                  >
                    <span className="font-medium capitalize">
                      {personality.charAt(0).toUpperCase() + personality.slice(1)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={startGame}
              className="w-full py-4 text-xl font-bold rounded-lg bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 transition-colors shadow-lg"
            >
              Start Game
            </button>

            <div className="mt-8 p-4 bg-gray-700/50 rounded-lg">
              <h3 className="text-xl font-medium mb-2 text-center">How to Play</h3>
              <p className="text-gray-300 text-sm">
                Ultimate Tic-Tac-Toe is played on a 3×3 grid of 3×3 Tic-Tac-Toe boards.
                To win, you need to win three smaller boards in a row. The catch: wherever
                you play determines which board your opponent must play in next. If sent to
                a completed board, your opponent may choose any available board.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl p-6 sm:p-8 shadow-xl border border-gray-700 flex flex-col items-center">
            {gameResult ? (
              <div className="w-full text-center mb-6">
                <h2 className="text-4xl font-bold mb-4 animate-bounce">
                  {gameResult.winner === playerSymbol
                    ? "🎉 You Win! 🎉"
                    : gameResult.winner === "draw"
                      ? "🤝 Game Draw! 🤝"
                      : "😢 AI Wins! 😢"}
                </h2>
                <button
                  onClick={playAgain}
                  className="mb-6 py-4 px-10 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-xl font-medium transition-colors shadow-lg transform hover:scale-105"
                >
                  Play Again
                </button>
              </div>
            ) : null}

            <UltimateTicTacToeGame
              difficulty={difficulty}
              playerSymbol={playerSymbol}
              isAIGame={true}
              aiPersonality={aiPersonality}
              onGameEnd={handleGameEnd}
            />

            {/* Return to settings button */}
            {!gameResult?.winner && (
              <button
                onClick={playAgain}
                className="mt-8 py-2 px-6 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-base transition-colors"
              >
                Back to Settings
              </button>
            )}
          </div>
        )}
      </main>

      <div className="mt-10">
        <Footer />
      </div>
    </div>
  );
}
