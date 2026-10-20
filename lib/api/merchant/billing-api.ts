import { apiClient } from '../client';
import type { ApiResponse } from '../types';

export interface MerchantBillingData {
  merchantId: string;
  merchantName: string;
  subscription: {
    id: string;
    status: string;
    isTrial: boolean;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    remainingDays: number;
    isExpiringSoon: boolean;
    isExpired: boolean;
    plan: {
      id: string;
      code: string;
      name: string;
      description?: string | null;
      priceNpr: number;
      billingCycle: string;
      durationDays: number;
      entitlementsJson: Record<string, any>;
    };
  } | null;
  quotas: {
    branches: {
      used: number;
      max: number;
      isUnlimited: boolean;
      hasReachedLimit: boolean;
    };
    offers: {
      used: number;
      max: number;
      isUnlimited: boolean;
      hasReachedLimit: boolean;
    };
    featuredBoosts: {
      allowed: number;
    };
  };
}

export interface InitiateCheckoutPayload {
  planId: string;
  gateway: 'KHALTI' | 'ESEWA';
  merchantId: string;
  returnUrl?: string;
}

export interface CheckoutInitiateResponse {
  orderId: string;
  gateway: string;
  amountNpr: number;
  paymentUrl?: string;
  pidx?: string;
  formData?: Record<string, string>;
}

export async function getMerchantBilling(merchantId: string): Promise<ApiResponse<MerchantBillingData>> {
  return apiClient.get<MerchantBillingData>(`/merchants/${merchantId}/billing`);
}

export async function initiateMerchantCheckout(payload: InitiateCheckoutPayload): Promise<ApiResponse<CheckoutInitiateResponse>> {
  return apiClient.post<CheckoutInitiateResponse>('/payments/initiate', payload);
}

export async function verifyPayment(payload: {
  gateway: 'KHALTI' | 'ESEWA';
  orderId: string;
  token?: string;
  refId?: string;
}): Promise<ApiResponse<any>> {
  return apiClient.post<any>('/payments/verify', payload);
}
