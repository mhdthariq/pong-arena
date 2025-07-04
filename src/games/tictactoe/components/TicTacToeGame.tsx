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
import GlassmorphicCard from "../../../shared/components/GlassmorphicCard";
import ModernButton from "../../../shared/components/ModernButton";

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
        return "Game ended in a draw! 🤝";
      } else if (gameState.winner) {
        return `Player ${gameState.winner} wins! 🏆`;
      }
    }

    if (isAIThinking) {
      return "AI is thinking... 🤔";
    }

    // Show time remaining if time limit is enabled
    if (gameState.settings.timeLimit && gameState.moveTimeRemaining !== null) {
      const secondsRemaining = Math.ceil(gameState.moveTimeRemaining / 1000);
      return `${gameState.currentPlayer}'s Turn (${secondsRemaining}s) ⏱️`;
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
      "w-full h-full flex items-center justify-center text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold transition-all duration-300";

    // Add border styles - adapt to board size with glassmorphism
    const size = gameState.settings.boardSize;
    if (row < size - 1) className += " border-b-[2px] border-white/10";
    if (col < size - 1) className += " border-r-[2px] border-white/10";

    // Add player color with hover effects
    if (cell === "X") {
      className += " text-blue-400 drop-shadow-glow";
    } else if (cell === "O") {
      className += " text-red-400 drop-shadow-glow";
    } else {
      className += " hover:bg-white/10 cursor-pointer";

      // Highlight recommended move
      if (
        showRecommendation &&
        moveRecommendation &&
        moveRecommendation.row === row &&
        moveRecommendation.col === col
      ) {
        className += " bg-green-500/20 animate-pulse-slow";
      }
    }

    // Highlight winning cells with more prominent effect
    if (
      gameState.winningLine &&
      gameState.winningLine.some(([r, c]) => r === row && c === col)
    ) {
      className += " bg-green-500/30 animate-pulse-slow";
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
    <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center w-full max-w-7xl mx-auto gap-8 lg:gap-12">
      {/* Left side - Game Info and Controls */}
      <div className="flex flex-col items-center lg:items-start w-full lg:w-auto lg:min-w-[300px] order-2 lg:order-1">
        {/* Game status */}
        <div className="mb-6 text-2xl sm:text-3xl lg:text-4xl font-bold text-white drop-shadow-glow text-center lg:text-left">
          {getGameStatus()}
        </div>

        {/* Game mode and settings info */}
        <div className="mb-8 flex flex-wrap justify-center lg:justify-start gap-4 text-sm text-blue-200">
          <div className="px-4 py-2 glass rounded-full flex items-center">
            <span className="w-2 h-2 rounded-full bg-blue-400 mr-2"></span>
            Mode:{" "}
            <span className="ml-1 font-medium">
              {gameState.settings.gameMode.charAt(0).toUpperCase() +
                gameState.settings.gameMode.slice(1)}
            </span>
          </div>
          <div className="px-4 py-2 glass rounded-full flex items-center">
            <span className="w-2 h-2 rounded-full bg-purple-400 mr-2"></span>
            Board:{" "}
            <span className="ml-1 font-medium">
              {gameState.settings.boardSize}x{gameState.settings.boardSize}
            </span>
          </div>
          {isAIGame && (
            <div className="px-4 py-2 glass rounded-full flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-400 mr-2"></span>
              AI:{" "}
              <span className="ml-1 font-medium">
                {gameState.settings.aiDifficulty
                  ? gameState.settings.aiDifficulty.charAt(0).toUpperCase() +
                    gameState.settings.aiDifficulty.slice(1)
                  : "Medium"}
              </span>
            </div>
          )}
        </div>

        {/* Game controls */}
        <div className="mb-8 flex flex-wrap justify-center lg:justify-start gap-3">
          <ModernButton
            variant="glass"
            size="md"
            rounded="lg"
            onClick={handleUndo}
            isDisabled={gameState.moveHistory.length === 0}
            leftIcon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
            }
          >
            Undo
          </ModernButton>
          <ModernButton
            variant="glass"
            size="md"
            rounded="lg"
            onClick={handleRedo}
            isDisabled={
              gameState.historyIndex >= gameState.boardHistory.length - 1
            }
            leftIcon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            }
          >
            Redo
          </ModernButton>
          <ModernButton
            variant="danger"
            size="md"
            rounded="lg"
            onClick={handleReset}
            leftIcon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                  clipRule="evenodd"
                />
              </svg>
            }
          >
            Reset
          </ModernButton>
          <ModernButton
            variant="success"
            size="md"
            rounded="lg"
            onClick={getHint}
            isDisabled={
              gameState.isGameOver ||
              (isAIGame && gameState.currentPlayer !== playerSymbol)
            }
            leftIcon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            }
          >
            Hint
          </ModernButton>
        </div>

        {/* Move recommendation display */}
        {showRecommendation && moveRecommendation && (
          <GlassmorphicCard
            className="mb-6 text-center lg:text-left animate-fade-in w-full max-w-sm"
            blur="md"
            opacity="medium"
            padding="md"
            rounded="lg"
          >
            <p className="text-green-400 font-semibold flex items-center justify-center lg:justify-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                  clipRule="evenodd"
                />
              </svg>
              Recommended move: ({moveRecommendation.row + 1},{" "}
              {moveRecommendation.col + 1})
            </p>
            <p className="text-sm text-blue-200 mt-1">
              {moveRecommendation.reasoning} (Confidence:{" "}
              {moveRecommendation.confidence}%)
            </p>
          </GlassmorphicCard>
        )}

        {/* Move history display */}
        <GlassmorphicCard
          className="w-full max-w-sm"
          blur="sm"
          opacity="low"
          padding="md"
          rounded="lg"
        >
          <MoveHistory moves={gameState.moveHistory} maxHeight="300px" />
        </GlassmorphicCard>
      </div>

      {/* Center - Game board */}
      <div className="flex-shrink-0 order-1 lg:order-2">
        <GlassmorphicCard
          className="w-[min(90vmin,400px)] h-[min(90vmin,400px)] lg:w-[500px] lg:h-[500px] xl:w-[600px] xl:h-[600px] mx-auto overflow-hidden p-0 backdrop-blur-xl relative"
          blur="lg"
          opacity="medium"
          shadow="xl"
          rounded="xl"
          padding="none"
          border={true}
        >
          <div
            className="grid w-full h-full relative z-10"
            style={gridTemplateStyle}
          >
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

          {/* Add subtle glow effect behind the board */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 z-0"></div>
        </GlassmorphicCard>
      </div>

      {/* Right side - Additional space for future features */}
      <div className="hidden xl:flex flex-col items-center w-full max-w-[300px] order-3">
        {/* This space can be used for additional game features in the future */}
        <div className="text-center text-blue-200/50 text-sm">
          {/* Placeholder for future features */}
        </div>
      </div>
    </div>
  );
};

export default TicTacToeGame;
