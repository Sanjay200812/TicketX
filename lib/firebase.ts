import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  browserLocalPersistence,
  getAuth,
  GoogleAuthProvider,
  setPersistence,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'ticketx-61655.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'ticketx-61655',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'ticketx-61655.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '942302888270',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:942302888270:web:caf15c79a631457d005e1f',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-8W5TGK82C4',
};

export const firebaseApp =
  getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApp();

export const auth = getAuth(firebaseApp);

export const googleProvider = new GoogleAuthProvider();

// Requirement 19: Force Google account chooser so user selects real Google account
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export async function configureAuthPersistence() {
  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch (err) {
    console.error('Failed to configure auth persistence:', err);
  }
}
