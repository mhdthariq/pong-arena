// React component for the TicTacToe game board and UI
"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  TicTacToePlayer,
  TicTacToeGameState,
  GameSettings,
  AIMoveRecommendation,
  AIPersonality,
} from "../lib/types";
import MoveHistory from "./MoveHistory";
import {
  initializeGameState,
  makeMove,
  getAIMove,
  updateTimeRemaining,
  undoMove,
  redoMove,
  resetGame,
  getRecommendedMove,
} from "../lib/gameLogic";

interface TicTacToeGameProps {
  initialGameState?: TicTacToeGameState;
  customSettings?: Partial<GameSettings>;
  onGameEnd?: (result: { winner: TicTacToePlayer | "draw" | null }) => void;
  playerSymbol?: TicTacToePlayer;
  isAIGame?: boolean;
  aiPersonality?: AIPersonality;
}

const TicTacToeGame: React.FC<TicTacToeGameProps> = ({
  initialGameState,
  customSettings,
  onGameEnd,
  playerSymbol = "X",
  isAIGame = true,
  aiPersonality = "balanced",
}) => {
  const [gameState, setGameState] = useState<TicTacToeGameState>(
    initialGameState || initializeGameState(customSettings),
  );
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [moveRecommendation, setMoveRecommendation] =
    useState<AIMoveRecommendation | null>(null);
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // Update time remaining for timed games
  useEffect(() => {
    if (gameState.settings.timeLimit && !gameState.isGameOver) {
      const intervalId = setInterval(() => {
        setGameState((prev) => updateTimeRemaining(prev));
      }, 100);

      return () => clearInterval(intervalId);
    }
  }, [gameState.settings.timeLimit, gameState.isGameOver]);

  // Handle move recommendations
  const getHint = useCallback(() => {
    if (gameState.isGameOver) return;

    const recommendation = getRecommendedMove(gameState, playerSymbol);
    setMoveRecommendation(recommendation);
    setShowRecommendation(true);

    // Hide recommendation after 3 seconds
    if (timeoutId) clearTimeout(timeoutId);
    const id = setTimeout(() => setShowRecommendation(false), 3000);
    setTimeoutId(id as unknown as NodeJS.Timeout);
  }, [gameState, playerSymbol, timeoutId]);

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
        const aiDifficulty = gameState.settings.aiDifficulty || "medium";

        try {
          const aiMove = getAIMove(
            gameState,
            aiPlayer,
            aiDifficulty,
            aiPersonality,
          );

          if (aiMove) {
            const { row, col } = aiMove;
            const newGameState = makeMove(gameState, row, col);
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
  }, [gameState, isAIGame, playerSymbol, onGameEnd, aiPersonality]);

  // Handle player move
  const handleCellClick = (row: number, col: number) => {
    // Don't allow moves if:
    // - The game is over
    // - It's not the player's turn
    // - The AI is "thinking"
    // - The cell is already occupied
    if (
      gameState.isGameOver ||
      (isAIGame && gameState.currentPlayer !== playerSymbol) ||
      isAIThinking ||
      gameState.board[row][col] !== null
    ) {
      return;
    }

    const newGameState = makeMove(gameState, row, col);
    setGameState(newGameState);
    setShowRecommendation(false);

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

    // Show time remaining if time limit is enabled
    if (gameState.settings.timeLimit && gameState.moveTimeRemaining !== null) {
      const secondsRemaining = Math.ceil(gameState.moveTimeRemaining / 1000);
      return `${gameState.currentPlayer}'s Turn (${secondsRemaining}s)`;
    }

    return `${gameState.currentPlayer}'s Turn`;
  };

  // Handle undo move
  const handleUndo = () => {
    if (isAIGame) {
      // For AI games, undo both the AI's move and the player's move
      let newState = undoMove(gameState);
      if (newState.currentPlayer !== playerSymbol) {
        newState = undoMove(newState);
      }
      setGameState(newState);
    } else {
      // For two-player games, just undo the last move
      setGameState(undoMove(gameState));
    }
    setShowRecommendation(false);
  };

  // Handle redo move
  const handleRedo = () => {
    if (isAIGame) {
      // For AI games, redo both the player's move and the AI's move
      let newState = redoMove(gameState);
      if (newState.currentPlayer === playerSymbol && !newState.isGameOver) {
        // Simulate AI move for redo
        const aiPlayer = playerSymbol === "X" ? "O" : "X";
        const aiDifficulty = gameState.settings.aiDifficulty || "medium";
        try {
          const aiMove = getAIMove(
            newState,
            aiPlayer,
            aiDifficulty,
            aiPersonality,
          );
          if (aiMove) {
            newState = makeMove(newState, aiMove.row, aiMove.col);
          }
        } catch (error) {
          console.error("AI redo error:", error);
        }
      }
      setGameState(newState);
    } else {
      // For two-player games, just redo the last move
      setGameState(redoMove(gameState));
    }
    setShowRecommendation(false);
  };

  // Handle reset game
  const handleReset = () => {
    setGameState(resetGame(gameState));
    setShowRecommendation(false);
  };

  // Calculate cell classnames based on state
  const getCellClassName = (row: number, col: number) => {
    const cell = gameState.board[row][col];
    let className =
      "w-full h-full flex items-center justify-center text-5xl sm:text-6xl md:text-7xl lg:text-7xl font-bold transition-all duration-200";

    // Add border styles - adapt to board size
    const size = gameState.settings.boardSize;
    if (row < size - 1) className += " border-b-[8px] border-gray-500";
    if (col < size - 1) className += " border-r-[8px] border-gray-500";

    // Add player color with hover effects
    if (cell === "X") {
      className += " text-blue-500";
    } else if (cell === "O") {
      className += " text-red-500";
    } else {
      className += " hover:bg-gray-800/70 cursor-pointer";

      // Highlight recommended move
      if (
        showRecommendation &&
        moveRecommendation &&
        moveRecommendation.row === row &&
        moveRecommendation.col === col
      ) {
        className += " bg-green-800/40 animate-pulse";
      }
    }

    // Highlight winning cells with more prominent effect
    if (
      gameState.winningLine &&
      gameState.winningLine.some(([r, c]) => r === row && c === col)
    ) {
      className += " bg-green-900/50";
    }

    return className;
  };

  // Calculate aspect ratio based on board size
  const boardSize = gameState.settings.boardSize;
  const gridTemplateStyle = {
    gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
    gridTemplateRows: `repeat(${boardSize}, 1fr)`,
  };

  return (
    <div className="flex flex-col items-center justify-center w-full mx-auto">
      {/* Game status */}
      <div className="mb-4 text-2xl sm:text-3xl font-bold text-gray-200">
        {getGameStatus()}
      </div>

      {/* Game mode and settings info */}
      <div className="mb-6 flex flex-wrap justify-center gap-4 text-sm text-gray-300">
        <div>
          Mode:{" "}
          {gameState.settings.gameMode.charAt(0).toUpperCase() +
            gameState.settings.gameMode.slice(1)}
        </div>
        <div>
          Board: {gameState.settings.boardSize}x{gameState.settings.boardSize}
        </div>
        {isAIGame && (
          <div>
            AI:{" "}
            {gameState.settings.aiDifficulty
              ? gameState.settings.aiDifficulty.charAt(0).toUpperCase() +
                gameState.settings.aiDifficulty.slice(1)
              : "Medium"}
          </div>
        )}
      </div>

      {/* Game board */}
      <div className="w-[min(90vmin,500px)] h-[min(90vmin,500px)] mx-auto bg-gray-900 rounded-xl overflow-hidden shadow-xl border-4 border-gray-700">
        <div className="grid w-full h-full" style={gridTemplateStyle}>
          {gameState.board.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={getCellClassName(rowIndex, colIndex)}
                onClick={() => handleCellClick(rowIndex, colIndex)}
              >
                {cell}
              </div>
            )),
          )}
        </div>
      </div>

      {/* Move recommendation display */}
      {showRecommendation && moveRecommendation && (
        <div className="mt-4 text-center p-2 bg-gray-800/50 rounded-lg">
          <p className="text-green-400 font-semibold">
            Recommended move: ({moveRecommendation.row + 1},{" "}
            {moveRecommendation.col + 1})
          </p>
          <p className="text-sm text-gray-300">
            {moveRecommendation.reasoning} (Confidence:{" "}
            {moveRecommendation.confidence}%)
          </p>
        </div>
      )}

      {/* Game controls */}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          onClick={handleUndo}
          disabled={gameState.moveHistory.length === 0}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Undo
        </button>
        <button
          onClick={handleRedo}
          disabled={gameState.historyIndex >= gameState.boardHistory.length - 1}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Redo
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-lg"
        >
          Reset
        </button>
        <button
          onClick={getHint}
          disabled={
            gameState.isGameOver ||
            (isAIGame && gameState.currentPlayer !== playerSymbol)
          }
          className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Hint
        </button>
      </div>

      {/* Move history display */}
      <MoveHistory moves={gameState.moveHistory} maxHeight="200px" />
    </div>
  );
};

export default TicTacToeGame;
