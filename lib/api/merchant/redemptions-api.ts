import { apiClient } from '../client';
import type { ApiResponse } from '../types';

export interface Redemption {
  id: string;
  code: string;
  status: string;
  createdAt: string;
  offer: {
    id: string;
    title: string;
    category: string;
    originalPriceNpr: number;
  };
  branch: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
}

export interface RedemptionsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  offerId?: string;
  branchId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface RedemptionsResponse {
  data: Redemption[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getRedemptions(
  merchantId: string,
  params?: RedemptionsQueryParams
): Promise<ApiResponse<RedemptionsResponse>> {
  return apiClient.get<RedemptionsResponse>(
    `/api/v1/merchants/${merchantId}/redemptions`,
    { params: params as Record<string, string | number | boolean | undefined> }
  );
}

/**
 * Staff verifies the customer's scanned QR payload to complete a redemption.
 * Backend: POST /redemption/merchant/verify-qr — requires the staff `redeem`
 * permission (enforced server-side). No merchant PIN needed on this path.
 */
export async function verifyQrRedemption(data: {
  qrPayload: string;
  branchId?: string;
}): Promise<ApiResponse<Redemption>> {
  return apiClient.post<Redemption>(
    `/api/v1/redemption/merchant/verify-qr`,
    data
  );
}

/**
 * Legacy fallback path: merchant cashier confirms a customer's short code plus
 * the merchant PIN to complete a redemption.
 * Backend: POST /merchant/redeem
 */
export async function merchantRedeem(data: {
  code: string;
  merchantPin: string;
  staffId?: string;
  branchId?: string;
}): Promise<ApiResponse<Redemption>> {
  return apiClient.post<Redemption>(`/api/v1/merchant/redeem`, data);
}
