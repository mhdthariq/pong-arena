// TicTacToe settings component with modern responsive UI
"use client";

import React, { useState } from "react";
import {
  GameSettings,
  DEFAULT_SETTINGS,
  AIDifficulty,
  GameMode,
} from "../lib/types";
import GlassmorphicCard from "../../../shared/components/GlassmorphicCard";
import ModernButton from "../../../shared/components/ModernButton";

interface TicTacToeSettingsProps {
  initialSettings?: Partial<GameSettings>;
  onSave: (settings: GameSettings) => void;
  onCancel?: () => void;
}

const TicTacToeSettings: React.FC<TicTacToeSettingsProps> = ({
  initialSettings,
  onSave,
  onCancel,
}) => {
  // Merge initial settings with defaults
  const [settings, setSettings] = useState<GameSettings>({
    ...DEFAULT_SETTINGS,
    ...initialSettings,
  });

  // Board size options
  const boardSizeOptions = [3, 4, 5, 6];

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(settings);
  };

  // Update settings with new values
  const updateSettings = <K extends keyof GameSettings>(
    key: K,
    value: GameSettings[K],
  ) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));

    // Additional logic for interdependent settings
    if (key === "boardSize") {
      const size = value as number;
      // For larger boards, default win length to 4 instead of board size
      if (size > 3 && settings.winLength === settings.boardSize) {
        setSettings((prev) => ({
          ...prev,
          [key]: value,
          winLength: Math.min(4, size),
        }));
      } else {
        // Ensure win length doesn't exceed board size
        if (settings.winLength > size) {
          setSettings((prev) => ({
            ...prev,
            [key]: value,
            winLength: size,
          }));
        }
      }
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <h2 className="text-3xl lg:text-4xl font-bold text-white mb-8 text-center drop-shadow-glow animate-float">
        Game Settings
      </h2>

      <form onSubmit={handleSubmit} className="animate-fade-in">
        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 mb-8">
          {/* Board Configuration Card */}
          <GlassmorphicCard
            blur="md"
            opacity="medium"
            rounded="xl"
            shadow="lg"
            padding="lg"
            className="col-span-1 lg:col-span-2 xl:col-span-1"
          >
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white">Board Setup</h3>
            </div>

            {/* Board Size */}
            <div className="mb-6">
              <label className="text-blue-300 mb-3 font-medium flex items-center text-sm">
                Board Size
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {boardSizeOptions.map((size) => (
                  <button
                    key={size}
                    type="button"
                    className={`py-3 px-2 rounded-lg text-center transition-all duration-300 relative overflow-hidden ${
                      settings.boardSize === size
                        ? "bg-blue-600 text-white shadow-lg transform -translate-y-1"
                        : "glass-button hover:bg-white/20 text-gray-100"
                    }`}
                    onClick={() => updateSettings("boardSize", size)}
                  >
                    {settings.boardSize === size && (
                      <span className="absolute inset-0 bg-white/10 animate-pulse-slow"></span>
                    )}
                    <span className="relative z-10 font-medium text-sm">
                      {size}×{size}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Win Length */}
            <div>
              <label
                htmlFor="winLength"
                className="text-blue-300 mb-3 font-medium flex items-center text-sm"
              >
                Win Length
              </label>
              <div className="relative">
                <select
                  id="winLength"
                  value={settings.winLength}
                  onChange={(e) =>
                    updateSettings("winLength", parseInt(e.target.value))
                  }
                  className="w-full px-4 py-3 bg-black/40 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-white/20 appearance-none pr-10 backdrop-blur-sm"
                  style={{
                    backgroundColor: "rgba(0, 0, 0, 0.4)",
                    color: "white",
                    WebkitAppearance: "none",
                    MozAppearance: "none",
                    appearance: "none",
                    backgroundImage: "none",
                    textShadow: "none",
                    fontFamily: "inherit",
                  }}
                >
                  {Array.from(
                    { length: settings.boardSize },
                    (_, i) => i + 3,
                  ).map((len) => (
                    <option
                      key={len}
                      value={len}
                      disabled={len > settings.boardSize}
                      className="bg-gray-800 text-white"
                      style={{
                        backgroundColor: "#1f2937",
                        color: "white",
                        fontFamily: "inherit",
                      }}
                    >
                      {len} in a row
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="h-4 w-4 text-blue-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </GlassmorphicCard>

          {/* Game Rules Card */}
          <GlassmorphicCard
            blur="md"
            opacity="medium"
            rounded="xl"
            shadow="lg"
            padding="lg"
            className="col-span-1"
          >
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white">Game Rules</h3>
            </div>

            {/* Game Mode */}
            <div className="mb-6">
              <label className="text-blue-300 mb-3 font-medium flex items-center text-sm">
                Game Mode
              </label>
              <div className="space-y-2">
                {(["classic", "misere"] as GameMode[]).map((mode) => (
                  <div
                    key={mode}
                    className={`transition-all duration-300 cursor-pointer rounded-lg p-3 ${
                      settings.gameMode === mode
                        ? "bg-white/20 border border-white/20 transform -translate-y-0.5"
                        : "bg-white/10 hover:bg-white/15"
                    }`}
                    onClick={() => updateSettings("gameMode", mode)}
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-3 h-3 rounded-full mr-3 flex-shrink-0 ${
                          settings.gameMode === mode
                            ? "bg-purple-500 ring-2 ring-purple-300 ring-opacity-50"
                            : "border-2 border-white/30"
                        }`}
                      ></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <span
                              className={`font-medium capitalize ${
                                settings.gameMode === mode
                                  ? "text-white"
                                  : "text-blue-200"
                              }`}
                            >
                              {mode.charAt(0).toUpperCase() + mode.slice(1)}
                            </span>
                            <p
                              className={`text-xs mt-1 ${
                                settings.gameMode === mode
                                  ? "text-blue-100"
                                  : "text-blue-200/70"
                              }`}
                            >
                              {mode === "classic"
                                ? "Standard tic-tac-toe rules"
                                : "Reverse rules - avoid getting three in a row"}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              alert(
                                mode === "classic"
                                  ? "Classic Mode: Get the required number in a row to win. Standard tic-tac-toe rules apply."
                                  : "Misère Mode: The goal is reversed - avoid getting three in a row! The first player to get the required number in a row loses.",
                              );
                            }}
                            className="ml-2 w-5 h-5 rounded-full bg-blue-500/20 hover:bg-blue-500/40 flex items-center justify-center transition-colors"
                          >
                            <svg
                              className="w-3 h-3 text-blue-300"
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
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Time Limit */}
            <div>
              <label className="text-blue-300 mb-3 font-medium flex items-center text-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                Time Limit
              </label>
              <GlassmorphicCard padding="md" blur="sm" rounded="lg">
                <div className="flex items-center">
                  <input
                    type="range"
                    min="0"
                    max="60"
                    step="5"
                    value={settings.timeLimit || 0}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      updateSettings("timeLimit", val === 0 ? null : val);
                    }}
                    className="w-full mr-3 accent-purple-500"
                  />
                  <div className="text-white w-16 text-center glass rounded-full py-1 px-2 font-medium text-sm">
                    {settings.timeLimit === null
                      ? "None"
                      : `${settings.timeLimit}s`}
                  </div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-blue-200/70">
                  <span>No Limit</span>
                  <span>60s</span>
                </div>
              </GlassmorphicCard>
            </div>
          </GlassmorphicCard>

          {/* Player Settings Card */}
          <GlassmorphicCard
            blur="md"
            opacity="medium"
            rounded="xl"
            shadow="lg"
            padding="lg"
            className="col-span-1"
          >
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white">Players</h3>
            </div>

            {/* First Player */}
            <div className="mb-6">
              <label className="text-blue-300 mb-3 font-medium flex items-center text-sm">
                First Player
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["X", "O", "random"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`py-2 px-2 rounded-lg text-center relative overflow-hidden transition-all duration-300 text-sm ${
                      settings.firstPlayer === option
                        ? option === "X"
                          ? "bg-blue-600 text-white shadow-lg transform -translate-y-0.5"
                          : option === "O"
                            ? "bg-red-600 text-white shadow-lg transform -translate-y-0.5"
                            : "bg-green-600 text-white shadow-lg transform -translate-y-0.5"
                        : "glass-button hover:bg-white/20 text-gray-100"
                    }`}
                    onClick={() => updateSettings("firstPlayer", option)}
                  >
                    {settings.firstPlayer === option && (
                      <span className="absolute inset-0 bg-white/10 animate-pulse-slow"></span>
                    )}
                    <span className="relative z-10 font-medium">
                      {option === "random" ? "Random" : option}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Difficulty */}
            <div>
              <label className="text-blue-300 mb-3 font-medium flex items-center text-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z"
                    clipRule="evenodd"
                  />
                </svg>
                AI Difficulty
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(
                  ["easy", "medium", "hard", "impossible"] as AIDifficulty[]
                ).map((difficulty) => {
                  const colors = {
                    easy: "from-green-500 to-green-600",
                    medium: "from-blue-500 to-blue-600",
                    hard: "from-purple-500 to-purple-600",
                    impossible: "from-red-500 to-red-600",
                  };

                  return (
                    <button
                      key={difficulty}
                      type="button"
                      className={`p-3 rounded-lg text-center transition-all duration-300 overflow-hidden ${
                        settings.aiDifficulty === difficulty
                          ? `bg-gradient-to-br ${colors[difficulty as keyof typeof colors]} shadow-lg transform -translate-y-0.5`
                          : "glass-button hover:bg-white/20"
                      }`}
                      onClick={() => updateSettings("aiDifficulty", difficulty)}
                    >
                      <div className="flex flex-col items-center">
                        <span className="font-medium text-white text-sm">
                          {difficulty.charAt(0).toUpperCase() +
                            difficulty.slice(1)}
                        </span>
                        <span className="text-xs mt-1 text-white/80 leading-tight">
                          {difficulty === "easy"
                            ? "Beginners"
                            : difficulty === "medium"
                              ? "Balanced"
                              : difficulty === "hard"
                                ? "Experts"
                                : "Unbeatable"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </GlassmorphicCard>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
          {onCancel && (
            <ModernButton
              variant="glass"
              size="lg"
              rounded="lg"
              onClick={onCancel}
              className="w-full sm:w-auto min-w-[140px]"
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
              Cancel
            </ModernButton>
          )}
          <ModernButton
            variant="primary"
            size="lg"
            rounded="lg"
            type="submit"
            className="w-full sm:w-auto min-w-[140px]"
            rightIcon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            }
          >
            Start Game
          </ModernButton>
        </div>
      </form>
    </div>
  );
};

export default TicTacToeSettings;
