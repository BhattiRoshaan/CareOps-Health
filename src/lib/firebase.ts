import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  getIdTokenResult,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App singleton
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// CRITICAL: The app will break without passing firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test on app initialization
export async function testConnection(): Promise<boolean> {
  try {
    if (auth.currentUser) {
      await getDocFromServer(doc(db, 'users', auth.currentUser.uid));
    }
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline / check configuration:', error.message);
      return false;
    }
    return true;
  }
}

// Google Sign-In with popup (Real Firebase Auth)
export async function signInWithGoogle(): Promise<FirebaseUser> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
}

// Real Firebase Email & Password Sign-In
export async function signInWithEmail(email: string, password: string): Promise<FirebaseUser> {
  if (!email || !password) {
    throw new Error('Email address and password are required.');
  }
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
    return userCredential.user;
  } catch (error) {
    console.error('Firebase Email Sign-In error:', error);
    throw error;
  }
}

// Real Firebase Email & Password Registration
export async function signUpWithEmail(email: string, password: string, displayName?: string): Promise<FirebaseUser> {
  if (!email || !password) {
    throw new Error('Email address and password are required.');
  }
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    if (displayName) {
      await updateProfile(userCredential.user, { displayName });
    }
    return userCredential.user;
  } catch (error) {
    console.error('Firebase Email Sign-Up error:', error);
    throw error;
  }
}

// Real Firebase Password Reset Email
export async function sendPasswordReset(email: string): Promise<void> {
  if (!email) {
    throw new Error('Please enter your registered email address.');
  }
  try {
    await sendPasswordResetEmail(auth, email.trim());
  } catch (error) {
    console.error('Firebase Password Reset error:', error);
    throw error;
  }
}

// Retrieve cryptographically verified token claims from Firebase Auth
export async function getVerifiedTokenClaims(user: FirebaseUser): Promise<{
  role?: string;
  admin?: boolean;
  claims: Record<string, any>;
  token: string;
}> {
  try {
    const tokenResult = await getIdTokenResult(user, true);
    return {
      role: (tokenResult.claims.role as string) || undefined,
      admin: Boolean(tokenResult.claims.admin),
      claims: tokenResult.claims,
      token: tokenResult.token
    };
  } catch (e) {
    console.warn('Could not inspect Firebase token claims:', e);
    const token = await user.getIdToken();
    return { claims: {}, token };
  }
}

// Sign out
export async function logoutFirebase(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}

export { onAuthStateChanged };
export type { FirebaseUser };
