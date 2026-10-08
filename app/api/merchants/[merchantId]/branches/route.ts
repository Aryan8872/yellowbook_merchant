import { apiClient } from '@/lib/api/client';
import { NextRequest, NextResponse } from 'next/server';

function getAuthHeader(req: NextRequest): Record<string, string> {
  const token = req.cookies.get('accessToken')?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ merchantId: string }> }
) {
  try {
    const { merchantId } = await params
    const data = await apiClient.get(
      `/api/v1/merchants/${merchantId}/branches`,
      { headers: getAuthHeader(req) }
    );
    if (!data.success) {
      return NextResponse.json(
        { success: false, message: data.message ?? 'Failed to fetch branches' },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: true, data: data.data });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, message: e?.message ?? 'Internal server error' },
      { status: e?.status ?? 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ merchantId: string }> }
) {
  try {
    const { merchantId } = await params
    const body = await req.json();
    const data = await apiClient.post(
      `/api/v1/merchants/${merchantId}/branches`,
      body,
      { headers: getAuthHeader(req) }
    );
    if (!data.success) {
      return NextResponse.json(
        { success: false, message: data.message ?? 'Failed to create branch' },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: true, data: data.data }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, message: e?.message ?? 'Internal server error' },
      { status: e?.status ?? 500 }
    );
  }
}
