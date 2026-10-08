import { apiClient } from '../client';
import type { ApiResponse } from '../types';

export interface AdminDashboardStats {
  totalMerchants: number;
  pendingMerchants: number;
  totalUsers: number;
  activeOffers: number;
}

/**
 * Get admin dashboard stats
 */
export async function getAdminDashboard(): Promise<ApiResponse<AdminDashboardStats>> {
  return apiClient.get<AdminDashboardStats>('/admin/dashboard');
}
