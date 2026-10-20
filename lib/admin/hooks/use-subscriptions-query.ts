/**
 * TanStack Query hooks for Admin Subscriptions API
 * Provides plan listing, trial config, and override mutation hooks.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getSubscriptionPlans,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
  getTrialConfigs,
  updateTrialConfig,
  overrideSubscription,
  SubscriptionPlanItem,
} from '@/lib/api/admin/subscriptions-api';

// ─── Query Keys ─────────────────────────────────────────────────────────────

export const subscriptionKeys = {
  all: ['admin', 'subscriptions'] as const,
  plans: () => [...subscriptionKeys.all, 'plans'] as const,
  plan: (params: { audience?: string; includeArchived?: boolean }) =>
    [...subscriptionKeys.plans(), params] as const,
  trials: () => [...subscriptionKeys.all, 'trials'] as const,
};

// ─── Plan Hooks ──────────────────────────────────────────────────────────────

/**
 * Fetch all subscription plans, optionally filtered by audience
 */
export function useSubscriptionPlans(params?: { audience?: string; includeArchived?: boolean }) {
  return useQuery({
    queryKey: subscriptionKeys.plan(params ?? {}),
    queryFn: async () => {
      const response: any = await getSubscriptionPlans(params);
      // Handle both direct array and wrapped {data:[]} shapes
      if (Array.isArray(response)) return response as SubscriptionPlanItem[];
      if (Array.isArray(response?.data)) return response.data as SubscriptionPlanItem[];
      return [] as SubscriptionPlanItem[];
    },
    staleTime: 60_000, // plans rarely change; 1 min cache
  });
}

/**
 * Create a new subscription plan
 */
export function useCreateSubscriptionPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => createSubscriptionPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.plans() });
      toast.success('Plan created successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to create plan';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    },
  });
}

/**
 * Update an existing subscription plan
 */
export function useUpdateSubscriptionPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateSubscriptionPlan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.plans() });
      toast.success('Plan updated successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to update plan';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    },
  });
}

/**
 * Delete (archive) a subscription plan
 */
export function useDeleteSubscriptionPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSubscriptionPlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.plans() });
      toast.success('Plan archived successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to archive plan';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    },
  });
}

// ─── Trial Config Hooks ──────────────────────────────────────────────────────

/**
 * Fetch trial configurations
 */
export function useTrialConfigs() {
  return useQuery({
    queryKey: subscriptionKeys.trials(),
    queryFn: async () => {
      const response: any = await getTrialConfigs();
      if (Array.isArray(response)) return response;
      if (Array.isArray(response?.data)) return response.data;
      return [];
    },
  });
}

/**
 * Update trial configuration
 */
export function useUpdateTrialConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => updateTrialConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.trials() });
      toast.success('Trial config updated');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to update trial config';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    },
  });
}

// ─── Override / Admin Actions ─────────────────────────────────────────────────

/**
 * Manually grant / override a subscription for a user or merchant
 */
export function useOverrideSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      userId?: string;
      merchantId?: string;
      planId: string;
      mode?: 'REPLACE' | 'EXTEND' | 'RENEW';
      customDays?: number;
      durationDays?: number; // kept for back-compat; maps to customDays
      isTrial?: boolean;
      reason?: string;
    }) => {
      const { durationDays, ...rest } = data;
      return overrideSubscription({
        ...rest,
        customDays: rest.customDays ?? durationDays,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
      // Also refresh users/merchants lists so badges update
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'merchants'] });
      toast.success('Subscription override applied successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to override subscription';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    },
  });
}
