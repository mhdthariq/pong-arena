import {
  Firestore,
  collection,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  addDoc,
} from "firebase/firestore";
import {
  MultiplayerTicTacToeGameState,
  TicTacToePlayer,
} from "../../games/tictactoe/lib/types";
import { initializeBoard } from "../../games/tictactoe/lib/gameLogic";

// Generate a random 6-character code for game rooms
export function generateGameCode(): string {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Omitting confusing chars like 0,O,1,I
  let code = "";
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters.charAt(randomIndex);
  }
  return code;
}

// Create a new TicTacToe game
export async function createTicTacToeGame(
  db: Firestore,
  userId: string
): Promise<{ gameId: string; gameCode: string }> {
  try {
    const appId = "default-tictactoe-app-id";
    const gamesRef = collection(
      db,
      `artifacts/${appId}/public/data/tictactoe-games`
    );

    const gameCode = generateGameCode();

    // Initial game state
    const initialGameState: MultiplayerTicTacToeGameState = {
      board: initializeBoard(),
      currentPlayer: "X",
      winner: null,
      winningLine: null,
      moveHistory: [],
      isGameOver: false,
      player1Id: userId,
      player2Id: null,
      player1Symbol: "X",
      player2Symbol: "O",
      lastMoveTimestamp: Date.now(),
      status: "waiting",
      gameCode: gameCode,
    };

    // Create new game document
    const gameDocRef = await addDoc(gamesRef, initialGameState);
    console.log("Created new TicTacToe game with ID:", gameDocRef.id);

    return { gameId: gameDocRef.id, gameCode };
  } catch (error) {
    console.error("Error creating TicTacToe game:", error);
    throw error;
  }
}

// Join a TicTacToe game by game code
export async function joinTicTacToeGameByCode(
  db: Firestore,
  gameCode: string,
  userId: string
): Promise<string | null> {
  try {
    const appId = "default-tictactoe-app-id";
    const gamesRef = collection(
      db,
      `artifacts/${appId}/public/data/tictactoe-games`
    );

    // Query for the game with this code
    const q = query(gamesRef, where("gameCode", "==", gameCode));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.error("No game found with code:", gameCode);
      return null;
    }

    const gameDoc = querySnapshot.docs[0];
    const gameData = gameDoc.data() as MultiplayerTicTacToeGameState;

    // Check if game is already full or the user is the creator
    if (gameData.player1Id === userId) {
      console.log("You are already in this game as player 1");
      return gameDoc.id;
    }

    if (gameData.player2Id && gameData.player2Id !== userId) {
      console.error("Game is already full");
      return null;
    }

    if (gameData.status !== "waiting") {
      console.error("Game is not in waiting state");
      return null;
    }

    // Join the game as player 2
    await updateDoc(gameDoc.ref, {
      player2Id: userId,
      status: "playing",
      lastMoveTimestamp: Date.now(),
    });

    console.log("Successfully joined TicTacToe game:", gameDoc.id);
    return gameDoc.id;
  } catch (error) {
    console.error("Error joining TicTacToe game:", error);
    throw error;
  }
}

// Make a move in a multiplayer TicTacToe game
export async function makeTicTacToeMove(
  db: Firestore,
  gameId: string,
  userId: string,
  row: number,
  col: number
): Promise<boolean> {
  try {
    const appId = "default-tictactoe-app-id";
    const gameRef = doc(
      db,
      `artifacts/${appId}/public/data/tictactoe-games/${gameId}`
    );

    const gameSnapshot = await getDoc(gameRef);
    if (!gameSnapshot.exists()) {
      console.error("Game not found");
      return false;
    }

    const gameData = gameSnapshot.data() as MultiplayerTicTacToeGameState;

    // Check if it's the user's turn
    const isPlayer1 = gameData.player1Id === userId;
    const isPlayer2 = gameData.player2Id === userId;

    if (!isPlayer1 && !isPlayer2) {
      console.error("You are not a player in this game");
      return false;
    }

    const playerSymbol: TicTacToePlayer = isPlayer1
      ? gameData.player1Symbol
      : gameData.player2Symbol;

    if (gameData.currentPlayer !== playerSymbol) {
      console.error("It's not your turn");
      return false;
    }

    // Check if the move is valid
    if (gameData.board[row][col] !== null || gameData.isGameOver) {
      console.error("Invalid move");
      return false;
    }

    // Make the move
    const newBoard = gameData.board.map((boardRow) => [...boardRow]);
    newBoard[row][col] = playerSymbol;

    // Track move history
    const newMoveHistory = [
      ...gameData.moveHistory,
      { row, col, player: playerSymbol },
    ];

    // Check for win
    const { winner, winningLine } = checkWinner(newBoard);

    // Check for draw (all cells filled)
    const isBoardFull = newBoard.every((row) =>
      row.every((cell) => cell !== null)
    );

    const isGameOver = winner !== null || isBoardFull;
    const gameStatus = isGameOver ? "finished" : "playing";
    const nextPlayer = playerSymbol === "X" ? "O" : "X";

    // Update game state
    await updateDoc(gameRef, {
      board: newBoard,
      currentPlayer: nextPlayer,
      moveHistory: newMoveHistory,
      lastMoveTimestamp: Date.now(),
      winner: winner || (isBoardFull ? "draw" : null),
      winningLine,
      isGameOver,
      status: gameStatus,
    });

    return true;
  } catch (error) {
    console.error("Error making move:", error);
    throw error;
  }
}

// Subscribe to TicTacToe game updates
export function subscribeTicTacToeGame(
  db: Firestore,
  gameId: string,
  callback: (gameState: MultiplayerTicTacToeGameState) => void
) {
  const appId = "default-tictactoe-app-id";
  const gameRef = doc(
    db,
    `artifacts/${appId}/public/data/tictactoe-games/${gameId}`
  );

  return onSnapshot(
    gameRef,
    (doc) => {
      if (doc.exists()) {
        callback(doc.data() as MultiplayerTicTacToeGameState);
      } else {
        console.error("Game document does not exist");
      }
    },
    (error) => {
      console.error("Error subscribing to game updates:", error);
    }
  );
}

// Check for a winner in the TicTacToe board
function checkWinner(board: (TicTacToePlayer | null)[][]): {
  winner: TicTacToePlayer | null;
  winningLine: number[][] | null;
} {
  // All possible winning lines
  const lines = [
    // Rows
    [
      [0, 0],
      [0, 1],
      [0, 2],
    ],
    [
      [1, 0],
      [1, 1],
      [1, 2],
    ],
    [
      [2, 0],
      [2, 1],
      [2, 2],
    ],
    // Columns
    [
      [0, 0],
      [1, 0],
      [2, 0],
    ],
    [
      [0, 1],
      [1, 1],
      [2, 1],
    ],
    [
      [0, 2],
      [1, 2],
      [2, 2],
    ],
    // Diagonals
    [
      [0, 0],
      [1, 1],
      [2, 2],
    ],
    [
      [0, 2],
      [1, 1],
      [2, 0],
    ],
  ];

  for (const line of lines) {
    const [[a, b], [c, d], [e, f]] = line;
    if (
      board[a][b] &&
      board[a][b] === board[c][d] &&
      board[a][b] === board[e][f]
    ) {
      return { winner: board[a][b] as TicTacToePlayer, winningLine: line };
    }
  }

  return { winner: null, winningLine: null };
}

// Get a specific TicTacToe game by ID
export async function getTicTacToeGame(
  db: Firestore,
  gameId: string
): Promise<MultiplayerTicTacToeGameState | null> {
  try {
    const appId = "default-tictactoe-app-id";
    const gameRef = doc(
      db,
      `artifacts/${appId}/public/data/tictactoe-games/${gameId}`
    );

    const gameSnapshot = await getDoc(gameRef);
    if (!gameSnapshot.exists()) {
      console.error("Game not found");
      return null;
    }

    return gameSnapshot.data() as MultiplayerTicTacToeGameState;
  } catch (error) {
    console.error("Error getting game:", error);
    throw error;
  }
}

// Get active TicTacToe games for lobby
export async function getActiveTicTacToeGames(
  db: Firestore
): Promise<{ id: string; data: MultiplayerTicTacToeGameState }[]> {
  try {
    const appId = "default-tictactoe-app-id";
    const gamesRef = collection(
      db,
      `artifacts/${appId}/public/data/tictactoe-games`
    );

    // Get games that are waiting for players
    const q = query(gamesRef, where("status", "==", "waiting"));
    const querySnapshot = await getDocs(q);

    const games: { id: string; data: MultiplayerTicTacToeGameState }[] = [];
    querySnapshot.forEach((doc) => {
      games.push({
        id: doc.id,
        data: doc.data() as MultiplayerTicTacToeGameState,
      });
    });

    return games;
  } catch (error) {
    console.error("Error getting active games:", error);
    throw error;
  }
}
