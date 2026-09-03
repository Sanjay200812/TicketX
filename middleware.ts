import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_SESSION_COOKIE = 'ticketx_admin_session';

async function isValidAdminSessionToken(token: string, secret: string): Promise<boolean> {
  try {
    if (!token || typeof token !== 'string') return false;
    const parts = token.split('.');
    if (parts.length !== 2) return false;
    const [serialized, signature] = parts;

    // Web Crypto HMAC verification for Edge runtime compatibility
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(serialized));
    const bytes = new Uint8Array(sigBuf);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const expectedSig = btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    if (signature !== expectedSig) return false;

    // Verify expiration
    const payloadStr = atob(serialized.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(payloadStr);

    if (!payload.expiresAt || Date.now() > payload.expiresAt) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin and all sub-routes /admin/*
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    const sessionCookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

    if (!sessionCookie) {
      const loginUrl = new URL('/admin-login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    const secret =
      process.env.ADMIN_SESSION_SECRET ||
      process.env.ADMIN_ACCESS_KEY ||
      'fallback_ticketx_admin_secret_minimum_32_chars_long';

    const isValid = await isValidAdminSessionToken(sessionCookie, secret);

    if (!isValid) {
      const loginUrl = new URL('/admin-login', request.url);
      const response = NextResponse.redirect(loginUrl);
      // Clean invalid cookie
      response.cookies.delete(ADMIN_SESSION_COOKIE);
      return response;
    }
  }

  // If already logged in and navigating to /admin-login, optionally redirect to /admin
  if (pathname === '/admin-login') {
    const sessionCookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    if (sessionCookie) {
      const secret =
        process.env.ADMIN_SESSION_SECRET ||
        process.env.ADMIN_ACCESS_KEY ||
        'fallback_ticketx_admin_secret_minimum_32_chars_long';
      const isValid = await isValidAdminSessionToken(sessionCookie, secret);
      if (isValid) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/admin-login'],
};
