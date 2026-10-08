import { NextResponse } from 'next/server';
import { apiClient } from '@/lib/api/client';

export async function POST() {
  try {
    await apiClient.post('/api/v1/auth/logout').catch(() => {});
  } finally {
    const res = NextResponse.json({ success: true, message: 'Logged out' });
    res.cookies.delete('accessToken');
    res.cookies.delete('refreshToken');
    return res;
  }
}
