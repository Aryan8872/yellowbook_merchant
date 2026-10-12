import { apiClient } from '../client';
import type { ApiResponse } from '../types';

export type FraudFlagStatus = 'PENDING' | 'REVIEWED' | 'DISMISSED' | 'ESCALATED';
export type FraudFlagReason = 'DUPLICATE_REDEMPTION' | 'INVALID_CODE' | 'SUSPICIOUS_PATTERN' | 'MANUAL_REPORT' | string;

export interface FraudFlag {
  id: string;
  status: FraudFlagStatus;
  reason: FraudFlagReason;
  notes: string | null;
  redemptionSessionId: string | null;
  reportedAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  createdAt: string;
  updatedAt?: string;
  redemptionSession?: {
    id: string;
    redemptionCode: string;
    status: string;
    offer?: {
      title: string;
      merchant?: { name: string };
    };
    user?: { name: string | null; email: string };
  };
}

export interface FraudFlagsQueryParams {
  page?: number;
  limit?: number;
  status?: FraudFlagStatus;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FraudFlagsResponse {
  data: FraudFlag[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface ReviewFraudFlagDto {
  fraudFlagId: string;
  resolution: 'DISMISS' | 'ESCALATE' | 'RESOLVE';
  notes?: string;
}

/**
 * Get paginated list of fraud flags
 */
export async function getFraudFlags(
  params?: FraudFlagsQueryParams
): Promise<ApiResponse<FraudFlagsResponse>> {
  return apiClient.get<FraudFlagsResponse>('/admin/fraud-flags', {
    params: params as Record<string, string | number | boolean | undefined>,
  });
}

/**
 * Get fraud flag by ID with full redemption context
 */
export async function getFraudFlag(
  id: string
): Promise<ApiResponse<FraudFlag>> {
  return apiClient.get<FraudFlag>(`/admin/fraud-flags/${id}`);
}

/**
 * Review and resolve a fraud flag
 */
export async function reviewFraudFlag(
  data: ReviewFraudFlagDto
): Promise<ApiResponse<FraudFlag>> {
  return apiClient.post<FraudFlag>('/admin/fraud-flags/review', data);
}
