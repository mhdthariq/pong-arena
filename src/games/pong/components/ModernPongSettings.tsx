"use client";

import React, { useState } from "react";
import GlassmorphicCard from "../../../shared/components/GlassmorphicCard";
import ModernButton from "../../../shared/components/ModernButton";

export interface ModernGameSettings {
  difficulty: "easy" | "medium" | "hard" | "expert" | "impossible";
  paddleSize: "tiny" | "small" | "medium" | "large" | "huge";
  ballSpeed: "crawl" | "slow" | "medium" | "fast" | "lightning";
  maxScore: number;
  enablePowerUps: boolean;
  enableParticles: boolean;
  enableTrails: boolean;
  enableScreenShake: boolean;
  ballGlow: boolean;
  paddleGlow: boolean;
  theme: "classic" | "neon" | "retro" | "minimal" | "cyberpunk";
  soundEnabled: boolean;
  aiPersonality: "defensive" | "balanced" | "aggressive" | "unpredictable";
}

export const DEFAULT_MODERN_SETTINGS: ModernGameSettings = {
  difficulty: "medium",
  paddleSize: "medium",
  ballSpeed: "medium",
  maxScore: 7,
  enablePowerUps: true,
  enableParticles: true,
  enableTrails: true,
  enableScreenShake: true,
  ballGlow: true,
  paddleGlow: true,
  theme: "neon",
  soundEnabled: true,
  aiPersonality: "balanced",
};

interface ModernPongSettingsProps {
  initialSettings: ModernGameSettings;
  onStartGame: (settings: ModernGameSettings) => void;
}

const ModernPongSettings: React.FC<ModernPongSettingsProps> = ({
  initialSettings,
  onStartGame,
}) => {
  const [settings, setSettings] = useState<ModernGameSettings>(initialSettings);
  const [activeTab, setActiveTab] = useState<"basic" | "visual" | "advanced">(
    "basic",
  );

  const updateSetting = <K extends keyof ModernGameSettings>(
    key: K,
    value: ModernGameSettings[K],
  ) => {
    setSettings({ ...settings, [key]: value });
  };

  const resetToDefaults = () => {
    setSettings(DEFAULT_MODERN_SETTINGS);
  };

  const handleStartGame = () => {
    onStartGame(settings);
  };

  const tabs = [
    { id: "basic", label: "Basic", icon: "⚙️" },
    { id: "visual", label: "Visual", icon: "🎨" },
    { id: "advanced", label: "Advanced", icon: "🚀" },
  ] as const;

  const themeColors = {
    classic: "#ffffff",
    neon: "#00ff88",
    retro: "#eee82c",
    minimal: "#666666",
    cyberpunk: "#00ffff",
  };

  const difficultyDescriptions = {
    easy: "Relaxed pace, forgiving AI",
    medium: "Balanced challenge",
    hard: "Fast-paced, smart AI",
    expert: "Very challenging",
    impossible: "Ultimate test of skill",
  };

  const aiPersonalityDescriptions = {
    defensive: "Plays it safe, prioritizes defense",
    balanced: "Well-rounded playing style",
    aggressive: "Takes risks, plays offensively",
    unpredictable: "Random and chaotic moves",
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-glow">
          Modern Pong Configuration
        </h2>
        <p className="text-lg text-blue-200/80 max-w-2xl mx-auto">
          Customize your enhanced Pong experience with advanced features, visual
          effects, and AI personalities
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {tabs.map((tab) => (
          <ModernButton
            key={tab.id}
            variant={activeTab === tab.id ? "primary" : "secondary"}
            size="md"
            onClick={() => setActiveTab(tab.id)}
            className="min-w-[120px]"
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </ModernButton>
        ))}
      </div>

      {/* Settings Content */}
      <GlassmorphicCard
        blur="lg"
        opacity="medium"
        padding="lg"
        className="min-h-[500px]"
      >
        {activeTab === "basic" && (
          <div className="space-y-8">
            {/* Game Difficulty */}
            <div>
              <h3 className="text-2xl font-semibold text-white mb-4 flex items-center">
                <span className="mr-3">🎯</span>
                Difficulty Level
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {(
                  ["easy", "medium", "hard", "expert", "impossible"] as const
                ).map((difficulty) => (
                  <button
                    key={difficulty}
                    onClick={() => updateSetting("difficulty", difficulty)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      settings.difficulty === difficulty
                        ? "border-green-400 bg-green-500/20 text-white"
                        : "border-white/20 bg-white/10 text-gray-300 hover:border-white/40"
                    }`}
                  >
                    <div className="text-lg font-semibold capitalize">
                      {difficulty}
                    </div>
                    <div className="text-sm opacity-80 mt-1">
                      {difficultyDescriptions[difficulty]}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Personality */}
            <div>
              <h3 className="text-2xl font-semibold text-white mb-4 flex items-center">
                <span className="mr-3">🤖</span>
                AI Personality
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {(
                  [
                    "defensive",
                    "balanced",
                    "aggressive",
                    "unpredictable",
                  ] as const
                ).map((personality) => (
                  <button
                    key={personality}
                    onClick={() => updateSetting("aiPersonality", personality)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      settings.aiPersonality === personality
                        ? "border-purple-400 bg-purple-500/20 text-white"
                        : "border-white/20 bg-white/10 text-gray-300 hover:border-white/40"
                    }`}
                  >
                    <div className="text-lg font-semibold capitalize">
                      {personality}
                    </div>
                    <div className="text-sm opacity-80 mt-1">
                      {aiPersonalityDescriptions[personality]}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Game Parameters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Paddle Size */}
              <div>
                <label className="block text-lg font-semibold text-white mb-3">
                  Paddle Size
                </label>
                <select
                  value={settings.paddleSize}
                  onChange={(e) =>
                    updateSetting(
                      "paddleSize",
                      e.target.value as ModernGameSettings["paddleSize"],
                    )
                  }
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-green-400"
                >
                  <option value="tiny">Tiny (Extra Hard)</option>
                  <option value="small">Small (Hard)</option>
                  <option value="medium">Medium (Normal)</option>
                  <option value="large">Large (Easy)</option>
                  <option value="huge">Huge (Very Easy)</option>
                </select>
              </div>

              {/* Ball Speed */}
              <div>
                <label className="block text-lg font-semibold text-white mb-3">
                  Ball Speed
                </label>
                <select
                  value={settings.ballSpeed}
                  onChange={(e) =>
                    updateSetting(
                      "ballSpeed",
                      e.target.value as ModernGameSettings["ballSpeed"],
                    )
                  }
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-green-400"
                >
                  <option value="crawl">Crawl (Very Slow)</option>
                  <option value="slow">Slow</option>
                  <option value="medium">Medium</option>
                  <option value="fast">Fast</option>
                  <option value="lightning">Lightning (Very Fast)</option>
                </select>
              </div>

              {/* Max Score */}
              <div>
                <label className="block text-lg font-semibold text-white mb-3">
                  Points to Win
                </label>
                <select
                  value={settings.maxScore}
                  onChange={(e) =>
                    updateSetting("maxScore", parseInt(e.target.value))
                  }
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-green-400"
                >
                  <option value={3}>3 Points (Quick)</option>
                  <option value={5}>5 Points (Short)</option>
                  <option value={7}>7 Points (Medium)</option>
                  <option value={10}>10 Points (Long)</option>
                  <option value={15}>15 Points (Marathon)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === "visual" && (
          <div className="space-y-8">
            {/* Theme Selection */}
            <div>
              <h3 className="text-2xl font-semibold text-white mb-4 flex items-center">
                <span className="mr-3">🎨</span>
                Visual Theme
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {(
                  ["classic", "neon", "retro", "minimal", "cyberpunk"] as const
                ).map((theme) => (
                  <button
                    key={theme}
                    onClick={() => updateSetting("theme", theme)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 relative overflow-hidden ${
                      settings.theme === theme
                        ? "border-blue-400 bg-blue-500/20 text-white"
                        : "border-white/20 bg-white/10 text-gray-300 hover:border-white/40"
                    }`}
                  >
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{ backgroundColor: themeColors[theme] }}
                    />
                    <div className="relative z-10">
                      <div className="text-lg font-semibold capitalize">
                        {theme}
                      </div>
                      <div
                        className="w-6 h-6 rounded-full mx-auto mt-2"
                        style={{ backgroundColor: themeColors[theme] }}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Effects */}
            <div>
              <h3 className="text-2xl font-semibold text-white mb-4 flex items-center">
                <span className="mr-3">✨</span>
                Visual Effects
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    key: "enableParticles",
                    label: "Particle Effects",
                    icon: "🎆",
                    desc: "Floating background particles",
                  },
                  {
                    key: "enableTrails",
                    label: "Ball Trails",
                    icon: "💫",
                    desc: "Motion blur effect on ball",
                  },
                  {
                    key: "ballGlow",
                    label: "Ball Glow",
                    icon: "🌟",
                    desc: "Glowing effect around ball",
                  },
                  {
                    key: "paddleGlow",
                    label: "Paddle Glow",
                    icon: "✨",
                    desc: "Glowing effect around paddles",
                  },
                  {
                    key: "enableScreenShake",
                    label: "Screen Shake",
                    icon: "📳",
                    desc: "Impact feedback effects",
                  },
                ].map((effect) => (
                  <label
                    key={effect.key}
                    className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                      settings[
                        effect.key as keyof Pick<
                          ModernGameSettings,
                          | "enableParticles"
                          | "enableTrails"
                          | "ballGlow"
                          | "paddleGlow"
                          | "enableScreenShake"
                        >
                      ]
                        ? "border-cyan-400 bg-cyan-500/20"
                        : "border-white/20 bg-white/10 hover:border-white/40"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={
                        settings[
                          effect.key as keyof ModernGameSettings
                        ] as boolean
                      }
                      onChange={(e) =>
                        updateSetting(
                          effect.key as keyof Pick<
                            ModernGameSettings,
                            | "enableParticles"
                            | "enableTrails"
                            | "ballGlow"
                            | "paddleGlow"
                            | "enableScreenShake"
                          >,
                          e.target.checked,
                        )
                      }
                      className="sr-only"
                    />
                    <div className="flex-shrink-0 mr-3 text-2xl">
                      {effect.icon}
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-white">
                        {effect.label}
                      </div>
                      <div className="text-sm text-gray-300">{effect.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "advanced" && (
          <div className="space-y-8">
            {/* Power-ups */}
            <div>
              <h3 className="text-2xl font-semibold text-white mb-4 flex items-center">
                <span className="mr-3">⚡</span>
                Power-ups & Features
              </h3>
              <div className="space-y-4">
                <label
                  className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                    settings.enablePowerUps
                      ? "border-yellow-400 bg-yellow-500/20"
                      : "border-white/20 bg-white/10 hover:border-white/40"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={settings.enablePowerUps}
                    onChange={(e) =>
                      updateSetting("enablePowerUps", e.target.checked)
                    }
                    className="sr-only"
                  />
                  <div className="flex-shrink-0 mr-3 text-2xl">⚡</div>
                  <div>
                    <div className="text-lg font-semibold text-white">
                      Enable Power-ups
                    </div>
                    <div className="text-sm text-gray-300">
                      Collectible items that provide temporary advantages
                    </div>
                  </div>
                </label>

                <label
                  className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                    settings.soundEnabled
                      ? "border-green-400 bg-green-500/20"
                      : "border-white/20 bg-white/10 hover:border-white/40"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={settings.soundEnabled}
                    onChange={(e) =>
                      updateSetting("soundEnabled", e.target.checked)
                    }
                    className="sr-only"
                  />
                  <div className="flex-shrink-0 mr-3 text-2xl">🔊</div>
                  <div>
                    <div className="text-lg font-semibold text-white">
                      Sound Effects
                    </div>
                    <div className="text-sm text-gray-300">
                      Audio feedback for paddle hits and scoring
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Power-up Details */}
            {settings.enablePowerUps && (
              <div>
                <h4 className="text-xl font-semibold text-white mb-4">
                  Available Power-ups:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    {
                      icon: "🔴",
                      name: "Speed Boost",
                      desc: "Increases ball speed temporarily",
                    },
                    {
                      icon: "🟢",
                      name: "Size Up",
                      desc: "Makes your paddle larger",
                    },
                    {
                      icon: "🔵",
                      name: "Multi Ball",
                      desc: "Spawns additional balls",
                    },
                    {
                      icon: "🟡",
                      name: "Freeze",
                      desc: "Slows down AI temporarily",
                    },
                    {
                      icon: "🟣",
                      name: "Reverse",
                      desc: "Reverses AI controls",
                    },
                  ].map((powerup, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg bg-white/5 border border-white/10"
                    >
                      <div className="flex items-center mb-2">
                        <span className="text-xl mr-2">{powerup.icon}</span>
                        <span className="font-semibold text-white">
                          {powerup.name}
                        </span>
                      </div>
                      <div className="text-sm text-gray-300">
                        {powerup.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Game Info */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h4 className="text-xl font-semibold text-white mb-4 flex items-center">
                <span className="mr-2">ℹ️</span>
                Game Features
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
                <div className="space-y-2">
                  <div>• Dynamic AI that adapts to your play style</div>
                  <div>• Realistic physics with enhanced ball control</div>
                  <div>• Progressive difficulty as games advance</div>
                </div>
                <div className="space-y-2">
                  <div>• Mobile-friendly touch controls</div>
                  <div>• Keyboard and mouse support</div>
                  <div>• Pause/resume functionality</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </GlassmorphicCard>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <ModernButton
          variant="secondary"
          size="lg"
          onClick={resetToDefaults}
          className="w-full sm:w-auto"
        >
          Reset to Defaults
        </ModernButton>

        <ModernButton
          variant="primary"
          size="lg"
          onClick={handleStartGame}
          className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-300 shadow-xl"
        >
          <span className="mr-2">🚀</span>
          Start Game
        </ModernButton>
      </div>

      {/* Controls Info */}
      <GlassmorphicCard opacity="low" blur="md" padding="md" className="mt-8">
        <div className="text-center">
          <h4 className="text-lg font-semibold text-white mb-3">
            🎮 Game Controls
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-300">
            <div>
              <strong>W / ↑</strong> - Move Up
            </div>
            <div>
              <strong>S / ↓</strong> - Move Down
            </div>
            <div>
              <strong>Space</strong> - Start/Pause
            </div>
            <div>
              <strong>ESC</strong> - Settings
            </div>
          </div>
        </div>
      </GlassmorphicCard>
    </div>
  );
};

export default ModernPongSettings;
