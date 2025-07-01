// TicTacToe settings component with modern UI
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
    <div>
      <h2 className="text-2xl font-bold text-white mb-6 text-center drop-shadow-glow animate-float">
        Game Settings
      </h2>

      <form onSubmit={handleSubmit} className="animate-fade-in">
        {/* Board Size */}
        <div className="mb-8">
          <label className="text-blue-300 mb-3 font-medium flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Board Size
          </label>
          <div className="grid grid-cols-4 gap-3">
            {boardSizeOptions.map((size) => (
              <button
                key={size}
                type="button"
                className={`py-3 rounded-lg text-center transition-all duration-300 relative overflow-hidden ${
                  settings.boardSize === size
                    ? "bg-blue-600 text-white shadow-lg transform -translate-y-1"
                    : "glass-button hover:bg-white/20 text-gray-100"
                }`}
                onClick={() => updateSettings("boardSize", size)}
              >
                {settings.boardSize === size && (
                  <span className="absolute inset-0 bg-white/10 animate-pulse-slow"></span>
                )}
                <span className="relative z-10 font-medium">
                  {size}x{size}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Win Length */}
        <div className="mb-8">
          <label
            htmlFor="winLength"
            className="text-blue-300 mb-3 font-medium flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
            </svg>
            Win Length (pieces in a row to win)
          </label>
          <GlassmorphicCard
            padding="none"
            className="relative"
            blur="sm"
            rounded="lg"
          >
            <select
              id="winLength"
              value={settings.winLength}
              onChange={(e) =>
                updateSettings("winLength", parseInt(e.target.value))
              }
              className="w-full px-4 py-3 bg-transparent text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-none border-0 appearance-none pr-10"
            >
              {Array.from({ length: settings.boardSize }, (_, i) => i + 3).map(
                (len) => (
                  <option
                    key={len}
                    value={len}
                    disabled={len > settings.boardSize}
                    className={len > settings.boardSize ? "text-gray-500" : ""}
                  >
                    {len} in a row
                  </option>
                ),
              )}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg
                className="h-5 w-5 text-blue-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </GlassmorphicCard>
        </div>

        {/* Game Mode */}
        <div className="mb-8">
          <label className="text-blue-300 mb-3 font-medium flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                clipRule="evenodd"
              />
            </svg>
            Game Mode
          </label>
          <div className="space-y-3">
            {(["classic", "misere", "ultimate"] as GameMode[]).map((mode) => (
              <div
                key={mode}
                className={`transition-all duration-300 cursor-pointer ${
                  settings.gameMode === mode
                    ? "border-blue-500/50 transform -translate-y-1"
                    : ""
                } ${settings.gameMode === mode ? "bg-white/20" : "bg-white/10"}
                  backdrop-blur-${settings.gameMode === mode ? "md" : "sm"}
                  p-${settings.gameMode === mode ? "4" : "3"}
                  rounded-lg
                  ${settings.gameMode === mode ? "border border-white/20" : ""}
                  hover:bg-white/30`}
                onClick={() => updateSettings("gameMode", mode)}
              >
                <div className="flex items-center">
                  <div
                    className={`w-4 h-4 rounded-full mr-3 flex-shrink-0 ${
                      settings.gameMode === mode
                        ? "bg-blue-500 ring-2 ring-blue-300 ring-opacity-50"
                        : "border-2 border-white/30"
                    }`}
                  ></div>
                  <div>
                    <span
                      className={`font-medium capitalize text-lg ${
                        settings.gameMode === mode
                          ? "text-white"
                          : "text-blue-200"
                      }`}
                    >
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </span>
                    <span
                      className={`block text-xs mt-1 ${
                        settings.gameMode === mode
                          ? "text-blue-100"
                          : "text-blue-200/70"
                      }`}
                    >
                      {mode === "classic"
                        ? "Standard rules: Get " +
                          settings.winLength +
                          " in a row to win"
                        : mode === "misere"
                          ? "Reverse rules: Force opponent to get " +
                            settings.winLength +
                            " in a row"
                          : "Play on 9 boards simultaneously"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Time Limit */}
        <div className="mb-8">
          <label
            htmlFor="timeLimit"
            className="text-blue-300 mb-3 font-medium flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
            Time Limit (seconds per move)
          </label>
          <GlassmorphicCard padding="md" blur="sm" rounded="lg">
            <div className="flex items-center">
              <input
                type="range"
                id="timeLimit"
                min="0"
                max="60"
                step="5"
                value={settings.timeLimit || 0}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  updateSettings("timeLimit", val === 0 ? null : val);
                }}
                className="w-full mr-4 accent-blue-500"
              />
              <div className="text-white w-20 text-center glass rounded-full py-1 px-3 font-medium">
                {settings.timeLimit === null
                  ? "None"
                  : `${settings.timeLimit}s`}
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-blue-200/70">
              <span>No Limit</span>
              <span>30s</span>
              <span>60s</span>
            </div>
          </GlassmorphicCard>
        </div>

        {/* First Player */}
        <div className="mb-8">
          <label className="text-blue-300 mb-3 font-medium flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            First Player
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(["X", "O", "random"] as const).map((option) => (
              <button
                key={option}
                type="button"
                className={`py-3 rounded-lg text-center relative overflow-hidden transition-all duration-300 ${
                  settings.firstPlayer === option
                    ? option === "X"
                      ? "bg-blue-600 text-white shadow-lg transform -translate-y-1"
                      : option === "O"
                        ? "bg-red-600 text-white shadow-lg transform -translate-y-1"
                        : "bg-purple-600 text-white shadow-lg transform -translate-y-1"
                    : "glass-button"
                }`}
                onClick={() => updateSettings("firstPlayer", option)}
              >
                {settings.firstPlayer === option && (
                  <span className="absolute inset-0 bg-white/10 animate-pulse-slow"></span>
                )}
                <span className="relative z-10 font-medium">
                  {option === "random" ? "Random" : `Player ${option}`}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* AI Difficulty */}
        <div className="mb-10">
          <label className="text-blue-300 mb-3 font-medium flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
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
          <div className="relative h-36">
            {(["easy", "medium", "hard", "impossible"] as AIDifficulty[]).map(
              (difficulty) => {
                const colors = {
                  easy: "from-green-500 to-green-600",
                  medium: "from-blue-500 to-blue-600",
                  hard: "from-purple-500 to-purple-600",
                  impossible: "from-red-500 to-red-600",
                };

                const positions = {
                  easy: "top-0 left-0",
                  medium: "top-0 right-0",
                  hard: "bottom-0 left-0",
                  impossible: "bottom-0 right-0",
                };

                const size =
                  settings.aiDifficulty === difficulty
                    ? "w-[48%] h-[48%]"
                    : "w-[45%] h-[45%]";

                return (
                  <button
                    key={difficulty}
                    type="button"
                    className={`absolute ${positions[difficulty as keyof typeof positions]} ${size} rounded-xl text-center transition-all duration-300 overflow-hidden
                      ${
                        settings.aiDifficulty === difficulty
                          ? `bg-gradient-to-br ${colors[difficulty as keyof typeof colors]} shadow-lg z-10`
                          : "glass-button"
                      }`}
                    onClick={() => updateSettings("aiDifficulty", difficulty)}
                  >
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="relative z-10 h-full flex flex-col items-center justify-center">
                      <span className="font-medium text-white text-lg">
                        {difficulty.charAt(0).toUpperCase() +
                          difficulty.slice(1)}
                      </span>
                      <span className="text-xs mt-1 text-white/80">
                        {difficulty === "easy"
                          ? "For beginners"
                          : difficulty === "medium"
                            ? "Balanced challenge"
                            : difficulty === "hard"
                              ? "For experts"
                              : "Unbeatable AI"}
                      </span>
                    </div>
                  </button>
                );
              },
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-between">
          {onCancel && (
            <ModernButton
              variant="glass"
              size="lg"
              rounded="lg"
              onClick={onCancel}
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
