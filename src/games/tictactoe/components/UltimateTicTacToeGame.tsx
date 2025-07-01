// Ultimate Tic-Tac-Toe Game Component
"use client";

import React, { useState, useEffect } from "react";
import { TicTacToePlayer, AIPersonality } from "../lib/types";
import {
  initializeUltimateGame,
  makeUltimateMove,
  getUltimateAIMove,
  UltimateTicTacToeBoard,
} from "../lib/gameLogic";

interface UltimateTicTacToeGameProps {
  difficulty?: "easy" | "medium" | "hard" | "impossible";
  playerSymbol?: TicTacToePlayer;
  isAIGame?: boolean;
  aiPersonality?: AIPersonality;
  onGameEnd?: (result: { winner: TicTacToePlayer | "draw" | null }) => void;
}

const UltimateTicTacToeGame: React.FC<UltimateTicTacToeGameProps> = ({
  difficulty = "medium",
  playerSymbol = "X",
  isAIGame = true,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  aiPersonality = "balanced", // Pass this to more advanced AI implementations
  onGameEnd,
}) => {
  const [gameState, setGameState] = useState<UltimateTicTacToeBoard>(
    initializeUltimateGame(),
  );
  const [isAIThinking, setIsAIThinking] = useState(false);
  // We'll use this in future to highlight the active board on hover
  const [, /* activeBoard */ setActiveBoard] = useState<{
    mainRow: number;
    mainCol: number;
  } | null>(null);

  // AI moves
  useEffect(() => {
    if (
      isAIGame &&
      !gameState.isGameOver &&
      gameState.currentPlayer !== playerSymbol
    ) {
      // Simulate AI "thinking" time for better UX
      setIsAIThinking(true);
      const timer = setTimeout(() => {
        const aiPlayer = playerSymbol === "X" ? "O" : "X";

        try {
          const aiMove = getUltimateAIMove(gameState, aiPlayer, difficulty);

          if (aiMove) {
            const { mainRow, mainCol, subRow, subCol } = aiMove;
            const newGameState = makeUltimateMove(
              gameState,
              mainRow,
              mainCol,
              subRow,
              subCol,
            );
            setGameState(newGameState);

            if (newGameState.isGameOver && onGameEnd) {
              onGameEnd({ winner: newGameState.winner });
            }
          }
        } catch (error) {
          console.error("AI move error:", error);
        } finally {
          setIsAIThinking(false);
        }
      }, 750); // Delay AI move by 750ms to simulate thinking

      return () => clearTimeout(timer);
    }
  }, [gameState, isAIGame, playerSymbol, difficulty, onGameEnd]);

  // Handle player move
  const handleCellClick = (
    mainRow: number,
    mainCol: number,
    subRow: number,
    subCol: number,
  ) => {
    // Don't allow moves if:
    // - The game is over
    // - It's not the player's turn
    // - The AI is "thinking"
    // - The move is not valid based on the next board to play
    if (
      gameState.isGameOver ||
      (isAIGame && gameState.currentPlayer !== playerSymbol) ||
      isAIThinking ||
      (gameState.nextBoardToPlay !== null &&
        (gameState.nextBoardToPlay.row !== mainRow ||
          gameState.nextBoardToPlay.col !== mainCol)) ||
      gameState.mainBoard[mainRow][mainCol] !== null ||
      gameState.subBoards[mainRow][mainCol][subRow][subCol] !== null
    ) {
      return;
    }

    const newGameState = makeUltimateMove(
      gameState,
      mainRow,
      mainCol,
      subRow,
      subCol,
    );
    setGameState(newGameState);

    if (newGameState.isGameOver && onGameEnd) {
      onGameEnd({ winner: newGameState.winner });
    }
  };

  // Get message based on game state
  const getGameStatus = () => {
    if (gameState.isGameOver) {
      if (gameState.winner === "draw") {
        return "Game ended in a draw!";
      } else if (gameState.winner) {
        return `Player ${gameState.winner} wins!`;
      }
    }

    if (isAIThinking) {
      return "AI is thinking...";
    }

    if (gameState.nextBoardToPlay) {
      return `${gameState.currentPlayer}'s Turn (Board ${
        gameState.nextBoardToPlay.row + 1
      },${gameState.nextBoardToPlay.col + 1})`;
    }

    return `${gameState.currentPlayer}'s Turn (Any Board)`;
  };

  // Get hover state for a main board
  const getMainBoardHoverState = (mainRow: number, mainCol: number) => {
    // If there's a next board to play, only that board should be highlighted
    if (
      gameState.nextBoardToPlay &&
      (gameState.nextBoardToPlay.row !== mainRow ||
        gameState.nextBoardToPlay.col !== mainCol)
    ) {
      return "opacity-50";
    }

    // If the board is already won, it should be less interactive
    if (gameState.mainBoard[mainRow][mainCol] !== null) {
      return "opacity-70";
    }

    return "";
  };

  // Get the class for a main board based on its status
  const getMainBoardClass = (mainRow: number, mainCol: number) => {
    let className = "border-4 ";

    // Style based on winner of this board
    const boardWinner = gameState.mainBoard[mainRow][mainCol];
    if (boardWinner === "X") {
      className += "border-blue-600 bg-blue-900/20 ";
    } else if (boardWinner === "O") {
      className += "border-red-600 bg-red-900/20 ";
    } else if (boardWinner === "draw") {
      className += "border-yellow-600 bg-yellow-900/20 ";
    } else {
      className += "border-gray-600 ";
    }

    // Highlight the active or next board to play
    if (
      gameState.nextBoardToPlay &&
      gameState.nextBoardToPlay.row === mainRow &&
      gameState.nextBoardToPlay.col === mainCol
    ) {
      className += "ring-4 ring-green-400 ";
    }

    // Apply hover state
    className += getMainBoardHoverState(mainRow, mainCol);

    return className;
  };

  // Calculate cell classnames based on state
  const getCellClassName = (
    mainRow: number,
    mainCol: number,
    subRow: number,
    subCol: number,
  ) => {
    const cell = gameState.subBoards[mainRow][mainCol][subRow][subCol];
    let className =
      "w-full h-full flex items-center justify-center text-2xl sm:text-3xl font-bold transition-all duration-200";

    // Add border styles
    if (subRow < 2) className += " border-b-2 border-gray-500";
    if (subCol < 2) className += " border-r-2 border-gray-500";

    // Add player color with hover effects
    if (cell === "X") {
      className += " text-blue-500";
    } else if (cell === "O") {
      className += " text-red-500";
    } else {
      // Only make the cell interactive if:
      // 1. The game is not over
      // 2. The main board is not already won
      // 3. The next board to play is either null or matches this main board
      const isBoardActive =
        !gameState.isGameOver &&
        gameState.mainBoard[mainRow][mainCol] === null &&
        (gameState.nextBoardToPlay === null ||
          (gameState.nextBoardToPlay.row === mainRow &&
            gameState.nextBoardToPlay.col === mainCol));

      if (isBoardActive) {
        className += " hover:bg-gray-800/70 cursor-pointer";
      } else {
        className += " cursor-default";
      }
    }

    return className;
  };

  return (
    <div className="flex flex-col items-center justify-center w-full mx-auto">
      {/* Game status */}
      <div className="mb-4 text-2xl sm:text-3xl font-bold text-gray-200">
        {getGameStatus()}
      </div>

      {/* Ultimate TicTacToe board */}
      <div className="w-[min(95vmin,800px)] h-[min(95vmin,800px)] mx-auto bg-gray-900 rounded-xl overflow-hidden shadow-xl border-4 border-gray-700 p-2">
        <div className="grid grid-cols-3 grid-rows-3 gap-2 w-full h-full">
          {/* Main 3x3 grid */}
          {Array.from({ length: 3 }, (_, mainRow) =>
            Array.from({ length: 3 }, (_, mainCol) => (
              <div
                key={`main-${mainRow}-${mainCol}`}
                className={`relative flex flex-col ${getMainBoardClass(
                  mainRow,
                  mainCol,
                )}`}
                onMouseEnter={() => setActiveBoard({ mainRow, mainCol })}
                onMouseLeave={() => setActiveBoard(null)}
              >
                {/* Show board winner as an overlay */}
                {gameState.mainBoard[mainRow][mainCol] && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
                    <span
                      className={`text-6xl font-bold ${
                        gameState.mainBoard[mainRow][mainCol] === "X"
                          ? "text-blue-500"
                          : gameState.mainBoard[mainRow][mainCol] === "O"
                            ? "text-red-500"
                            : "text-yellow-500"
                      }`}
                    >
                      {gameState.mainBoard[mainRow][mainCol] === "draw"
                        ? "="
                        : gameState.mainBoard[mainRow][mainCol]}
                    </span>
                  </div>
                )}

                {/* Sub 3x3 grid */}
                <div className="grid grid-cols-3 grid-rows-3 w-full h-full">
                  {Array.from({ length: 3 }, (_, subRow) =>
                    Array.from({ length: 3 }, (_, subCol) => (
                      <div
                        key={`sub-${mainRow}-${mainCol}-${subRow}-${subCol}`}
                        className={getCellClassName(
                          mainRow,
                          mainCol,
                          subRow,
                          subCol,
                        )}
                        onClick={() =>
                          handleCellClick(mainRow, mainCol, subRow, subCol)
                        }
                      >
                        {gameState.subBoards[mainRow][mainCol][subRow][subCol]}
                      </div>
                    )),
                  )}
                </div>
              </div>
            )),
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-gray-800/30 rounded-lg max-w-md text-center">
        <h3 className="text-lg font-semibold text-gray-200 mb-2">
          How to Play
        </h3>
        <p className="text-gray-300 text-sm">
          Win three boards in a row to win the game. Your move in a board
          determines which board your opponent must play in next. If sent to a
          completed board, your opponent may play in any available board.
        </p>
      </div>
    </div>
  );
};

export default UltimateTicTacToeGame;
