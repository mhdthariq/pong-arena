"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import ModernLayout from "../shared/components/ModernLayout";
import GlassmorphicCard from "../shared/components/GlassmorphicCard";
import ModernButton from "../shared/components/ModernButton";
import GamingCard from "../shared/components/GamingCard";
import {
  setupFirebaseAuthListener,
  getFirebaseClient,
} from "../shared/firebase/firebaseClient";
import MessageBox from "../shared/components/MessageBox";
import { Firestore } from "firebase/firestore";
import { Auth } from "firebase/auth";

const HomePageContent = () => {
  const [db, setDb] = useState<Firestore | null>(null);
  const [auth, setAuth] = useState<Auth | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const pathname = usePathname();
  const [messageBox, setMessageBox] = useState<{
    message: string;
    onConfirm: () => void;
    showCancel?: boolean;
    onCancel?: () => void;
  }>({ message: "", onConfirm: () => {} });

  const router = useRouter();

  useEffect(() => {
    const { db, auth } = getFirebaseClient();
    setDb(db);
    setAuth(auth);

    const unsubscribeAuth = setupFirebaseAuthListener(
      setUserId,
      setIsAuthReady,
      setMessageBox,
    );
    return () => unsubscribeAuth();
  }, []);

  // Game data
  const games = [
    {
      id: "pong",
      title: "Pong Arena",
      description:
        "The ultimate evolution of the classic arcade game with enhanced graphics, power-ups, and intelligent AI",
      features: ["Modern Graphics", "Power-ups", "AI Opponents", "Multiplayer"],
      gradient: "from-blue-600 to-blue-900",
      accentColor: "blue",
      neonColor: "blue",
      icon: "🏓",
      classicPath: "/games/pong/classic",
      modernPath: "/games/pong/modern",
      multiplayerPath: "/games/pong/multi-player/lobby",
    },
    {
      id: "tictactoe",
      title: "Tic-Tac-Toe",
      description:
        "Strategic X's and O's battles with ultimate game modes and advanced AI challenges",
      features: ["Ultimate Mode", "Smart AI", "Online Battles", "Strategy"],
      gradient: "from-red-600 to-purple-900",
      accentColor: "purple",
      neonColor: "purple",
      icon: "⭕",
      classicPath: "/games/tictactoe/classic",
      modernPath: "/games/tictactoe/ultimate",
      multiplayerPath: "/games/tictactoe/multi-player/lobby",
    },
  ];

  // Game selection handlers
  const selectGame = (
    gameId: string,
    mode: "classic" | "modern" | "multiplayer",
  ) => {
    const game = games.find((g) => g.id === gameId);
    if (!game) return;

    switch (mode) {
      case "classic":
        router.push(game.classicPath);
        break;
      case "modern":
        router.push(game.modernPath);
        break;
      case "multiplayer":
        if (isAuthReady && userId && db && auth) {
          router.push(game.multiplayerPath);
        } else {
          setMessageBox({
            message:
              "Firebase authentication not ready. Please wait or check your connection.",
            onConfirm: () =>
              setMessageBox({ message: "", onConfirm: () => {} }),
          });
        }
        break;
    }
  };

  return (
    <ModernLayout
      variant="default"
      withBackground={true}
      backgroundParticleColor="#60a5fa"
      backgroundParticleCount={120}
      withVerticalCenter={false}
      maxWidth="full"
      containerClassName="min-h-screen"
    >
      {/* Enhanced Hero Section */}
      <div className="relative z-10 text-center pt-8 lg:pt-16 pb-12 lg:pb-20">
        <div className="max-w-6xl mx-auto px-4">
          {/* Main Title */}
          <div className="mb-8 lg:mb-12">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-6 relative">
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-600 bg-clip-text text-transparent drop-shadow-2xl animate-neon-glow">
                GAME ARENA
              </span>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-400/20 via-purple-500/20 to-indigo-600/20 blur-3xl -z-10 animate-pulse-slow" />
            </h1>

            <p className="text-xl lg:text-2xl xl:text-3xl text-blue-200/90 mb-8 max-w-4xl mx-auto leading-relaxed">
              Enter the ultimate gaming experience with classic arcade games
              reimagined for the modern era
            </p>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 max-w-3xl mx-auto mb-12">
              <GlassmorphicCard className="text-center py-4" padding="sm">
                <div className="text-3xl lg:text-4xl font-bold text-blue-400 mb-2">
                  2
                </div>
                <div className="text-sm lg:text-base text-gray-300">
                  Epic Games
                </div>
              </GlassmorphicCard>
              <GlassmorphicCard className="text-center py-4" padding="sm">
                <div className="text-3xl lg:text-4xl font-bold text-green-400 mb-2">
                  ∞
                </div>
                <div className="text-sm lg:text-base text-gray-300">
                  Challenges
                </div>
              </GlassmorphicCard>
              <GlassmorphicCard className="text-center py-4" padding="sm">
                <div className="text-3xl lg:text-4xl font-bold text-purple-400 mb-2">
                  🌐
                </div>
                <div className="text-sm lg:text-base text-gray-300">
                  Multiplayer
                </div>
              </GlassmorphicCard>
              <GlassmorphicCard className="text-center py-4" padding="sm">
                <div className="text-3xl lg:text-4xl font-bold text-yellow-400 mb-2">
                  🚀
                </div>
                <div className="text-sm lg:text-base text-gray-300">
                  Modern UI
                </div>
              </GlassmorphicCard>
            </div>
          </div>

          {/* Connection Status */}
          <div className="flex justify-center items-center space-x-6 mb-12">
            <GlassmorphicCard className="px-6 py-3" padding="none">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isAuthReady
                      ? "bg-green-400 animate-pulse"
                      : "bg-yellow-400 animate-bounce"
                  }`}
                />
                <span className="text-white font-medium">
                  {isAuthReady
                    ? "🟢 Ready for Multiplayer"
                    : "🟡 Connecting to Servers..."}
                </span>
              </div>
            </GlassmorphicCard>
          </div>
        </div>
      </div>

      {/* Enhanced Games Grid */}
      <div className="relative z-10 px-4 lg:px-8 pb-16 lg:pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {games.map((game, index) => (
              <GamingCard
                key={game.id}
                variant="neon"
                size="lg"
                glowEffect={true}
                hoverEffect={true}
                borderAnimation={false}
                backgroundPattern={true}
                neonColor={
                  game.neonColor as
                    | "blue"
                    | "green"
                    | "purple"
                    | "red"
                    | "yellow"
                }
                className={`group animate-fade-in ${
                  index === 1 ? "animate-delay-200" : ""
                } transform-gpu`}
                onClick={() => {
                  setSelectedGame(selectedGame === game.id ? null : game.id);
                }}
              >
                {/* Game Header */}
                <div
                  className={`relative h-64 bg-gradient-to-br ${game.gradient} rounded-lg mb-6 overflow-hidden`}
                >
                  {/* Animated Background */}
                  <div className="absolute inset-0 bg-black/20" />

                  {/* Game Icon/Visual */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    {game.id === "pong" ? (
                      <div className="flex items-center space-x-8 animate-float">
                        <div className="w-6 h-20 bg-white rounded-full shadow-lg shadow-white/50" />
                        <div className="w-4 h-4 bg-white rounded-full animate-pulse shadow-lg shadow-white/50" />
                        <div className="w-6 h-20 bg-white rounded-full shadow-lg shadow-white/50" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-3 w-48 h-48 animate-breathe">
                        {Array.from({ length: 9 }).map((_, i) => (
                          <div
                            key={i}
                            className="bg-white/20 rounded-lg flex items-center justify-center text-4xl font-bold border border-white/30"
                          >
                            {i === 0 || i === 4 || i === 8 ? (
                              <span className="text-blue-400 animate-pulse">
                                X
                              </span>
                            ) : i === 2 || i === 6 ? (
                              <span
                                className="text-red-400 animate-pulse"
                                style={{ animationDelay: "0.5s" }}
                              >
                                O
                              </span>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Floating Game Icon */}
                  <div className="absolute top-4 right-4 text-6xl animate-float">
                    {game.icon}
                  </div>

                  {/* Overlay Effects */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>

                {/* Game Content */}
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors duration-300">
                      {game.title}
                    </h2>
                    <p className="text-gray-300 text-lg leading-relaxed mb-6">
                      {game.description}
                    </p>
                  </div>

                  {/* Features */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {game.features.map((feature, featureIndex) => (
                      <div
                        key={feature}
                        className="flex items-center space-x-2 text-sm text-gray-300 animate-slide-up"
                        style={{ animationDelay: `${featureIndex * 0.1}s` }}
                      >
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <ModernButton
                        variant="success"
                        size="lg"
                        fullWidth
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 btn-enhanced transform-gpu"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          e.preventDefault();
                          selectGame(game.id, "classic");
                        }}
                      >
                        {game.id === "pong" ? "🏓 Classic" : "⭕ Classic"}
                      </ModernButton>
                      <ModernButton
                        variant="primary"
                        size="lg"
                        fullWidth
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 btn-enhanced transform-gpu"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          e.preventDefault();
                          selectGame(game.id, "modern");
                        }}
                      >
                        {game.id === "pong" ? "⚡ Modern" : "🎯 Ultimate"}
                      </ModernButton>
                    </div>
                    <ModernButton
                      variant="info"
                      size="lg"
                      fullWidth
                      disabled={!isAuthReady || !userId || !db || !auth}
                      className={`btn-enhanced transform-gpu transition-all duration-300 ${
                        !isAuthReady || !userId || !db || !auth
                          ? "opacity-50 cursor-not-allowed"
                          : "bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                      }`}
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        e.preventDefault();
                        selectGame(game.id, "multiplayer");
                      }}
                    >
                      {game.id === "pong"
                        ? "🌐 Multiplayer Battle"
                        : "🌐 Multiplayer"}
                    </ModernButton>
                  </div>

                  {/* Connection Status for Multiplayer */}
                  {(!isAuthReady || !userId || !db || !auth) && (
                    <div className="text-center">
                      <p className="text-sm text-yellow-400 flex items-center justify-center space-x-2">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                        <span>Connecting to multiplayer servers...</span>
                      </p>
                    </div>
                  )}
                </div>
              </GamingCard>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Footer - Only show on homepage */}
      {pathname === "/" && (
        <footer className="relative z-10 border-t border-white/10 bg-black/20 backdrop-blur-lg">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
              {/* Brand Section */}
              <div className="text-center lg:text-left">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Game Arena
                </h3>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Experience classic arcade games reimagined with modern
                  technology, stunning visuals, and competitive multiplayer
                  action.
                </p>
                <div className="flex justify-center lg:justify-start space-x-4">
                  <a
                    href="mailto:mthariqaryaputra1@gmail.com"
                    className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors duration-300 group"
                    title="Email"
                  >
                    <svg
                      className="w-6 h-6 text-gray-300 group-hover:text-white transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </a>
                  <a
                    href="https://github.com/mhdthariq"
                    className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors duration-300 group"
                    title="GitHub"
                  >
                    <svg
                      className="w-6 h-6 text-gray-300 group-hover:text-white transition-colors"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z"
                      />
                    </svg>
                  </a>
                  <a
                    href="www.linkedin.com/in/muhammad-thariq-arya-putra-sembiring"
                    className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors duration-300 group"
                    title="LinkedIn"
                  >
                    <svg
                      className="w-6 h-6 text-gray-300 group-hover:text-white transition-colors"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14m-.5 15.5v-5.3a3.26 3.26 0 00-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 011.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 001.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 00-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Quick Links */}
              <div className="text-center">
                <h4 className="text-lg font-semibold text-white mb-4">
                  Quick Links
                </h4>
                <div className="space-y-3">
                  <Link
                    href="/games/pong/modern"
                    className="block text-gray-300 hover:text-blue-400 transition-colors duration-300"
                  >
                    Modern Pong
                  </Link>
                  <Link
                    href="/games/pong/multi-player/lobby"
                    className="block text-gray-300 hover:text-blue-400 transition-colors duration-300"
                  >
                    Pong Multiplayer
                  </Link>
                  <Link
                    href="/games/tictactoe/classic"
                    className="block text-gray-300 hover:text-blue-400 transition-colors duration-300"
                  >
                    Tic-Tac-Toe Classic
                  </Link>
                  <Link
                    href="/games/tictactoe/ultimate"
                    className="block text-gray-300 hover:text-blue-400 transition-colors duration-300"
                  >
                    Ultimate Tic-Tac-Toe
                  </Link>
                </div>
              </div>

              {/* System Status */}
              <div className="text-center lg:text-right">
                <h4 className="text-lg font-semibold text-white mb-4">
                  System Status
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-center lg:justify-end space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-sm text-gray-300">
                      Game Servers Online
                    </span>
                  </div>
                  <div className="flex items-center justify-center lg:justify-end space-x-2">
                    <div
                      className={`w-2 h-2 rounded-full ${isAuthReady ? "bg-green-400 animate-pulse" : "bg-yellow-400 animate-bounce"}`}
                    />
                    <span className="text-sm text-gray-300">
                      {isAuthReady ? "Multiplayer Ready" : "Connecting..."}
                    </span>
                  </div>
                  <div className="flex items-center justify-center lg:justify-end space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                    <span className="text-sm text-gray-300">
                      Enhanced Graphics
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Copyright */}
            <div className="border-t border-white/10 mt-8 pt-8 text-center">
              <p className="text-gray-400">
                © 2025 Muhammad Thariq. All rights reserved. Built with
                Next.js, TypeScript & Tailwind CSS.
              </p>
            </div>
          </div>
        </footer>
      )}

      {/* Message Box */}
      {messageBox.message && (
        <MessageBox
          message={messageBox.message}
          onConfirm={messageBox.onConfirm}
          showCancel={messageBox.showCancel}
          onCancel={messageBox.onCancel}
        />
      )}

      {/* Debug Info (hidden) */}
      {isAuthReady && userId && (
        <div className="hidden">
          <p className="text-gray-400 text-sm break-words">
            User ID: <span className="font-mono text-xs">{userId}</span>
          </p>
        </div>
      )}
    </ModernLayout>
  );
};

export default HomePageContent;
