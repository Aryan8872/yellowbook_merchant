import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/lib/api/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const response = await apiClient.post('/api/v1/auth/login', { email, password });

    if (!response.success || !response.data) {
      return NextResponse.json(
        { success: false, message: response.message || 'Login failed' },
        { status: 401 }
      );
    }
  

    const { tokens, user } = response.data;
    const accessToken=tokens.accessToken;
    const refreshToken=tokens.refreshToken;

    const res = NextResponse.json({
      success: true,
      data: { user },
    });
    const isProduction = process.env.NODE_ENV === 'production';

    // Store accessToken in HttpOnly cookie (1 day)
    res.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    });

    // Store refreshToken in HttpOnly cookie (7 days)
    if (refreshToken) {
      res.cookies.set('refreshToken', refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    return res;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Authentication error' },
      { status: error?.statusCode || 500 }
    );
  }
}
