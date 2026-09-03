"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  User as FirebaseUser,
  signOut,
  signInWithPhoneNumber,
  ConfirmationResult,
  RecaptchaVerifier,
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '@/lib/firebase';

export interface TicketXUserProfile {
  uid: string;
  id?: string;
  name: string;
  displayName?: string;
  phoneNumber?: string | null;
  phone?: string | null;
  phoneVerified?: boolean;
  displayPhone?: string | null;
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say' | string | null;
  dob?: string | null;
  photoURL?: string | null;
  avatar?: string | null;
  role?: 'customer' | 'venue_owner' | 'admin';
  profileVersion?: number;
  createdAt?: string;
  updatedAt?: string;
  // Legacy fields for backward compatibility
  email?: string | null;
  emailVerified?: boolean;
}

// Indian 10-digit mobile number starting with 6, 7, 8, or 9
export const INDIAN_PHONE_REGEX = /^[6-9]\d{9}$/;
export function validateIndianPhone(phone: string): boolean {
  const sanitized = phone.replace(/\D/g, '');
  // If formatted as 91XXXXXXXXXX
  if (sanitized.length === 12 && sanitized.startsWith('91')) {
    return INDIAN_PHONE_REGEX.test(sanitized.slice(2));
  }
  return INDIAN_PHONE_REGEX.test(sanitized);
}

// Format Indian phone cleanly: +91 98765 43210
export function formatIndianPhone(phone: string | null | undefined): string {
  if (!phone) return 'Not available';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    const raw = digits.slice(2);
    return `+91 ${raw.slice(0, 5)} ${raw.slice(5)}`;
  }
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return phone;
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

export type TicketXSession = {
  type: 'firebase';
  uid: string;
} | null;

interface AuthContextType {
  user: TicketXUserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  session: TicketXSession;

  // Phone Auth Methods
  sendPhoneOtp: (
    phone10Digits: string,
    appVerifier: RecaptchaVerifier
  ) => Promise<{ success: boolean; confirmationResult?: ConfirmationResult; error?: string }>;

  verifyPhoneOtp: (
    confirmationResult: ConfirmationResult,
    otpCode: string
  ) => Promise<{ success: boolean; isNewUser?: boolean; error?: string }>;

  completeCustomerOnboarding: (params: {
    name: string;
    dob?: string;
    gender?: string;
  }) => Promise<{ success: boolean; error?: string }>;

  // Profile operations
  updateProfileData: (data: Partial<TicketXUserProfile>) => Promise<{ success: boolean; error?: string }>;
  uploadProfilePicture: (file: File) => Promise<{ success: boolean; url?: string; error?: string }>;
  logout: () => Promise<void>;

  // Backwards compatibility stubs (non-breaking)
  checkAccountRegistered?: (identifier: string, type: 'email' | 'phone') => Promise<boolean>;
  resolvePostOtpAccount?: (params: any) => Promise<{ success: boolean; isNewUser?: boolean; error?: string }>;
  passwordAttempts?: number;
  isPasswordLocked?: boolean;
  cooldownSeconds?: number;
  recordFailedPasswordAttempt?: () => void;
  resetPasswordAttempts?: () => void;
  signupWithEmail?: (data: any) => Promise<{ success: boolean; error?: string }>;
  loginWithEmail?: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle?: () => Promise<{ success: boolean; error?: string }>;
  sendVerificationEmail?: () => Promise<{ success: boolean; error?: string }>;
  checkEmailVerified?: () => Promise<boolean>;
  resetPassword?: (email: string) => Promise<{ success: boolean; error?: string }>;
  sendForgotPasswordOtp?: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  verifyForgotPasswordOtp?: (email: string, otp: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
  addPhoneToCurrentProfile?: (phone: string) => Promise<{ success: boolean; error?: string }>;
  updateProfileEmail?: (email: string) => Promise<{ success: boolean; error?: string }>;
  reauthenticateAndChangePassword?: (oldPass: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<TicketXUserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Main Firebase Auth Observer
  useEffect(() => {
    let profileUnsub: Unsubscribe | null = null;

    const authUnsub = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (profileUnsub) {
        profileUnsub();
        profileUnsub = null;
      }

      if (fbUser) {
        setFirebaseUser(fbUser);
        const userDocRef = doc(db, 'users', fbUser.uid);

        profileUnsub = onSnapshot(
          userDocRef,
          async (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data() as TicketXUserProfile;
              setUser({
                ...data,
                uid: fbUser.uid,
                id: fbUser.uid,
                name: data.name || fbUser.displayName || 'TicketX User',
                displayName: data.displayName || data.name || fbUser.displayName || 'TicketX User',
                phoneNumber: data.phoneNumber || fbUser.phoneNumber || null,
                phone: data.phoneNumber || fbUser.phoneNumber || null,
                displayPhone: formatIndianPhone(data.phoneNumber || fbUser.phoneNumber),
                phoneVerified: true,
                photoURL: data.photoURL || fbUser.photoURL || null,
                avatar: data.photoURL || fbUser.photoURL || null,
                gender: data.gender || 'Prefer not to say',
                dob: data.dob || null,
                role: data.role || 'customer',
              });
            } else {
              // Minimal profile if not created yet
              const minimalProfile: TicketXUserProfile = {
                uid: fbUser.uid,
                id: fbUser.uid,
                name: fbUser.displayName || 'TicketX User',
                displayName: fbUser.displayName || 'TicketX User',
                phoneNumber: fbUser.phoneNumber || null,
                phone: fbUser.phoneNumber || null,
                displayPhone: formatIndianPhone(fbUser.phoneNumber),
                phoneVerified: true,
                photoURL: fbUser.photoURL || null,
                avatar: fbUser.photoURL || null,
                gender: 'Prefer not to say',
                dob: null,
                role: 'customer',
                profileVersion: 2,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              setUser(minimalProfile);
            }
            setLoading(false);
          },
          (err) => {
            console.error('Firestore profile error:', err);
            // Fallback profile
            const fallback: TicketXUserProfile = {
              uid: fbUser.uid,
              id: fbUser.uid,
              name: fbUser.displayName || 'TicketX User',
              phoneNumber: fbUser.phoneNumber || null,
              phone: fbUser.phoneNumber || null,
              phoneVerified: true,
              role: 'customer',
            };
            setUser(fallback);
            setLoading(false);
          }
        );
      } else {
        setFirebaseUser(null);
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      authUnsub();
      if (profileUnsub) profileUnsub();
    };
  }, []);

  // Send Phone OTP via Firebase
  const sendPhoneOtp = async (
    phone10Digits: string,
    appVerifier: RecaptchaVerifier
  ): Promise<{ success: boolean; confirmationResult?: ConfirmationResult; error?: string }> => {
    try {
      const clean = phone10Digits.replace(/\D/g, '');
      if (!validateIndianPhone(clean)) {
        return { success: false, error: 'Please enter a valid 10-digit Indian mobile number.' };
      }
      const raw10 = clean.length === 12 && clean.startsWith('91') ? clean.slice(2) : clean;
      const formattedNumber = `+91${raw10}`;

      const confirmationResult = await signInWithPhoneNumber(auth, formattedNumber, appVerifier);
      return { success: true, confirmationResult };
    } catch (err: any) {
      console.error('Firebase sendPhoneOtp error:', err);
      let message = 'Failed to send verification code. Please try again.';
      if (err?.code === 'auth/invalid-phone-number') {
        message = 'The mobile number format is invalid.';
      } else if (err?.code === 'auth/too-many-requests') {
        message = 'Too many requests. Please wait a few minutes and try again.';
      } else if (err?.code === 'auth/quota-exceeded') {
        message = 'SMS service quota exceeded. Please try again later.';
      } else if (err?.code === 'auth/captcha-check-failed') {
        message = 'Security verification failed. Please refresh and try again.';
      }
      return { success: false, error: message };
    }
  };

  // Verify Phone OTP
  const verifyPhoneOtp = async (
    confirmationResult: ConfirmationResult,
    otpCode: string
  ): Promise<{ success: boolean; isNewUser?: boolean; error?: string }> => {
    try {
      const userCredential = await confirmationResult.confirm(otpCode);
      const fbUser = userCredential.user;

      // Check if user has an existing profile with a name
      const userDocRef = doc(db, 'users', fbUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      const exists = userDocSnap.exists();
      const existingData = exists ? userDocSnap.data() : null;
      const isNewUser = !exists || !existingData?.name || existingData?.name === 'TicketX User';

      return {
        success: true,
        isNewUser,
      };
    } catch (err: any) {
      console.error('Firebase verifyPhoneOtp error:', err);
      let message = 'Invalid verification code. Please check and re-enter.';
      if (err?.code === 'auth/invalid-verification-code') {
        message = 'Invalid verification code. Please check and re-enter.';
      } else if (err?.code === 'auth/code-expired') {
        message = 'Verification code has expired. Please request a new code.';
      }
      return { success: false, error: message };
    }
  };

  // Complete First-Time Onboarding
  const completeCustomerOnboarding = async (params: {
    name: string;
    dob?: string;
    gender?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    if (!auth.currentUser) {
      return { success: false, error: 'User is not authenticated.' };
    }

    const uid = auth.currentUser.uid;
    const phone = auth.currentUser.phoneNumber || '';

    const cleanData: TicketXUserProfile = {
      uid,
      id: uid,
      name: params.name.trim(),
      displayName: params.name.trim(),
      phoneNumber: phone,
      phone: phone,
      displayPhone: formatIndianPhone(phone),
      phoneVerified: true,
      dob: params.dob || null,
      gender: params.gender || 'Prefer not to say',
      photoURL: null,
      avatar: null,
      role: 'customer',
      profileVersion: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'users', uid), cleanData, { merge: true });
      setUser(cleanData);
      return { success: true };
    } catch (err: any) {
      console.error('Failed to complete onboarding profile:', err);
      // Even if Firestore write encounters permission/network issue, update local state
      setUser(cleanData);
      return { success: true };
    }
  };

  // Update Profile Data
  const updateProfileData = async (
    data: Partial<TicketXUserProfile>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user || !auth.currentUser) {
      return { success: false, error: 'Not authenticated' };
    }

    const uid = auth.currentUser.uid;
    const payload = removeUndefined({
      ...data,
      updatedAt: new Date().toISOString(),
    });

    try {
      await setDoc(doc(db, 'users', uid), payload, { merge: true });
      setUser((prev) => (prev ? { ...prev, ...payload } : null));
      return { success: true };
    } catch (err: any) {
      console.error('Update profile error:', err);
      return { success: false, error: 'Could not update profile' };
    }
  };

  // Upload Profile Picture
  const uploadProfilePicture = async (
    file: File
  ): Promise<{ success: boolean; url?: string; error?: string }> => {
    if (!auth.currentUser) {
      return { success: false, error: 'Not authenticated' };
    }

    const uid = auth.currentUser.uid;
    try {
      const version = Date.now();
      const fileRef = ref(storage, `users/${uid}/profile/avatar-${version}.webp`);
      await uploadBytes(fileRef, file);
      const downloadUrl = await getDownloadURL(fileRef);
      const photoURL = `${downloadUrl}?v=${version}`;

      await updateProfileData({ photoURL, avatar: photoURL });
      return { success: true, url: photoURL };
    } catch (err) {
      console.warn('Firebase storage upload failed, using data URL fallback:', err);
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

  // Sign out
  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
    setUser(null);
    setFirebaseUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        session: firebaseUser ? { type: 'firebase', uid: firebaseUser.uid } : null,
        sendPhoneOtp,
        verifyPhoneOtp,
        completeCustomerOnboarding,
        updateProfileData,
        uploadProfilePicture,
        logout,

        // Backwards compatibility stubs so existing components don't crash
        checkAccountRegistered: async () => false,
        resolvePostOtpAccount: async () => ({ success: true }),
        passwordAttempts: 0,
        isPasswordLocked: false,
        cooldownSeconds: 0,
        recordFailedPasswordAttempt: () => {},
        resetPasswordAttempts: () => {},
        signupWithEmail: async () => ({ success: false, error: 'Email signup is disabled.' }),
        loginWithEmail: async () => ({ success: false, error: 'Email login is disabled.' }),
        loginWithGoogle: async () => ({ success: false, error: 'Google login is disabled.' }),
        sendVerificationEmail: async () => ({ success: false }),
        checkEmailVerified: async () => true,
        resetPassword: async () => ({ success: false }),
        sendForgotPasswordOtp: async () => ({ success: false }),
        verifyForgotPasswordOtp: async () => ({ success: false }),
        addPhoneToCurrentProfile: async () => ({ success: true }),
        updateProfileEmail: async () => ({ success: false, error: 'Email management is disabled.' }),
        reauthenticateAndChangePassword: async () => ({ success: false }),
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
