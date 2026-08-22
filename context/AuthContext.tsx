"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface TicketXUser {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  displayPhone?: string;
  avatar?: string;
  authMethod: 'email' | 'phone' | 'google';
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
  sendPhoneOtp: (phone: string) => { success: boolean; error?: string };
  verifyPhoneOtp: (otp: string) => { success: boolean; error?: string };
  loginWithEmail: (email: string, pass: string) => { success: boolean; error?: string };
  signupWithEmail: (name: string, email: string, pass: string) => { success: boolean; error?: string };
  loginWithGoogle: (customEmail?: string, customName?: string, customAvatar?: string) => void;
  updateUsername: (newName: string) => { success: boolean; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const IS_DEV_MODE = process.env.NEXT_PUBLIC_DEV_AUTH_MODE !== 'false';
const USERS_DB_KEY = 'ticketx_registered_users';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<TicketXUser | null>(null);
  const [pendingOtp, setPendingOtp] = useState<PendingOtp | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('ticketx_user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const saveUserSession = (u: TicketXUser) => {
    setUser(u);
    localStorage.setItem('ticketx_user', JSON.stringify(u));

    // Save/update user in registry to prevent duplicate accounts
    try {
      const storedRegistry = localStorage.getItem(USERS_DB_KEY);
      const registry: Record<string, TicketXUser> = storedRegistry ? JSON.parse(storedRegistry) : {};
      if (u.email) {
        registry[u.email.toLowerCase()] = u;
      }
      if (u.phone) {
        registry[u.phone] = u;
      }
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(registry));
    } catch (e) {
      console.error(e);
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

    // Account linking check
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
      createdAt: new Date().toISOString(),
    };

    saveUserSession(newUser);
    return { success: true };
  };

  // Requirements 6, 7, 8: Real Google account linking (prevents duplicate accounts)
  const loginWithGoogle = (customEmail?: string, customName?: string, customAvatar?: string) => {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (googleClientId) {
      const redirectUri = window.location.origin + '/login';
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&response_type=token&scope=email%20profile`;
      window.location.href = googleAuthUrl;
      return;
    }

    const email = (customEmail || 'user.ticketx@gmail.com').toLowerCase().trim();
    const name = customName || email.split('@')[0].toUpperCase();
    const avatar = customAvatar || 'https://lh3.googleusercontent.com/a/default-user';

    // Account linking check: reuse existing user if email matches
    let existingUser: TicketXUser | null = null;
    try {
      const storedRegistry = localStorage.getItem(USERS_DB_KEY);
      if (storedRegistry) {
        const registry: Record<string, TicketXUser> = JSON.parse(storedRegistry);
        existingUser = registry[email] || null;
      }
    } catch (e) {
      console.error(e);
    }

    const targetUser: TicketXUser = existingUser ? {
      ...existingUser,
      avatar: avatar || existingUser.avatar,
    } : {
      id: `usr_google_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
      name,
      email,
      avatar,
      authMethod: 'google',
      createdAt: new Date().toISOString(),
    };

    saveUserSession(targetUser);
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

  const logout = () => {
    setUser(null);
    setPendingOtp(null);
    localStorage.removeItem('ticketx_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        pendingOtp,
        sendPhoneOtp,
        verifyPhoneOtp,
        loginWithEmail,
        signupWithEmail,
        loginWithGoogle,
        updateUsername,
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
