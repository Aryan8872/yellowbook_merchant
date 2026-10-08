/**
 * JWT Utility Functions
 * 
 * This module provides functions for decoding and validating JWT tokens
 * without external dependencies (using base64url decoding).
 */

/**
 * JWT payload interface
 */
export interface JWTPayload {
  sub: string; // User ID
  email: string;
  role: string;
  merchantId?: string;
  subscriptionActive?: boolean;
  iat?: number; // Issued at
  exp?: number; // Expiration time
}

/**
 * Decode base64url string to base64
 */
function base64UrlToBase64(base64Url: string): string {
  base64Url = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - (base64Url.length % 4)) % 4);
  return base64Url + padding;
}

/**
 * Decode base64 string to UTF-8
 */
function base64Decode(base64: string): string {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

/**
 * Decode JWT token without verification (for middleware use)
 * Note: This does not verify the signature. Signature verification
 * should be done by the backend API.
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const base64Payload = base64UrlToBase64(payload);
    const decodedPayload = base64Decode(base64Payload);

    return JSON.parse(decodedPayload) as JWTPayload;
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

/**
 * Get user role from JWT token
 */
export function getUserRole(token: string): string | null {
  const payload = decodeJWT(token);
  return payload?.role ?? null;
}

/**
 * Get user ID from JWT token
 */
export function getUserId(token: string): string | null {
  const payload = decodeJWT(token);
  return payload?.sub ?? null;
}

/**
 * Check if JWT token is expired
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return true; // Treat as expired if no exp claim
  }

  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now;
}

/**
 * Validate JWT token (not expired and has required claims)
 */
export function validateToken(token: string): { valid: boolean; error?: string } {
  if (!token) {
    return { valid: false, error: 'No token provided' };
  }

  const payload = decodeJWT(token);
  if (!payload) {
    return { valid: false, error: 'Invalid token format' };
  }

  if (!payload.sub) {
    return { valid: false, error: 'Token missing subject claim' };
  }

  if (!payload.role) {
    return { valid: false, error: 'Token missing role claim' };
  }

  if (isTokenExpired(token)) {
    return { valid: false, error: 'Token expired' };
  }

  return { valid: true };
}
