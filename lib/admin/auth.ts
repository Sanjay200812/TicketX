import crypto from 'crypto';
import { cookies } from 'next/headers';
import { AdminSession, AdminRole } from '@/types/admin';

export const ADMIN_SESSION_COOKIE = 'ticketx_admin_session';
export const SESSION_DURATION_HOURS = 8;
export const SESSION_DURATION_MS = SESSION_DURATION_HOURS * 60 * 60 * 1000;

function getSessionSecret(): string {
  const secret =
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_ACCESS_KEY;

  if (!secret) {
    console.warn('[Admin Auth Config Warning] ADMIN_SESSION_SECRET is not configured.');
    return 'fallback_ticketx_admin_secret_minimum_32_chars_long';
  }
  return secret;
}

/**
 * Validates submitted admin credentials strictly server-side against environment variables.
 * Never reveals which specific credential failed.
 */
export function validateAdminCredentials(
  email?: string,
  password?: string,
  accessKey?: string
): { valid: boolean; error?: string; admin?: AdminSession } {
  const expectedEmail = process.env.ADMIN_EMAIL;
  const expectedPassword = process.env.ADMIN_PASSWORD;
  const expectedAccessKey = process.env.ADMIN_ACCESS_KEY;
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;

  // Environment Validation: Safely check whether required variables exist
  if (!expectedEmail || !expectedPassword || !expectedAccessKey || !sessionSecret) {
    console.warn(
      '[Admin Auth Config Warning] Missing required admin environment variables. Please check ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_ACCESS_KEY, and ADMIN_SESSION_SECRET.'
    );
    return {
      valid: false,
      error: 'Admin authentication is temporarily unavailable.',
    };
  }

  if (!email || !password || !accessKey) {
    return {
      valid: false,
      error: 'Invalid administrative credentials.',
    };
  }

  // Safe constant-time string comparison helper
  const safeCompare = (submitted: string, expected: string): boolean => {
    const bufA = Buffer.from(submitted);
    const bufB = Buffer.from(expected);
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  };

  const emailMatches = email.trim().toLowerCase() === expectedEmail.trim().toLowerCase();
  const passwordMatches = safeCompare(password, expectedPassword);
  const keyMatches = safeCompare(accessKey.trim(), expectedAccessKey.trim());

  if (emailMatches && passwordMatches && keyMatches) {
    const expiresAt = Date.now() + SESSION_DURATION_MS;
    return {
      valid: true,
      admin: {
        uid: 'admin_super_01',
        email: expectedEmail.trim(),
        name: 'Super Admin',
        role: 'super_admin',
        expiresAt,
      },
    };
  }

  return {
    valid: false,
    error: 'Invalid administrative credentials.',
  };
}

/**
 * Creates and signs a secure admin session token.
 */
export function createSignedToken(payload: AdminSession): string {
  const secret = getSessionSecret();
  const serialized = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(serialized)
    .digest('base64url');
  return `${serialized}.${signature}`;
}

/**
 * Verifies the signature and expiration of an admin session token.
 */
export function verifyAdminSession(token: string): AdminSession | null {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [serialized, signature] = parts;

    const secret = getSessionSecret();
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(serialized)
      .digest('base64url');

    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);
    if (
      sigBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(sigBuffer, expectedBuffer)
    ) {
      return null;
    }

    const payloadStr = Buffer.from(serialized, 'base64url').toString('utf8');
    const session: AdminSession = JSON.parse(payloadStr);

    if (Date.now() > session.expiresAt) {
      return null; // Expired
    }

    return session;
  } catch {
    return null;
  }
}

/**
 * Creates an HTTP-only session cookie for the authenticated admin.
 * Does NOT store passwords or access keys in the cookie.
 */
export function createAdminSession(admin: {
  uid?: string;
  email: string;
  name?: string;
  role: AdminRole;
}): AdminSession {
  const expiresAt = Date.now() + SESSION_DURATION_MS;
  const session: AdminSession = {
    uid: admin.uid || 'admin_super_01',
    email: admin.email,
    name: admin.name || 'Super Admin',
    role: admin.role,
    expiresAt,
  };

  const token = createSignedToken(session);
  const cookieStore = cookies();

  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_DURATION_HOURS * 60 * 60, // 8 hours in seconds
  });

  return session;
}

/**
 * Destroys the admin session cookie.
 */
export function destroyAdminSession(): void {
  const cookieStore = cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
}

/**
 * Retrieves the currently active admin session from request cookies.
 */
export function getCurrentAdmin(): AdminSession | null {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
    if (!token) return null;
    return verifyAdminSession(token);
  } catch {
    return null;
  }
}

// Aliases for compatibility
export const setAdminSessionCookie = createAdminSession;
export const clearAdminSessionCookie = destroyAdminSession;
export const getAdminSessionFromCookie = getCurrentAdmin;
export const getAdminSession = getCurrentAdmin;
export function validateAdminAccessKey(providedKey: string): boolean {
  const expectedKey = process.env.ADMIN_ACCESS_KEY || '';
  if (!providedKey || !expectedKey) return false;
  const bufA = Buffer.from(providedKey);
  const bufB = Buffer.from(expectedKey);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}
