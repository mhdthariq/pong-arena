"use client";

import React, { useState, useEffect } from "react";
import {
  setupFirebaseAuthListener,
  getFirebaseClient,
} from "../firebase/firebaseClient";
import MessageBox from "../components/MessageBox";
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

  const onSinglePlayer = () => {
    router.push("/single-player");
  };

  const onMultiplayer = () => {
    if (isAuthReady && userId && db && auth) {
      router.push("/multi-player/lobby");
    } else {
      setMessageBox({
        message:
          "Firebase authentication not ready. Please wait or check your connection.",
        onConfirm: () => setMessageBox({ message: "", onConfirm: () => {} }),
      });
    }
  };

  return (
    // Main container for the home page content, centered and responsive
    <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl text-center flex flex-col items-center justify-center min-h-[calc(100vh-theme(spacing.24))] mx-auto">
      <h2 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-gray-200">
        Choose Your Battle!
      </h2>
      <div className="space-y-4 w-full">
        {" "}
        {/* Buttons take full width within max-width container */}
        <button
          onClick={onSinglePlayer}
          className="w-full px-8 py-4 text-xl sm:text-2xl font-semibold rounded-lg shadow-lg
                               bg-gradient-to-r from-green-500 to-teal-600 text-white
                               hover:from-green-600 hover:to-teal-700 transition duration-300 ease-in-out transform hover:scale-105"
        >
          Player vs. AI
        </button>
        <button
          onClick={onMultiplayer}
          disabled={!isAuthReady || !userId || !db || !auth}
          className={`w-full px-8 py-4 text-xl sm:text-2xl font-semibold rounded-lg shadow-lg transition duration-300 ease-in-out
                                bg-gradient-to-r from-purple-600 to-indigo-700 text-white
                                ${
                                  !isAuthReady || !userId || !db || !auth
                                    ? "opacity-50 cursor-not-allowed"
                                    : "hover:from-purple-700 hover:to-indigo-800 transform hover:scale-105"
                                }`}
        >
          Player vs. Player (Multiplayer)
        </button>
        {!isAuthReady && (
          <p className="text-gray-400 mt-4 text-sm sm:text-base">
            Initializing Firebase for multiplayer...
          </p>
        )}
        {isAuthReady && !userId && (
          <p className="text-red-400 mt-4 text-sm sm:text-base">
            Failed to authenticate for multiplayer. Please check console for
            errors.
          </p>
        )}
      </div>
      {isAuthReady && userId && (
        <p className="text-gray-400 text-sm mt-6 break-words">
          Your User ID:{" "}
          <span className="font-mono text-xs sm:text-sm">{userId}</span>
        </p>
      )}
      <MessageBox {...messageBox} />
    </div>
  );
};

export default HomePageContent;
