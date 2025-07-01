// TicTacToe settings component
"use client";

import React, { useState } from "react";
import {
  GameSettings,
  DEFAULT_SETTINGS,
  AIDifficulty,
  GameMode,
} from "../lib/types";

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
    value: GameSettings[K]
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
    <div className="w-full max-w-md mx-auto bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">
        Game Settings
      </h2>

      <form onSubmit={handleSubmit}>
        {/* Board Size */}
        <div className="mb-6">
          <label className="block text-gray-300 mb-2 font-medium">
            Board Size
          </label>
          <div className="grid grid-cols-4 gap-2">
            {boardSizeOptions.map((size) => (
              <button
                key={size}
                type="button"
                className={`py-2 rounded-md text-center transition-colors ${
                  settings.boardSize === size
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
                onClick={() => updateSettings("boardSize", size)}
              >
                {size}x{size}
              </button>
            ))}
          </div>
        </div>

        {/* Win Length */}
        <div className="mb-6">
          <label
            htmlFor="winLength"
            className="block text-gray-300 mb-2 font-medium"
          >
            Win Length (pieces in a row to win)
          </label>
          <select
            id="winLength"
            value={settings.winLength}
            onChange={(e) =>
              updateSettings("winLength", parseInt(e.target.value))
            }
            className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Array.from(
              { length: settings.boardSize },
              (_, i) => i + 3
            ).map((len) => (
              <option key={len} value={len} disabled={len > settings.boardSize}>
                {len} in a row
              </option>
            ))}
          </select>
        </div>

        {/* Game Mode */}
        <div className="mb-6">
          <label className="block text-gray-300 mb-2 font-medium">
            Game Mode
          </label>
          <div className="grid grid-cols-1 gap-2">
            {(["classic", "misere", "ultimate"] as GameMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                className={`py-2 px-3 rounded-md text-left transition-colors ${
                  settings.gameMode === mode
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
                onClick={() => updateSettings("gameMode", mode)}
              >
                <span className="font-medium capitalize">
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </span>
                <span className="block text-xs mt-1 opacity-80">
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
              </button>
            ))}
          </div>
        </div>

        {/* Time Limit */}
        <div className="mb-6">
          <label
            htmlFor="timeLimit"
            className="block text-gray-300 mb-2 font-medium"
          >
            Time Limit (seconds per move)
          </label>
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
              className="w-full mr-4"
            />
            <span className="text-white w-16 text-center">
              {settings.timeLimit === null ? "None" : `${settings.timeLimit}s`}
            </span>
          </div>
        </div>

        {/* First Player */}
        <div className="mb-6">
          <label className="block text-gray-300 mb-2 font-medium">
            First Player
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(["X", "O", "random"] as const).map((option) => (
              <button
                key={option}
                type="button"
                className={`py-2 rounded-md text-center transition-colors ${
                  settings.firstPlayer === option
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
                onClick={() => updateSettings("firstPlayer", option)}
              >
                {option === "random" ? "Random" : `Player ${option}`}
              </button>
            ))}
          </div>
        </div>

        {/* AI Difficulty */}
        <div className="mb-8">
          <label className="block text-gray-300 mb-2 font-medium">
            AI Difficulty
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(["easy", "medium", "hard", "impossible"] as AIDifficulty[]).map(
              (difficulty) => (
                <button
                  key={difficulty}
                  type="button"
                  className={`py-2 rounded-md text-center transition-colors ${
                    settings.aiDifficulty === difficulty
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                  onClick={() => updateSettings("aiDifficulty", difficulty)}
                >
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </button>
              )
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-between">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors"
          >
            Start Game
          </button>
        </div>
      </form>
    </div>
  );
};

export default TicTacToeSettings;
