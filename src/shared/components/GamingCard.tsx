// Enhanced Gaming Card Component - Desktop Optimized
"use client";

import React, { ReactNode } from "react";

interface GamingCardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "neon" | "battle" | "victory" | "danger";
  size?: "sm" | "md" | "lg" | "xl";
  glowEffect?: boolean;
  hoverEffect?: boolean;
  borderAnimation?: boolean;
  backgroundPattern?: boolean;
  neonColor?: "blue" | "green" | "purple" | "red" | "yellow";
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

const GamingCard: React.FC<GamingCardProps> = ({
  children,
  className = "",
  variant = "default",
  size = "md",
  glowEffect = true,
  hoverEffect = true,
  borderAnimation = false,
  backgroundPattern = false,
  neonColor = "blue",
  onClick,
  disabled = false,
  loading = false,
}) => {
  // Size classes
  const sizeClasses = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
    xl: "p-10",
  }[size];

  // Variant styles
  const variantClasses = {
    default: "bg-white/10 border-white/20 shadow-xl backdrop-blur-lg",
    neon: "bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-indigo-500/10 border-blue-400/40",
    battle:
      "bg-gradient-to-br from-red-500/10 via-orange-500/10 to-yellow-500/10 border-red-400/40",
    victory:
      "bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-teal-500/10 border-green-400/40",
    danger:
      "bg-gradient-to-br from-red-500/10 via-rose-500/10 to-pink-500/10 border-red-400/40",
  }[variant];

  // Neon color classes
  const neonColorClasses = {
    blue: "shadow-blue-500/20",
    green: "shadow-green-500/20",
    purple: "shadow-purple-500/20",
    red: "shadow-red-500/20",
    yellow: "shadow-yellow-500/20",
  }[neonColor];

  // Glow effect
  const glowClass = glowEffect ? `${neonColorClasses} animate-glow-pulse` : "";

  // Hover effects
  const hoverClass =
    hoverEffect && !disabled
      ? "hover:scale-[1.02] hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ease-out cursor-pointer transform-gpu will-change-transform"
      : "";

  // Border animation
  const borderAnimationClass = borderAnimation
    ? "relative border-2 border-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 bg-clip-border animate-spin"
    : "";

  // Background pattern
  const backgroundPatternClass = backgroundPattern
    ? "relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/5 before:to-transparent before:pointer-events-none"
    : "";

  // Disabled state
  const disabledClass = disabled
    ? "opacity-50 cursor-not-allowed pointer-events-none"
    : "";

  // Loading state
  const loadingClass = loading ? "animate-pulse cursor-wait" : "";

  // Click handler
  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      onClick();
    }
  };

  return (
    <div
      className={`
        relative
        rounded-xl
        ${borderAnimation ? "p-0" : "border"}
        backdrop-blur-lg
        transition-all
        duration-300
        ease-in-out
        will-change-transform
        ${borderAnimation ? "" : sizeClasses}
        ${variantClasses}
        ${glowClass}
        ${hoverClass}
        ${borderAnimationClass}
        ${backgroundPatternClass}
        ${disabledClass}
        ${loadingClass}
        ${className}
      `}
      onClick={handleClick}
    >
      {/* Background pattern overlay */}
      {backgroundPattern && (
        <div
          className="absolute inset-0 opacity-5 pointer-events-none rounded-xl"
          style={{
            backgroundImage: `
              radial-gradient(circle at 25% 25%, white 2px, transparent 2px),
              radial-gradient(circle at 75% 75%, white 2px, transparent 2px)
            `,
            backgroundSize: "30px 30px",
          }}
        />
      )}

      {/* Border animation inner content */}
      {borderAnimation && (
        <div
          className={`relative bg-gray-900/95 backdrop-blur-lg rounded-lg m-0.5 ${sizeClasses} transition-all duration-300`}
        >
          {children}
        </div>
      )}

      {/* Content */}
      {!borderAnimation && (
        <div className="relative z-10">
          {loading ? (
            <div className="flex items-center justify-center space-x-3">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-gray-300">Loading...</span>
            </div>
          ) : (
            children
          )}
        </div>
      )}

      {/* Corner decorations for gaming theme */}
      <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-current opacity-30" />
      <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-current opacity-30" />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-current opacity-30" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-current opacity-30" />

      {/* Shine effect on hover */}
      {hoverEffect && !disabled && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full transition-transform duration-700 hover:translate-x-full opacity-0 hover:opacity-100 pointer-events-none" />
      )}
    </div>
  );
};

export default GamingCard;
