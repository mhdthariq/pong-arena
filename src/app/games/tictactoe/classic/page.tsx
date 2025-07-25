"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { TicTacToeGame, TicTacToeSettings } from "../../../../games/tictactoe";
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
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-center mt-8 mb-8 lg:mb-12 text-white drop-shadow-glow animate-float">
          Tic-Tac-Toe
          <span className="block text-lg sm:text-xl lg:text-2xl mt-2 font-normal text-blue-300 animate-pulse-slow">
            Enhanced Edition
          </span>
        </h1>
      </header>

      <main className="w-full flex-grow z-10 relative animate-slide-up px-4">
        {!gameStarted ? (
          <div className="max-w-7xl mx-auto space-y-8">
            <GlassmorphicCard
              blur="lg"
              opacity="medium"
              rounded="xl"
              shadow="xl"
              padding="lg"
              className="w-full"
            >
              <TicTacToeSettings
                initialSettings={gameSettings}
                onSave={handleStartGame}
              />
            </GlassmorphicCard>

            {/* AI Personality Selection Card */}
            <GlassmorphicCard
              blur="lg"
              opacity="medium"
              rounded="xl"
              shadow="xl"
              padding="lg"
              className="w-full"
            >
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-white"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-white drop-shadow-glow">
                    AI Personality
                  </h3>
                  <p className="text-blue-200 text-sm mt-1">
                    Choose how the AI opponent will behave during the game
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4 lg:gap-6">
                {(
                  [
                    "balanced",
                    "aggressive",
                    "defensive",
                    "random",
                    "strategic",
                    "mimicking",
                    "learning",
                  ] as AIPersonality[]
                ).map((personality) => (
                  <div key={personality} className="relative">
                    <button
                      onClick={() => changeAiPersonality(personality)}
                      className={`w-full relative overflow-hidden p-4 rounded-xl text-left transition-all duration-300 group ${
                        aiPersonality === personality
                          ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white transform -translate-y-1 shadow-xl"
                          : "bg-white/10 hover:bg-white/20 text-gray-200 hover:transform hover:-translate-y-0.5"
                      }`}
                    >
                      {/* Ripple effect */}
                      {aiPersonality === personality && (
                        <span className="absolute inset-0 bg-white/10 animate-pulse-slow"></span>
                      )}

                      {/* Icon based on personality */}
                      <div className="mb-3 relative z-10">
                        {personality === "balanced" && (
                          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                        {personality === "aggressive" && (
                          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                        {personality === "defensive" && (
                          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                        {personality === "random" && (
                          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                        {personality === "strategic" && (
                          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        )}
                        {personality === "mimicking" && (
                          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                        {personality === "learning" && (
                          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      <div className="flex items-start justify-between relative z-10">
                        <div className="flex-1">
                          <span className="font-semibold capitalize text-lg">
                            {personality.charAt(0).toUpperCase() +
                              personality.slice(1)}
                          </span>

                          <span className="block text-xs mt-2 opacity-90 leading-relaxed">
                            {personality === "balanced"
                              ? "Even mix of offense and defense"
                              : personality === "aggressive"
                                ? "Prioritizes creating winning moves"
                                : personality === "defensive"
                                  ? "Focuses on blocking your moves"
                                  : personality === "random"
                                    ? "Completely unpredictable moves"
                                    : personality === "strategic"
                                      ? "Plans multiple moves ahead"
                                      : personality === "mimicking"
                                        ? "Adapts to copy your playing style"
                                        : "Gets smarter as the game progresses"}
                          </span>
                        </div>
                      </div>
                    </button>

                    {/* Info button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const descriptions = {
                          balanced:
                            "This AI maintains a perfect balance between offensive and defensive strategies. It will block your winning moves while also looking for its own opportunities. Good for players who want a fair, competitive game.",
                          aggressive:
                            "This AI prioritizes creating multiple threats and winning opportunities. It focuses on offensive moves and may occasionally miss blocking your moves in favor of creating its own winning chances. Great for players who want a challenging, fast-paced game.",
                          defensive:
                            "This AI's primary goal is to block all your moves and prevent you from winning. It plays very defensively and will rarely miss a blocking opportunity. Perfect for players who want to practice finding creative winning paths.",
                          random:
                            "This AI makes completely unpredictable moves with no strategy. Every move is random, making it impossible to predict what it will do next. Ideal for casual, fun games or when you want to practice against unpredictable opponents.",
                          strategic:
                            "This AI thinks several moves ahead and uses advanced algorithms to plan the best possible moves. It analyzes multiple future scenarios and chooses moves that lead to the best long-term position. Best for experienced players who want the ultimate challenge.",
                          mimicking:
                            "This AI analyzes your playing style and tries to copy your strategies. It places moves near your recent moves and adapts its behavior based on your patterns. Creates a unique experience that evolves as you play.",
                          learning:
                            "This AI starts easy but gets progressively smarter as the game progresses. It begins with simple moves but gradually adopts more advanced strategies. The longer the game goes on, the more challenging it becomes.",
                        };
                        alert(
                          descriptions[
                            personality as keyof typeof descriptions
                          ],
                        );
                      }}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-blue-500/30 hover:bg-blue-500/50 flex items-center justify-center transition-colors z-20"
                    >
                      <svg
                        className="w-3 h-3 text-blue-200"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
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
              {gameResult && gameResult.winner ? (
                <div className="w-full text-center mb-8 lg:mb-12 animate-slide-up">
                  <h2
                    className={`text-4xl lg:text-5xl font-bold mb-6 animate-pulse-slow ${
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
                    {gameResult.winner === "X" &&
                    gameSettings.firstPlayer === "X"
                      ? "🎉 You Win! 🎉"
                      : gameResult.winner === "O" &&
                          gameSettings.firstPlayer === "O"
                        ? "🎉 You Win! 🎉"
                        : gameResult.winner === "draw"
                          ? "🤝 Game Draw! 🤝"
                          : "😢 AI Wins! 😢"}
                  </h2>

                  <div className="flex flex-wrap justify-center gap-4 lg:gap-6 mt-8 lg:mt-12">
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
                <div className="text-center mt-8 lg:mt-12">
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
          </div>
        )}
      </main>
    </ModernLayout>
  );
}
