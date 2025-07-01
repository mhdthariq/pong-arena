"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  setupFirebaseAuthListener,
  getFirebaseClient,
} from "../../../../../../shared/firebase/firebaseClient";
import { makeTicTacToeMove } from "../../../../../../shared/firebase/tictactoeService";
import {
  MultiplayerTicTacToeGameState,
  TicTacToePlayer,
} from "../../../../../../games/tictactoe/lib/types";
import { doc, onSnapshot } from "firebase/firestore";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function TicTacToeGamePage({ params, searchParams }: any) {
  const gameId = params.id;
  const gameCode = searchParams.code || "";

  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [gameState, setGameState] =
    useState<MultiplayerTicTacToeGameState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [playerSymbol, setPlayerSymbol] = useState<TicTacToePlayer | null>(
    null,
  );
  const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(false);

  // Setup Firebase and load game
  useEffect(() => {
    const unsubscribeAuth = setupFirebaseAuthListener(
      setUserId,
      setIsAuthReady,
      () => {},
    );

    // Return cleanup function
    return () => {
      unsubscribeAuth();
    };
  }, []);

  // Load game data when auth is ready
  useEffect(() => {
    if (!isAuthReady || !userId) return;

    const { db: firestore } = getFirebaseClient();
    if (!firestore) return;

    setIsLoading(true);
    setError(null);

    // Set up real-time listener for game updates
    const appId = "default-tictactoe-app-id";
    const gameRef = doc(
      firestore,
      `artifacts/${appId}/public/data/tictactoe-games`,
      gameId,
    );

    const unsubscribeGame = onSnapshot(
      gameRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data() as MultiplayerTicTacToeGameState;
          setGameState(data);

          // Determine player symbol
          if (data.player1Id === userId) {
            setPlayerSymbol(data.player1Symbol);
          } else if (data.player2Id === userId) {
            setPlayerSymbol(data.player2Symbol);
          } else {
            setPlayerSymbol(null); // Spectator
          }

          // Determine if it's the player's turn
          setIsPlayerTurn(
            (data.player1Id === userId &&
              data.currentPlayer === data.player1Symbol) ||
              (data.player2Id === userId &&
                data.currentPlayer === data.player2Symbol),
          );

          setIsLoading(false);
        } else {
          setError("Game not found");
          setIsLoading(false);
        }
      },
      (err) => {
        console.error("Error getting game updates:", err);
        setError("Failed to load game updates");
        setIsLoading(false);
      },
    );

    // Return cleanup function
    return () => {
      unsubscribeGame();
    };
  }, [gameId, isAuthReady, userId]);

  // Handle cell click
  const handleCellClick = async (row: number, col: number) => {
    if (
      !gameState ||
      !isPlayerTurn ||
      gameState.isGameOver ||
      gameState.board[row][col] !== null
    ) {
      return;
    }

    try {
      const { db: firestore } = getFirebaseClient();
      if (!firestore || !userId) return;

      await makeTicTacToeMove(firestore, gameId, userId, row, col);
    } catch (error) {
      console.error("Error making move:", error);
    }
  };

  // Copy game code to clipboard
  const copyGameCode = () => {
    if (gameCode) {
      navigator.clipboard.writeText(gameCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  // Get game status message
  const getGameStatusMessage = () => {
    if (!gameState) return "Loading game...";

    if (gameState.status === "waiting") {
      return "Waiting for opponent...";
    } else if (isPlayerTurn) {
      return "Your Turn";
    } else {
      return "Opponent's Turn";
    }
  };

  // Determine if this player is a spectator
  const isSpectator =
    gameState &&
    gameState.player1Id !== userId &&
    gameState.player2Id !== userId;

  return (
    <div className="w-full min-h-screen bg-gray-900 text-white p-4 flex flex-col">
      <header className="w-full max-w-6xl mx-auto pt-4 pb-6">
        <nav className="flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold text-white hover:text-blue-400 transition-colors"
          >
            ← Back to Game Arena
          </Link>
        </nav>
        <h1 className="text-3xl sm:text-4xl font-bold text-center mt-4 mb-8">
          Tic-Tac-Toe Multiplayer
        </h1>
      </header>

      <main className="w-full max-w-4xl mx-auto flex-grow px-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 border-t-2 border-blue-500 border-solid rounded-full animate-spin mx-auto mb-4"></div>
            <p>Loading game...</p>
          </div>
        ) : error ? (
          <div className="bg-gray-800 rounded-xl p-6 sm:p-8 shadow-xl border border-gray-700">
            <div className="text-center py-4 text-red-400">
              <p className="text-xl font-bold mb-4">Error</p>
              <p>{error}</p>
              <Link
                href="/games/tictactoe/multi-player/lobby"
                className="mt-6 inline-block py-2 px-6 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-medium"
              >
                Back to Lobby
              </Link>
            </div>
          </div>
        ) : gameState ? (
          <div className="bg-gray-800 rounded-xl p-6 sm:p-8 shadow-xl border border-gray-700 flex flex-col items-center">
            {/* Game status and info */}
            <div className="mb-8 w-full">
              <div className="flex justify-between items-center mb-4">
                {!gameState.isGameOver && (
                  <div className="text-xl sm:text-2xl font-semibold">
                    {getGameStatusMessage()}
                  </div>
                )}
                {playerSymbol && (
                  <div className="px-4 py-2 bg-gray-700 rounded-full text-lg">
                    You:{" "}
                    <span
                      className={
                        playerSymbol === "X"
                          ? "text-blue-400 font-bold"
                          : "text-red-400 font-bold"
                      }
                    >
                      {playerSymbol}
                    </span>
                  </div>
                )}
                {isSpectator && (
                  <div className="px-4 py-2 bg-gray-700 rounded-full text-lg">
                    Spectating
                  </div>
                )}
              </div>

              {gameState.status === "waiting" && gameCode && (
                <div className="mb-4 p-4 bg-gray-700 rounded-lg">
                  <p className="text-sm sm:text-base mb-2">
                    Invite a friend with this code:
                  </p>
                  <div className="flex items-center">
                    <div className="bg-gray-900 py-2 px-4 rounded-lg font-mono text-xl sm:text-2xl flex-grow text-center">
                      {gameCode}
                    </div>
                    <button
                      onClick={copyGameCode}
                      className="ml-3 p-3 bg-blue-600 hover:bg-blue-700 rounded-lg"
                      aria-label="Copy game code"
                    >
                      {copySuccess ? "✓" : "Copy"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Game board */}
            <div className="w-[min(90vmin,500px)] h-[min(90vmin,500px)] mx-auto bg-gray-900 rounded-xl overflow-hidden shadow-xl border-4 border-gray-700">
              <div className="grid grid-cols-3 grid-rows-3 w-full h-full">
                {gameState.board.map((row, rowIndex) =>
                  row.map((cell, colIndex) => {
                    // Calculate cell className
                    let cellClass =
                      "w-full h-full flex items-center justify-center text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold transition-all duration-200";

                    // Add border styles
                    if (rowIndex < 2)
                      cellClass += " border-b-[12px] border-gray-500";
                    if (colIndex < 2)
                      cellClass += " border-r-[12px] border-gray-500";

                    // Add player color
                    if (cell === "X") {
                      cellClass += " text-blue-500";
                    } else if (cell === "O") {
                      cellClass += " text-red-500";
                    } else if (
                      isPlayerTurn &&
                      !gameState.isGameOver &&
                      !isSpectator
                    ) {
                      cellClass += " hover:bg-gray-800/70 cursor-pointer";
                    }

                    // Highlight winning cells
                    if (
                      gameState.winningLine &&
                      gameState.winningLine.some(
                        ([r, c]) => r === rowIndex && c === colIndex,
                      )
                    ) {
                      cellClass += " bg-green-900/50";
                    }

                    return (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className={cellClass}
                        onClick={() => handleCellClick(rowIndex, colIndex)}
                      >
                        {cell}
                      </div>
                    );
                  }),
                )}
              </div>
            </div>

            {/* Game finished actions */}
            {gameState.isGameOver && (
              <div className="mt-8 text-center w-full">
                <h2 className="text-4xl font-bold mb-8 animate-bounce">
                  {gameState.winner === "draw"
                    ? "🤝 Game Draw! 🤝"
                    : gameState.winner === playerSymbol
                      ? "🎉 You Win! 🎉"
                      : "😢 Opponent Wins! 😢"}
                </h2>
                <Link
                  href="/games/tictactoe/multi-player/lobby"
                  className="inline-block py-4 px-10 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-xl font-medium transition-colors shadow-lg transform hover:scale-105"
                >
                  Back to Lobby
                </Link>
              </div>
            )}
          </div>
        ) : null}
      </main>

      {/* Footer completely removed from gameplay */}
    </div>
  );
}
