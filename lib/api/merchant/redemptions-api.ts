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
