import crypto from 'crypto';

export const AUTH_COOKIE_NAME = 'admin_auth';
export const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours in seconds

/**
 * Generates a signed authentication token using HMAC-SHA256.
 * The token is based on a timestamp, making it unique per session.
 */
export function generateAuthToken(): string {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) {
    throw new Error('ADMIN_PASSWORD environment variable is not set');
  }

  const timestamp = Date.now().toString();
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(timestamp);
  const signature = hmac.digest('hex');

  // Format: timestamp.signature
  return `${timestamp}.${signature}`;
}

/**
 * Validates an authentication token using timing-safe comparison.
 * Returns true if the token is valid and not expired.
 */
export function validateAuthToken(token: string | undefined): boolean {
  if (!token) {
    return false;
  }

  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) {
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

  // Regenerate the expected signature
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(timestamp);
  const expectedSignature = hmac.digest('hex');

  // Use timing-safe comparison to prevent timing attacks
  return timingSafeEqual(providedSignature, expectedSignature);
}

/**
 * Timing-safe string comparison to prevent timing attacks.
 */
export function timingSafeEqual(a: string, b: string): boolean {
  const encoder = new TextEncoder();
  const bufA = encoder.encode(a);
  const bufB = encoder.encode(b);

  // If lengths differ, compare with itself to maintain constant time
  // but return false
  if (bufA.length !== bufB.length) {
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }

  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Validates password using timing-safe comparison.
 */
export function validatePassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword || !password) {
    return false;
  }

  return timingSafeEqual(password, adminPassword);
}

/**
 * Generates the Set-Cookie header value for authentication.
 */
export function generateAuthCookie(token: string): string {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${AUTH_COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Strict${secure}`;
}

/**
 * Generates the Set-Cookie header value to clear authentication.
 */
export function generateClearAuthCookie(): string {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${AUTH_COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict${secure}`;
}

/**
 * Validates authentication from API request cookies.
 * Returns true if the request has a valid auth token.
 */
export function isAuthenticated(cookies: Partial<{ [key: string]: string }>): boolean {
  const token = cookies[AUTH_COOKIE_NAME];
  return validateAuthToken(token);
}
