import { getAnalytics, isSupported } from 'firebase/analytics';
import { firebaseApp } from './firebase';

export async function initializeAnalytics() {
  if (typeof window === 'undefined') return null;

  try {
    const supported = await isSupported();
    if (!supported) return null;
    return getAnalytics(firebaseApp);
  } catch (err) {
    console.error('Firebase analytics initialization skipped:', err);
    return null;
  }
}
