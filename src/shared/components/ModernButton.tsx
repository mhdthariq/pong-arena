// Modern Button Component
"use client";

import React, { ButtonHTMLAttributes, ReactNode } from "react";

interface ModernButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?:
    | "primary"
    | "secondary"
    | "success"
    | "danger"
    | "warning"
    | "info"
    | "dark"
    | "glass";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  rounded?: "none" | "sm" | "md" | "lg" | "full";
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  isLoading?: boolean;
  loadingText?: string;
  isDisabled?: boolean;
  className?: string;
}

const ModernButton: React.FC<ModernButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  rounded = "md",
  fullWidth = false,
  leftIcon,
  rightIcon,
  isLoading = false,
  loadingText,
  isDisabled = false,
  className = "",
  ...props
}) => {
  // Variant styles
  const variantClasses = {
    primary:
      "bg-gradient-to-tr from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 active:from-blue-700 active:to-indigo-800",
    secondary:
      "bg-gradient-to-tr from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700 active:from-gray-700 active:to-gray-800",
    success:
      "bg-gradient-to-tr from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 active:from-green-700 active:to-emerald-800",
    danger:
      "bg-gradient-to-tr from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 active:from-red-700 active:to-rose-800",
    warning:
      "bg-gradient-to-tr from-yellow-400 to-amber-500 text-white hover:from-yellow-500 hover:to-amber-600 active:from-yellow-600 active:to-amber-700",
    info: "bg-gradient-to-tr from-cyan-400 to-sky-500 text-white hover:from-cyan-500 hover:to-sky-600 active:from-cyan-600 active:to-sky-700",
    dark: "bg-gradient-to-tr from-gray-700 to-gray-900 text-white hover:from-gray-800 hover:to-gray-950 active:from-gray-900 active:to-black",
    glass:
      "bg-white/20 backdrop-blur-md text-white border border-white/20 hover:bg-white/30 active:bg-white/40",
  }[variant];

  // Size styles
  const sizeClasses = {
    xs: "text-xs py-1 px-2",
    sm: "text-sm py-1.5 px-3",
    md: "text-base py-2 px-4",
    lg: "text-lg py-2.5 px-5",
    xl: "text-xl py-3 px-6",
  }[size];

  // Rounded styles
  const roundedClasses = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  }[rounded];

  // Width style
  const widthClass = fullWidth ? "w-full" : "";

  // Disabled style
  const disabledClass =
    isDisabled || isLoading
      ? "opacity-70 cursor-not-allowed pointer-events-none"
      : "";

  // Main button styles
  const buttonStyles = `
    inline-flex items-center justify-center font-medium
    transition-all duration-200 ease-in-out shadow-md
    hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50
    ${variantClasses} ${sizeClasses} ${roundedClasses} ${widthClass} ${disabledClass} ${className}
  `;

  // Icon sizing
  const iconSize = {
    xs: "w-3 h-3",
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
    xl: "w-6 h-6",
  }[size];

  return (
    <button
      {...props}
      disabled={isDisabled || isLoading}
      className={buttonStyles}
    >
      {/* Button content */}
      {isLoading ? (
        <>
          <svg
            className={`animate-spin -ml-1 mr-2 ${iconSize}`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          {loadingText || children}
        </>
      ) : (
        <>
          {leftIcon && <span className={`mr-2 ${iconSize}`}>{leftIcon}</span>}
          {children}
          {rightIcon && <span className={`ml-2 ${iconSize}`}>{rightIcon}</span>}
        </>
      )}
    </button>
  );
};

export default ModernButton;
