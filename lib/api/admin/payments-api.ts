import { apiClient } from '../client';
import type { ApiResponse } from '../types';

export interface PaymentTransactionItem {
  id: string;
  orderId: string;
  gateway: 'KHALTI' | 'ESEWA' | 'MANUAL_ADMIN';
  gatewayRefId?: string | null;
  amountNpr: number;
  status: 'INITIATED' | 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  paidAt?: string | null;
  failureReason?: string | null;
  createdAt: string;
  userId?: string | null;
  merchantId?: string | null;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  } | null;
  subscription?: {
    id: string;
    status: string;
    plan?: {
      id: string;
      code: string;
      name: string;
      priceNpr: number;
    } | null;
  } | null;
  invoice?: {
    id: string;
    invoiceNumber: string;
    status: string;
    amountNpr: number;
  } | null;
}

export interface ListPaymentsParams {
  page?: number;
  limit?: number;
  gateway?: string;
  status?: string;
  search?: string;
}

export interface ListPaymentsResponse {
  data: PaymentTransactionItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export async function getPayments(params?: ListPaymentsParams): Promise<ApiResponse<ListPaymentsResponse>> {
  return apiClient.get<ListPaymentsResponse>('/admin/payments', {
    params: params as Record<string, string | number | boolean | undefined>,
  });
}

export async function verifyManualPayment(
  transactionId: string,
  notes?: string
): Promise<ApiResponse<{ success: boolean; message: string; transaction: PaymentTransactionItem }>> {
  return apiClient.post(`/admin/payments/${transactionId}/verify-manual`, { notes });
}
