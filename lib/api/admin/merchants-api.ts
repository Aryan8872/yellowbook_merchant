import { apiClient } from '../client';
import type { ApiResponse } from '../types';

export interface Merchant {
  id: string;
  name: string;
  contactEmail: string;
  contactPhone: string | null;
  status: 'PENDING_REVIEW' | 'ACTIVE' | 'ARCHIVED' | 'SUSPENDED';
  logoUrl?: string;
  branches: any[];
  offers?: any[];
  _count?: {
    branches: number;
    offers: number;
    redemptions: number;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface UpdateMerchantDto {
  name?: string;
  contactEmail?: string;
  contactPhone?: string;
  panNumber?: string;
  vatNumber?: string;
  status?: 'PENDING_REVIEW' | 'ACTIVE' | 'ARCHIVED' | 'SUSPENDED';
  logoUrl?: string;
  description?: string;
  websiteUrl?: string;
  coverUrl?: string;
}

export interface MerchantsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface MerchantsResponse {
  data: Merchant[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface ApproveMerchantDto {
  merchantId: string;
  notes?: string;
}

export interface RejectMerchantDto {
  merchantId: string;
  reason: string;
}

export interface SuspendMerchantDto {
  merchantId: string;
  reason?: string;
}

export interface ReactivateMerchantDto {
  merchantId: string;
  notes?: string;
}

export interface CreateMerchantDto {
  name: string;
  contactEmail: string;
  contactPhone?: string;
  panNumber?: string;
  vatNumber?: string;
  logoUrl?: string;
  description?: string;
  websiteUrl?: string;
  coverUrl?: string;
}

/**
 * Get paginated list of merchants
 */
export async function getMerchants(
  params?: MerchantsQueryParams
): Promise<ApiResponse<MerchantsResponse>> {
  return apiClient.get<MerchantsResponse>('/admin/merchants', {
    params: params as Record<string, string | number | boolean | undefined>,
  });
}

/**
 * Get merchant by ID
 */
export async function getMerchant(
  id: string
): Promise<ApiResponse<Merchant>> {
  return apiClient.get<Merchant>(`/admin/merchants/${id}`);
}

/**
 * Create merchant
 */
export async function createMerchant(
  data: CreateMerchantDto
): Promise<ApiResponse<Merchant>> {
  return apiClient.post<Merchant>('/admin/merchants', data);
}

/**
 * Update merchant
 */
export async function updateMerchant(
  id: string,
  data: UpdateMerchantDto
): Promise<ApiResponse<Merchant>> {
  return apiClient.patch<Merchant>(`/admin/merchants/${id}`, data);
}

/**
 * Approve merchant
 */
export async function approveMerchant(
  data: ApproveMerchantDto
): Promise<ApiResponse<Merchant>> {
  return apiClient.post<Merchant>('/admin/merchants/approve', data);
}

/**
 * Reject merchant
 */
export async function rejectMerchant(
  data: RejectMerchantDto
): Promise<ApiResponse<Merchant>> {
  return apiClient.post<Merchant>('/admin/merchants/reject', data);
}

/**
 * Suspend merchant
 */
export async function suspendMerchant(
  data: SuspendMerchantDto
): Promise<ApiResponse<Merchant>> {
  return apiClient.post<Merchant>('/admin/merchants/suspend', data);
}

/**
 * Reactivate merchant
 */
export async function reactivateMerchant(
  data: ReactivateMerchantDto
): Promise<ApiResponse<Merchant>> {
  return apiClient.post<Merchant>('/admin/merchants/reactivate', data);
}
