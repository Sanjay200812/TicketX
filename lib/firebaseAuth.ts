import {
  signInWithPopup,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth';

import {
  auth,
  googleProvider,
  configureAuthPersistence,
} from './firebase';

export async function loginWithGoogle(): Promise<FirebaseUser> {
  await configureAuthPersistence();

  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function logoutFirebaseUser(): Promise<void> {
  await signOut(auth);
}
