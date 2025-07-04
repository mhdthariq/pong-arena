// Player types
export type TicTacToePlayer = "X" | "O";

// Board cell types (null means empty)
export type TicTacToeCell = TicTacToePlayer | null;

// Game board - now configurable size (default 3x3, but can be larger)
export type TicTacToeBoard = TicTacToeCell[][];

// Move information type
export interface TicTacToeMove {
  row: number;
  col: number;
  player: TicTacToePlayer;
  timestamp: number;
}

// Game modes
export type GameMode = "classic" | "ultimate" | "misere";

// Difficulty levels for AI
export type AIDifficulty = "easy" | "medium" | "hard" | "impossible";

// Game settings
export interface GameSettings {
  boardSize: number; // Size of the board (3 for 3x3, 5 for 5x5, etc.)
  winLength: number; // How many in a row needed to win
  gameMode: GameMode; // Game mode
  timeLimit: number | null; // Time limit in seconds for each move (null = no limit)
  firstPlayer: "X" | "O" | "random"; // Who goes first
  aiDifficulty?: AIDifficulty; // Difficulty level for AI (if playing against AI)
}

// Default settings
export const DEFAULT_SETTINGS: GameSettings = {
  boardSize: 3,
  winLength: 3,
  gameMode: "classic",
  timeLimit: null,
  firstPlayer: "X",
  aiDifficulty: "medium",
};

// Game state type
export interface TicTacToeGameState {
  board: TicTacToeBoard;
  currentPlayer: TicTacToePlayer;
  winner: TicTacToePlayer | "draw" | null;
  winningLine: number[][] | null;
  moveHistory: TicTacToeMove[];
  settings: GameSettings;
  isGameOver: boolean;
  startTime: number;
  lastMoveTime: number | null;
  moveTimeRemaining: number | null; // For timed moves
  boardHistory: TicTacToeBoard[]; // For undo/redo functionality
  historyIndex: number; // Current position in history
}

// Game statistics
export interface GameStats {
  xWins: number;
  oWins: number;
  draws: number;
  totalGames: number;
  averageMovesPerGame: number;
  fastestWin: number; // moves count
  longestGame: number; // moves count
}

// AI move suggestion with confidence
export interface AIMoveRecommendation {
  row: number;
  col: number;
  confidence: number; // 0-100 percentage indicating confidence
  reasoning: string; // Explanation for the move
}

// Multiplayer game state for Firebase
export interface MultiplayerTicTacToeGameState extends TicTacToeGameState {
  player1Id: string;
  player2Id: string | null;
  player1Symbol: TicTacToePlayer;
  player2Symbol: TicTacToePlayer;
  status: "waiting" | "playing" | "finished";
  gameCode: string;
  spectators?: string[];
  chatMessages?: {
    playerId: string;
    message: string;
    timestamp: number;
  }[];
}

// AI personality types that affect play style
export type AIPersonality =
  | "random" // Makes completely random moves
  | "aggressive" // Prioritizes offense
  | "defensive" // Prioritizes blocking
  | "balanced" // Balanced between offense and defense
  | "learning" // Gets better the more you play
  | "strategic" // Thinks several moves ahead
  | "mimicking"; // Tries to copy opponent's style

// Ultimate TicTacToe types (board is a 3x3 grid of 3x3 boards)
export type UltimateTicTacToeMove = {
  mainRow: number;
  mainCol: number;
  subRow: number;
  subCol: number;
  player: TicTacToePlayer;
};

export type UltimateTicTacToeBoard = {
  mainBoard: (TicTacToePlayer | "draw" | null)[][];
  subBoards: TicTacToeBoard[][];
  nextBoardToPlay: { row: number; col: number } | null; // null means player can choose any board
  winner: TicTacToePlayer | "draw" | null;
  currentPlayer: TicTacToePlayer;
  moveHistory: UltimateTicTacToeMove[];
  isGameOver: boolean;
};
