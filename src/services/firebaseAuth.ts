import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  User as FirebaseUser,
} from 'firebase/auth';

export const firebaseConfig = {
  apiKey: "AIzaSyBA8GCNWAL3q-owrAC2R8NSfDgS7nhhxlg",
  authDomain: "techmain-3dc2a.firebaseapp.com",
  projectId: "techmain-3dc2a",
  storageBucket: "techmain-3dc2a.firebasestorage.app",
  messagingSenderId: "27211537518",
  appId: "1:27211537518:web:57ca0fe98febc02c6f1a7f",
  measurementId: "G-Y3754PL0HT",
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async (rememberMe: boolean = true): Promise<FirebaseUser | null> => {
  try {
    await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error('Google Auth Error:', error);
    throw error;
  }
};

export const signInWithCredentials = async (
  emailOrUsername: string,
  password: string,
  rememberMe: boolean = true
): Promise<FirebaseUser> => {
  await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
  
  // If user entered a username instead of an email, normalize to campus domain format if appropriate
  const email = emailOrUsername.includes('@')
    ? emailOrUsername.trim().toLowerCase()
    : `${emailOrUsername.trim().toLowerCase()}@campus.edu`;

  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
};

export const registerUser = async (
  username: string,
  email: string,
  password: string
): Promise<FirebaseUser> => {
  const credential = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
  if (credential.user) {
    await updateProfile(credential.user, {
      displayName: username.trim(),
    });
  }
  return credential.user;
};

export const sendPasswordRecovery = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email.trim().toLowerCase());
};

export const logoutGoogle = async (): Promise<void> => {
  await signOut(auth);
};

export const subscribeToAuth = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
