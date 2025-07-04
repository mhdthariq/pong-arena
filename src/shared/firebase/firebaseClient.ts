import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
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
    console.error("Error initializing Firebase:", error);
    return { app: null, db: null, auth: null };
  }
};

/**
 * Signs in a user anonymously to Firebase.
 * @returns {Promise<string>} The user ID upon successful sign in.
 */
export const signInAnonymouslyToFirebase = async (): Promise<string> => {
  const { auth } = getFirebaseClient();
  if (!auth) throw new Error("Firebase auth not initialized");

  try {
    const userCredential = await signInAnonymously(auth);
    return userCredential.user.uid;
  } catch (error) {
    console.error("Error signing in anonymously:", error);
    throw error;
  }
};

/**
 * Sets up an auth state change listener.
 * @param {Function} setUserId Function to set the user ID state.
 * @param {Function} setIsAuthReady Function to set the auth ready state.
 * @param {Function} setMessageBox Function to show messages to the user.
 * @returns {Unsubscribe} Function to unsubscribe from the auth state listener.
 */
export const setupFirebaseAuthListener = (
  setUserId: (userId: string | null) => void,
  setIsAuthReady: (isReady: boolean) => void,
  setMessageBox: (messageBox: {
    message: string;
    onConfirm: () => void;
  }) => void
): Unsubscribe => {
  const { auth } = getFirebaseClient();
  if (!auth) {
    setMessageBox({
      message: "Failed to initialize Firebase auth",
      onConfirm: () => {},
    });
    return () => {};
  }

  // Clean up any existing listener
  if (authUnsubscribe) {
    authUnsubscribe();
  }

  // Set up new listener
  authUnsubscribe = onAuthStateChanged(
    auth,
    (user) => {
      if (user) {
        // User is signed in
        setUserId(user.uid);
        setIsAuthReady(true);
      } else {
        // No user is signed in, attempt anonymous sign-in
        signInAnonymouslyToFirebase()
          .then((uid) => {
            setUserId(uid);
            setIsAuthReady(true);
          })
          .catch((error) => {
            console.error("Error during anonymous auth:", error);
            setMessageBox({
              message: "Failed to authenticate. Please try again.",
              onConfirm: () => {},
            });
            setIsAuthReady(false);
          });
      }
    },
    (error) => {
      console.error("Auth state change error:", error);
      setMessageBox({
        message: "Authentication error. Please refresh the page.",
        onConfirm: () => {},
      });
    }
  );

  return authUnsubscribe;
};
