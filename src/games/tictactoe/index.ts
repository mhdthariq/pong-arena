// Export all TicTacToe components and game logic
import TicTacToeGame from "./components/TicTacToeGame";
import TicTacToeSettings from "./components/TicTacToeSettings";
import MoveHistory from "./components/MoveHistory";
import UltimateTicTacToeGame from "./components/UltimateTicTacToeGame";

// Export game logic
import * as gameLogic from "./lib/gameLogic";
import * as types from "./lib/types";

// Re-export everything
export {
  TicTacToeGame,
  TicTacToeSettings,
  MoveHistory,
  UltimateTicTacToeGame,
  gameLogic,
  types,
};

// Export types directly for easier use
export type {
  TicTacToePlayer,
  TicTacToeCell,
  TicTacToeBoard,
  TicTacToeGameState,
  TicTacToeMove,
  GameSettings,
  AIDifficulty,
  GameMode,
  MultiplayerTicTacToeGameState,
  GameStats,
  AIMoveRecommendation,
  AIPersonality,
  UltimateTicTacToeBoard,
  UltimateTicTacToeMove,
} from "./lib/types";

// Default export for easier importing
const TicTacToeExports = {
  Game: TicTacToeGame,
  Settings: TicTacToeSettings,
  MoveHistory: MoveHistory,
  UltimateGame: UltimateTicTacToeGame,
  gameLogic,
  types,
};

export default TicTacToeExports;
