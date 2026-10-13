import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMerchants, getMerchant, createMerchant, updateMerchant, approveMerchant, rejectMerchant, suspendMerchant, reactivateMerchant, type MerchantsQueryParams, type CreateMerchantDto, type UpdateMerchantDto } from '@/lib/api/admin/merchants-api';
import { toast } from 'sonner';

// Query keys
export const merchantsKeys = {
  all: ['merchants'] as const,
  lists: () => [...merchantsKeys.all, 'list'] as const,
  list: (params: MerchantsQueryParams) => [...merchantsKeys.lists(), params] as const,
  details: () => [...merchantsKeys.all, 'detail'] as const,
  detail: (id: string) => [...merchantsKeys.details(), id] as const,
};

// Fetch merchants list
export function useMerchants(params?: MerchantsQueryParams) {
  return useQuery({
    queryKey: merchantsKeys.list(params || {}),
    queryFn: () => getMerchants(params),
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Fetch single merchant
export function useMerchant(id: string) {
  return useQuery({
    queryKey: merchantsKeys.detail(id),
    queryFn: () => getMerchant(id),
    enabled: !!id,
    staleTime: 60 * 1000, // 1 minute
  });
}

// Create merchant mutation
export function useCreateMerchant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMerchantDto) => createMerchant(data),
    onSuccess: () => {
      // Invalidate merchants list to refetch
      queryClient.invalidateQueries({ queryKey: merchantsKeys.lists() });
      // Invalidate any merchant detail queries
      queryClient.invalidateQueries({ queryKey: merchantsKeys.details() });
      toast.success('Merchant created successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Failed to create merchant';
      toast.error(message);
    },
  });
}

// Update merchant mutation
export function useUpdateMerchant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMerchantDto }) => updateMerchant(id, data),
    onSuccess: (_, variables) => {
      // Invalidate both the list and the specific merchant
      queryClient.invalidateQueries({ queryKey: merchantsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: merchantsKeys.details() });
      queryClient.invalidateQueries({ queryKey: merchantsKeys.detail(variables.id) });
      toast.success('Merchant updated successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Failed to update merchant';
      toast.error(message);
    },
  });
}

// Approve merchant mutation
export function useApproveMerchant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approveMerchant,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: merchantsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: merchantsKeys.details() });
      queryClient.invalidateQueries({ queryKey: merchantsKeys.detail(variables.merchantId) });
      toast.success('Merchant approved successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Failed to approve merchant';
      toast.error(message);
    },
  });
}

// Reject merchant mutation
export function useRejectMerchant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rejectMerchant,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: merchantsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: merchantsKeys.details() });
      queryClient.invalidateQueries({ queryKey: merchantsKeys.detail(variables.merchantId) });
      toast.success('Merchant rejected successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Failed to reject merchant';
      toast.error(message);
    },
  });
}

// Suspend merchant mutation
export function useSuspendMerchant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: suspendMerchant,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: merchantsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: merchantsKeys.details() });
      queryClient.invalidateQueries({ queryKey: merchantsKeys.detail(variables.merchantId) });
      toast.success('Merchant suspended successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Failed to suspend merchant';
      toast.error(message);
    },
  });
}

// Reactivate merchant mutation
export function useReactivateMerchant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reactivateMerchant,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: merchantsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: merchantsKeys.details() });
      queryClient.invalidateQueries({ queryKey: merchantsKeys.detail(variables.merchantId) });
      toast.success('Merchant reactivated successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Failed to reactivate merchant';
      toast.error(message);
    },
  });
}
