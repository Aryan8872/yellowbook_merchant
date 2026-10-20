/**
 * TanStack Query hooks for Merchants API
 * Handles server state for merchants with caching, invalidation, and mutations
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getMerchants,
  getMerchant,
  createMerchant,
  updateMerchant,
  approveMerchant,
  rejectMerchant,
  suspendMerchant,
  reactivateMerchant,
  Merchant,
  CreateMerchantDto,
  UpdateMerchantDto,
  MerchantsQueryParams,
  MerchantsResponse,
  ApproveMerchantDto,
  RejectMerchantDto,
  SuspendMerchantDto,
  ReactivateMerchantDto,
  getMerchantBilling,
  MerchantBillingData,
} from '@/lib/api/admin/merchants-api';

// Query keys
export const merchantsKeys = {
  all: ['admin', 'merchants'] as const,
  lists: () => [...merchantsKeys.all, 'list'] as const,
  list: (params: MerchantsQueryParams) => [...merchantsKeys.lists(), params] as const,
  details: () => [...merchantsKeys.all, 'detail'] as const,
  detail: (id: string) => [...merchantsKeys.details(), id] as const,
  billing: (id: string) => [...merchantsKeys.detail(id), 'billing'] as const,
};

/**
 * Fetch paginated merchants list
 */
export function useMerchants(
  params?: MerchantsQueryParams,
  options?: Omit<UseQueryOptions<MerchantsResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: merchantsKeys.list(params || {}),
    queryFn: async () => {
      const response: any = await getMerchants(params);
      if (!response) {
        throw new Error('Failed to fetch merchants');
      }
      // If response is already the envelope with data and pagination
      if (Array.isArray(response.data)) {
        return {
          data: response.data,
          pagination: response.pagination || { page: 1, limit: 10, total: response.data.length, totalPages: 1, hasNext: false, hasPrevious: false },
        };
      }
      // If response.data itself has a .data property
      if (response.data && Array.isArray(response.data.data)) {
        return response.data;
      }
      // If response is directly an array
      if (Array.isArray(response)) {
        return {
          data: response,
          pagination: { page: 1, limit: 10, total: response.length, totalPages: 1, hasNext: false, hasPrevious: false },
        };
      }
      return {
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0, hasNext: false, hasPrevious: false },
      };
    },
    ...options,
  });
}

/**
 * Fetch single merchant by ID
 */
export function useMerchant(
  id: string,
  enabled: boolean = true,
  options?: Omit<UseQueryOptions<Merchant>, 'queryKey' | 'queryFn' | 'enabled'>
) {
  return useQuery({
    queryKey: merchantsKeys.detail(id),
    queryFn: async () => {
      const response = await getMerchant(id);
      if (!response.data) {
        throw new Error('Failed to fetch merchant');
      }
      return response.data;
    },
    enabled: enabled && Boolean(id),
    ...options,
  });
}

/**
 * Create merchant mutation
 */
export function useCreateMerchant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMerchantDto) => createMerchant(data),
    onSuccess: (response) => {
      // Invalidate merchants list to refetch
      queryClient.invalidateQueries({ queryKey: merchantsKeys.lists() });
      toast.success('Merchant created successfully');
      return response;
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to create merchant';
      // Handle validation error arrays
      const displayMessage = Array.isArray(message) ? message.join(', ') : message;
      toast.error(displayMessage);
    },
  });
}

/**
 * Update merchant mutation
 */
export function useUpdateMerchant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMerchantDto }) =>
      updateMerchant(id, data),
    onSuccess: (_, variables) => {
      // Invalidate merchants list and detail
      queryClient.invalidateQueries({ queryKey: merchantsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: merchantsKeys.detail(variables.id) });
      toast.success('Merchant updated successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to update merchant';
      // Handle validation error arrays
      const displayMessage = Array.isArray(message) ? message.join(', ') : message;
      toast.error(displayMessage);
    },
  });
}

/**
 * Approve merchant mutation
 */
export function useApproveMerchant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ApproveMerchantDto) => approveMerchant(data),
    onSuccess: (_, variables) => {
      // Invalidate merchants list and detail
      queryClient.invalidateQueries({ queryKey: merchantsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: merchantsKeys.detail(variables.merchantId) });
      toast.success('Merchant approved successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to approve merchant';
      // Handle validation error arrays
      const displayMessage = Array.isArray(message) ? message.join(', ') : message;
      toast.error(displayMessage);
    },
  });
}

/**
 * Reject merchant mutation
 */
export function useRejectMerchant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RejectMerchantDto) => rejectMerchant(data),
    onSuccess: (_, variables) => {
      // Invalidate merchants list and detail
      queryClient.invalidateQueries({ queryKey: merchantsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: merchantsKeys.detail(variables.merchantId) });
      toast.success('Merchant rejected successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to reject merchant';
      // Handle validation error arrays
      const displayMessage = Array.isArray(message) ? message.join(', ') : message;
      toast.error(displayMessage);
    },
  });
}

/**
 * Suspend merchant mutation
 */
export function useSuspendMerchant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SuspendMerchantDto) => suspendMerchant(data),
    onSuccess: (_, variables) => {
      // Invalidate merchants list and detail
      queryClient.invalidateQueries({ queryKey: merchantsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: merchantsKeys.detail(variables.merchantId) });
      toast.success('Merchant suspended successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to suspend merchant';
      // Handle validation error arrays
      const displayMessage = Array.isArray(message) ? message.join(', ') : message;
      toast.error(displayMessage);
    },
  });
}

/**
 * Reactivate merchant mutation
 */
export function useReactivateMerchant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ReactivateMerchantDto) => reactivateMerchant(data),
    onSuccess: (_, variables) => {
      // Invalidate merchants list and detail
      queryClient.invalidateQueries({ queryKey: merchantsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: merchantsKeys.detail(variables.merchantId) });
      toast.success('Merchant reactivated successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to reactivate merchant';
      // Handle validation error arrays
      const displayMessage = Array.isArray(message) ? message.join(', ') : message;
      toast.error(displayMessage);
    },
  });
}

/**
 * Fetch billing, active subscription, and quota usage for a merchant
 */
export function useMerchantBilling(merchantId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: merchantsKeys.billing(merchantId),
    queryFn: async () => {
      const response = await getMerchantBilling(merchantId);
      if (!response.data) {
        throw new Error('Failed to fetch merchant billing details');
      }
      return response.data;
    },
    enabled: enabled && Boolean(merchantId),
  });
}
