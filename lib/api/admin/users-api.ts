import { apiClient } from '../client';
import type { ApiResponse } from '../types';

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'ADMIN' | 'MERCHANT_ADMIN' | 'MERCHANT_STAFF' | 'USER';
  isVerified: boolean;
  isActive: boolean;
  phone?: string | null;
  avatarUrl?: string | null;
  merchantId?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface UpdateUserDto {
  name?: string;
  role?: 'ADMIN' | 'MERCHANT_ADMIN' | 'MERCHANT_STAFF' | 'USER';
  isActive?: boolean;
  phone?: string;
  avatarUrl?: string;
  merchantId?: string;
}

export interface UsersQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: boolean;
}

export interface UsersResponse {
  data: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

/**
 * Get paginated list of users
 */
export async function getUsers(
  params?: UsersQueryParams
): Promise<ApiResponse<UsersResponse>> {
  return apiClient.get<UsersResponse>('/admin/users', {
    params: params as Record<string, string | number | boolean | undefined>,
  });
}

/**
 * Get user by ID
 */
export async function getUser(
  id: string
): Promise<ApiResponse<User>> {
  return apiClient.get<User>(`/admin/users/${id}`);
}

/**
 * Update user
 */
export async function updateUser(
  id: string,
  data: UpdateUserDto
): Promise<ApiResponse<User>> {
  return apiClient.patch<User>(`/admin/users/${id}`, data);
}

/**
 * Delete user
 */
export async function deleteUser(
  id: string
): Promise<ApiResponse<void>> {
  return apiClient.delete<void>(`/admin/users/${id}`);
}

/**
 * Activate user
 */
export async function activateUser(
  userId: string,
  notes?: string
): Promise<ApiResponse<User>> {
  return apiClient.post<User>('/admin/users/activate', { userId, notes });
}

/**
 * Deactivate user
 */
export async function deactivateUser(
  userId: string,
  reason?: string
): Promise<ApiResponse<User>> {
  return apiClient.post<User>('/admin/users/suspend', { userId, reason });
}
