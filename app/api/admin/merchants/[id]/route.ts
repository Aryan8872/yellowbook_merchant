import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/lib/api/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const accessToken = request.cookies.get('accessToken')?.value;

  if (!accessToken) {
    return NextResponse.json(
      { success: false, message: 'Unauthenticated' },
      { status: 401 }
    );
  }

  try {
    const response = await apiClient.get(`/api/v1/admin/merchants/${id}`, {
      token: accessToken,
    });

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch merchant' },
      { status: error?.statusCode || 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const accessToken = request.cookies.get('accessToken')?.value;

  if (!accessToken) {
    return NextResponse.json(
      { success: false, message: 'Unauthenticated' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const response = await apiClient.patch(`/api/v1/admin/merchants/${id}`, body, {
      token: accessToken,
    });

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to update merchant' },
      { status: error?.statusCode || 500 }
    );
  }
}
