import { apiClient } from '../client';
import type { ApiResponse } from '../types';

export interface Staff {
  id: string;
  merchantId: string;
  userId: string;
  role: 'MERCHANT_ADMIN' | 'MERCHANT_STAFF';
  permissions: string[];
  isActive: boolean;
  deviceId: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    passwordHash?: string;
  };
}

export interface CreateStaffDto {
  name: string;
  email: string;
  phone?: string;
  role: 'MERCHANT_ADMIN' | 'MERCHANT_STAFF';
  password: string;
  permissions?: string[];
}

export interface UpdateStaffDto {
  name?: string;
  email?: string;
  phone?: string;
  role?: 'MERCHANT_ADMIN' | 'MERCHANT_STAFF';
  isActive?: boolean;
  permissions?: string[];
}

export interface StaffQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export interface StaffListResponse {
  data: Staff[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext?: boolean;
    hasPrevious?: boolean;
  };
}

export async function getStaff(
  merchantId: string,
  params?: StaffQueryParams
): Promise<ApiResponse<StaffListResponse | Staff[]>> {
  return apiClient.get<StaffListResponse | Staff[]>(`/api/v1/merchants/${merchantId}/staff`, {
    params: params as Record<string, string | number | boolean | undefined>,
  });
}

export async function createStaff(
  merchantId: string,
  data: CreateStaffDto
): Promise<ApiResponse<Staff>> {
  return apiClient.post<Staff>(`/api/v1/merchants/${merchantId}/staff`, data);
}

export async function updateStaff(
  merchantId: string,
  staffId: string,
  data: UpdateStaffDto
): Promise<ApiResponse<Staff>> {
  return apiClient.put<Staff>(`/api/v1/merchants/${merchantId}/staff/${staffId}`, data);
}
