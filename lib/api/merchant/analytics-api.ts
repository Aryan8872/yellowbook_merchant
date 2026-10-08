import { apiClient } from '../client';
import type { ApiResponse } from '../types';

export interface DashboardStats {
  totalOffers: number;
  activeOffers: number;
  totalRedemptions: number;
  totalBranches: number;
  totalStaff: number;
}

export interface AnalyticsData {
  totalRedemptions: number;
  dailyRedemptions: Array<{
    date: string;
    count: number;
  }>;
  topOffers: Array<{
    title: string;
    count: number;
  }>;
}

export interface TimeRangeParams {
  range?: '7d' | '30d' | 'custom';
  startDate?: string;
  endDate?: string;
}

export async function getMerchantDashboard(
  merchantId: string
): Promise<ApiResponse<DashboardStats>> {
  return apiClient.get<DashboardStats>(
    `/api/v1/merchants/${merchantId}/dashboard`
  );
}

export async function getMerchantAnalytics(
  merchantId: string,
  params?: TimeRangeParams
): Promise<ApiResponse<AnalyticsData>> {
  return apiClient.get<AnalyticsData>(
    `/api/v1/merchants/${merchantId}/analytics`,
    { params: params as Record<string, string | undefined> }
  );
}
