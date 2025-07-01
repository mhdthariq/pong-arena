import {
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
  collection,
  query,
  where,
  addDoc,
  serverTimestamp,
  Timestamp,
  Firestore,
  getDocs,
} from "firebase/firestore";
import {
  BallState,
  PaddleState,
  GameStatus,
} from "../../games/pong/lib/constants";

// Define Game Document Structure for Firestore
export interface GameDocument {
  player1Id: string;
  player2Id: string | null;
  status: GameStatus;
  ball: BallState;
  paddle1: PaddleState;
  paddle2: PaddleState;
  score1: number;
  score2: number;
  createdAt: Timestamp | null;
  lastActivity: Timestamp | null;
  gameCode?: string;
  player1Ready: boolean;
  player2Ready: boolean;
}

/**
 * Gets the base path for public game data in Firestore.
 * @param {string} appId The application ID.
 * @returns {string} The Firestore collection path.
 */
const getGamesCollectionPath = (appId: string): string =>
  `artifacts/${appId}/public/data/games`;

/**
 * Creates a new multiplayer game.
 * @param {Firestore} db The Firestore instance.
 * @param {string} userId The ID of the player creating the game.
 * @param {{ ball: BallState; paddle1: PaddleState; paddle2: PaddleState; score1: number; score2: number; }} initialGameState The initial state of the game.
 * @returns {Promise<{ gameId: string, gameCode: string }>} The ID and code of the newly created game.
 */
export const createGame = async (
  db: Firestore,
  userId: string,
  initialGameState: {
    ball: BallState;
    paddle1: PaddleState;
    paddle2: PaddleState;
    score1: number;
    score2: number;
  }
): Promise<{ gameId: string; gameCode: string }> => {
  try {
    const appId = "pong-game"; // Fixed app ID for simplicity
    const gamesCollectionRef = collection(db, getGamesCollectionPath(appId));

    // Generate a random 6-character game code for easy sharing
    const gameCode = generateGameCode();

    // Create the initial game document
    const gameData: GameDocument = {
      player1Id: userId,
      player2Id: null, // Will be filled when a second player joins
      status: "waiting", // Game is waiting for a second player
      ball: initialGameState.ball,
      paddle1: initialGameState.paddle1,
      paddle2: initialGameState.paddle2,
      score1: initialGameState.score1,
      score2: initialGameState.score2,
      createdAt: serverTimestamp() as Timestamp, // Current server timestamp
      lastActivity: serverTimestamp() as Timestamp, // Current server timestamp
      gameCode, // Add the code to the document
      player1Ready: false,
      player2Ready: false,
    };

    // Add the document to Firestore
    const gameDocRef = await addDoc(gamesCollectionRef, gameData);
    console.log("Created game with ID:", gameDocRef.id);

    return { gameId: gameDocRef.id, gameCode };
  } catch (error) {
    console.error("Error creating game:", error);
    throw error;
  }
};

/**
 * Generates a random 6-character code for game rooms.
 * @returns {string} A 6-character code.
 */
export function generateGameCode(): string {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Omitting confusing chars like 0,O,1,I
  let code = "";
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters.charAt(randomIndex);
  }
  return code;
}

/**
 * Joins a game using a game code.
 * @param {Firestore} db The Firestore instance.
 * @param {string} gameCode The code for the game to join.
 * @param {string} userId The ID of the player joining.
 * @returns {Promise<string|null>} The ID of the joined game, or null if not found/joinable.
 */
export const joinGameByCode = async (
  db: Firestore,
  gameCode: string,
  userId: string
): Promise<string | null> => {
  try {
    const appId = "pong-game";
    const gamesCollectionRef = collection(db, getGamesCollectionPath(appId));

    // Query for games with this code
    const q = query(gamesCollectionRef, where("gameCode", "==", gameCode));
    const querySnapshot = await getDocs(q);

    // Check if game exists
    if (querySnapshot.empty) {
      console.error("No game found with code:", gameCode);
      return null;
    }

    const gameDoc = querySnapshot.docs[0];
    const gameData = gameDoc.data() as GameDocument;

    // Check if game is joinable
    if (gameData.status !== "waiting") {
      console.error("Game is not in waiting state");
      return null;
    }

    // Check if user is already in the game
    if (gameData.player1Id === userId) {
      console.log("You are already in this game as player 1");
      return gameDoc.id;
    }

    // Check if player 2 slot is free
    if (gameData.player2Id && gameData.player2Id !== userId) {
      console.error("Game already has a player 2");
      return null;
    }

    // Join as player 2
    await updateDoc(gameDoc.ref, {
      player2Id: userId,
      status: "playing", // Game can start once both players are ready
      lastActivity: serverTimestamp(),
    });

    console.log("Successfully joined game");
    return gameDoc.id;
  } catch (error) {
    console.error("Error joining game by code:", error);
    throw error;
  }
};

/**
 * Gets active games that are waiting for a second player.
 * @param {Firestore} db The Firestore instance.
 * @returns {Promise<Array<{id: string, data: GameDocument}>>} Array of active games.
 */
export const getActiveGames = async (
  db: Firestore
): Promise<Array<{ id: string; data: GameDocument }>> => {
  try {
    const appId = "pong-game";
    const gamesCollectionRef = collection(db, getGamesCollectionPath(appId));

    // Query for games in the waiting state
    const q = query(gamesCollectionRef, where("status", "==", "waiting"));
    const querySnapshot = await getDocs(q);

    // Process results
    const games: { id: string; data: GameDocument }[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as GameDocument;
      games.push({ id: doc.id, data });
    });

    return games;
  } catch (error) {
    console.error("Error getting active games:", error);
    throw error;
  }
};

/**
 * Gets a specific game by ID.
 * @param {Firestore} db The Firestore instance.
 * @param {string} gameId The ID of the game.
 * @returns {Promise<GameDocument|null>} The game document or null if not found.
 */
export const getGame = async (
  db: Firestore,
  gameId: string
): Promise<GameDocument | null> => {
  try {
    const appId = "pong-game";
    const gameDocRef = doc(db, `${getGamesCollectionPath(appId)}/${gameId}`);
    const gameDoc = await getDoc(gameDocRef);

    if (gameDoc.exists()) {
      return gameDoc.data() as GameDocument;
    } else {
      console.error("Game not found with ID:", gameId);
      return null;
    }
  } catch (error) {
    console.error("Error getting game:", error);
    throw error;
  }
};

/**
 * Updates the game state in Firestore.
 * @param {Firestore} db The Firestore instance.
 * @param {string} gameId The ID of the game.
 * @param {Partial<GameDocument>} updateData The fields to update.
 * @returns {Promise<void>}
 */
export const updateGameState = async (
  db: Firestore,
  gameId: string,
  updateData: Partial<GameDocument>
): Promise<void> => {
  try {
    const appId = "pong-game";
    const gameDocRef = doc(db, `${getGamesCollectionPath(appId)}/${gameId}`);

    // Always update lastActivity to keep track of activity
    await updateDoc(gameDocRef, {
      ...updateData,
      lastActivity: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating game state:", error);
    throw error;
  }
};

/**
 * Subscribes to real-time updates for a game.
 * @param {Firestore} db The Firestore instance.
 * @param {string} gameId The ID of the game.
 * @param {Function} onUpdate Callback function when game data updates.
 * @returns {Function} Unsubscribe function to stop listening.
 */
export const subscribeToGame = (
  db: Firestore,
  gameId: string,
  onUpdate: (gameData: GameDocument) => void
): (() => void) => {
  const appId = "pong-game";
  const gameDocRef = doc(db, `${getGamesCollectionPath(appId)}/${gameId}`);

  // Listen for real-time updates
  const unsubscribe = onSnapshot(
    gameDocRef,
    (doc) => {
      if (doc.exists()) {
        onUpdate(doc.data() as GameDocument);
      }
    },
    (error) => {
      console.error("Error subscribing to game:", error);
    }
  );

  return unsubscribe;
};

/**
 * Updates paddle position in multiplayer game.
 * @param {Firestore} db The Firestore instance.
 * @param {string} gameId The ID of the game.
 * @param {string} userId The ID of the user.
 * @param {number} paddleY The Y position of the paddle.
 * @returns {Promise<void>}
 */
export const updatePaddlePosition = async (
  db: Firestore,
  gameId: string,
  userId: string,
  paddleY: number
): Promise<void> => {
  try {
    const appId = "pong-game";
    const gameDocRef = doc(db, `${getGamesCollectionPath(appId)}/${gameId}`);
    const gameDoc = await getDoc(gameDocRef);

    if (!gameDoc.exists()) {
      console.error("Game not found");
      return;
    }

    const gameData = gameDoc.data() as GameDocument;
    const isPlayer1 = gameData.player1Id === userId;
    const isPlayer2 = gameData.player2Id === userId;

    if (!isPlayer1 && !isPlayer2) {
      console.error("User is not a player in this game");
      return;
    }

    const updateData: Partial<GameDocument> = {};
    if (isPlayer1) {
      updateData.paddle1 = { ...gameData.paddle1, y: paddleY };
    } else if (isPlayer2) {
      updateData.paddle2 = { ...gameData.paddle2, y: paddleY };
    }

    await updateDoc(gameDocRef, updateData);
  } catch (error) {
    console.error("Error updating paddle position:", error);
  }
};

/**
 * Updates the ball state in a multiplayer game.
 * @param {Firestore} db The Firestore instance.
 * @param {string} gameId The ID of the game.
 * @param {BallState} ballState The new ball state.
 * @returns {Promise<void>}
 */
export const updateBallState = async (
  db: Firestore,
  gameId: string,
  ballState: BallState
): Promise<void> => {
  try {
    const appId = "pong-game";
    const gameDocRef = doc(db, `${getGamesCollectionPath(appId)}/${gameId}`);
    await updateDoc(gameDocRef, { ball: ballState });
  } catch (error) {
    console.error("Error updating ball state:", error);
  }
};

/**
 * Updates the score in a multiplayer game.
 * @param {Firestore} db The Firestore instance.
 * @param {string} gameId The ID of the game.
 * @param {number} score1 Player 1's score.
 * @param {number} score2 Player 2's score.
 * @returns {Promise<void>}
 */
export const updateScore = async (
  db: Firestore,
  gameId: string,
  score1: number,
  score2: number
): Promise<void> => {
  try {
    const appId = "pong-game";
    const gameDocRef = doc(db, `${getGamesCollectionPath(appId)}/${gameId}`);
    await updateDoc(gameDocRef, { score1, score2 });
  } catch (error) {
    console.error("Error updating score:", error);
  }
};

/**
 * Sets a player as ready in the game.
 * @param {Firestore} db The Firestore instance.
 * @param {string} gameId The ID of the game.
 * @param {string} userId The ID of the user.
 * @param {boolean} ready Whether the player is ready.
 * @returns {Promise<void>}
 */
export const setPlayerReady = async (
  db: Firestore,
  gameId: string,
  userId: string,
  ready: boolean
): Promise<void> => {
  try {
    const appId = "pong-game";
    const gameDocRef = doc(db, `${getGamesCollectionPath(appId)}/${gameId}`);
    const gameDoc = await getDoc(gameDocRef);

    if (!gameDoc.exists()) {
      console.error("Game not found");
      return;
    }

    const gameData = gameDoc.data() as GameDocument;
    const isPlayer1 = gameData.player1Id === userId;
    const isPlayer2 = gameData.player2Id === userId;

    if (!isPlayer1 && !isPlayer2) {
      console.error("User is not a player in this game");
      return;
    }

    const updateData: Partial<GameDocument> = {};
    if (isPlayer1) {
      updateData.player1Ready = ready;
    } else if (isPlayer2) {
      updateData.player2Ready = ready;
    }

    await updateDoc(gameDocRef, updateData);
  } catch (error) {
    console.error("Error setting player ready state:", error);
  }
};

/**
 * Marks a game as finished.
 * @param {Firestore} db The Firestore instance.
 * @param {string} gameId The ID of the game.
 * @returns {Promise<void>}
 */
export const finishGame = async (
  db: Firestore,
  gameId: string
): Promise<void> => {
  try {
    const appId = "pong-game";
    const gameDocRef = doc(db, `${getGamesCollectionPath(appId)}/${gameId}`);
    await updateDoc(gameDocRef, { status: "finished" as GameStatus });
  } catch (error) {
    console.error("Error finishing game:", error);
  }
};

/**
 * Leaves a game (marks as abandoned if no other player).
 * @param {Firestore} db The Firestore instance.
 * @param {string} gameId The ID of the game.
 * @param {string} userId The ID of the user.
 * @returns {Promise<void>}
 */
export const leaveGame = async (
  db: Firestore,
  gameId: string,
  userId: string
): Promise<void> => {
  try {
    const appId = "pong-game";
    const gameDocRef = doc(db, `${getGamesCollectionPath(appId)}/${gameId}`);
    const gameDoc = await getDoc(gameDocRef);

    if (!gameDoc.exists()) {
      console.error("Game not found");
      return;
    }

    const gameData = gameDoc.data() as GameDocument;

    // If user is player 1 and there's no player 2, or if user is player 2 and there's no player 1, mark as abandoned
    if (
      (gameData.player1Id === userId && !gameData.player2Id) ||
      (gameData.player2Id === userId && !gameData.player1Id)
    ) {
      await updateDoc(gameDocRef, { status: "abandoned" as GameStatus });
    }
    // If user is player 1 and there's a player 2, make player 2 the new player 1
    else if (gameData.player1Id === userId && gameData.player2Id) {
      await updateDoc(gameDocRef, {
        player1Id: gameData.player2Id,
        player2Id: null,
      });
    }
    // If user is player 2, just remove them from the game
    else if (gameData.player2Id === userId) {
      await updateDoc(gameDocRef, {
        player2Id: null,
        status: "waiting" as GameStatus,
      });
    }
  } catch (error) {
    console.error("Error leaving game:", error);
  }
};
