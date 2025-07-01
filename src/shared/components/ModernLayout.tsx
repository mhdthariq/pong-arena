// Modern Layout Component
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
}

const ModernLayout: React.FC<ModernLayoutProps> = ({
  children,
  withBackground = true,
  withPadding = true,
  withMaxWidth = true,
  maxWidth = "xl",
  withGradient = false,
  gradientFrom = "from-blue-900",
  gradientTo = "to-purple-900",
  className = "",
  backgroundParticleColor = "#60a5fa",
  backgroundParticleCount = 120,
  interactiveBackground = true,
  withVerticalCenter = false,
}) => {
  // Max width classes
  const maxWidthClasses = {
    sm: "max-w-screen-sm",
    md: "max-w-screen-md",
    lg: "max-w-screen-lg",
    xl: "max-w-screen-xl",
    "2xl": "max-w-screen-2xl",
    full: "max-w-full",
  }[maxWidth];

  // Padding
  const paddingClass = withPadding ? "px-4 py-8 md:px-6 md:py-12 lg:px-8" : "";

  // Gradient
  const gradientClass = withGradient
    ? `bg-gradient-to-br ${gradientFrom} ${gradientTo}`
    : "";

  // Center vertically
  const verticalCenterClass = withVerticalCenter
    ? "flex flex-col items-center justify-center min-h-screen"
    : "min-h-screen";

  return (
    <div
      className={`relative ${verticalCenterClass} ${gradientClass} ${className}`}
    >
      {/* Three.js background */}
      {withBackground && (
        <ThreeJsBackground
          particleColor={backgroundParticleColor}
          particleCount={backgroundParticleCount}
          interactive={interactiveBackground}
        />
      )}

      {/* Main content */}
      <main className={`w-full z-10 ${paddingClass}`}>
        <div
          className={`${withMaxWidth ? `mx-auto ${maxWidthClasses}` : "w-full"}`}
        >
          {children}
        </div>
      </main>
    </div>
  );
};

export default ModernLayout;
