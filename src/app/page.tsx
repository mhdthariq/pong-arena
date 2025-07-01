"use client";

import React, { useState, useEffect } from "react";
import {
  setupFirebaseAuthListener,
  getFirebaseClient,
} from "../shared/firebase/firebaseClient";
import MessageBox from "../shared/components/MessageBox";
import { useRouter } from "next/navigation";
import { Firestore } from "firebase/firestore";
import { Auth } from "firebase/auth";

const HomePageContent = () => {
  const [db, setDb] = useState<Firestore | null>(null);
  const [auth, setAuth] = useState<Auth | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
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
      setMessageBox
    );
    return () => unsubscribeAuth();
  }, []);

  // Game selection handlers
  const selectPongSinglePlayer = () => {
    router.push("/games/pong/single-player");
  };

  const selectPongMultiplayer = () => {
    if (isAuthReady && userId && db && auth) {
      router.push("/games/pong/multi-player/lobby");
    } else {
      setMessageBox({
        message:
          "Firebase authentication not ready. Please wait or check your connection.",
        onConfirm: () => setMessageBox({ message: "", onConfirm: () => {} }),
      });
    }
  };

  const selectTicTacToeSinglePlayer = () => {
    router.push("/games/tictactoe/single-player");
  };

  const selectTicTacToeMultiplayer = () => {
    if (isAuthReady && userId && db && auth) {
      router.push("/games/tictactoe/multi-player/lobby");
    } else {
      setMessageBox({
        message:
          "Firebase authentication not ready. Please wait or check your connection.",
        onConfirm: () => setMessageBox({ message: "", onConfirm: () => {} }),
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col">
      <main className="flex-grow flex flex-col items-center justify-center px-4 py-8">
        <h1 className="text-4xl sm:text-5xl font-bold mb-8 sm:mb-10 text-center text-white">
          Game Arena
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto w-full">
          {/* Pong Game Card */}
          <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="relative h-48 bg-gradient-to-br from-blue-600 to-blue-900">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-16 bg-white rounded-full"></div>
                <div className="w-3 h-3 bg-white rounded-full mx-8 animate-pulse"></div>
                <div className="w-4 h-16 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-white">Pong</h2>
              <p className="text-gray-300 mb-6">
                Classic arcade game where you control a paddle to bounce a ball
                past your opponent&apos;s paddle.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={selectPongSinglePlayer}
                  className="flex-1 py-3 px-4 rounded-lg font-medium bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white transition-colors"
                >
                  Player vs. AI
                </button>
                <button
                  onClick={selectPongMultiplayer}
                  disabled={!isAuthReady || !userId || !db || !auth}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors
                                  bg-gradient-to-r from-purple-600 to-indigo-700 text-white
                                  ${
                                    !isAuthReady || !userId || !db || !auth
                                      ? "opacity-50 cursor-not-allowed"
                                      : "hover:from-purple-700 hover:to-indigo-800"
                                  }`}
                >
                  Multiplayer
                </button>
              </div>
            </div>
          </div>

          {/* Tic-Tac-Toe Game Card */}
          <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="relative h-48 bg-gradient-to-br from-red-600 to-purple-900">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="grid grid-cols-3 gap-2 w-36 h-36">
                  <div className="bg-white/10 rounded-md flex items-center justify-center text-3xl text-blue-400 font-bold">
                    X
                  </div>
                  <div className="bg-white/10 rounded-md"></div>
                  <div className="bg-white/10 rounded-md flex items-center justify-center text-3xl text-red-400 font-bold">
                    O
                  </div>
                  <div className="bg-white/10 rounded-md"></div>
                  <div className="bg-white/10 rounded-md flex items-center justify-center text-3xl text-blue-400 font-bold">
                    X
                  </div>
                  <div className="bg-white/10 rounded-md"></div>
                  <div className="bg-white/10 rounded-md"></div>
                  <div className="bg-white/10 rounded-md"></div>
                  <div className="bg-white/10 rounded-md flex items-center justify-center text-3xl text-red-400 font-bold">
                    O
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-white">
                Tic-Tac-Toe
              </h2>
              <p className="text-gray-300 mb-6">
                Classic game of X&apos;s and O&apos;s. Form a line of three to
                win against AI or another player.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={selectTicTacToeSinglePlayer}
                  className="flex-1 py-3 px-4 rounded-lg font-medium bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white transition-colors"
                >
                  Player vs. AI
                </button>
                <button
                  onClick={selectTicTacToeMultiplayer}
                  disabled={!isAuthReady || !userId || !db || !auth}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors
                                  bg-gradient-to-r from-purple-600 to-indigo-700 text-white
                                  ${
                                    !isAuthReady || !userId || !db || !auth
                                      ? "opacity-50 cursor-not-allowed"
                                      : "hover:from-purple-700 hover:to-indigo-800"
                                  }`}
                >
                  Multiplayer
                </button>
              </div>
            </div>
          </div>
        </div>

        {!isAuthReady && (
          <p className="text-gray-400 mt-6 text-sm sm:text-base text-center">
            Initializing Firebase for multiplayer...
          </p>
        )}
        {isAuthReady && !userId && (
          <p className="text-red-400 mt-6 text-sm sm:text-base text-center">
            Failed to authenticate for multiplayer. Please check console for
            errors.
          </p>
        )}
        {messageBox.message && (
          <MessageBox
            message={messageBox.message}
            onConfirm={messageBox.onConfirm}
            showCancel={messageBox.showCancel}
            onCancel={messageBox.onCancel}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 py-6 mt-auto">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="text-center sm:text-left mb-4 sm:mb-0">
              <p className="text-gray-300">
                © 2025 Muhammad Thariq. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-4">
              <a
                href="mailto:muhammad.thariq@example.com"
                className="text-gray-300 hover:text-white transition-colors"
                title="Email"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
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
                href="https://github.com/muhammad-thariq"
                className="text-gray-300 hover:text-white transition-colors"
                title="GitHub"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
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
                href="https://linkedin.com/in/muhammad-thariq"
                className="text-gray-300 hover:text-white transition-colors"
                title="LinkedIn"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14m-.5 15.5v-5.3a3.26 3.26 0 00-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 011.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 001.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 00-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {isAuthReady && userId && (
        <p className="text-gray-400 text-sm mt-6 break-words hidden">
          Your User ID:{" "}
          <span className="font-mono text-xs sm:text-sm">{userId}</span>
        </p>
      )}
      <MessageBox {...messageBox} />
    </div>
  );
};

export default HomePageContent;
