"use client";

import React, { useState, useEffect } from "react";
import {
  createGame,
  joinGame,
  joinGameByCode,
  listenToAvailableGames,
  GameDocument,
  cleanupWaitingGames,
  getUserExistingGame,
  deleteGameRoom,
  getGame,
} from "../../../firebase/gameService";
import {
  getFirebaseClient,
  setupFirebaseAuthListener,
} from "../../../firebase/firebaseClient";
import { resetBallState } from "../../../lib/gameLogic";
import {
  CANVAS_HEIGHT,
  PADDLE_HEIGHT,
  CANVAS_WIDTH,
  PADDLE_WIDTH,
} from "../../../lib/constants"; // Added CANVAS_WIDTH for initial paddle pos
import MessageBox from "../../../components/MessageBox";
import { useRouter } from "next/navigation";
import { Firestore } from "firebase/firestore";
import { Auth } from "firebase/auth";

const MultiplayerLobbyPage = () => {
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

  const clearMessageBox = () =>
    setMessageBox({ message: "", onConfirm: () => {} });

  const [availableGames, setAvailableGames] = useState<
    (GameDocument & { id: string })[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [creatingGame, setCreatingGame] = useState<boolean>(false);
  const [joiningByCode, setJoiningByCode] = useState<boolean>(false);
  const [gameCode, setGameCode] = useState<string>("");
  const [hasExistingGame, setHasExistingGame] = useState<boolean>(false);
  const [existingGameId, setExistingGameId] = useState<string | null>(null);

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

  useEffect(() => {
    if (db) {
      // Clean up expired games when the lobby is loaded
      cleanupWaitingGames(db, 30); // 30-minute timeout
    }
  }, [db]);

  useEffect(() => {
    if (!isAuthReady || !db) {
      setLoading(false);
      return;
    }

    const unsubscribe = listenToAvailableGames(db, (gamesList) => {
      setAvailableGames(gamesList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db, isAuthReady]);

  // Check if user has an existing game
  useEffect(() => {
    if (db && userId) {
      const checkExistingGame = async () => {
        try {
          const gameId = await getUserExistingGame(db, userId);
          setHasExistingGame(!!gameId);
          setExistingGameId(gameId);
        } catch (error) {
          console.error("Error checking for existing game:", error);
        }
      };

      checkExistingGame();
    }
  }, [db, userId]);

  const handleJoinGameClick = async (gameId: string) => {
    if (!db || !userId) {
      setMessageBox({
        message: "Firebase not ready. Please wait.",
        onConfirm: clearMessageBox,
      });
      return;
    }

    try {
      const joined = await joinGame(db, gameId, userId);
      if (joined) {
        router.push(`/multi-player/game/${gameId}`);
      } else {
        setMessageBox({
          message:
            "Game is no longer available, already started, or you are already Player 1 in this game. Refresh to see updated list.",
          onConfirm: clearMessageBox,
        });
      }
    } catch (error) {
      console.error("Error attempting to join game:", error);
      setMessageBox({
        message: `Failed to join game: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        onConfirm: clearMessageBox,
      });
    }
  };

  const handleCreateGame = async () => {
    if (!db || !userId) {
      setMessageBox({
        message: "Firebase authentication not ready. Please wait.",
        onConfirm: clearMessageBox,
      });
      return;
    }

    setCreatingGame(true);
    try {
      // If user already has a game, let them join their existing game
      if (hasExistingGame && existingGameId) {
        router.push(`/multi-player/game/${existingGameId}`);
        setCreatingGame(false);
        return;
      }

      // Double check for existing game to avoid duplicates
      const checkGameId = await getUserExistingGame(db, userId);
      if (checkGameId) {
        setExistingGameId(checkGameId);
        setHasExistingGame(true);
        router.push(`/multi-player/game/${checkGameId}`);
        setCreatingGame(false);
        return;
      }

      const initialGameState = {
        ball: resetBallState(),
        paddle1: {
          x: 0,
          y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
          dy: 0,
        },
        paddle2: {
          x: CANVAS_WIDTH - PADDLE_WIDTH,
          y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
          dy: 0,
        },
        score1: 0,
        score2: 0,
      };

      const newGameId = await createGame(db, userId, initialGameState);

      // Get the full game data to get the game code
      // Check for existing games
      await getUserExistingGame(db, userId);
      setExistingGameId(newGameId);
      setHasExistingGame(true);

      // Get the full game data with the code
      const gameData = await getGame(db, newGameId);
      const gameCode = gameData?.gameCode || "Unknown";

      setMessageBox({
        message: `Game created! Your game code is: ${gameCode}\nShare this code with your opponent to join the game.`,
        onConfirm: () => {
          clearMessageBox();
          router.push(`/multi-player/game/${newGameId}`);
        },
      });
    } catch (error) {
      console.error("Error creating game:", error);
      setMessageBox({
        message: `Failed to create game: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        onConfirm: clearMessageBox,
      });
    } finally {
      setCreatingGame(false);
    }
  };

  // Function to join a game by code
  const handleJoinByCode = async () => {
    if (!db || !userId || !gameCode.trim()) {
      setMessageBox({
        message: "Please enter a valid game code.",
        onConfirm: clearMessageBox,
      });
      return;
    }

    setJoiningByCode(true);
    try {
      const formattedCode = gameCode.toUpperCase().trim();
      const gameId = await joinGameByCode(db, formattedCode, userId);

      if (gameId) {
        router.push(`/multi-player/game/${gameId}`);
      } else {
        setMessageBox({
          message: "Game not found. Please check the code and try again.",
          onConfirm: clearMessageBox,
        });
      }
    } catch (error) {
      console.error("Error joining game by code:", error);
      setMessageBox({
        message: `Failed to join game: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        onConfirm: clearMessageBox,
      });
    } finally {
      setJoiningByCode(false);
    }
  };

  // Function to manually refresh game list
  const handleRefreshGames = async () => {
    if (!db) return;

    setLoading(true);

    try {
      // Clean up expired games
      await cleanupWaitingGames(db, 30);

      // Re-check user's existing game
      if (userId) {
        const gameId = await getUserExistingGame(db, userId);
        setHasExistingGame(!!gameId);
        setExistingGameId(gameId);
      }
    } catch (error) {
      console.error("Error refreshing games:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle game deletion
  const handleDeleteGame = async (gameId: string) => {
    if (!db || !userId) return;

    try {
      const success = await deleteGameRoom(db, gameId, userId);
      if (success) {
        setMessageBox({
          message: "Game room deleted successfully",
          onConfirm: clearMessageBox,
        });

        // Reset existing game state
        setHasExistingGame(false);
        setExistingGameId(null);

        // Refresh the list
        await handleRefreshGames();
      } else {
        setMessageBox({
          message:
            "Failed to delete game room. You can only delete games you created.",
          onConfirm: clearMessageBox,
        });
      }
    } catch (error) {
      console.error("Error deleting game:", error);
      setMessageBox({
        message: `Error deleting game: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        onConfirm: clearMessageBox,
      });
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
      <h1 className="text-5xl font-bold mb-4 tracking-wider text-center">
        Multiplayer Lobby
      </h1>

      {existingGameId && hasExistingGame && (
        <div className="mb-6 text-center">
          <p className="text-xl text-yellow-300 mb-2">
            You have an active game
          </p>
          <p className="text-md text-blue-400 font-mono mb-2">
            Code: {existingGameId}
          </p>
        </div>
      )}

      {/* Responsive container - narrow on mobile, wide but contained on desktop */}
      <div className="w-full max-w-md lg:max-w-6xl mx-auto bg-gradient-to-b from-gray-800/50 to-gray-900/50 p-6 lg:p-8 rounded-xl shadow-xl border border-gray-800">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8">
          {/* Left Column */}
          <div className="lg:col-span-1">
            <div className="flex flex-col h-full">
              <p className="text-gray-400 mb-4 text-center">
                Your User ID:{" "}
                <span className="font-mono text-blue-300 text-xs md:text-sm">
                  {userId?.substring(0, 10) + "..." || "Loading..."}
                </span>
              </p>

              {/* Create Game Button */}
              <button
                onClick={handleCreateGame}
                disabled={
                  !isAuthReady || !userId || !db || !auth || creatingGame
                }
                className={`w-full px-6 py-4 mb-6 text-xl font-semibold rounded-lg shadow-lg transition duration-300 ease-in-out
                          bg-gradient-to-r from-green-500 to-teal-600 text-white
                          disabled:opacity-50 disabled:cursor-not-allowed
                          hover:enabled:from-green-600 hover:enabled:to-teal-700 hover:enabled:transform hover:enabled:scale-105`}
              >
                {hasExistingGame
                  ? "Go to Your Game"
                  : creatingGame
                  ? "Creating Game..."
                  : "Create New Game"}
              </button>

              {/* Join by Code Section */}
              <div className="bg-gray-800/80 rounded-lg p-6 shadow-xl mb-6 border border-gray-700">
                <h3 className="text-2xl font-bold mb-4 text-center">
                  Join with Code
                </h3>
                <div className="flex flex-col space-y-3">
                  <input
                    type="text"
                    value={gameCode}
                    onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                    placeholder="ENTER 6-DIGIT CODE"
                    maxLength={6}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border-2 border-gray-600 focus:border-blue-500 focus:outline-none text-center text-2xl tracking-wider uppercase"
                  />
                  <button
                    onClick={handleJoinByCode}
                    disabled={
                      joiningByCode || !gameCode || gameCode.length !== 6
                    }
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
                  >
                    {joiningByCode ? "Joining..." : "Join Game"}
                  </button>
                </div>
              </div>

              <button
                onClick={() => router.push("/")}
                className="mt-auto px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 transform hover:scale-105 shadow-lg text-lg w-full"
              >
                Back to Home
              </button>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1 mt-6 lg:mt-0">
            <div className="bg-gray-800/80 rounded-lg p-6 shadow-xl border border-gray-700 h-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-center">
                  Available Games
                </h3>
                <button
                  onClick={handleRefreshGames}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center"
                  title="Refresh game list"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </button>
              </div>
              {loading ? (
                <div className="py-8 text-center">
                  <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
                  <p className="mt-4 text-gray-400 text-lg">Loading games...</p>
                </div>
              ) : availableGames.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <p className="text-gray-400 text-center text-xl mb-4">
                    No games available
                  </p>
                  <p className="text-gray-500 text-center">
                    Be the first to create one!
                  </p>
                </div>
              ) : (
                <ul className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                  {availableGames.map((game) => (
                    <li
                      key={game.id}
                      className="flex justify-between items-center bg-gray-700 p-4 rounded-lg shadow-md border border-gray-600 hover:border-blue-500 transition-all"
                    >
                      <div className="flex flex-col">
                        <span className="text-xl font-bold text-white">
                          {game.gameCode || "XXXXXX"}
                        </span>
                        <span className="text-xs text-gray-400">
                          Created:{" "}
                          {game.createdAt
                            ? new Date(
                                game.createdAt.toMillis()
                              ).toLocaleTimeString()
                            : "unknown"}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <button
                          onClick={() => handleJoinGameClick(game.id)}
                          disabled={game.player1Id === userId}
                          className={`px-4 py-2 text-white rounded-md transition duration-150 ease-in-out
                                   ${
                                     game.player1Id === userId
                                       ? "bg-gray-500"
                                       : "bg-blue-600 hover:bg-blue-700"
                                   }
                                   disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {game.player1Id === userId ? "Your Game" : "Join"}
                        </button>

                        {/* Delete Game Button - only visible for the game creator */}
                        {game.player1Id === userId && (
                          <button
                            onClick={() => handleDeleteGame(game.id)}
                            className="ml-3 p-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-all duration-200"
                            title="Delete Game"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {/* Refresh Button - Always visible, placed at the bottom of the column */}
              <div className="mt-4">
                <button
                  onClick={handleRefreshGames}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-all duration-200 flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                      Refreshing...
                    </>
                  ) : (
                    "Refresh Game List"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <MessageBox {...messageBox} />
    </main>
  );
};

export default MultiplayerLobbyPage;
