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
      "w-full h-full flex items-center justify-center text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold transition-all duration-200";

    // Add border styles
    if (subRow < 2) className += " border-b-2 border-gray-400/50";
    if (subCol < 2) className += " border-r-2 border-gray-400/50";

    // Add player color with hover effects
    if (cell === "X") {
      className += " text-blue-400 drop-shadow-glow";
    } else if (cell === "O") {
      className += " text-red-400 drop-shadow-glow";
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
        className += " hover:bg-white/10 cursor-pointer";
      } else {
        className += " cursor-default opacity-60";
      }
    }

    return className;
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-7xl mx-auto px-4">
      {/* Game status */}
      <div className="mb-6 text-2xl sm:text-3xl lg:text-4xl font-bold text-white drop-shadow-glow text-center">
        {getGameStatus()}
      </div>

      {/* Ultimate TicTacToe board */}
      <div className="w-[min(95vmin,600px)] h-[min(95vmin,600px)] lg:w-[700px] lg:h-[700px] xl:w-[800px] xl:h-[800px] mx-auto bg-gray-900/80 backdrop-blur-lg rounded-xl overflow-hidden shadow-2xl border-4 border-gray-600/50 p-3 lg:p-4">
        <div className="grid grid-cols-3 grid-rows-3 gap-3 lg:gap-4 w-full h-full">
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
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-10 rounded-lg">
                    <span
                      className={`text-4xl lg:text-5xl xl:text-6xl font-bold drop-shadow-glow ${
                        gameState.mainBoard[mainRow][mainCol] === "X"
                          ? "text-blue-400"
                          : gameState.mainBoard[mainRow][mainCol] === "O"
                            ? "text-red-400"
                            : "text-yellow-400"
                      }`}
                    >
                      {gameState.mainBoard[mainRow][mainCol] === "draw"
                        ? "="
                        : gameState.mainBoard[mainRow][mainCol]}
                    </span>
                  </div>
                )}

                {/* Sub 3x3 grid */}
                <div className="grid grid-cols-3 grid-rows-3 w-full h-full gap-1">
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
      <div className="mt-8 p-6 glass rounded-xl max-w-2xl text-center mx-auto">
        <h3 className="text-xl font-semibold text-white drop-shadow-glow mb-3">
          How to Play Ultimate Tic-Tac-Toe
        </h3>
        <p className="text-blue-200 text-base leading-relaxed">
          Win three boards in a row to win the game. Your move in a board
          determines which board your opponent must play in next. If sent to a
          completed board, your opponent may play in any available board.
        </p>
        <div className="mt-4 flex justify-center gap-4 text-sm">
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-green-400 mr-2"></span>
            <span className="text-green-300">Active Board</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-blue-400 mr-2"></span>
            <span className="text-blue-300">Player X</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-red-400 mr-2"></span>
            <span className="text-red-300">Player O</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UltimateTicTacToeGame;
