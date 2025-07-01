"use client";

import React, { useState } from "react";
import GlassmorphicCard from "../../../shared/components/GlassmorphicCard";
import ModernButton from "../../../shared/components/ModernButton";

// Settings types
export interface GameSettings {
  // Basic game settings
  difficulty: "easy" | "medium" | "hard" | "expert" | "impossible";
  paddleSize: "tiny" | "small" | "medium" | "large" | "huge";
  ballSpeed: "crawl" | "slow" | "medium" | "fast" | "lightning";
  maxScore: number;
  gameMode: "classic" | "powerup" | "survival" | "tournament";

  // AI settings
  aiPersonality: "defensive" | "balanced" | "aggressive" | "unpredictable";
  aiReactionTime: number; // 0-1, higher = faster reaction
  aiAccuracy: number; // 0-1, higher = more accurate

  // Power-up settings
  enablePowerUps: boolean;
  powerUpFrequency: "rare" | "normal" | "frequent" | "chaos";
  powerUpDuration: number; // seconds

  // Visual settings
  enableParticles: boolean;
  enableTrails: boolean;
  enableScreenShake: boolean;
  ballGlow: boolean;
  paddleGlow: boolean;
  theme: "classic" | "neon" | "retro" | "minimal" | "cyberpunk";

  // Audio settings
  soundEnabled: boolean;
  musicEnabled: boolean;
  soundVolume: number; // 0-1
  musicVolume: number; // 0-1

  // Performance settings
  targetFPS: 30 | 60 | 120;
  particleCount: "low" | "medium" | "high" | "ultra";
  enableVSync: boolean;

  // Accessibility
  highContrast: boolean;
  reduceMotion: boolean;
  colorBlindMode: "none" | "deuteranopia" | "protanopia" | "tritanopia";

  // Advanced
  enablePhysics: boolean;
  ballBounceDamping: number; // 0-1
  paddleFriction: number; // 0-1
  wallBounceSound: boolean;
  paddleHitSound: boolean;
}

interface PongSettingsProps {
  settings: GameSettings;
  onSettingsChange: (settings: GameSettings) => void;
  onClose: () => void;
  onReset: () => void;
  isVisible: boolean;
}

const PongSettings: React.FC<PongSettingsProps> = ({
  settings,
  onSettingsChange,
  onClose,
  onReset,
  isVisible,
}) => {
  const [activeTab, setActiveTab] = useState<
    "basic" | "advanced" | "visual" | "audio"
  >("basic");
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isVisible) return null;

  const updateSetting = <K extends keyof GameSettings>(
    key: K,
    value: GameSettings[K],
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const tabs = [
    { id: "basic", label: "Basic", icon: "⚙️" },
    { id: "advanced", label: "Advanced", icon: "🔧" },
    { id: "visual", label: "Visual", icon: "🎨" },
    { id: "audio", label: "Audio", icon: "🔊" },
  ] as const;

  const themes = [
    {
      value: "classic",
      label: "Classic",
      description: "Traditional white on black",
    },
    {
      value: "neon",
      label: "Neon",
      description: "Bright neon colors with glow effects",
    },
    {
      value: "retro",
      label: "Retro",
      description: "80s-inspired color scheme",
    },
    { value: "minimal", label: "Minimal", description: "Clean, simple design" },
    {
      value: "cyberpunk",
      label: "Cyberpunk",
      description: "Futuristic dark theme",
    },
  ];

  const Slider: React.FC<{
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (value: number) => void;
    suffix?: string;
  }> = ({ label, value, min, max, step, onChange, suffix = "" }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm text-blue-200">{label}</label>
        <span className="text-sm text-white font-medium">
          {value.toFixed(step < 1 ? 2 : 0)}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
      />
    </div>
  );

  const Toggle: React.FC<{
    label: string;
    value: boolean;
    onChange: (value: boolean) => void;
    description?: string;
  }> = ({ label, value, onChange, description }) => (
    <div className="flex items-center justify-between">
      <div>
        <label className="text-sm text-blue-200">{label}</label>
        {description && (
          <p className="text-xs text-gray-400 mt-1">{description}</p>
        )}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`w-12 h-6 rounded-full transition-colors ${
          value ? "bg-green-500" : "bg-gray-500"
        }`}
      >
        <div
          className={`w-5 h-5 bg-white rounded-full transition-transform ${
            value ? "translate-x-6" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );

  const Select: React.FC<{
    label: string;
    value: string | number;
    options: { value: string | number; label: string; description?: string }[];
    onChange: (value: string | number) => void;
  }> = ({ label, value, options, onChange }) => (
    <div className="space-y-2">
      <label className="block text-sm text-blue-200">{label}</label>
      <select
        value={value}
        onChange={(e) => {
          const selectedOption = options.find(
            (opt) => opt.value.toString() === e.target.value,
          );
          onChange(
            typeof selectedOption?.value === "number"
              ? Number(e.target.value)
              : e.target.value,
          );
        }}
        className="w-full p-2 rounded bg-white/20 text-white border border-white/20 focus:border-blue-400 focus:outline-none"
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-gray-800"
          >
            {option.label}
          </option>
        ))}
      </select>
      {options.find((opt) => opt.value === value)?.description && (
        <p className="text-xs text-gray-400">
          {options.find((opt) => opt.value === value)?.description}
        </p>
      )}
    </div>
  );

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "pong-settings.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target?.result as string);
        onSettingsChange(importedSettings);
      } catch (error) {
        console.error("Failed to import settings:", error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <GlassmorphicCard
        className="w-full max-w-4xl max-h-[90vh] overflow-hidden"
        padding="none"
        blur="xl"
        opacity="high"
        rounded="xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Game Settings</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4">
          <div className="flex space-x-4 border-b border-white/20">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 px-2 text-sm font-medium transition-colors flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? "text-blue-400 border-b-2 border-blue-400"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === "basic" && (
            <div className="space-y-6">
              <Select
                label="Game Mode"
                value={settings.gameMode}
                onChange={(value) =>
                  updateSetting("gameMode", value as GameSettings["gameMode"])
                }
                options={[
                  {
                    value: "classic",
                    label: "Classic",
                    description: "Traditional Pong gameplay",
                  },
                  {
                    value: "powerup",
                    label: "Power-up Mode",
                    description: "Includes special power-ups and effects",
                  },
                  {
                    value: "survival",
                    label: "Survival",
                    description: "Increasingly difficult AI",
                  },
                  {
                    value: "tournament",
                    label: "Tournament",
                    description: "Best of multiple rounds",
                  },
                ]}
              />

              <Select
                label="Difficulty"
                value={settings.difficulty}
                onChange={(value) =>
                  updateSetting(
                    "difficulty",
                    value as GameSettings["difficulty"],
                  )
                }
                options={[
                  {
                    value: "easy",
                    label: "Easy",
                    description: "Perfect for beginners",
                  },
                  {
                    value: "medium",
                    label: "Medium",
                    description: "Balanced challenge",
                  },
                  {
                    value: "hard",
                    label: "Hard",
                    description: "For experienced players",
                  },
                  {
                    value: "expert",
                    label: "Expert",
                    description: "Very challenging",
                  },
                  {
                    value: "impossible",
                    label: "Impossible",
                    description: "Nearly unbeatable AI",
                  },
                ]}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                  label="Paddle Size"
                  value={settings.paddleSize}
                  onChange={(value) =>
                    updateSetting(
                      "paddleSize",
                      value as GameSettings["paddleSize"],
                    )
                  }
                  options={[
                    { value: "tiny", label: "Tiny" },
                    { value: "small", label: "Small" },
                    { value: "medium", label: "Medium" },
                    { value: "large", label: "Large" },
                    { value: "huge", label: "Huge" },
                  ]}
                />

                <Select
                  label="Ball Speed"
                  value={settings.ballSpeed}
                  onChange={(value) =>
                    updateSetting(
                      "ballSpeed",
                      value as GameSettings["ballSpeed"],
                    )
                  }
                  options={[
                    { value: "crawl", label: "Crawl" },
                    { value: "slow", label: "Slow" },
                    { value: "medium", label: "Medium" },
                    { value: "fast", label: "Fast" },
                    { value: "lightning", label: "Lightning" },
                  ]}
                />
              </div>

              <Select
                label="Score to Win"
                value={settings.maxScore}
                onChange={(value) => updateSetting("maxScore", value as number)}
                options={[
                  { value: 3, label: "3 Points" },
                  { value: 5, label: "5 Points" },
                  { value: 7, label: "7 Points" },
                  { value: 10, label: "10 Points" },
                  { value: 15, label: "15 Points" },
                  { value: 21, label: "21 Points" },
                ]}
              />

              <div className="space-y-4">
                <Toggle
                  label="Enable Power-ups"
                  value={settings.enablePowerUps}
                  onChange={(value) => updateSetting("enablePowerUps", value)}
                  description="Adds special power-ups during gameplay"
                />

                {settings.enablePowerUps && (
                  <Select
                    label="Power-up Frequency"
                    value={settings.powerUpFrequency}
                    onChange={(value) =>
                      updateSetting(
                        "powerUpFrequency",
                        value as GameSettings["powerUpFrequency"],
                      )
                    }
                    options={[
                      { value: "rare", label: "Rare" },
                      { value: "normal", label: "Normal" },
                      { value: "frequent", label: "Frequent" },
                      { value: "chaos", label: "Chaos Mode" },
                    ]}
                  />
                )}
              </div>
            </div>
          )}

          {activeTab === "advanced" && (
            <div className="space-y-6">
              <Select
                label="AI Personality"
                value={settings.aiPersonality}
                onChange={(value) =>
                  updateSetting(
                    "aiPersonality",
                    value as GameSettings["aiPersonality"],
                  )
                }
                options={[
                  {
                    value: "defensive",
                    label: "Defensive",
                    description: "Plays it safe, focuses on blocking",
                  },
                  {
                    value: "balanced",
                    label: "Balanced",
                    description: "Mix of offense and defense",
                  },
                  {
                    value: "aggressive",
                    label: "Aggressive",
                    description: "Takes risks for winning shots",
                  },
                  {
                    value: "unpredictable",
                    label: "Unpredictable",
                    description: "Random playing style",
                  },
                ]}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Slider
                  label="AI Reaction Time"
                  value={settings.aiReactionTime}
                  min={0}
                  max={1}
                  step={0.05}
                  onChange={(value) => updateSetting("aiReactionTime", value)}
                />

                <Slider
                  label="AI Accuracy"
                  value={settings.aiAccuracy}
                  min={0}
                  max={1}
                  step={0.05}
                  onChange={(value) => updateSetting("aiAccuracy", value)}
                />
              </div>

              {settings.enablePowerUps && (
                <Slider
                  label="Power-up Duration"
                  value={settings.powerUpDuration}
                  min={1}
                  max={10}
                  step={0.5}
                  onChange={(value) => updateSetting("powerUpDuration", value)}
                  suffix="s"
                />
              )}

              <div className="space-y-4">
                <Toggle
                  label="Enhanced Physics"
                  value={settings.enablePhysics}
                  onChange={(value) => updateSetting("enablePhysics", value)}
                  description="Realistic ball physics and spin effects"
                />

                {settings.enablePhysics && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Slider
                      label="Ball Bounce Damping"
                      value={settings.ballBounceDamping}
                      min={0}
                      max={1}
                      step={0.05}
                      onChange={(value) =>
                        updateSetting("ballBounceDamping", value)
                      }
                    />

                    <Slider
                      label="Paddle Friction"
                      value={settings.paddleFriction}
                      min={0}
                      max={1}
                      step={0.05}
                      onChange={(value) =>
                        updateSetting("paddleFriction", value)
                      }
                    />
                  </div>
                )}
              </div>

              <Select
                label="Target FPS"
                value={settings.targetFPS}
                onChange={(value) =>
                  updateSetting("targetFPS", value as GameSettings["targetFPS"])
                }
                options={[
                  {
                    value: 30,
                    label: "30 FPS",
                    description: "Better battery life",
                  },
                  {
                    value: 60,
                    label: "60 FPS",
                    description: "Smooth gameplay",
                  },
                  {
                    value: 120,
                    label: "120 FPS",
                    description: "Ultra smooth (high-end devices)",
                  },
                ]}
              />

              <Toggle
                label="V-Sync"
                value={settings.enableVSync}
                onChange={(value) => updateSetting("enableVSync", value)}
                description="Prevents screen tearing"
              />
            </div>
          )}

          {activeTab === "visual" && (
            <div className="space-y-6">
              <Select
                label="Theme"
                value={settings.theme}
                onChange={(value) =>
                  updateSetting("theme", value as GameSettings["theme"])
                }
                options={themes}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Toggle
                    label="Ball Glow Effect"
                    value={settings.ballGlow}
                    onChange={(value) => updateSetting("ballGlow", value)}
                  />

                  <Toggle
                    label="Paddle Glow Effect"
                    value={settings.paddleGlow}
                    onChange={(value) => updateSetting("paddleGlow", value)}
                  />

                  <Toggle
                    label="Ball Trails"
                    value={settings.enableTrails}
                    onChange={(value) => updateSetting("enableTrails", value)}
                  />
                </div>

                <div className="space-y-4">
                  <Toggle
                    label="Particle Effects"
                    value={settings.enableParticles}
                    onChange={(value) =>
                      updateSetting("enableParticles", value)
                    }
                  />

                  <Toggle
                    label="Screen Shake"
                    value={settings.enableScreenShake}
                    onChange={(value) =>
                      updateSetting("enableScreenShake", value)
                    }
                  />

                  {settings.enableParticles && (
                    <Select
                      label="Particle Quality"
                      value={settings.particleCount}
                      onChange={(value) =>
                        updateSetting(
                          "particleCount",
                          value as GameSettings["particleCount"],
                        )
                      }
                      options={[
                        { value: "low", label: "Low" },
                        { value: "medium", label: "Medium" },
                        { value: "high", label: "High" },
                        { value: "ultra", label: "Ultra" },
                      ]}
                    />
                  )}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/20">
                <h4 className="text-lg font-semibold text-white">
                  Accessibility
                </h4>

                <Toggle
                  label="High Contrast Mode"
                  value={settings.highContrast}
                  onChange={(value) => updateSetting("highContrast", value)}
                  description="Increases contrast for better visibility"
                />

                <Toggle
                  label="Reduce Motion"
                  value={settings.reduceMotion}
                  onChange={(value) => updateSetting("reduceMotion", value)}
                  description="Reduces animations and effects"
                />

                <Select
                  label="Color Blind Support"
                  value={settings.colorBlindMode}
                  onChange={(value) =>
                    updateSetting(
                      "colorBlindMode",
                      value as GameSettings["colorBlindMode"],
                    )
                  }
                  options={[
                    { value: "none", label: "None" },
                    {
                      value: "deuteranopia",
                      label: "Deuteranopia (Red-Green)",
                    },
                    { value: "protanopia", label: "Protanopia (Red-Green)" },
                    { value: "tritanopia", label: "Tritanopia (Blue-Yellow)" },
                  ]}
                />
              </div>
            </div>
          )}

          {activeTab === "audio" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Toggle
                    label="Sound Effects"
                    value={settings.soundEnabled}
                    onChange={(value) => updateSetting("soundEnabled", value)}
                  />

                  {settings.soundEnabled && (
                    <Slider
                      label="Sound Volume"
                      value={settings.soundVolume}
                      min={0}
                      max={1}
                      step={0.05}
                      onChange={(value) => updateSetting("soundVolume", value)}
                      suffix="%"
                    />
                  )}
                </div>

                <div className="space-y-4">
                  <Toggle
                    label="Background Music"
                    value={settings.musicEnabled}
                    onChange={(value) => updateSetting("musicEnabled", value)}
                  />

                  {settings.musicEnabled && (
                    <Slider
                      label="Music Volume"
                      value={settings.musicVolume}
                      min={0}
                      max={1}
                      step={0.05}
                      onChange={(value) => updateSetting("musicVolume", value)}
                      suffix="%"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/20">
                <h4 className="text-lg font-semibold text-white">
                  Individual Sound Effects
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Toggle
                    label="Wall Bounce Sound"
                    value={settings.wallBounceSound}
                    onChange={(value) =>
                      updateSetting("wallBounceSound", value)
                    }
                  />

                  <Toggle
                    label="Paddle Hit Sound"
                    value={settings.paddleHitSound}
                    onChange={(value) => updateSetting("paddleHitSound", value)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/20 bg-black/20">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <ModernButton variant="glass" size="sm" onClick={exportSettings}>
                Export Settings
              </ModernButton>

              <label className="relative cursor-pointer">
                <input
                  type="file"
                  accept=".json"
                  onChange={importSettings}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <span className="inline-flex items-center justify-center font-medium transition-all duration-200 ease-in-out shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50 bg-white/20 backdrop-blur-md text-white border border-white/20 hover:bg-white/30 active:bg-white/40 text-sm py-1.5 px-3 rounded-md">
                  Import Settings
                </span>
              </label>

              <ModernButton
                variant="warning"
                size="sm"
                onClick={() => setShowResetConfirm(true)}
              >
                Reset to Defaults
              </ModernButton>
            </div>

            <div className="flex gap-2">
              <ModernButton variant="glass" size="md" onClick={onClose}>
                Cancel
              </ModernButton>

              <ModernButton variant="primary" size="md" onClick={onClose}>
                Apply Settings
              </ModernButton>
            </div>
          </div>
        </div>
      </GlassmorphicCard>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <GlassmorphicCard className="max-w-md" padding="lg">
            <h3 className="text-xl font-bold text-white mb-4">
              Reset Settings?
            </h3>
            <p className="text-blue-200 mb-6">
              This will reset all settings to their default values. This action
              cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <ModernButton
                variant="glass"
                onClick={() => setShowResetConfirm(false)}
              >
                Cancel
              </ModernButton>
              <ModernButton
                variant="danger"
                onClick={() => {
                  onReset();
                  setShowResetConfirm(false);
                }}
              >
                Reset
              </ModernButton>
            </div>
          </GlassmorphicCard>
        </div>
      )}
    </div>
  );
};

export default PongSettings;
