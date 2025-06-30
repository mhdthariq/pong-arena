import {
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
  collection,
  query,
  where,
  addDoc,
  deleteDoc,
  serverTimestamp, // Import serverTimestamp for reliable timestamps
  Timestamp, // Import Timestamp type for client-side use
  Firestore,
  getDocs,
} from "firebase/firestore";
import { BallState, PaddleState, GameStatus } from "../lib/constants"; // Import types

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
  createdAt: Timestamp | null; // Firestore Timestamp type
  lastActivity: Timestamp | null; // Firestore Timestamp type
  gameCode?: string; // Added game code for easier sharing/joining
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
 * @param {any} db The Firestore instance.
 * @param {string} userId The ID of the player creating the game.
 * @param {{ ball: BallState; paddle1: PaddleState; paddle2: PaddleState; score1: number; score2: number; }} initialGameState The initial state of the game.
 * @returns {Promise<string>} The ID of the newly created game document.
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
): Promise<string> => {
  // Check if user already has a game created
  const existingGameId = await getUserExistingGame(db, userId);
  if (existingGameId) {
    throw new Error(
      "You already have an active game. You can only create one game at a time."
    );
  }

  const appId = "default-pong-app-id";
  const gamesRef = collection(db, getGamesCollectionPath(appId));

  // Generate a user-friendly game code
  const gameCode = generateGameCode();

  const newGame: GameDocument = {
    ...initialGameState,
    player1Id: userId,
    player2Id: null,
    status: "waiting",
    createdAt: serverTimestamp() as Timestamp,
    lastActivity: serverTimestamp() as Timestamp,
    gameCode: gameCode, // Add the game code
    player1Ready: false,
    player2Ready: false,
  };
  const docRef = await addDoc(gamesRef, newGame);
  return docRef.id;
};

/**
 * Sets the ready status for a player in a multiplayer game.
 * @param {any} db The Firestore instance.
 * @param {string} gameId The ID of the game.
 * @param {string} userId The ID of the player.
 * @param {boolean} isReady The ready status to set.
 * @returns {Promise<void>}
 */
export const setPlayerReady = async (
  db: Firestore,
  gameId: string,
  userId: string,
  isReady: boolean
): Promise<void> => {
  const appId = "default-pong-app-id";
  const gameRef = doc(db, getGamesCollectionPath(appId), gameId);
  const gameSnap = await getDoc(gameRef);

  if (!gameSnap.exists()) {
    console.error("Game not found for setting ready status.");
    return;
  }

  const gameData = gameSnap.data() as GameDocument;
  const updateData: Partial<GameDocument> = {};

  if (gameData.player1Id === userId) {
    updateData.player1Ready = isReady;
  } else if (gameData.player2Id === userId) {
    updateData.player2Ready = isReady;
  } else {
    console.warn("User is not a player in this game.");
    return;
  }

  await updateDoc(gameRef, { ...updateData, lastActivity: serverTimestamp() });
};

/**
 * Joins an existing multiplayer game.
 * @param {any} db The Firestore instance.
 * @param {string} gameId The ID of the game to join.
 * @param {string} userId The ID of the player joining the game.
 * @returns {Promise<boolean>} True if joined successfully, false otherwise.
 */
export const joinGame = async (
  db: Firestore,
  gameId: string,
  userId: string
): Promise<boolean> => {
  const appId = "default-pong-app-id";
  const gameRef = doc(db, getGamesCollectionPath(appId), gameId);
  const gameSnap = await getDoc(gameRef);

  if (!gameSnap.exists()) {
    console.warn("Attempted to join a non-existent game.");
    return false;
  }

  const data = gameSnap.data() as GameDocument; // Cast to GameDocument
  if (data.status === "waiting" && data.player1Id !== userId) {
    await updateDoc(gameRef, {
      player2Id: userId,
      status: "playing",
      lastActivity: serverTimestamp(), // Update last activity on join
    });
    return true;
  } else if (data.player1Id === userId) {
    // Player is already player1, allow them to proceed to game, update activity
    await updateDoc(gameRef, {
      lastActivity: serverTimestamp(),
    });
    return true;
  }
  return false;
};

/**
 * Deletes a game document from Firestore.
 * @param {any} db The Firestore instance.
 * @param {string} gameId The ID of the game to delete.
 * @returns {Promise<void>}
 */
export const deleteGame = async (
  db: Firestore,
  gameId: string
): Promise<void> => {
  const appId = "default-pong-app-id";
  const gameRef = doc(db, getGamesCollectionPath(appId), gameId);
  await deleteDoc(gameRef);
};

/**
 * Updates specific fields of a game document.
 * Automatically updates lastActivity.
 * @param {any} db The Firestore instance.
 * @param {string} gameId The ID of the game to update.
 * @param {Partial<GameDocument>} updates An object containing fields to update.
 * @returns {Promise<void>}
 */
export const updateGame = async (
  db: Firestore,
  gameId: string,
  updates: Partial<GameDocument>
): Promise<void> => {
  const appId = "default-pong-app-id";
  const gameRef = doc(db, getGamesCollectionPath(appId), gameId);
  // Also update lastActivity on every game update to keep it active
  await updateDoc(gameRef, { ...updates, lastActivity: serverTimestamp() });
};

/**
 * Deletes games that have been in a 'waiting' state for too long.
 * @param {any} db The Firestore instance.
 * @param {number} timeoutMinutes The timeout in minutes.
 */
export const cleanupWaitingGames = async (
  db: Firestore,
  timeoutMinutes: number
) => {
  const appId = "default-pong-app-id";
  const gamesRef = collection(db, getGamesCollectionPath(appId));
  const now = Timestamp.now();
  const timeout = new Timestamp(
    now.seconds - timeoutMinutes * 60,
    now.nanoseconds
  );

  // Query only by status to avoid index issues
  const q = query(gamesRef, where("status", "==", "waiting"));

  const snapshot = await getDocs(q);
  const deletePromises: Promise<void>[] = [];

  // Filter by time client-side
  snapshot.forEach((doc) => {
    const gameData = doc.data() as GameDocument;
    if (
      gameData.createdAt &&
      gameData.createdAt.toMillis() <= timeout.toMillis()
    ) {
      console.log(`Deleting expired game: ${doc.id}`);
      deletePromises.push(deleteDoc(doc.ref));
    }
  });

  await Promise.all(deletePromises);
};

/**
 * Listens for real-time updates to available waiting games.
 * @param {any} db The Firestore instance.
 * @param {(games: (GameDocument & { id: string })[]) => void} callback Callback function to receive the list of games.
 * @returns {() => void} An unsubscribe function.
 */
export const listenToAvailableGames = (
  db: Firestore,
  callback: (games: (GameDocument & { id: string })[]) => void
): (() => void) => {
  const appId = "default-pong-app-id";
  const gamesRef = collection(db, getGamesCollectionPath(appId));

  // Only query by status to avoid index issues
  const q = query(gamesRef, where("status", "==", "waiting"));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    // Filter out any corrupted documents or those without proper data
    const gamesList: (GameDocument & { id: string })[] = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...(data as GameDocument),
        };
      })
      .filter((game) => game.gameCode); // Only include games with a valid game code

    // Client-side sort by createdAt
    callback(
      gamesList.sort(
        (a, b) =>
          (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0)
      )
    );
  });
  return unsubscribe;
};

/**
 * Listens for real-time updates to a specific game document.
 * @param {any} db The Firestore instance.
 * @param {string} gameId The ID of the game to listen to.
 * @param {(gameData: GameDocument | null) => void} callback Callback function to receive the game data.
 * @returns {() => void} An unsubscribe function.
 */
export const listenToGame = (
  db: Firestore,
  gameId: string,
  callback: (gameData: GameDocument | null) => void
): (() => void) => {
  const appId = "default-pong-app-id";
  const gameRef = doc(db, getGamesCollectionPath(appId), gameId);
  const unsubscribe = onSnapshot(gameRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as GameDocument); // Cast data to GameDocument
    } else {
      callback(null);
    }
  });
  return unsubscribe;
};

/**
 * Gets a specific game by its ID.
 * @param {Firestore} db The Firestore instance.
 * @param {string} gameId The ID of the game to retrieve.
 * @returns {Promise<GameDocument | null>} The game document or null if it doesn't exist.
 */
export const getGame = async (
  db: Firestore,
  gameId: string
): Promise<(GameDocument & { id: string }) | null> => {
  const appId = "default-pong-app-id";
  const gameRef = doc(db, getGamesCollectionPath(appId), gameId);
  const gameSnap = await getDoc(gameRef);

  if (!gameSnap.exists()) {
    return null;
  }

  return {
    id: gameSnap.id,
    ...(gameSnap.data() as GameDocument),
  };
};

/**
 * Generates a random 6-character game code
 * @returns {string} A random 6-character code (alpha-numeric)
 */
export const generateGameCode = (): string => {
  // Use only uppercase letters and digits, avoiding characters that look similar
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

/**
 * Checks if a user already has an active game
 * @param {Firestore} db The Firestore instance
 * @param {string} userId The user's ID
 * @returns {Promise<string|null>} The ID of the user's existing game, or null if none exists
 */
export const getUserExistingGame = async (
  db: Firestore,
  userId: string
): Promise<string | null> => {
  const appId = "default-pong-app-id";
  const gamesRef = collection(db, getGamesCollectionPath(appId));
  const q = query(
    gamesRef,
    where("player1Id", "==", userId),
    where("status", "==", "waiting")
  );

  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    return snapshot.docs[0].id;
  }
  return null;
};

/**
 * Joins an existing game by its game code
 * @param {Firestore} db The Firestore instance
 * @param {string} gameCode The game code to join
 * @param {string} userId The user ID of the player joining
 * @returns {Promise<string|null>} The game ID if successful, null if game not found
 */
export const joinGameByCode = async (
  db: Firestore,
  gameCode: string,
  userId: string
): Promise<string | null> => {
  try {
    const appId = "default-pong-app-id";
    const gamesRef = collection(db, getGamesCollectionPath(appId));

    // Get all waiting games first
    const q = query(gamesRef, where("status", "==", "waiting"));

    const snapshot = await getDocs(q);

    // Client-side filtering for game code since we might have index issues
    const matchingGame = snapshot.docs.find((doc) => {
      const data = doc.data();
      return (
        data.gameCode && data.gameCode.toUpperCase() === gameCode.toUpperCase()
      );
    });

    if (!matchingGame) {
      console.log(`No game found with code: ${gameCode}`);
      return null;
    }

    const gameData = matchingGame.data() as GameDocument;

    // Check if the user is trying to join their own game
    if (gameData.player1Id === userId) {
      return matchingGame.id; // Allow them to proceed to the game
    }

    // Join the game
    await updateDoc(matchingGame.ref, {
      player2Id: userId,
      status: "playing",
      lastActivity: serverTimestamp(),
    });

    return matchingGame.id;
  } catch (error) {
    console.error("Error joining game by code:", error);
    return null;
  }
};

/**
 * Deletes a game room
 * @param {Firestore} db The Firestore instance
 * @param {string} gameId The ID of the game to delete
 * @param {string} userId User ID requesting the delete (must be the owner)
 * @returns {Promise<boolean>} Whether deletion was successful
 */
export const deleteGameRoom = async (
  db: Firestore,
  gameId: string,
  userId: string
): Promise<boolean> => {
  try {
    const appId = "default-pong-app-id";
    const gameRef = doc(db, getGamesCollectionPath(appId), gameId);
    const gameSnap = await getDoc(gameRef);

    if (!gameSnap.exists()) {
      console.log("Game not found for deletion");
      return false;
    }

    const gameData = gameSnap.data() as GameDocument;

    // Only the creator (player1) can delete the room
    if (gameData.player1Id !== userId) {
      console.log("Only the room creator can delete it");
      return false;
    }

    await deleteDoc(gameRef);
    console.log(`Game ${gameId} deleted successfully`);
    return true;
  } catch (error) {
    console.error("Error deleting game:", error);
    return false;
  }
};
