"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, Unsubscribe, collection, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '@/lib/firebase';

export interface TicketXUserProfile {
  uid: string;
  id?: string;
  name: string;
  displayName?: string;
  email?: string | null;
  emailVerified?: boolean;
  phoneNumber?: string | null;
  phone?: string | null;
  phoneVerified?: boolean;
  displayPhone?: string | null;
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say' | string | null;
  dob?: string | null;
  photoURL?: string | null;
  avatar?: string | null;
  authMethods?: string[];
  role?: 'customer' | 'venue_owner' | 'admin';
  profileVersion?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Single password rule — minimum 6 characters only
export function validatePasswordRules(pass: string): { isValid: boolean } {
  return {
    isValid: pass.length >= 6,
  };
}

// Indian 10-digit mobile number starting with 6, 7, 8, or 9 (Requirements 1, 33)
export const INDIAN_PHONE_REGEX = /^[6-9]\d{9}$/;
export function validateIndianPhone(phone: string): boolean {
  const sanitized = phone.replace(/\D/g, '');
  return INDIAN_PHONE_REGEX.test(sanitized);
}

// Age Check with minimum age 16 requirements
export function validateMinimumAge16(dobStr: string): boolean {
  if (!dobStr) return false;
  const parts = dobStr.split('-');
  if (parts.length !== 3) return false;

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) return false;

  const dob = new Date(year, month, day);
  if (dob.getFullYear() !== year || dob.getMonth() !== month || dob.getDate() !== day) {
    return false;
  }

  const today = new Date();
  const maxAllowedDob = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate());

  return dob <= maxAllowedDob;
}

// Helper to strip undefined values before writing to Firestore
export function removeUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined)
  ) as Partial<T>;
}

export type TicketXSession =
  | {
      type: 'firebase';
      uid: string;
    }
  | {
      type: 'demo-phone';
      phone: string;
      accountKey: string;
    }
  | {
      type: 'demo-email';
      email: string;
      accountKey: string;
    }
  | null;

interface AuthContextType {
  user: TicketXUserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  session: TicketXSession;

  // Account Existence Lookup
  checkAccountRegistered: (identifier: string, type: 'email' | 'phone') => Promise<boolean>;

  // Post-OTP Verification Account Resolver
  resolvePostOtpAccount: (params: {
    identifier: string;
    type: 'phone' | 'email';
    name?: string;
  }) => Promise<{ success: boolean; isNewUser?: boolean; error?: string }>;

  // Rate Limiting
  passwordAttempts: number;
  isPasswordLocked: boolean;
  cooldownSeconds: number;
  recordFailedPasswordAttempt: () => void;
  resetPasswordAttempts: () => void;

  // Email authentication
  signupWithEmail: (data: {
    name: string;
    email: string;
    pass: string;
    phone: string;
    gender?: string;
    dob?: string;
  }) => Promise<{ success: boolean; error?: string }>;

  loginWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;

  sendVerificationEmail: () => Promise<{ success: boolean; error?: string }>;
  checkEmailVerified: () => Promise<boolean>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  sendForgotPasswordOtp: (email: string) => Promise<{ success: boolean; message?: string; demoOtp?: string; error?: string }>;
  verifyForgotPasswordOtp: (email: string, otp: string, newPass: string) => Promise<{ success: boolean; error?: string }>;

  // Profile operations & Security
  updateProfileData: (data: Partial<TicketXUserProfile>) => Promise<{ success: boolean; error?: string }>;
  uploadProfilePicture: (file: File) => Promise<{ success: boolean; url?: string; error?: string }>;
  addPhoneToCurrentProfile: (phone: string) => Promise<{ success: boolean; error?: string }>;
  updateProfileEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  reauthenticateAndChangePassword: (oldPass: string, newPass: string) => Promise<{ success: boolean; error?: string }>;

  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<TicketXUserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [demoSessionUser, setDemoSessionUser] = useState<{ identifier: string; accountKey: string; type: 'phone' | 'email' } | null>(null);
  const [loading, setLoading] = useState(true);

  // Rate limiting state
  const [passwordAttempts, setPasswordAttempts] = useState<number>(0);
  const [isPasswordLocked, setIsPasswordLocked] = useState<boolean>(false);
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);

  const currentSession: TicketXSession = firebaseUser
    ? { type: 'firebase', uid: firebaseUser.uid }
    : demoSessionUser?.type === 'phone'
    ? { type: 'demo-phone', phone: demoSessionUser.identifier, accountKey: demoSessionUser.accountKey }
    : demoSessionUser?.type === 'email'
    ? { type: 'demo-email', email: demoSessionUser.identifier, accountKey: demoSessionUser.accountKey }
    : null;

  // Rate Limiter Cooldown Timer
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const interval = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          setIsPasswordLocked(false);
          setPasswordAttempts(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownSeconds]);

  const recordFailedPasswordAttempt = () => {
    setPasswordAttempts((prev) => {
      const updated = prev + 1;
      if (updated >= 5) {
        setIsPasswordLocked(true);
        setCooldownSeconds(60);
      }
      return updated;
    });
  };

  const resetPasswordAttempts = () => {
    setPasswordAttempts(0);
    setIsPasswordLocked(false);
    setCooldownSeconds(0);
  };

  // Initialize Demo Session if present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedDemo = localStorage.getItem('ticketx_demo_session');
      if (storedDemo) {
        try {
          const parsed = JSON.parse(storedDemo);
          if (parsed && parsed.identifier && parsed.accountKey) {
            setDemoSessionUser(parsed);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  // SINGLE main Firebase onAuthStateChanged observer with Robust Bootstrap & Legacy Migration (Requirements 46, 47, 48, 49, 50, 51)
  useEffect(() => {
    let profileUnsub: Unsubscribe | null = null;

    const authUnsub = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (profileUnsub) {
        profileUnsub();
        profileUnsub = null;
      }

      if (fbUser) {
        setFirebaseUser(fbUser);
        setDemoSessionUser(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('ticketx_demo_session');
        }

        const userDocRef = doc(db, 'users', fbUser.uid);

        // Check if legacy profile exists matching user email in local storage or collections
        let legacyProfileData: Partial<TicketXUserProfile> = {};
        if (typeof window !== 'undefined' && fbUser.email) {
          const emailClean = fbUser.email.toLowerCase().trim();
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.includes(':profile')) {
              try {
                const parsed = JSON.parse(localStorage.getItem(k) || '{}');
                if (parsed.email && parsed.email.toLowerCase().trim() === emailClean) {
                  legacyProfileData = parsed;
                  break;
                }
              } catch (e) {
                // ignore
              }
            }
          }
        }

        profileUnsub = onSnapshot(
          userDocRef,
          async (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data() as TicketXUserProfile;
              setUser({
                ...data,
                uid: `firebase:${fbUser.uid}`,
                id: fbUser.uid,
                name: data.name || fbUser.displayName || (fbUser.email ? fbUser.email.split('@')[0] : 'TicketX User'),
                displayName: data.displayName || data.name || fbUser.displayName || 'TicketX User',
                email: data.email || fbUser.email || null,
                phone: data.phoneNumber || data.phone || fbUser.phoneNumber || undefined,
                phoneNumber: data.phoneNumber || data.phone || fbUser.phoneNumber || undefined,
                emailVerified: fbUser.emailVerified || data.emailVerified || false,
                photoURL: data.photoURL || fbUser.photoURL || undefined,
                avatar: data.photoURL || fbUser.photoURL || undefined,
                gender: data.gender || 'Prefer not to say',
                dob: data.dob || null,
                role: data.role || 'customer',
              });
            } else {
              // Bootstrap minimal profile using Firebase identity & legacy attributes (Requirement 48, 49)
              const bootstrappedName =
                legacyProfileData.name ||
                fbUser.displayName ||
                (fbUser.email ? fbUser.email.split('@')[0] : 'TicketX User');

              const initialProfileData = removeUndefined({
                uid: `firebase:${fbUser.uid}`,
                id: fbUser.uid,
                name: bootstrappedName,
                displayName: bootstrappedName,
                email: fbUser.email || legacyProfileData.email || null,
                emailVerified: fbUser.emailVerified || legacyProfileData.emailVerified || false,
                phoneNumber: fbUser.phoneNumber || legacyProfileData.phoneNumber || null,
                phone: fbUser.phoneNumber || legacyProfileData.phone || null,
                displayPhone: legacyProfileData.displayPhone || (fbUser.phoneNumber ? fbUser.phoneNumber : null),
                phoneVerified: Boolean(fbUser.phoneNumber || legacyProfileData.phoneVerified),
                gender: legacyProfileData.gender || 'Prefer not to say',
                dob: legacyProfileData.dob || null,
                photoURL: fbUser.photoURL || legacyProfileData.photoURL || null,
                avatar: fbUser.photoURL || legacyProfileData.avatar || null,
                role: 'customer',
                profileVersion: 1,
                authMethods: fbUser.providerData.map((p) => p.providerId),
                createdAt: legacyProfileData.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              });

              try {
                await setDoc(userDocRef, initialProfileData, { merge: true });
              } catch (setErr) {
                console.warn('Could not write profile to Firestore immediately:', setErr);
              }

              setUser(initialProfileData as unknown as TicketXUserProfile);
            }
            setLoading(false);
          },
          (err) => {
            console.error('Firestore profile error:', err);
            // Fallback: don't let error lock user out as "Not Registered"
            const fallbackProfile: TicketXUserProfile = {
              uid: `firebase:${fbUser.uid}`,
              id: fbUser.uid,
              name: fbUser.displayName || (fbUser.email ? fbUser.email.split('@')[0] : 'TicketX User'),
              email: fbUser.email,
              emailVerified: fbUser.emailVerified,
              photoURL: fbUser.photoURL,
              phoneNumber: fbUser.phoneNumber,
              role: 'customer',
              profileVersion: 1,
            };
            setUser(fallbackProfile);
            setLoading(false);
          }
        );
      } else {
        setFirebaseUser(null);
        if (demoSessionUser) {
          loadDemoSessionUser(demoSessionUser);
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    });

    return () => {
      authUnsub();
      if (profileUnsub) profileUnsub();
    };
  }, [demoSessionUser?.identifier]);

  const loadDemoSessionUser = (demoSession: { identifier: string; accountKey: string; type: 'phone' | 'email' }, fallbackName?: string) => {
    const storageKey = `ticketx:${demoSession.accountKey}:profile`;
    let storedProfile: TicketXUserProfile | null = null;

    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        try {
          storedProfile = JSON.parse(raw);
        } catch (e) {
          console.error(e);
        }
      }
    }

    if (!storedProfile) {
      storedProfile = {
        uid: demoSession.accountKey,
        id: demoSession.accountKey,
        name: fallbackName || (demoSession.type === 'phone' ? `TicketX User (+91 ${demoSession.identifier.slice(-4)})` : demoSession.identifier.split('@')[0]),
        email: demoSession.type === 'email' ? demoSession.identifier : null,
        phoneNumber: demoSession.type === 'phone' ? `+91${demoSession.identifier}` : null,
        displayPhone: demoSession.type === 'phone' ? `+91 ${demoSession.identifier}` : null,
        phoneVerified: demoSession.type === 'phone',
        emailVerified: demoSession.type === 'email',
        gender: 'Prefer not to say',
        role: 'customer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, JSON.stringify(storedProfile));
      }
    } else if (fallbackName && storedProfile.name !== fallbackName) {
      storedProfile.name = fallbackName;
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, JSON.stringify(storedProfile));
      }
    }

    setUser(storedProfile);
    setLoading(false);
  };

  // Account Registration Lookup
  const checkAccountRegistered = async (identifier: string, type: 'email' | 'phone'): Promise<boolean> => {
    if (!identifier) return false;
    const clean = identifier.trim().toLowerCase();

    // Check local storage accounts
    if (typeof window !== 'undefined') {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes(':profile')) {
          try {
            const profile = JSON.parse(localStorage.getItem(key) || '{}');
            if (type === 'email' && profile.email?.toLowerCase() === clean) return true;
            if (type === 'phone' && profile.phoneNumber?.includes(clean.slice(-10))) return true;
          } catch (e) {
            console.error(e);
          }
        }
      }
    }

    // Check Firestore users collection
    try {
      const usersRef = collection(db, 'users');
      const q = type === 'email'
        ? query(usersRef, where('email', '==', clean))
        : query(usersRef, where('phoneNumber', '==', `+91${clean.slice(-10)}`));

      const snap = await getDocs(q);
      return !snap.empty;
    } catch (e) {
      console.error('Account lookup error:', e);
      return false;
    }
  };

  // Post-OTP Verification Account Resolver & Auto-Bootstrap (Requirements 3, 4, 34)
  const resolvePostOtpAccount = async ({
    identifier,
    type,
    name,
  }: {
    identifier: string;
    type: 'phone' | 'email';
    name?: string;
  }): Promise<{ success: boolean; isNewUser?: boolean; error?: string }> => {
    const clean = identifier.trim().toLowerCase();

    if (auth.currentUser) {
      await signOut(auth);
      setFirebaseUser(null);
    }

    const cleanDigits = type === 'phone' ? clean.replace(/\D/g, '').slice(-10) : clean;
    const accountKey = type === 'phone' ? `phone:+91${cleanDigits}` : `email:${clean}`;
    const demoSession = { identifier: cleanDigits, accountKey, type };

    if (typeof window !== 'undefined') {
      localStorage.setItem('ticketx_demo_session', JSON.stringify(demoSession));
    }
    setDemoSessionUser(demoSession);
    loadDemoSessionUser(demoSession, name);
    return { success: true, isNewUser: false };
  };

  // EMAIL & PASSWORD SIGNUP
  const signupWithEmail = async (data: {
    name: string;
    email: string;
    pass: string;
    phone: string;
    gender?: string;
    dob?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const cleanPhone = data.phone.replace(/\D/g, '').slice(0, 10);
      if (!validateIndianPhone(cleanPhone)) {
        return { success: false, error: 'Enter a valid number' };
      }

      if (data.pass.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters.' };
      }

      if (data.dob && !validateMinimumAge16(data.dob)) {
        return { success: false, error: "Doesn't meet age requirements." };
      }

      if (typeof window !== 'undefined') {
        localStorage.removeItem('ticketx_demo_session');
      }
      setDemoSessionUser(null);

      const userCred = await createUserWithEmailAndPassword(auth, data.email, data.pass);
      const fbUser = userCred.user;

      const profile = removeUndefined({
        uid: `firebase:${fbUser.uid}`,
        id: fbUser.uid,
        name: data.name,
        displayName: data.name,
        email: data.email ?? null,
        emailVerified: false,
        phoneNumber: `+91${cleanPhone}`,
        phone: `+91${cleanPhone}`,
        displayPhone: `+91 ${cleanPhone}`,
        phoneVerified: false,
        gender: data.gender ?? 'Prefer not to say',
        dob: data.dob ?? null,
        role: 'customer',
        profileVersion: 1,
        authMethods: ['password'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      await setDoc(doc(db, 'users', fbUser.uid), profile, { merge: true });
      await sendEmailVerification(fbUser).catch(() => {});

      setUser(profile as unknown as TicketXUserProfile);
      return { success: true };
    } catch (err: any) {
      let msg = 'Failed to create account.';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'An account with this email already exists. Please sign in.';
      }
      return { success: false, error: msg };
    }
  };

  // EMAIL & PASSWORD LOGIN
  const loginWithEmail = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    if (isPasswordLocked) {
      return { success: false, error: `Too many failed attempts. Try again in ${cooldownSeconds}s.` };
    }

    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('ticketx_demo_session');
      }
      setDemoSessionUser(null);

      await signInWithEmailAndPassword(auth, email, pass);
      resetPasswordAttempts();
      return { success: true };
    } catch (err: any) {
      recordFailedPasswordAttempt();

      if (auth.currentUser) {
        await signOut(auth);
      }
      setFirebaseUser(null);
      setUser(null);

      let msg = 'No account found. Sign up first.';
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Wrong password.';
      } else if (err.code === 'auth/user-not-found') {
        msg = 'No account found. Sign up first.';
      }
      return { success: false, error: msg };
    }
  };

  // GOOGLE AUTHENTICATION
  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('ticketx_demo_session');
      }
      setDemoSessionUser(null);

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
      return { success: true };
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      let errorMsg = 'Unable to sign in with Google. Please try again.';
      if (err.code === 'auth/popup-closed-by-user') {
        errorMsg = 'Sign in was cancelled.';
      }
      return { success: false, error: errorMsg };
    }
  };

  const sendVerificationEmail = async (): Promise<{ success: boolean; error?: string }> => {
    if (!auth.currentUser) return { success: false, error: 'User not authenticated.' };
    try {
      await sendEmailVerification(auth.currentUser);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const checkEmailVerified = async (): Promise<boolean> => {
    if (!auth.currentUser) return false;
    await auth.currentUser.reload();
    return auth.currentUser.emailVerified;
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'Failed to send password reset link.' };
    }
  };

  const sendForgotPasswordOtp = async (
    email: string
  ): Promise<{ success: boolean; message?: string; demoOtp?: string; error?: string }> => {
    try {
      const isRegistered = await checkAccountRegistered(email, 'email');
      if (!isRegistered) {
        return { success: false, error: 'No account found. Sign up first.' };
      }

      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send-otp', email }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Failed to send OTP.' };
      return { success: true, message: data.message, demoOtp: data.demoOtp };
    } catch (err: any) {
      return { success: false, error: 'Network error sending OTP.' };
    }
  };

  const verifyForgotPasswordOtp = async (
    email: string,
    otp: string,
    newPass: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      if (newPass.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters.' };
      }

      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify-reset', email, otp, newPassword: newPass }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Password reset failed.' };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'Network error verifying OTP.' };
    }
  };

  // Safe Profile Data Updates
  const updateProfileData = async (data: Partial<TicketXUserProfile>): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'No active profile.' };

    if (data.dob && !validateMinimumAge16(data.dob)) {
      return { success: false, error: "Doesn't meet age requirements." };
    }

    const updated = {
      ...user,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    const cleanData = removeUndefined(updated as Record<string, unknown>);

    if (firebaseUser) {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      await setDoc(userDocRef, cleanData, { merge: true });
    } else if (demoSessionUser) {
      const storageKey = `ticketx:${demoSessionUser.accountKey}:profile`;
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, JSON.stringify(cleanData));
      }
    }

    setUser(cleanData as unknown as TicketXUserProfile);
    return { success: true };
  };

  // PROFILE PHONE LINKING / UPDATING
  const addPhoneToCurrentProfile = async (phone: string): Promise<{ success: boolean; error?: string }> => {
    const cleanPhone = phone.replace(/\D/g, '').slice(0, 10);
    if (!validateIndianPhone(cleanPhone)) {
      return { success: false, error: 'Enter a valid number' };
    }

    return await updateProfileData({
      phoneNumber: `+91${cleanPhone}`,
      phone: `+91${cleanPhone}`,
      displayPhone: `+91 ${cleanPhone}`,
      phoneVerified: true,
    });
  };

  // PROFILE EMAIL LINKING / UPDATING (Requirement 13, 14)
  const updateProfileEmail = async (newEmail: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = newEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return { success: false, error: 'Enter a valid email address' };
    }

    return await updateProfileData({
      email: cleanEmail,
      emailVerified: true,
    });
  };

  // Profile Picture Upload
  const uploadProfilePicture = async (file: File): Promise<{ success: boolean; url?: string; error?: string }> => {
    if (!user) return { success: false, error: 'User not logged in.' };

    try {
      const version = Date.now();
      let photoURL = '';

      if (firebaseUser) {
        const fileRef = ref(storage, `users/${firebaseUser.uid}/profile/avatar-${version}.webp`);
        await uploadBytes(fileRef, file);
        const downloadUrl = await getDownloadURL(fileRef);
        photoURL = `${downloadUrl}?v=${version}`;
      } else if (demoSessionUser) {
        photoURL = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      } else {
        photoURL = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      await updateProfileData({ photoURL, avatar: photoURL });
      return { success: true, url: photoURL };
    } catch (err: any) {
      console.error('Photo upload error:', err);
      // If Firebase storage fails (e.g. offline/rules), store base64 in profile
      try {
        const reader = new FileReader();
        const base64Url = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        await updateProfileData({ photoURL: base64Url, avatar: base64Url });
        return { success: true, url: base64Url };
      } catch (fallbackErr) {
        return { success: false, error: 'Image upload failed.' };
      }
    }
  };

  const reauthenticateAndChangePassword = async (oldPass: string, newPass: string): Promise<{ success: boolean; error?: string }> => {
    if (!auth.currentUser || !auth.currentUser.email) {
      return { success: false, error: 'User re-authentication failed.' };
    }

    if (newPass.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, oldPass);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPass);
      return { success: true };
    } catch (err: any) {
      let msg = 'Failed to change password.';
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Wrong password.';
      }
      return { success: false, error: msg };
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);

    if (typeof window !== 'undefined') {
      localStorage.removeItem('ticketx_demo_session');
    }

    setDemoSessionUser(null);
    setFirebaseUser(null);
    setUser(null);

    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }

    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        session: currentSession,
        checkAccountRegistered,
        resolvePostOtpAccount,
        passwordAttempts,
        isPasswordLocked,
        cooldownSeconds,
        recordFailedPasswordAttempt,
        resetPasswordAttempts,
        signupWithEmail,
        loginWithEmail,
        loginWithGoogle,
        sendVerificationEmail,
        checkEmailVerified,
        resetPassword,
        sendForgotPasswordOtp,
        verifyForgotPasswordOtp,
        updateProfileData,
        uploadProfilePicture,
        addPhoneToCurrentProfile,
        updateProfileEmail,
        reauthenticateAndChangePassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
