// Glassmorphic Card Component
"use client";

import React, { ReactNode } from "react";

interface GlassmorphicCardProps {
  children: ReactNode;
  className?: string;
  blur?: "none" | "sm" | "md" | "lg" | "xl";
  opacity?: "low" | "medium" | "high";
  border?: boolean;
  hoverEffect?: boolean;
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "full";
  shadow?: "none" | "sm" | "md" | "lg" | "xl";
}

const GlassmorphicCard: React.FC<GlassmorphicCardProps> = ({
  children,
  className = "",
  blur = "md",
  opacity = "medium",
  border = true,
  hoverEffect = false,
  padding = "lg",
  rounded = "lg",
  shadow = "lg",
}) => {
  // Compute blur class
  const blurClass = {
    none: "",
    sm: "backdrop-blur-sm",
    md: "backdrop-blur-md",
    lg: "backdrop-blur-lg",
    xl: "backdrop-blur-xl",
  }[blur];

  // Compute background opacity
  const bgOpacityClass = {
    low: "bg-white/10 dark:bg-gray-900/10",
    medium: "bg-white/20 dark:bg-gray-900/20",
    high: "bg-white/30 dark:bg-gray-900/30",
  }[opacity];

  // Compute border class
  const borderClass = border
    ? "border border-white/20 dark:border-gray-700/30"
    : "";

  // Compute hover effect
  const hoverClass = hoverEffect
    ? "transition-all duration-300 hover:bg-white/30 dark:hover:bg-gray-900/40 hover:shadow-lg hover:-translate-y-1"
    : "";

  // Compute padding
  const paddingClass = {
    none: "p-0",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
    xl: "p-8",
  }[padding];

  // Compute rounded corners
  const roundedClass = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    full: "rounded-3xl",
  }[rounded];

  // Compute shadow
  const shadowClass = {
    none: "",
    sm: "shadow-sm",
    md: "shadow",
    lg: "shadow-lg",
    xl: "shadow-xl",
  }[shadow];

  return (
    <div
      className={`${blurClass} ${bgOpacityClass} ${borderClass} ${hoverClass} ${paddingClass} ${roundedClass} ${shadowClass} ${className}`}
    >
      {children}
    </div>
  );
};

export default GlassmorphicCard;
