import { apiClient } from '@/lib/api/client';
import { NextRequest, NextResponse } from 'next/server';

function getAuthHeader(req: NextRequest): Record<string, string> {
  const token = req.cookies.get('accessToken')?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ branchId: string }> }
) {
  try {
    const { branchId } = await params
    const body = await req.json();
    const data = await apiClient.put(
      `/api/v1/merchants/branches/${branchId}`,
      body,
      { headers: getAuthHeader(req) }
    );
    if (!data.success) {
      return NextResponse.json(
        { success: false, message: data.message ?? 'Failed to update branch' },
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ branchId: string }> }
) {
  try {
    const { branchId } = await params
    await apiClient.delete(
      `/api/v1/merchants/branches/${branchId}`,
      { headers: getAuthHeader(req) }
    );
    return new NextResponse(null, { status: 204 });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, message: e?.message ?? 'Internal server error' },
      { status: e?.status ?? 500 }
    );
  }
}
