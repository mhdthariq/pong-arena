import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  // signInWithCustomToken is commented out to prevent unused import errors
  // signInWithCustomToken,
  onAuthStateChanged,
  Auth,
  Unsubscribe,
} from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

let appInstance: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;
let authInstance: Auth | null = null;
let authUnsubscribe: Unsubscribe | null = null;

interface FirebaseClient {
  app: FirebaseApp | null;
  db: Firestore | null;
  auth: Auth | null;
}

/**
 * Initializes Firebase client-side or returns existing instances.
 * This ensures Firebase is initialized only once.
 * @returns {FirebaseClient} Firebase app, db, and auth instances.
 */
export const getFirebaseClient = (): FirebaseClient => {
  if (appInstance) {
    return { app: appInstance, db: dbInstance, auth: authInstance };
  }

  // Manual configuration - replace with your own Firebase web app configuration
  // You can get these values from the Firebase Console > Project Settings > Web App
  const firebaseConfig = {
    apiKey: "AIzaSyDIwxAcWerrY6bETpPmMamZFKAQxD-yJqU",
    authDomain: "pong-arena-firebase.firebaseapp.com",
    projectId: "pong-arena-firebase",
    storageBucket: "pong-arena-firebase.firebasestorage.app",
    messagingSenderId: "958677315192",
    appId: "1:958677315192:web:85ad7ac26997e67796c78d",
  };

  try {
    if (!getApps().length) {
      appInstance = initializeApp(firebaseConfig);
    } else {
      appInstance = getApp();
    }

    dbInstance = getFirestore(appInstance);
    authInstance = getAuth(appInstance);

    return { app: appInstance, db: dbInstance, auth: authInstance };
  } catch (error) {
    console.error("Firebase initialization error:", error);
    return { app: null, db: null, auth: null };
  }
};

/**
 * Sets up the Firebase authentication listener for client-side use.
 * @param {(userId: string | null) => void} setUserId Callback to set the user ID in React state.
 * @param {(isReady: boolean) => void} setIsAuthReady Callback to set auth readiness in React state.
 * @param {(messageBoxState: { message: string; onConfirm: () => void; showCancel?: boolean; onCancel?: () => void }) => void} setMessageBox Callback to display messages to the user.
 * @returns {Unsubscribe} An unsubscribe function for the auth listener.
 */
export const setupFirebaseAuthListener = (
  setUserId: (userId: string | null) => void,
  setIsAuthReady: (isReady: boolean) => void,
  setMessageBox: (messageBoxState: {
    message: string;
    onConfirm: () => void;
    showCancel?: boolean;
    onCancel?: () => void;
  }) => void
): Unsubscribe => {
  const { auth } = getFirebaseClient();
  if (!auth) {
    console.error("Firebase Auth not initialized for listener setup.");
    setIsAuthReady(true);
    return () => {};
  }

  if (authUnsubscribe) {
    authUnsubscribe();
  }

  authUnsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      setUserId(user.uid);
    } else {
      try {
        if (false) {
          // Auth token logic removed for now
        } else {
          const anonUser = await signInAnonymously(auth);
          setUserId(anonUser.user.uid);
        }
      } catch (error) {
        console.error("Error during Firebase sign-in:", error);
        setMessageBox({
          message: `Failed to sign in: ${
            error instanceof Error ? error.message : "Unknown error"
          }. Multiplayer features may not work.`,
          onConfirm: () => setMessageBox({ message: "", onConfirm: () => {} }),
        });
      }
    }
    setIsAuthReady(true);
  });

  return () => {
    if (authUnsubscribe) {
      authUnsubscribe();
      authUnsubscribe = null;
    }
  };
};
