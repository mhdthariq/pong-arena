// Enhanced Modern Layout Component - Desktop Optimized
"use client";

import React, { ReactNode } from "react";
import ThreeJsBackground from "./ThreeJsBackground";

interface ModernLayoutProps {
  children: ReactNode;
  withBackground?: boolean;
  withPadding?: boolean;
  withMaxWidth?: boolean;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  withGradient?: boolean;
  gradientFrom?: string;
  gradientTo?: string;
  className?: string;
  backgroundParticleColor?: string;
  backgroundParticleCount?: number;
  interactiveBackground?: boolean;
  withVerticalCenter?: boolean;
  variant?: "default" | "gaming" | "minimal" | "immersive";
  withGlow?: boolean;
  containerClassName?: string;
}

const ModernLayout: React.FC<ModernLayoutProps> = ({
  children,
  withBackground = true,
  withPadding = true,
  withMaxWidth = true,
  maxWidth = "2xl",
  withGradient = false,
  gradientFrom = "from-blue-900/20",
  gradientTo = "to-purple-900/20",
  className = "",
  backgroundParticleColor = "#60a5fa",
  backgroundParticleCount = 150,
  interactiveBackground = true,
  withVerticalCenter = false,
  variant = "default",
  withGlow = true,
  containerClassName = "",
}) => {
  // Enhanced max width classes for better desktop scaling
  const maxWidthClasses = {
    sm: "max-w-screen-sm",
    md: "max-w-screen-md",
    lg: "max-w-screen-lg",
    xl: "max-w-screen-xl",
    "2xl": "max-w-screen-2xl",
    full: "max-w-full",
  }[maxWidth];

  // Enhanced responsive padding system
  const paddingClass = withPadding
    ? "px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-12 lg:px-12 lg:py-16 xl:px-16 xl:py-20 2xl:px-20 2xl:py-24"
    : "";

  // Enhanced gradient system
  const gradientClass = withGradient
    ? `bg-gradient-to-br ${gradientFrom} ${gradientTo}`
    : "";

  // Layout variants for different use cases
  const variantClasses = {
    default: "min-h-screen",
    gaming:
      "min-h-screen bg-gradient-to-b from-slate-900 via-gray-900 to-black",
    minimal:
      "min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-black",
    immersive: "min-h-screen bg-black overflow-hidden",
  }[variant];

  // Enhanced center alignment
  const verticalCenterClass = withVerticalCenter
    ? "flex flex-col items-center justify-center"
    : "";

  // Glow effect for enhanced visual appeal
  const glowClass = withGlow
    ? "before:absolute before:inset-0 before:bg-gradient-radial before:from-blue-500/5 before:via-transparent before:to-transparent before:pointer-events-none"
    : "";

  // Background particle settings based on variant
  const getParticleSettings = () => {
    switch (variant) {
      case "gaming":
        return {
          color: "#00ff88",
          count: 200,
        };
      case "minimal":
        return {
          color: "#94a3b8",
          count: 80,
        };
      case "immersive":
        return {
          color: "#3b82f6",
          count: 300,
        };
      default:
        return {
          color: backgroundParticleColor,
          count: backgroundParticleCount,
        };
    }
  };

  const particleSettings = getParticleSettings();

  return (
    <div
      className={`
        relative
        ${variantClasses}
        ${verticalCenterClass}
        ${gradientClass}
        ${glowClass}
        ${className}
        overflow-x-hidden
        transition-all duration-500 ease-in-out
      `}
    >
      {/* Enhanced Three.js background with better desktop performance */}
      {withBackground && (
        <div className="fixed inset-0 z-0">
          <ThreeJsBackground
            particleColor={particleSettings.color}
            particleCount={particleSettings.count}
            interactive={interactiveBackground}
          />
        </div>
      )}

      {/* Ambient lighting overlay for depth */}
      {variant === "gaming" && (
        <div className="fixed inset-0 z-[1] pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" />
          <div
            className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float"
            style={{ animationDelay: "1s" }}
          />
        </div>
      )}

      {/* Enhanced main content container */}
      <main className={`w-full z-10 relative ${paddingClass}`}>
        <div
          className={`
            ${withMaxWidth ? `mx-auto ${maxWidthClasses}` : "w-full"}
            ${containerClassName}
            transition-all duration-300 ease-in-out
          `}
        >
          {/* Content wrapper with enhanced glassmorphism */}
          <div className="relative">{children}</div>
        </div>
      </main>

      {/* Decorative elements for enhanced visual appeal */}
      <div className="fixed inset-0 z-[2] pointer-events-none overflow-hidden">
        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-blue-500/5 to-transparent rounded-full blur-2xl" />
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-purple-500/5 to-transparent rounded-full blur-2xl" />

        {/* Subtle grid pattern for desktop */}
        <div
          className="hidden lg:block absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />
      </div>
    </div>
  );
};

export default ModernLayout;
