"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { TicTacToeGame, TicTacToeSettings } from "../../../../games/tictactoe";
import Footer from "../../../../shared/components/Footer";
import {
  TicTacToePlayer,
  GameSettings,
  DEFAULT_SETTINGS,
  TicTacToeGameState,
  AIPersonality,
} from "../../../../games/tictactoe/lib/types";
import { initializeGameState } from "../../../../games/tictactoe/lib/gameLogic";
import GlassmorphicCard from "../../../../shared/components/GlassmorphicCard";
import ModernButton from "../../../../shared/components/ModernButton";
import ModernLayout from "../../../../shared/components/ModernLayout";

export default function TicTacToeSinglePlayerPage() {
  const [gameSettings, setGameSettings] = useState<GameSettings>({
    ...DEFAULT_SETTINGS,
  });
  const [aiPersonality, setAiPersonality] = useState<AIPersonality>("balanced");
  const [gameStarted, setGameStarted] = useState(false);
  const [gameState, setGameState] = useState<TicTacToeGameState | null>(null);
  const [gameResult, setGameResult] = useState<{
    winner: TicTacToePlayer | "draw" | null;
  } | null>(null);
  const [themeColor, setThemeColor] = useState("#60a5fa"); // Default blue theme

  // Set theme color based on AI personality
  useEffect(() => {
    switch (aiPersonality) {
      case "aggressive":
        setThemeColor("#ef4444"); // Red for aggressive
        break;
      case "defensive":
        setThemeColor("#10b981"); // Green for defensive
        break;
      case "strategic":
        setThemeColor("#8b5cf6"); // Purple for strategic
        break;
      case "random":
        setThemeColor("#f59e0b"); // Amber for random
        break;
      case "mimicking":
        setThemeColor("#ec4899"); // Pink for mimicking
        break;
      default:
        setThemeColor("#60a5fa"); // Blue for balanced
        break;
    }
  }, [aiPersonality]);

  const handleStartGame = (settings: GameSettings) => {
    // Initialize new game with these settings
    const newGameState = initializeGameState(settings);
    setGameState(newGameState);
    setGameSettings(settings);
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

  const changeAiPersonality = (personality: AIPersonality) => {
    setAiPersonality(personality);
  };

  return (
    <ModernLayout
      withBackground={true}
      backgroundParticleColor={themeColor}
      backgroundParticleCount={150}
      withMaxWidth={true}
      maxWidth="xl"
      withVerticalCenter={true}
    >
      {/* Navigation */}
      <header className="w-full max-w-6xl mx-auto px-4 py-6 z-10 relative animate-fade-in">
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
        <h1 className="text-4xl sm:text-5xl font-bold text-center mt-8 mb-6 text-white drop-shadow-glow animate-float">
          Tic-Tac-Toe
          <span className="block text-lg sm:text-xl mt-2 font-normal text-blue-300 animate-pulse-slow">
            Enhanced Edition
          </span>
        </h1>
      </header>

      <main className="w-full flex-grow z-10 relative animate-slide-up">
        {!gameStarted ? (
          <GlassmorphicCard
            blur="lg"
            opacity="medium"
            rounded="xl"
            shadow="xl"
            padding="lg"
            className="max-w-2xl mx-auto"
          >
            <TicTacToeSettings
              initialSettings={gameSettings}
              onSave={handleStartGame}
            />

            {/* AI Personality Selection */}
            <div className="mt-8 border-t border-white/10 pt-6">
              <h3 className="text-xl font-medium mb-4 text-white drop-shadow-glow">
                AI Personality
              </h3>
              <p className="text-blue-200 mb-4">
                Choose how the AI opponent will behave during the game
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(
                  [
                    "balanced",
                    "aggressive",
                    "defensive",
                    "random",
                    "strategic",
                    "mimicking",
                  ] as AIPersonality[]
                ).map((personality) => (
                  <button
                    key={personality}
                    onClick={() => changeAiPersonality(personality)}
                    className={`relative overflow-hidden py-3 px-3 rounded-lg text-left transition-all duration-300 ${
                      aiPersonality === personality
                        ? "bg-white/30 text-white transform -translate-y-1 shadow-lg"
                        : "bg-white/10 hover:bg-white/20 text-gray-200"
                    }`}
                  >
                    {/* Ripple effect */}
                    {aiPersonality === personality && (
                      <span className="absolute inset-0 bg-white/10 animate-pulse-slow"></span>
                    )}
                    <span className="font-medium capitalize relative z-10">
                      {personality.charAt(0).toUpperCase() +
                        personality.slice(1)}
                    </span>
                    <span className="block text-xs mt-1 opacity-80 relative z-10">
                      {personality === "balanced"
                        ? "Balances offense and defense strategies"
                        : personality === "aggressive"
                          ? "Focuses on creating winning opportunities"
                          : personality === "defensive"
                            ? "Prioritizes blocking your moves"
                            : personality === "random"
                              ? "Makes completely unpredictable moves"
                              : personality === "strategic"
                                ? "Plans several moves ahead"
                                : "Adapts to mimic your playing style"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </GlassmorphicCard>
        ) : (
          <GlassmorphicCard
            blur="lg"
            opacity="medium"
            rounded="xl"
            shadow="xl"
            padding="lg"
            className="max-w-4xl mx-auto"
          >
            {gameResult && gameResult.winner ? (
              <div className="w-full text-center mb-8 animate-slide-up">
                <h2
                  className={`text-4xl font-bold mb-4 animate-pulse-slow ${
                    gameResult.winner === "X" &&
                    gameSettings.firstPlayer === "X"
                      ? "text-green-400"
                      : gameResult.winner === "O" &&
                          gameSettings.firstPlayer === "O"
                        ? "text-green-400"
                        : gameResult.winner === "draw"
                          ? "text-yellow-400"
                          : "text-red-400"
                  }`}
                >
                  {gameResult.winner === "X" && gameSettings.firstPlayer === "X"
                    ? "🎉 You Win! 🎉"
                    : gameResult.winner === "O" &&
                        gameSettings.firstPlayer === "O"
                      ? "🎉 You Win! 🎉"
                      : gameResult.winner === "draw"
                        ? "🤝 Game Draw! 🤝"
                        : "😢 AI Wins! 😢"}
                </h2>

                <div className="flex flex-wrap justify-center gap-4 mt-8">
                  <ModernButton
                    variant="glass"
                    size="lg"
                    rounded="lg"
                    onClick={playAgain}
                    leftIcon={
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 17l-5-5m0 0l5-5m-5 5h12"
                        />
                      </svg>
                    }
                  >
                    Change Settings
                  </ModernButton>

                  <ModernButton
                    variant="success"
                    size="lg"
                    rounded="lg"
                    onClick={() => {
                      // Start a new game with the same settings
                      const newGameState = initializeGameState(gameSettings);
                      setGameState(newGameState);
                      setGameResult(null);
                    }}
                    leftIcon={
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                    }
                  >
                    Play Again
                  </ModernButton>
                </div>
              </div>
            ) : null}

            {gameState && (
              <div className="transition-all duration-500 animate-fade-in">
                <TicTacToeGame
                  initialGameState={gameState}
                  customSettings={gameSettings}
                  playerSymbol={
                    gameSettings.firstPlayer === "random"
                      ? "X"
                      : gameSettings.firstPlayer
                  }
                  isAIGame={true}
                  aiPersonality={aiPersonality}
                  onGameEnd={handleGameEnd}
                />
              </div>
            )}

            {/* Return to settings button */}
            {!gameResult?.winner && (
              <div className="text-center mt-8">
                <ModernButton
                  variant="glass"
                  size="md"
                  rounded="lg"
                  onClick={playAgain}
                >
                  Back to Settings
                </ModernButton>
              </div>
            )}
          </GlassmorphicCard>
        )}
      </main>

      <Footer />
    </ModernLayout>
  );
}
