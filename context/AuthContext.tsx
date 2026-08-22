"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { loginWithGoogle as firebaseLoginWithGoogle, logoutFirebaseUser } from '@/lib/firebaseAuth';

export interface TicketXUser {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  displayPhone?: string;
  avatar?: string;
  authMethod: 'email' | 'phone' | 'google';
  role?: 'customer' | 'venue_owner' | 'admin';
  createdAt: string;
}

interface PendingOtp {
  phone: string;
  code: string;
  expiresAt: number;
}

interface AuthContextType {
  user: TicketXUser | null;
  pendingOtp: PendingOtp | null;
  loading: boolean;
  sendPhoneOtp: (phone: string) => { success: boolean; error?: string };
  verifyPhoneOtp: (otp: string) => { success: boolean; error?: string };
  loginWithEmail: (email: string, pass: string) => { success: boolean; error?: string };
  signupWithEmail: (name: string, email: string, pass: string) => { success: boolean; error?: string };
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  updateUsername: (newName: string) => { success: boolean; error?: string };
  setRole: (role: 'customer' | 'venue_owner' | 'admin') => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const IS_DEV_MODE = process.env.NEXT_PUBLIC_DEV_AUTH_MODE !== 'false';
const USERS_DB_KEY = 'ticketx_registered_users';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<TicketXUser | null>(null);
  const [pendingOtp, setPendingOtp] = useState<PendingOtp | null>(null);
  const [loading, setLoading] = useState(true);

  // Requirement 10: Observe Firebase Authentication state with onAuthStateChanged (Official Firebase recommendation)
  useEffect(() => {
    // 1. Initial check from localStorage for fast initial render
    const saved = localStorage.getItem('ticketx_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUser({ role: 'customer', ...parsed });
      } catch (e) {
        console.error(e);
      }
    }

    // 2. Real-time Firebase Authentication State Observer
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Look up existing profile in registry to preserve custom edited display names or venue owner roles
        let existingUser: TicketXUser | null = null;
        try {
          const storedRegistry = localStorage.getItem(USERS_DB_KEY);
          if (storedRegistry) {
            const registry: Record<string, TicketXUser> = JSON.parse(storedRegistry);
            existingUser = registry[firebaseUser.uid] || (firebaseUser.email ? registry[firebaseUser.email.toLowerCase()] : null);
          }
        } catch (e) {
          console.error('Registry lookup error:', e);
        }

        const ticketxUser: TicketXUser = {
          id: firebaseUser.uid, // Requirement 9: Stable Firebase user.uid identity
          name: existingUser?.name || firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'TicketX Member'),
          email: firebaseUser.email || existingUser?.email,
          avatar: firebaseUser.photoURL || existingUser?.avatar,
          authMethod: 'google',
          role: existingUser?.role || 'customer',
          createdAt: existingUser?.createdAt || new Date().toISOString(),
        };

        saveUserSession(ticketxUser);
      } else {
        // If current active session was Google auth, log out local session on Firebase logout
        const currentSaved = localStorage.getItem('ticketx_user');
        if (currentSaved) {
          try {
            const parsed = JSON.parse(currentSaved);
            if (parsed.authMethod === 'google') {
              setUser(null);
              localStorage.removeItem('ticketx_user');
            }
          } catch (e) {
            console.error(e);
          }
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const saveUserSession = (u: TicketXUser) => {
    const normalizedUser = { role: u.role || 'customer', ...u };
    setUser(normalizedUser);
    localStorage.setItem('ticketx_user', JSON.stringify(normalizedUser));

    // Save/update user in registry mapped by Firebase UID and email
    try {
      const storedRegistry = localStorage.getItem(USERS_DB_KEY);
      const registry: Record<string, TicketXUser> = storedRegistry ? JSON.parse(storedRegistry) : {};
      registry[u.id] = normalizedUser;
      if (u.email) {
        registry[u.email.toLowerCase()] = normalizedUser;
      }
      if (u.phone) {
        registry[u.phone] = normalizedUser;
      }
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(registry));
    } catch (e) {
      console.error(e);
    }
  };

  const setRole = (role: 'customer' | 'venue_owner' | 'admin') => {
    if (user) {
      saveUserSession({ ...user, role });
    }
  };

  const sendPhoneOtp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return { success: false, error: 'Please enter a valid 10-digit Indian phone number.' };
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    const otpData = { phone: cleanPhone, code, expiresAt };
    setPendingOtp(otpData);

    console.log(`[TICKETX AUTH LOG] OTP requested for +91${cleanPhone}`);

    return { success: true };
  };

  const verifyPhoneOtp = (otp: string) => {
    const cleanOtp = otp.trim();

    if (!pendingOtp) {
      return { success: false, error: 'No active OTP request found. Please resend code.' };
    }

    if (Date.now() > pendingOtp.expiresAt) {
      return { success: false, error: 'OTP has expired. Please request a new code.' };
    }

    if (cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
      return { success: false, error: 'Please enter a valid 6-digit numeric OTP code.' };
    }

    if (!IS_DEV_MODE) {
      if (cleanOtp !== pendingOtp.code) {
        return { success: false, error: 'Invalid 6-digit OTP code. Please check and try again.' };
      }
    }

    const phoneFormatted = `+91 ${pendingOtp.phone}`;
    const masked = `+91 ••••••${pendingOtp.phone.slice(-4)}`;

    let existingUser: TicketXUser | null = null;
    try {
      const storedRegistry = localStorage.getItem(USERS_DB_KEY);
      if (storedRegistry) {
        const registry: Record<string, TicketXUser> = JSON.parse(storedRegistry);
        existingUser = registry[phoneFormatted] || null;
      }
    } catch (e) {
      console.error(e);
    }

    const targetUser: TicketXUser = existingUser || {
      id: `usr_phone_${pendingOtp.phone}`,
      name: `User ${pendingOtp.phone.slice(-4)}`,
      phone: phoneFormatted,
      displayPhone: masked,
      authMethod: 'phone',
      role: 'customer',
      createdAt: new Date().toISOString(),
    };

    saveUserSession(targetUser);
    setPendingOtp(null);
    return { success: true };
  };

  const loginWithEmail = (email: string, pass: string) => {
    if (!email.includes('@') || pass.length < 6) {
      return { success: false, error: 'Please enter a valid email address and password (min 6 chars).' };
    }

    const emailLower = email.toLowerCase().trim();
    let existingUser: TicketXUser | null = null;
    try {
      const storedRegistry = localStorage.getItem(USERS_DB_KEY);
      if (storedRegistry) {
        const registry: Record<string, TicketXUser> = JSON.parse(storedRegistry);
        existingUser = registry[emailLower] || null;
      }
    } catch (e) {
      console.error(e);
    }

    const nameFromEmail = emailLower.split('@')[0];
    const formattedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);

    const targetUser: TicketXUser = existingUser || {
      id: `usr_email_${emailLower.replace(/[^a-zA-Z0-9]/g, '_')}`,
      name: formattedName,
      email: emailLower,
      authMethod: 'email',
      role: 'customer',
      createdAt: new Date().toISOString(),
    };

    saveUserSession(targetUser);
    return { success: true };
  };

  const signupWithEmail = (name: string, email: string, pass: string) => {
    if (!name.trim() || !email.includes('@') || pass.length < 6) {
      return { success: false, error: 'Please fill all required fields correctly.' };
    }

    const emailLower = email.toLowerCase().trim();

    const newUser: TicketXUser = {
      id: `usr_email_${emailLower.replace(/[^a-zA-Z0-9]/g, '_')}`,
      name: name.trim(),
      email: emailLower,
      authMethod: 'email',
      role: 'customer',
      createdAt: new Date().toISOString(),
    };

    saveUserSession(newUser);
    return { success: true };
  };

  // Requirements 7, 8, 9: Real Firebase Google Authentication Login
  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const fbUser = await firebaseLoginWithGoogle();
      if (fbUser) {
        return { success: true };
      }
      return { success: false, error: 'Failed to complete Google Sign-In.' };
    } catch (err: any) {
      console.error('Google Auth login error:', err);
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        return { success: false };
      }
      if (err?.code === 'auth/unauthorized-domain') {
        return {
          success: false,
          error: 'This domain is not authorized for Google Sign-In in Firebase Console. Please add domain under Firebase Auth Settings → Authorized Domains.',
        };
      }
      return { success: false, error: err?.message || 'Unable to sign in with Google. Please try again.' };
    }
  };

  const updateUsername = (newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) {
      return { success: false, error: 'Username cannot be empty or whitespace only.' };
    }
    if (trimmed.length > 50) {
      return { success: false, error: 'Username must be under 50 characters.' };
    }

    if (user) {
      const updated = { ...user, name: trimmed };
      saveUserSession(updated);
      return { success: true };
    }
    return { success: false, error: 'No active user session found.' };
  };

  const logout = async (): Promise<void> => {
    try {
      await logoutFirebaseUser();
    } catch (e) {
      console.error('Firebase signout error:', e);
    }
    setUser(null);
    setPendingOtp(null);
    localStorage.removeItem('ticketx_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        pendingOtp,
        loading,
        sendPhoneOtp,
        verifyPhoneOtp,
        loginWithEmail,
        signupWithEmail,
        loginWithGoogle,
        updateUsername,
        setRole,
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
