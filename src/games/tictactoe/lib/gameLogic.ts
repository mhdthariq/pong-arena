import {
  TicTacToePlayer,
  TicTacToeCell,
  TicTacToeBoard,
  TicTacToeGameState,
  TicTacToeMove,
  AIDifficulty,
  GameMode,
  GameSettings,
  DEFAULT_SETTINGS,
  AIMoveRecommendation,
  AIPersonality,
} from "./types";

// Initialize an empty board of any size
export function initializeBoard(size: number = 3): TicTacToeBoard {
  const board: TicTacToeBoard = [];
  for (let i = 0; i < size; i++) {
    const row: TicTacToeCell[] = [];
    for (let j = 0; j < size; j++) {
      row.push(null);
    }
    board.push(row);
  }
  return board;
}

// Initialize a new game state with custom settings
export function initializeGameState(
  customSettings?: Partial<GameSettings>,
): TicTacToeGameState {
  const settings: GameSettings = {
    ...DEFAULT_SETTINGS,
    ...customSettings,
  };

  // Determine first player
  let firstPlayer: TicTacToePlayer = "X";
  if (settings.firstPlayer === "random") {
    firstPlayer = Math.random() < 0.5 ? "X" : "O";
  } else if (settings.firstPlayer === "O") {
    firstPlayer = "O";
  }

  const board = initializeBoard(settings.boardSize);

  return {
    board,
    currentPlayer: firstPlayer,
    winner: null,
    winningLine: null,
    moveHistory: [],
    settings,
    isGameOver: false,
    startTime: Date.now(),
    lastMoveTime: null,
    moveTimeRemaining: settings.timeLimit ? settings.timeLimit * 1000 : null,
    boardHistory: [JSON.parse(JSON.stringify(board))], // Deep copy for history
    historyIndex: 0,
  };
}

// Make a move on the board
export function makeMove(
  gameState: TicTacToeGameState,
  row: number,
  col: number,
): TicTacToeGameState {
  // Don't allow moves on finished games or occupied cells
  if (
    gameState.isGameOver ||
    gameState.board[row][col] !== null ||
    row < 0 ||
    row >= gameState.settings.boardSize ||
    col < 0 ||
    col >= gameState.settings.boardSize
  ) {
    return gameState;
  }

  // Check time limit if enabled
  if (
    gameState.settings.timeLimit &&
    gameState.moveTimeRemaining !== null &&
    gameState.moveTimeRemaining <= 0
  ) {
    // Time's up - the current player loses
    return {
      ...gameState,
      winner: gameState.currentPlayer === "X" ? "O" : "X",
      isGameOver: true,
    };
  }

  // Create a deep copy of the game state for immutability
  const newState = JSON.parse(JSON.stringify(gameState)) as TicTacToeGameState;

  // Make the move
  newState.board[row][col] = gameState.currentPlayer;

  // Record the move in history
  const move: TicTacToeMove = {
    row,
    col,
    player: gameState.currentPlayer,
    timestamp: Date.now(),
  };

  newState.moveHistory = [...newState.moveHistory, move];
  newState.lastMoveTime = Date.now();

  // Update time remaining if time limits are enabled
  if (newState.settings.timeLimit) {
    newState.moveTimeRemaining = newState.settings.timeLimit * 1000;
  }

  // If we made any moves after undoing, truncate the future history
  if (newState.historyIndex < newState.boardHistory.length - 1) {
    newState.boardHistory = newState.boardHistory.slice(
      0,
      newState.historyIndex + 1,
    );
  }

  // Add the new board state to history
  newState.boardHistory.push(JSON.parse(JSON.stringify(newState.board)));
  newState.historyIndex = newState.boardHistory.length - 1;

  // Check for a winner
  const winResult = checkWinner(
    newState.board,
    newState.settings.winLength,
    newState.settings.gameMode,
  );

  newState.winner = winResult.winner;
  newState.winningLine = winResult.winningLine;

  // Check if the board is full (a draw)
  const isBoardFull = isFull(newState.board);

  // Update game state
  newState.isGameOver = newState.winner !== null || isBoardFull;

  // If the game is not over, switch turns
  if (!newState.isGameOver) {
    newState.currentPlayer = newState.currentPlayer === "X" ? "O" : "X";
  } else if (isBoardFull && newState.winner === null) {
    // It's a draw
    newState.winner = "draw";
  }

  return newState;
}

// Check if the board is full
function isFull(board: TicTacToeBoard): boolean {
  return board.every((row) => row.every((cell) => cell !== null));
}

// Check for a winner based on game mode
export function checkWinner(
  board: TicTacToeBoard,
  winLength: number = 3,
  gameMode: GameMode = "classic",
): {
  winner: TicTacToePlayer | null;
  winningLine: number[][] | null;
} {
  const size = board.length;

  // Helper function to check a line for a win
  const checkLine = (
    line: number[][],
  ): { winner: TicTacToePlayer | null; winningLine: number[][] | null } => {
    if (line.length < winLength) return { winner: null, winningLine: null };

    let count = 1;
    let currentPlayer = board[line[0][0]][line[0][1]];
    let startIdx = 0;

    for (let i = 1; i < line.length; i++) {
      const [row, col] = line[i];
      const cell = board[row][col];

      if (cell === currentPlayer && cell !== null) {
        count++;
        if (count === winLength) {
          const winningSegment = line.slice(startIdx, startIdx + winLength);

          // For misère mode, getting winLength in a row means you lose
          if (gameMode === "misere") {
            return {
              winner: currentPlayer === "X" ? "O" : "X",
              winningLine: winningSegment,
            };
          }

          // For classic mode, getting winLength in a row means you win
          return {
            winner: currentPlayer,
            winningLine: winningSegment,
          };
        }
      } else {
        currentPlayer = cell;
        count = currentPlayer === null ? 0 : 1;
        startIdx = i;
      }
    }

    return { winner: null, winningLine: null };
  };

  // Check rows
  for (let row = 0; row < size; row++) {
    const line = Array.from({ length: size }, (_, col) => [row, col]);
    const result = checkLine(line);
    if (result.winner) return result;
  }

  // Check columns
  for (let col = 0; col < size; col++) {
    const line = Array.from({ length: size }, (_, row) => [row, col]);
    const result = checkLine(line);
    if (result.winner) return result;
  }

  // Check diagonals (main and anti-diagonal)
  const mainDiagonal = Array.from({ length: size }, (_, i) => [i, i]);
  const antiDiagonal = Array.from({ length: size }, (_, i) => [
    i,
    size - 1 - i,
  ]);

  const mainResult = checkLine(mainDiagonal);
  if (mainResult.winner) return mainResult;

  const antiResult = checkLine(antiDiagonal);
  if (antiResult.winner) return antiResult;

  // For larger boards, check all possible diagonals (those with at least winLength cells)
  if (size > 3) {
    // Check all possible diagonals starting from left edge
    for (let startRow = 1; startRow <= size - winLength; startRow++) {
      const diagDown = Array.from({ length: size - startRow }, (_, i) => [
        startRow + i,
        i,
      ]);
      const diagUp = Array.from({ length: size - startRow }, (_, i) => [
        startRow + i,
        size - 1 - i,
      ]);

      const downResult = checkLine(diagDown);
      if (downResult.winner) return downResult;

      const upResult = checkLine(diagUp);
      if (upResult.winner) return upResult;
    }

    // Check all possible diagonals starting from top edge
    for (let startCol = 1; startCol <= size - winLength; startCol++) {
      const diagDown = Array.from({ length: size - startCol }, (_, i) => [
        i,
        startCol + i,
      ]);
      const diagUp = Array.from({ length: size - startCol }, (_, i) => [
        i,
        size - 1 - startCol - i,
      ]);

      const downResult = checkLine(diagDown);
      if (downResult.winner) return downResult;

      const upResult = checkLine(diagUp);
      if (upResult.winner) return upResult;
    }
  }

  return { winner: null, winningLine: null };
}

// Get all available moves on the board
export function getAvailableMoves(
  board: TicTacToeBoard,
): { row: number; col: number }[] {
  const moves = [];
  const size = board.length;

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (board[row][col] === null) {
        moves.push({ row, col });
      }
    }
  }

  return moves;
}

// Update time remaining for timed games
export function updateTimeRemaining(
  gameState: TicTacToeGameState,
): TicTacToeGameState {
  if (!gameState.settings.timeLimit || gameState.isGameOver) {
    return gameState;
  }

  if (gameState.lastMoveTime === null) {
    return gameState;
  }

  const newState = { ...gameState };
  const elapsed = Date.now() - gameState.lastMoveTime;
  const timeRemaining = Math.max(
    0,
    (gameState.moveTimeRemaining || gameState.settings.timeLimit * 1000) -
      elapsed,
  );

  newState.moveTimeRemaining = timeRemaining;

  // If time is up, end the game
  if (timeRemaining <= 0 && !gameState.isGameOver) {
    newState.isGameOver = true;
    newState.winner = gameState.currentPlayer === "X" ? "O" : "X"; // Current player loses
  }

  return newState;
}

// Undo the last move
export function undoMove(gameState: TicTacToeGameState): TicTacToeGameState {
  if (gameState.historyIndex <= 0 || gameState.boardHistory.length <= 1) {
    return gameState;
  }

  const newState = { ...gameState };
  newState.historyIndex--;
  newState.board = JSON.parse(
    JSON.stringify(newState.boardHistory[newState.historyIndex]),
  );

  // Remove the last move from history
  if (newState.moveHistory.length > 0) {
    newState.moveHistory = newState.moveHistory.slice(0, -1);
  }

  // Switch back to the previous player
  newState.currentPlayer = newState.currentPlayer === "X" ? "O" : "X";

  // Reset game over state and winner
  newState.isGameOver = false;
  newState.winner = null;
  newState.winningLine = null;

  return newState;
}

// Redo a previously undone move
export function redoMove(gameState: TicTacToeGameState): TicTacToeGameState {
  if (
    gameState.historyIndex >= gameState.boardHistory.length - 1 ||
    gameState.isGameOver
  ) {
    return gameState;
  }

  const newState = { ...gameState };
  newState.historyIndex++;
  newState.board = JSON.parse(
    JSON.stringify(newState.boardHistory[newState.historyIndex]),
  );

  // Restore move history (this is a simplified approach)
  // In a complete implementation, you'd need to store the full move history
  newState.currentPlayer = newState.currentPlayer === "X" ? "O" : "X";

  // Check for win conditions after redo
  const winResult = checkWinner(
    newState.board,
    newState.settings.winLength,
    newState.settings.gameMode,
  );

  newState.winner = winResult.winner;
  newState.winningLine = winResult.winningLine;

  // Check if the board is full
  const isBoardFull = newState.board.every((row) =>
    row.every((cell) => cell !== null),
  );

  newState.isGameOver = newState.winner !== null || isBoardFull;

  return newState;
}

// Reset the game to initial state while keeping settings
export function resetGame(gameState: TicTacToeGameState): TicTacToeGameState {
  return initializeGameState(gameState.settings);
}

// Minimax algorithm with alpha-beta pruning for unbeatable AI
function minimax(
  board: TicTacToeBoard,
  depth: number,
  isMaximizing: boolean,
  alpha: number,
  beta: number,
  player: TicTacToePlayer,
  opponent: TicTacToePlayer,
  winLength: number,
  gameMode: GameMode,
): { score: number; move?: { row: number; col: number } } {
  // Check terminal states
  const winResult = checkWinner(board, winLength, gameMode);

  if (winResult.winner === player) {
    return { score: 10 - depth }; // Win (prefer quicker wins)
  }
  if (winResult.winner === opponent) {
    return { score: depth - 10 }; // Loss (prefer longer games before losing)
  }
  if (isFull(board)) {
    return { score: 0 }; // Draw
  }
  if (depth >= 9) {
    return { score: 0 }; // Depth limit reached
  }

  const moves = getAvailableMoves(board);

  if (isMaximizing) {
    let bestScore = -Infinity;
    let bestMove;

    for (const move of moves) {
      const { row, col } = move;

      // Make move
      board[row][col] = player;

      // Recursively find best score
      const result = minimax(
        board,
        depth + 1,
        false,
        alpha,
        beta,
        player,
        opponent,
        winLength,
        gameMode,
      );

      // Undo move
      board[row][col] = null;

      if (result.score > bestScore) {
        bestScore = result.score;
        bestMove = move;
      }

      // Alpha-beta pruning
      alpha = Math.max(alpha, bestScore);
      if (beta <= alpha) {
        break;
      }
    }

    return { score: bestScore, move: bestMove };
  } else {
    let bestScore = Infinity;
    let bestMove;

    for (const move of moves) {
      const { row, col } = move;

      // Make move
      board[row][col] = opponent;

      // Recursively find best score
      const result = minimax(
        board,
        depth + 1,
        true,
        alpha,
        beta,
        player,
        opponent,
        winLength,
        gameMode,
      );

      // Undo move
      board[row][col] = null;

      if (result.score < bestScore) {
        bestScore = result.score;
        bestMove = move;
      }

      // Alpha-beta pruning
      beta = Math.min(beta, bestScore);
      if (beta <= alpha) {
        break;
      }
    }

    return { score: bestScore, move: bestMove };
  }
}

// Custom evaluation function for larger boards where minimax can't explore fully
function evaluateBoard(
  board: TicTacToeBoard,
  player: TicTacToePlayer,
  opponent: TicTacToePlayer,
  winLength: number,
): number {
  let score = 0;
  const size = board.length;

  // Helper to evaluate a line of cells
  const evaluateLine = (line: TicTacToeCell[]) => {
    // Count player and opponent cells
    const playerCount = line.filter((cell) => cell === player).length;
    const opponentCount = line.filter((cell) => cell === opponent).length;
    const emptyCount = line.filter((cell) => cell === null).length;

    // No score if both players have pieces in the line
    if (playerCount > 0 && opponentCount > 0) {
      return 0;
    }

    // Score for player's pieces
    if (playerCount > 0) {
      // Exponentially increase score as we get closer to winning
      if (playerCount === winLength - 1 && emptyCount === 1) {
        return 100; // Almost win
      }
      return Math.pow(10, playerCount);
    }

    // Negative score for opponent's pieces
    if (opponentCount > 0) {
      // Prioritize blocking opponent's potential wins
      if (opponentCount === winLength - 1 && emptyCount === 1) {
        return -100; // Block opponent's win
      }
      return -Math.pow(10, opponentCount);
    }

    return 0;
  };

  // Evaluate rows
  for (let row = 0; row < size; row++) {
    for (let col = 0; col <= size - winLength; col++) {
      const line = Array.from(
        { length: winLength },
        (_, i) => board[row][col + i],
      );
      score += evaluateLine(line);
    }
  }

  // Evaluate columns
  for (let col = 0; col < size; col++) {
    for (let row = 0; row <= size - winLength; row++) {
      const line = Array.from(
        { length: winLength },
        (_, i) => board[row + i][col],
      );
      score += evaluateLine(line);
    }
  }

  // Evaluate diagonals (top-left to bottom-right)
  for (let row = 0; row <= size - winLength; row++) {
    for (let col = 0; col <= size - winLength; col++) {
      const line = Array.from(
        { length: winLength },
        (_, i) => board[row + i][col + i],
      );
      score += evaluateLine(line);
    }
  }

  // Evaluate diagonals (top-right to bottom-left)
  for (let row = 0; row <= size - winLength; row++) {
    for (let col = winLength - 1; col < size; col++) {
      const line = Array.from(
        { length: winLength },
        (_, i) => board[row + i][col - i],
      );
      score += evaluateLine(line);
    }
  }

  return score;
}

// AI recommendation with confidence and reasoning
export function getRecommendedMove(
  gameState: TicTacToeGameState,
  player: TicTacToePlayer,
): AIMoveRecommendation {
  const opponent = player === "X" ? "O" : "X";
  const boardSize = gameState.settings.boardSize;
  const availableMoves = getAvailableMoves(gameState.board);

  if (availableMoves.length === 0) {
    throw new Error("No available moves");
  }

  // For 3x3 boards, use minimax for optimal play
  if (boardSize === 3) {
    const boardCopy = JSON.parse(JSON.stringify(gameState.board));
    const result = minimax(
      boardCopy,
      0,
      true,
      -Infinity,
      Infinity,
      player,
      opponent,
      gameState.settings.winLength,
      gameState.settings.gameMode,
    );

    if (!result.move) {
      // Fall back to a random move if minimax fails
      const randomMove =
        availableMoves[Math.floor(Math.random() * availableMoves.length)];
      return {
        row: randomMove.row,
        col: randomMove.col,
        confidence: 50,
        reasoning: "Choosing a random move as a fallback strategy.",
      };
    }

    let reasoning = "";
    let confidence = 90; // High confidence for minimax

    // Generate reasoning
    if (result.score > 5) {
      reasoning = "This move leads to a winning position.";
      confidence = 100;
    } else if (result.score < -5) {
      reasoning = "This is a defensive move to prevent a loss.";
      confidence = 85;
    } else {
      reasoning = "This move keeps the game balanced.";
      confidence = 75;
    }

    return {
      row: result.move.row,
      col: result.move.col,
      confidence,
      reasoning,
    };
  }

  // For larger boards, use heuristic evaluation
  const moveScores = availableMoves.map((move) => {
    const { row, col } = move;
    const boardCopy = JSON.parse(JSON.stringify(gameState.board));

    // Try the move
    boardCopy[row][col] = player;

    // Check for immediate win
    const winResult = checkWinner(
      boardCopy,
      gameState.settings.winLength,
      gameState.settings.gameMode,
    );

    if (winResult.winner === player) {
      return {
        move,
        score: 1000,
        reasoning: "This move creates a winning line!",
        confidence: 100,
      };
    }

    // Reset and check if opponent can win next
    boardCopy[row][col] = null;

    // Check all opponent's possible responses
    for (const opMove of availableMoves) {
      if (opMove.row === row && opMove.col === col) continue;

      boardCopy[opMove.row][opMove.col] = opponent;
      const opWinResult = checkWinner(
        boardCopy,
        gameState.settings.winLength,
        gameState.settings.gameMode,
      );

      if (opWinResult.winner === opponent) {
        // Found a move the opponent can make to win
        boardCopy[opMove.row][opMove.col] = null;
        boardCopy[row][col] = player; // Put our move back

        // Check if our move blocks this win
        const blockResult = checkWinner(
          boardCopy,
          gameState.settings.winLength,
          gameState.settings.gameMode,
        );

        if (blockResult.winner === null) {
          return {
            move,
            score: 900,
            reasoning: "This move blocks opponent's winning line!",
            confidence: 95,
          };
        }
      }

      boardCopy[opMove.row][opMove.col] = null;
    }

    // Make the move
    boardCopy[row][col] = player;

    // Evaluate board position
    const score = evaluateBoard(
      boardCopy,
      player,
      opponent,
      gameState.settings.winLength,
    );

    // Generate reasoning based on position
    let reasoning = "";
    let confidence = Math.min(90, 50 + Math.abs(score) / 10);

    if (score > 50) {
      reasoning = "This move creates good attacking opportunities.";
    } else if (score > 20) {
      reasoning = "This move develops a potential threat.";
    } else if (score < -50) {
      reasoning = "This move prevents opponent's threats.";
    } else if (score < -20) {
      reasoning = "This move controls an important position.";
    } else {
      // Center and corners are generally good
      if (
        (row === Math.floor(boardSize / 2) &&
          col === Math.floor(boardSize / 2)) ||
        (row === 0 && col === 0) ||
        (row === 0 && col === boardSize - 1) ||
        (row === boardSize - 1 && col === 0) ||
        (row === boardSize - 1 && col === boardSize - 1)
      ) {
        reasoning = "This move controls a strategically important position.";
        confidence = Math.max(confidence, 65);
      } else {
        reasoning = "This move maintains flexibility for future plays.";
        confidence = Math.min(confidence, 60);
      }
    }

    return { move, score, reasoning, confidence };
  });

  // Sort by score
  moveScores.sort((a, b) => b.score - a.score);

  // Return the best move
  const best = moveScores[0];
  return {
    row: best.move.row,
    col: best.move.col,
    confidence: best.confidence,
    reasoning: best.reasoning,
  };
}

// Get AI move based on difficulty
export function getAIMove(
  gameState: TicTacToeGameState,
  aiPlayer: TicTacToePlayer,
  difficulty: AIDifficulty = "medium",
  personality: AIPersonality = "balanced",
): { row: number; col: number } {
  const availableMoves = getAvailableMoves(gameState.board);

  if (availableMoves.length === 0) {
    throw new Error("No available moves");
  }

  const humanPlayer = aiPlayer === "X" ? "O" : "X";

  // Personality-based behavior overrides
  if (personality === "random") {
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  }

  if (personality === "mimicking") {
    // Try to mimic human player's style by placing near their moves
    const humanMoves = gameState.moveHistory
      .filter((move) => move.player === humanPlayer)
      .slice(-2); // Look at last 2 human moves

    if (humanMoves.length > 0) {
      const lastHumanMove = humanMoves[humanMoves.length - 1];
      const adjacentMoves = availableMoves.filter((move) => {
        const rowDiff = Math.abs(move.row - lastHumanMove.row);
        const colDiff = Math.abs(move.col - lastHumanMove.col);
        return rowDiff <= 1 && colDiff <= 1 && rowDiff + colDiff > 0;
      });

      if (adjacentMoves.length > 0 && Math.random() < 0.7) {
        return adjacentMoves[Math.floor(Math.random() * adjacentMoves.length)];
      }
    }
  }

  // Learning personality - gets harder with more moves
  if (personality === "learning") {
    const gameProgress =
      gameState.moveHistory.length /
      (gameState.settings.boardSize * gameState.settings.boardSize);
    const dynamicDifficulty =
      gameProgress > 0.3
        ? "hard"
        : gameProgress > 0.6
          ? "impossible"
          : difficulty;
    difficulty = dynamicDifficulty as AIDifficulty;
  }

  // Strategic personality - always looks ahead
  if (personality === "strategic") {
    if (gameState.settings.boardSize === 3) {
      const boardCopy = JSON.parse(JSON.stringify(gameState.board));
      const result = minimax(
        boardCopy,
        0,
        true,
        -Infinity,
        Infinity,
        aiPlayer,
        humanPlayer,
        gameState.settings.winLength,
        gameState.settings.gameMode,
      );
      if (result.move) {
        return result.move;
      }
    }
  }

  // Check for winning move (all personalities except random)
  for (const move of availableMoves) {
    const { row, col } = move;
    const boardCopy = JSON.parse(JSON.stringify(gameState.board));
    boardCopy[row][col] = aiPlayer;

    const winResult = checkWinner(
      boardCopy,
      gameState.settings.winLength,
      gameState.settings.gameMode,
    );

    if (winResult.winner === aiPlayer) {
      return move; // AI can win with this move
    }
  }

  // Block player's winning move (except for easy difficulty and aggressive personality when prioritizing offense)
  if (
    difficulty !== "easy" &&
    !(personality === "aggressive" && Math.random() < 0.3)
  ) {
    for (const move of availableMoves) {
      const { row, col } = move;
      const boardCopy = JSON.parse(JSON.stringify(gameState.board));
      boardCopy[row][col] = humanPlayer;

      const winResult = checkWinner(
        boardCopy,
        gameState.settings.winLength,
        gameState.settings.gameMode,
      );

      if (winResult.winner === humanPlayer) {
        // Defensive personality always blocks, others have some chance to miss
        if (personality === "defensive" || Math.random() < 0.8) {
          return move; // Block player's winning move
        }
      }
    }
  }

  // Personality-specific move selection
  if (personality === "aggressive") {
    // Prioritize offensive moves that create multiple threats
    const boardCopy = JSON.parse(JSON.stringify(gameState.board));
    const moveValues = availableMoves.map((move) => {
      boardCopy[move.row][move.col] = aiPlayer;
      let value = evaluateBoard(
        boardCopy,
        aiPlayer,
        humanPlayer,
        gameState.settings.winLength,
      );

      // Bonus for creating multiple threat lines
      let threatCount = 0;
      for (let i = 0; i < gameState.settings.boardSize; i++) {
        for (let j = 0; j < gameState.settings.boardSize; j++) {
          if (boardCopy[i][j] === aiPlayer) {
            threatCount += countPotentialLines(
              boardCopy,
              i,
              j,
              aiPlayer,
              gameState.settings.winLength,
            );
          }
        }
      }
      value += threatCount * 10;

      boardCopy[move.row][move.col] = null;
      return { move, value };
    });

    moveValues.sort((a, b) => b.value - a.value);
    return moveValues[0].move;
  }

  if (personality === "defensive") {
    // Prioritize blocking and safe moves
    const boardCopy = JSON.parse(JSON.stringify(gameState.board));
    const moveValues = availableMoves.map((move) => {
      boardCopy[move.row][move.col] = humanPlayer;
      let value = -evaluateBoard(
        boardCopy,
        humanPlayer,
        aiPlayer,
        gameState.settings.winLength,
      );

      // Bonus for moves that don't give opponent opportunities
      boardCopy[move.row][move.col] = aiPlayer;
      const aiValue = evaluateBoard(
        boardCopy,
        aiPlayer,
        humanPlayer,
        gameState.settings.winLength,
      );
      value += aiValue * 0.3; // Small bonus for our own position

      boardCopy[move.row][move.col] = null;
      return { move, value };
    });

    moveValues.sort((a, b) => b.value - a.value);
    return moveValues[0].move;
  }

  // For hard difficulty and above, use more advanced strategies
  if (difficulty === "hard" || difficulty === "impossible") {
    // For 3x3 board and impossible difficulty, use minimax for perfect play
    if (gameState.settings.boardSize === 3 && difficulty === "impossible") {
      const boardCopy = JSON.parse(JSON.stringify(gameState.board));
      const result = minimax(
        boardCopy,
        0,
        true,
        -Infinity,
        Infinity,
        aiPlayer,
        humanPlayer,
        gameState.settings.winLength,
        gameState.settings.gameMode,
      );

      if (result.move) {
        return result.move;
      }
    }

    // Otherwise, use strategic play
    const recommendation = getRecommendedMove(gameState, aiPlayer);

    // Add some randomness based on difficulty
    if (difficulty === "hard" && Math.random() < 0.2) {
      // 20% chance to make a random move for hard difficulty
      return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }

    return { row: recommendation.row, col: recommendation.col };
  }

  // For medium difficulty and balanced personality, use strategic positions
  const size = gameState.settings.boardSize;
  const center = Math.floor(size / 2);

  // Try to take the center
  const centerMove = availableMoves.find(
    (move) => move.row === center && move.col === center,
  );
  if (centerMove && Math.random() < 0.7) {
    return centerMove;
  }

  // Try to take corners
  const cornerMoves = availableMoves.filter(
    (move) =>
      (move.row === 0 || move.row === size - 1) &&
      (move.col === 0 || move.col === size - 1),
  );

  if (cornerMoves.length > 0 && Math.random() < 0.6) {
    return cornerMoves[Math.floor(Math.random() * cornerMoves.length)];
  }

  // Easy difficulty or fallback: pick a random move
  return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

// Helper function to count potential winning lines from a position
function countPotentialLines(
  board: TicTacToeBoard,
  row: number,
  col: number,
  player: TicTacToePlayer,
  winLength: number,
): number {
  const size = board.length;
  let count = 0;

  // Check all 8 directions
  const directions = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];

  for (const [dr, dc] of directions) {
    let lineLength = 1; // Count the current piece
    let hasSpace = false;

    // Check in positive direction
    for (let i = 1; i < winLength; i++) {
      const newRow = row + dr * i;
      const newCol = col + dc * i;

      if (newRow >= 0 && newRow < size && newCol >= 0 && newCol < size) {
        if (board[newRow][newCol] === player) {
          lineLength++;
        } else if (board[newRow][newCol] === null) {
          hasSpace = true;
          break;
        } else {
          break; // Blocked by opponent
        }
      } else {
        break; // Out of bounds
      }
    }

    // Check in negative direction
    for (let i = 1; i < winLength; i++) {
      const newRow = row - dr * i;
      const newCol = col - dc * i;

      if (newRow >= 0 && newRow < size && newCol >= 0 && newCol < size) {
        if (board[newRow][newCol] === player) {
          lineLength++;
        } else if (board[newRow][newCol] === null) {
          hasSpace = true;
          break;
        } else {
          break; // Blocked by opponent
        }
      } else {
        break; // Out of bounds
      }
    }

    if (lineLength >= 2 && hasSpace) {
      count++;
    }
  }

  return count;
}

// Handle "Ultimate Tic-Tac-Toe" mode functionality
// In Ultimate mode, the board is a 3x3 grid of 3x3 boards
// Each move restricts the next player to the corresponding sub-board
// Ultimate TicTacToe types
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

// Initialize an Ultimate TicTacToe game
export function initializeUltimateGame(): UltimateTicTacToeBoard {
  const subBoards: TicTacToeBoard[][] = [];
  const mainBoard: (TicTacToePlayer | "draw" | null)[][] = [];

  // Create a 3x3 grid of 3x3 tic-tac-toe boards
  for (let i = 0; i < 3; i++) {
    const subBoardRow: TicTacToeBoard[] = [];
    const mainBoardRow: (TicTacToePlayer | "draw" | null)[] = [];

    for (let j = 0; j < 3; j++) {
      subBoardRow.push(initializeBoard(3));
      mainBoardRow.push(null);
    }

    subBoards.push(subBoardRow);
    mainBoard.push(mainBoardRow);
  }

  return {
    mainBoard,
    subBoards,
    nextBoardToPlay: null, // First move can be in any sub-board
    winner: null,
    currentPlayer: "X",
    moveHistory: [],
    isGameOver: false,
  };
}

// Make a move in Ultimate TicTacToe
export function makeUltimateMove(
  game: UltimateTicTacToeBoard,
  mainRow: number,
  mainCol: number,
  subRow: number,
  subCol: number,
): UltimateTicTacToeBoard {
  // Validate move
  if (
    game.isGameOver ||
    (game.nextBoardToPlay !== null &&
      (game.nextBoardToPlay.row !== mainRow ||
        game.nextBoardToPlay.col !== mainCol)) ||
    game.mainBoard[mainRow][mainCol] !== null ||
    game.subBoards[mainRow][mainCol][subRow][subCol] !== null
  ) {
    return game; // Invalid move
  }

  // Create a deep copy of the game
  const newGame = JSON.parse(JSON.stringify(game)) as UltimateTicTacToeBoard;

  // Make the move
  newGame.subBoards[mainRow][mainCol][subRow][subCol] = game.currentPlayer;

  // Add to move history
  newGame.moveHistory.push({
    mainRow,
    mainCol,
    subRow,
    subCol,
    player: game.currentPlayer,
  });

  // Check if this move won the sub-board
  const winResult = checkWinner(
    newGame.subBoards[mainRow][mainCol],
    3,
    "classic",
  );

  if (winResult.winner) {
    newGame.mainBoard[mainRow][mainCol] = winResult.winner;
  } else if (isFull(newGame.subBoards[mainRow][mainCol])) {
    newGame.mainBoard[mainRow][mainCol] = "draw";
  }

  // Check if the game is won on the main board
  const mainWinResult = checkWinner(
    newGame.mainBoard as TicTacToeBoard,
    3,
    "classic",
  );

  if (mainWinResult.winner) {
    newGame.winner = mainWinResult.winner;
    newGame.isGameOver = true;
  } else if (
    newGame.mainBoard.every((row) => row.every((cell) => cell !== null))
  ) {
    newGame.winner = "draw";
    newGame.isGameOver = true;
  }

  // Determine next board to play
  if (!newGame.isGameOver) {
    if (newGame.mainBoard[subRow][subCol] === null) {
      // Next move must be in the sub-board corresponding to the current move's position
      newGame.nextBoardToPlay = { row: subRow, col: subCol };
    } else {
      // If the target sub-board is already won or drawn, player can choose any board
      newGame.nextBoardToPlay = null;
    }

    // Switch player
    newGame.currentPlayer = newGame.currentPlayer === "X" ? "O" : "X";
  }

  return newGame;
}

// Get available moves for Ultimate TicTacToe
export function getUltimateAvailableMoves(
  game: UltimateTicTacToeBoard,
): { mainRow: number; mainCol: number; subRow: number; subCol: number }[] {
  const moves: {
    mainRow: number;
    mainCol: number;
    subRow: number;
    subCol: number;
  }[] = [];

  if (game.isGameOver) {
    return moves;
  }

  // If next board is specified
  if (game.nextBoardToPlay) {
    const { row, col } = game.nextBoardToPlay;

    // Can only play in the specified sub-board
    if (game.mainBoard[row][col] === null) {
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (game.subBoards[row][col][i][j] === null) {
            moves.push({ mainRow: row, mainCol: col, subRow: i, subCol: j });
          }
        }
      }
    }
  } else {
    // Can play in any sub-board that isn't won yet
    for (let mainRow = 0; mainRow < 3; mainRow++) {
      for (let mainCol = 0; mainCol < 3; mainCol++) {
        if (game.mainBoard[mainRow][mainCol] === null) {
          for (let subRow = 0; subRow < 3; subRow++) {
            for (let subCol = 0; subCol < 3; subCol++) {
              if (game.subBoards[mainRow][mainCol][subRow][subCol] === null) {
                moves.push({ mainRow, mainCol, subRow, subCol });
              }
            }
          }
        }
      }
    }
  }

  return moves;
}

// AI move for Ultimate TicTacToe
export function getUltimateAIMove(
  game: UltimateTicTacToeBoard,
  aiPlayer: TicTacToePlayer,
  difficulty: AIDifficulty = "medium",
): { mainRow: number; mainCol: number; subRow: number; subCol: number } {
  const availableMoves = getUltimateAvailableMoves(game);

  if (availableMoves.length === 0) {
    throw new Error("No available moves");
  }

  // Easy difficulty or add randomness for non-impossible difficulties
  const shouldMakeRandomMove = (): boolean => {
    if (difficulty === "easy") return true;
    if (difficulty === "medium") return Math.random() < 0.3;
    if (difficulty === "hard") return Math.random() < 0.1;
    return false;
  };

  if (shouldMakeRandomMove()) {
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  }

  const humanPlayer = aiPlayer === "X" ? "O" : "X";

  // Check for winning moves in sub-boards
  for (const move of availableMoves) {
    const { mainRow, mainCol, subRow, subCol } = move;
    const gameCopy = JSON.parse(JSON.stringify(game)) as UltimateTicTacToeBoard;

    gameCopy.subBoards[mainRow][mainCol][subRow][subCol] = aiPlayer;

    // Check if this move wins the sub-board
    const winResult = checkWinner(
      gameCopy.subBoards[mainRow][mainCol],
      3,
      "classic",
    );

    if (winResult.winner === aiPlayer) {
      // Check if winning this sub-board wins the game
      const mainBoardCopy = JSON.parse(JSON.stringify(game.mainBoard));
      mainBoardCopy[mainRow][mainCol] = aiPlayer;

      const mainWinResult = checkWinner(
        mainBoardCopy as TicTacToeBoard,
        3,
        "classic",
      );

      if (mainWinResult.winner === aiPlayer) {
        return move; // This move wins the game
      }

      // Prioritize winning sub-boards even if it doesn't win the game
      if (difficulty === "hard" || difficulty === "impossible") {
        return move;
      }
    }
  }

  // Block opponent's winning moves
  if (difficulty !== "easy") {
    for (const move of availableMoves) {
      const { mainRow, mainCol, subRow, subCol } = move;
      const gameCopy = JSON.parse(
        JSON.stringify(game),
      ) as UltimateTicTacToeBoard;

      gameCopy.subBoards[mainRow][mainCol][subRow][subCol] = humanPlayer;

      // Check if this move would let opponent win the sub-board
      const winResult = checkWinner(
        gameCopy.subBoards[mainRow][mainCol],
        3,
        "classic",
      );

      if (winResult.winner === humanPlayer) {
        // Check if winning this sub-board would win the game for opponent
        const mainBoardCopy = JSON.parse(JSON.stringify(game.mainBoard));
        mainBoardCopy[mainRow][mainCol] = humanPlayer;

        const mainWinResult = checkWinner(
          mainBoardCopy as TicTacToeBoard,
          3,
          "classic",
        );

        if (mainWinResult.winner === humanPlayer) {
          return move; // Block opponent from winning the game
        }
      }
    }
  }

  // Strategic moves for harder difficulties
  if (difficulty === "hard" || difficulty === "impossible") {
    // Prioritize moves that send opponent to already won/drawn boards
    // (which would give us free choice on next move)
    for (const move of availableMoves) {
      const { subRow, subCol } = move;

      if (game.mainBoard[subRow][subCol] !== null) {
        return move;
      }
    }

    // Prioritize center of main board
    const centerMainMove = availableMoves.find(
      (move) => move.mainRow === 1 && move.mainCol === 1,
    );

    if (centerMainMove && Math.random() < 0.8) {
      return centerMainMove;
    }

    // Prioritize center of sub-board
    const centerSubMove = availableMoves.find(
      (move) => move.subRow === 1 && move.subCol === 1,
    );

    if (centerSubMove && Math.random() < 0.7) {
      return centerSubMove;
    }

    // Prioritize corners
    const cornerMoves = availableMoves.filter(
      (move) =>
        (move.subRow === 0 || move.subRow === 2) &&
        (move.subCol === 0 || move.subCol === 2),
    );

    if (cornerMoves.length > 0 && Math.random() < 0.6) {
      return cornerMoves[Math.floor(Math.random() * cornerMoves.length)];
    }
  }

  // Default to random move
  return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}
