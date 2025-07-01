"use client";

import React, { useState } from "react";
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
          Tic-Tac-Toe - Enhanced Edition
        </h1>
      </header>

      <main className="w-full max-w-4xl mx-auto flex-grow px-4">
        {!gameStarted ? (
          <div className="bg-gray-800 rounded-xl p-6 sm:p-8 shadow-xl border border-gray-700">
            <TicTacToeSettings
              initialSettings={gameSettings}
              onSave={handleStartGame}
            />

            {/* AI Personality Selection */}
            <div className="mt-8 border-t border-gray-700 pt-6">
              <h3 className="text-xl font-medium mb-4">AI Personality</h3>
              <p className="text-gray-400 mb-4">
                Choose how the AI opponent will behave during the game
              </p>
              <div className="grid grid-cols-2 gap-3">
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
                    className={`py-2 px-3 rounded-lg text-left transition-colors ${
                      aiPersonality === personality
                        ? "bg-purple-700 text-white"
                        : "bg-gray-700 hover:bg-gray-600 text-gray-200"
                    }`}
                  >
                    <span className="font-medium capitalize">
                      {personality.charAt(0).toUpperCase() +
                        personality.slice(1)}
                    </span>
                    <span className="block text-xs mt-1 opacity-80">
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
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl p-6 sm:p-8 shadow-xl border border-gray-700 flex flex-col items-center">
            {gameResult && gameResult.winner ? (
              <div className="w-full text-center mb-6">
                <h2 className="text-4xl font-bold mb-4 animate-bounce">
                  {gameResult.winner === "X" && gameSettings.firstPlayer === "X"
                    ? "🎉 You Win! 🎉"
                    : gameResult.winner === "O" &&
                        gameSettings.firstPlayer === "O"
                      ? "🎉 You Win! 🎉"
                      : gameResult.winner === "draw"
                        ? "🤝 Game Draw! 🤝"
                        : "😢 AI Wins! 😢"}
                </h2>

                <div className="flex flex-wrap justify-center gap-4 mt-6">
                  <button
                    onClick={playAgain}
                    className="py-3 px-8 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-lg font-medium transition-colors shadow-lg"
                  >
                    Change Settings
                  </button>

                  <button
                    onClick={() => {
                      // Start a new game with the same settings
                      const newGameState = initializeGameState(gameSettings);
                      setGameState(newGameState);
                      setGameResult(null);
                    }}
                    className="py-3 px-8 bg-green-600 hover:bg-green-700 rounded-lg text-white text-lg font-medium transition-colors shadow-lg"
                  >
                    Play Again
                  </button>
                </div>
              </div>
            ) : null}

            {gameState && (
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
            )}

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
