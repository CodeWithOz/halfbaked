import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_COOKIE_NAME = 'admin_auth';
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours in seconds

/**
 * Validates an authentication token in Edge runtime.
 * Uses Web Crypto API which is available in Edge.
 */
async function validateAuthToken(token: string | undefined, secret: string): Promise<boolean> {
  if (!token || !secret) {
    return false;
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return false;
  }

  const [timestamp, providedSignature] = parts;

  // Check if token is expired (older than COOKIE_MAX_AGE)
  const tokenAge = Date.now() - parseInt(timestamp, 10);
  if (isNaN(tokenAge) || tokenAge > COOKIE_MAX_AGE * 1000) {
    return false;
  }

  // Regenerate the expected signature using Web Crypto API
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(timestamp));
  const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  // Timing-safe comparison
  if (providedSignature.length !== expectedSignature.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < providedSignature.length; i++) {
    result |= providedSignature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
  }

  return result === 0;
}

export async function middleware(request: NextRequest) {
  const adminPath = process.env.ADMIN_PATH;
  const adminPassword = process.env.ADMIN_PASSWORD;

  // If env vars not set, let the request through - pages will handle the error
  if (!adminPath || !adminPassword) {
    console.error('ADMIN_PATH or ADMIN_PASSWORD environment variable is not set');
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  const authCookie = request.cookies.get(AUTH_COOKIE_NAME);

  // Protected dashboard route: /p/${ADMIN_PATH}
  if (pathname === `/p/${adminPath}`) {
    const isValid = await validateAuthToken(authCookie?.value, adminPassword);

    if (!isValid) {
      // Redirect to login page
      const loginUrl = new URL(`/p/${adminPath}/login`, request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If already authenticated and trying to access login page, redirect to dashboard
  if (pathname === `/p/${adminPath}/login`) {
    const isValid = await validateAuthToken(authCookie?.value, adminPassword);

    if (isValid) {
      const dashboardUrl = new URL(`/p/${adminPath}`, request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/p/:id*'],
};
