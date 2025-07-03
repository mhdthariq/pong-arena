"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { UltimateTicTacToeGame } from "../../../../games/tictactoe";
import Footer from "../../../../shared/components/Footer";
import {
  TicTacToePlayer,
  AIPersonality,
} from "../../../../games/tictactoe/lib/types";
import GlassmorphicCard from "../../../../shared/components/GlassmorphicCard";
import ModernButton from "../../../../shared/components/ModernButton";
import ModernLayout from "../../../../shared/components/ModernLayout";

export default function UltimateTicTacToePage() {
  const [difficulty, setDifficulty] = useState<
    "easy" | "medium" | "hard" | "impossible"
  >("medium");
  const [playerSymbol, setPlayerSymbol] = useState<TicTacToePlayer>("X");
  const [aiPersonality, setAiPersonality] =
    useState<AIPersonality>("strategic");
  const [gameStarted, setGameStarted] = useState(false);
  const [gameResult, setGameResult] = useState<{
    winner: TicTacToePlayer | "draw" | null;
  } | null>(null);
  const [themeColor, setThemeColor] = useState("#8b5cf6"); // Purple theme for Ultimate

  // Set theme color based on AI personality
  useEffect(() => {
    switch (aiPersonality) {
      case "aggressive":
        setThemeColor("#ef4444"); // Red for aggressive
        break;
      case "defensive":
        setThemeColor("#10b981"); // Green for defensive
        break;
      case "balanced":
        setThemeColor("#60a5fa"); // Blue for balanced
        break;
      case "random":
        setThemeColor("#f59e0b"); // Amber for random
        break;
      case "mimicking":
        setThemeColor("#ec4899"); // Pink for mimicking
        break;
      default:
        setThemeColor("#8b5cf6"); // Purple for strategic (default)
        break;
    }
  }, [aiPersonality]);

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
    <ModernLayout
      withBackground={true}
      backgroundParticleColor={themeColor}
      backgroundParticleCount={180}
      withMaxWidth={true}
      maxWidth="2xl"
      withVerticalCenter={false}
    >
      {/* Navigation */}
      <header className="w-full max-w-7xl mx-auto px-4 py-6 z-10 relative animate-fade-in">
        <nav className="flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold text-white hover:text-blue-400 transition-colors flex items-center group"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-2 transform group-hover:-translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span className="drop-shadow-glow">Game Arena</span>
          </Link>
        </nav>
        <h1 className="text-4xl sm:text-6xl font-bold text-center mt-8 mb-6 text-white drop-shadow-glow animate-float">
          Ultimate
          <span className="block text-2xl sm:text-3xl mt-2 text-purple-300 animate-pulse-slow">
            Tic-Tac-Toe
          </span>
        </h1>
      </header>

      <main className="w-full flex-grow z-10 relative animate-slide-up px-4">
        {!gameStarted ? (
          <div className="max-w-7xl mx-auto">
            <GlassmorphicCard
              blur="lg"
              opacity="medium"
              rounded="xl"
              shadow="xl"
              padding="lg"
              className="w-full"
            >
              <h2 className="text-2xl font-bold text-white mb-6 text-center drop-shadow-glow animate-float">
                Game Settings
              </h2>

              <div className="mb-8">
                <h3 className="text-xl font-medium mb-4 flex items-center text-purple-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Select Difficulty
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {(["easy", "medium", "hard", "impossible"] as const).map(
                    (level) => (
                      <button
                        key={level}
                        onClick={() => setDifficulty(level)}
                        className={`py-3 px-4 rounded-lg text-lg font-medium transition-all duration-300 relative overflow-hidden
                      ${
                        difficulty === level
                          ? "bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg transform -translate-y-1"
                          : "glass-button"
                      }`}
                      >
                        {difficulty === level && (
                          <span className="absolute inset-0 bg-white/10 animate-pulse-slow"></span>
                        )}
                        <span className="relative z-10">
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </span>
                      </button>
                    ),
                  )}
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-medium mb-4 flex items-center text-purple-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Choose Your Symbol
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  {(["X", "O"] as TicTacToePlayer[]).map((symbol) => (
                    <button
                      key={symbol}
                      onClick={() => setPlayerSymbol(symbol)}
                      className={`py-8 px-4 rounded-lg text-4xl font-bold transition-all duration-300 relative overflow-hidden
                      ${
                        playerSymbol === symbol
                          ? symbol === "X"
                            ? "bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg transform -translate-y-1"
                            : "bg-gradient-to-br from-red-500 to-red-700 text-white shadow-lg transform -translate-y-1"
                          : "glass-button"
                      }`}
                    >
                      {playerSymbol === symbol && (
                        <span className="absolute inset-0 bg-white/10 animate-pulse-slow"></span>
                      )}
                      <span className="relative z-10 drop-shadow-glow">
                        {symbol}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-10">
                <h3 className="text-xl font-medium mb-4 flex items-center text-purple-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                      clipRule="evenodd"
                    />
                  </svg>
                  AI Personality
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {(
                    [
                      "strategic",
                      "aggressive",
                      "defensive",
                      "balanced",
                      "random",
                      "mimicking",
                    ] as AIPersonality[]
                  ).map((personality) => {
                    // Get color based on personality
                    const getColor = () => {
                      switch (personality) {
                        case "aggressive":
                          return "from-red-500 to-red-700";
                        case "defensive":
                          return "from-green-500 to-green-700";
                        case "balanced":
                          return "from-blue-500 to-blue-700";
                        case "random":
                          return "from-yellow-500 to-amber-700";
                        case "mimicking":
                          return "from-pink-500 to-pink-700";
                        default:
                          return "from-purple-500 to-purple-700";
                      }
                    };

                    return (
                      <button
                        key={personality}
                        onClick={() => setAiPersonality(personality)}
                        className={`py-3 px-4 rounded-lg text-center transition-all duration-300 relative overflow-hidden ${
                          aiPersonality === personality
                            ? `bg-gradient-to-br ${getColor()} text-white shadow-lg transform -translate-y-1`
                            : "glass-button"
                        }`}
                      >
                        {aiPersonality === personality && (
                          <span className="absolute inset-0 bg-white/10 animate-pulse-slow"></span>
                        )}
                        <div className="relative z-10">
                          <span className="font-medium capitalize block">
                            {personality.charAt(0).toUpperCase() +
                              personality.slice(1)}
                          </span>
                          <span className="text-xs block mt-1 opacity-80">
                            {personality === "strategic"
                              ? "Plans ahead"
                              : personality === "aggressive"
                                ? "Attacks rapidly"
                                : personality === "defensive"
                                  ? "Blocks moves"
                                  : personality === "balanced"
                                    ? "Versatile play"
                                    : personality === "random"
                                      ? "Unpredictable"
                                      : "Copies your style"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <ModernButton
                variant="primary"
                size="xl"
                rounded="lg"
                fullWidth={true}
                onClick={startGame}
                className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                rightIcon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
              >
                Start Game
              </ModernButton>

              <GlassmorphicCard
                className="mt-8"
                blur="md"
                opacity="medium"
                rounded="lg"
              >
                <h3 className="text-xl font-medium mb-3 text-center text-white drop-shadow-glow">
                  How to Play
                </h3>
                <p className="text-blue-100 text-sm leading-relaxed">
                  Ultimate Tic-Tac-Toe is played on a 3×3 grid of 3×3
                  Tic-Tac-Toe boards. To win, you need to win three smaller
                  boards in a row. The catch: wherever you play determines which
                  board your opponent must play in next. If sent to a completed
                  board, your opponent may choose any available board.
                </p>
                <div className="mt-4 flex justify-center">
                  <div className="grid grid-cols-3 gap-1 w-24 h-24 mx-auto mt-2 opacity-80">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div
                        key={i}
                        className="bg-white/10 rounded-sm flex items-center justify-center"
                      >
                        <div className="w-6 h-6 grid grid-cols-3 gap-px">
                          {Array.from({ length: 9 }).map((_, j) => (
                            <div
                              key={j}
                              className="bg-white/20 rounded-[1px]"
                            ></div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </GlassmorphicCard>
            </GlassmorphicCard>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            <GlassmorphicCard
              blur="lg"
              opacity="medium"
              rounded="xl"
              shadow="xl"
              padding="lg"
              className="w-full"
            >
              {gameResult ? (
                <div className="w-full text-center mb-8 lg:mb-12 animate-slide-up">
                  <h2
                    className={`text-4xl lg:text-5xl font-bold mb-6 animate-pulse-slow ${
                      gameResult.winner === playerSymbol
                        ? "text-green-400"
                        : gameResult.winner === "draw"
                          ? "text-yellow-400"
                          : "text-red-400"
                    }`}
                  >
                    {gameResult.winner === playerSymbol
                      ? "🎉 You Win! 🎉"
                      : gameResult.winner === "draw"
                        ? "🤝 Game Draw! 🤝"
                        : "😢 AI Wins! 😢"}
                  </h2>
                  <ModernButton
                    variant="primary"
                    size="lg"
                    rounded="lg"
                    onClick={playAgain}
                    className="transform hover:scale-105 bg-gradient-to-r from-purple-500 to-indigo-600"
                    leftIcon={
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                          clipRule="evenodd"
                        />
                      </svg>
                    }
                  >
                    Play Again
                  </ModernButton>
                </div>
              ) : null}

              <div className="transition-all duration-500 animate-fade-in">
                <UltimateTicTacToeGame
                  difficulty={difficulty}
                  playerSymbol={playerSymbol}
                  isAIGame={true}
                  aiPersonality={aiPersonality}
                  onGameEnd={handleGameEnd}
                />
              </div>

              {/* Return to settings button */}
              {!gameResult?.winner && (
                <div className="text-center mt-8 lg:mt-12">
                  <ModernButton
                    variant="glass"
                    size="md"
                    rounded="lg"
                    onClick={playAgain}
                    leftIcon={
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    }
                  >
                    Back to Settings
                  </ModernButton>
                </div>
              )}
            </GlassmorphicCard>
          </div>
        )}
      </main>

      <Footer />
    </ModernLayout>
  );
}
