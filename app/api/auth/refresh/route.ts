import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Shared rotation logic: exchanges the refresh-token cookie for a fresh
 * token pair and re-issues the HttpOnly cookies.
 */
async function rotateTokens(request: NextRequest, returnUrl?: string | null) {
  const refreshToken = request.cookies.get('refreshToken')?.value;

  if (!refreshToken) {
    const res = NextResponse.json(
      { success: false, message: 'No refresh token available' },
      { status: 401 }
    );
    res.cookies.delete('accessToken');
    res.cookies.delete('refreshToken');
    return res;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const res = NextResponse.json(
        { success: false, message: 'Failed to rotate tokens' },
        { status: 401 }
      );
      res.cookies.delete('accessToken');
      res.cookies.delete('refreshToken');
      return res;
    }

    const tokens = data.data?.tokens || data.data || {};
    const newAccessToken = tokens.accessToken;
    const newRefreshToken = tokens.refreshToken;

    if (!newAccessToken) {
      const res = NextResponse.json(
        { success: false, message: 'Invalid token structure received from auth service' },
        { status: 401 }
      );
      res.cookies.delete('accessToken');
      res.cookies.delete('refreshToken');
      return res;
    }
    const isProduction = process.env.NODE_ENV === 'production';

    // GET navigations from middleware get redirected back to their origin
    // page; JSON callers (client-side fetch) get a plain success body.
    const res = returnUrl
      ? NextResponse.redirect(new URL(returnUrl, request.url))
      : NextResponse.json({ success: true });

    if (newAccessToken) {
      res.cookies.set('accessToken', newAccessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24,
      });
    }

    if (newRefreshToken) {
      res.cookies.set('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return res;
  } catch (error: any) {
    const res = NextResponse.json(
      { success: false, message: error?.message || 'Token refresh error' },
      { status: 401 }
    );
    res.cookies.delete('accessToken');
    res.cookies.delete('refreshToken');
    return res;
  }
}

export async function POST(request: NextRequest) {
  return rotateTokens(request);
}

// Middleware redirects here on navigation when the access token has expired;
// it can only follow up with a GET, so support that and bounce the user back.
export async function GET(request: NextRequest) {
  const returnUrl = request.nextUrl.searchParams.get('returnUrl');
  const res = await rotateTokens(request, returnUrl);

  // If rotation failed on a browser navigation, send to login instead of
  // returning JSON the user would see as raw text.
  if (returnUrl && res.status === 401) {
    const loginUrl = new URL('/merchant/auth/login', request.url);
    loginUrl.searchParams.set('returnUrl', returnUrl);
    return NextResponse.redirect(loginUrl);
  }
  return res;
}
