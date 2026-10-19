import { apiClient } from '../client';
import type { ApiResponse } from '../types';

export interface SubscriptionPlanItem {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  audience: 'MERCHANT' | 'USER';
  priceNpr: number;
  billingCycle: string;
  durationDays: number;
  trialDays: number;
  isActive: boolean;
  isArchived: boolean;
  isPublic: boolean;
  entitlementsJson: Record<string, any>;
  activeSubscribersCount?: number;
  totalSubscribersCount?: number;
  createdAt: string;
}

export interface SystemTrialConfigItem {
  id: string;
  audience: 'MERCHANT' | 'USER';
  isEnabled: boolean;
  defaultPeriodDays: number;
  unlimitedRedeems: boolean;
  notes?: string | null;
}

export async function getSubscriptionPlans(params?: {
  audience?: string;
  includeArchived?: boolean;
}): Promise<ApiResponse<SubscriptionPlanItem[]>> {
  return apiClient.get<SubscriptionPlanItem[]>('/admin/plans', {
    params: params as Record<string, string | number | boolean | undefined>,
  });
}

export async function createSubscriptionPlan(data: any): Promise<ApiResponse<SubscriptionPlanItem>> {
  return apiClient.post<SubscriptionPlanItem>('/admin/plans', data);
}

export async function updateSubscriptionPlan(id: string, data: any): Promise<ApiResponse<SubscriptionPlanItem>> {
  return apiClient.patch<SubscriptionPlanItem>(`/admin/plans/${id}`, data);
}

export async function deleteSubscriptionPlan(id: string): Promise<ApiResponse<{ message: string }>> {
  return apiClient.delete<{ message: string }>(`/admin/plans/${id}`);
}

export async function getTrialConfigs(): Promise<ApiResponse<SystemTrialConfigItem[]>> {
  return apiClient.get<SystemTrialConfigItem[]>('/admin/trials/config');
}

export async function updateTrialConfig(data: any): Promise<ApiResponse<SystemTrialConfigItem>> {
  return apiClient.patch<SystemTrialConfigItem>('/admin/trials/config', data);
}

export async function overrideSubscription(data: any): Promise<ApiResponse<any>> {
  return apiClient.post<any>('/admin/subscriptions/override', data);
}
