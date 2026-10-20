/**
 * TanStack Query hooks for Branches API
 * Handles server state for branches with caching, invalidation, and mutations
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getBranches,
  createBranch,
  updateBranch,
  deleteBranch,
  BranchListParams,
  BranchListResponse,
} from '@/lib/api/branches';
import { Branch, CreateBranchDto, UpdateBranchDto } from '@/lib/types/branch';

// Query keys
export const branchesKeys = {
  all: (merchantId: string) => ['merchant', merchantId, 'branches'] as const,
  lists: (merchantId: string) => [...branchesKeys.all(merchantId), 'list'] as const,
  list: (merchantId: string, params: BranchListParams) => [...branchesKeys.lists(merchantId), params] as const,
  details: (merchantId: string) => [...branchesKeys.all(merchantId), 'detail'] as const,
  detail: (merchantId: string, branchId: string) => [...branchesKeys.details(merchantId), branchId] as const,
};

/**
 * Fetch paginated branches list for a merchant
 */
export function useBranches(
  merchantId: string,
  params?: BranchListParams,
  options?: Omit<UseQueryOptions<BranchListResponse>, 'queryKey' | 'queryFn' | 'enabled'>
) {
  return useQuery({
    queryKey: branchesKeys.list(merchantId, params || {}),
    queryFn: async (): Promise<BranchListResponse> => {
      const response = await getBranches(merchantId, params);
      const rawData = response.data;
      if (!rawData) {
        return {
          data: [],
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 1,
            hasNext: false,
            hasPrevious: false,
          },
        };
      }

      if (Array.isArray(rawData)) {
        return {
          data: rawData,
          pagination: {
            page: 1,
            limit: rawData.length || 20,
            total: rawData.length,
            totalPages: 1,
            hasNext: false,
            hasPrevious: false,
          },
        };
      }

      const branchList = Array.isArray(rawData.data) ? rawData.data : [];
      const pagination = rawData.pagination || {
        page: 1,
        limit: 20,
        total: branchList.length,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      };

      return {
        data: branchList,
        pagination,
      };
    },
    enabled: Boolean(merchantId),
    ...options,
  });
}

/**
 * Create branch mutation
 */
export function useCreateBranch(merchantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBranchDto) => createBranch(merchantId, data),
    onSuccess: () => {
      // Invalidate branches list to refetch
      queryClient.invalidateQueries({ queryKey: branchesKeys.lists(merchantId) });
      toast.success('Branch created successfully');
    },
    onError: (error: any) => {
      const errData = error?.response?.data;
      const errorCode = errData?.errorCode;
      const message = errData?.message || error?.message || 'Failed to create branch';
      const displayMessage = Array.isArray(message) ? message.join(', ') : message;

      if (errorCode === 'QUOTA_BRANCHES_EXCEEDED') {
        toast.error(displayMessage, {
          action: {
            label: 'Upgrade Plan',
            onClick: () => {
              if (typeof window !== 'undefined') {
                window.location.href = '/merchant/settings';
              }
            },
          },
          duration: 8000,
        });
      } else {
        toast.error(displayMessage);
      }
    },
  });
}

/**
 * Update branch mutation
 */
export function useUpdateBranch(merchantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ branchId, data }: { branchId: string; data: UpdateBranchDto }) =>
      updateBranch(merchantId, branchId, data),
    onSuccess: (_, variables) => {
      // Invalidate all branches queries for this merchant
      queryClient.invalidateQueries({ queryKey: branchesKeys.all(merchantId) });
      toast.success('Branch updated successfully');
    },
    onError: (error: any) => {
      const message = error?.data?.message || error?.response?.data?.message || error?.message || 'Failed to update branch';
      const displayMessage = Array.isArray(message) ? message.join(', ') : message;
      toast.error(displayMessage);
    },
  });
}

/**
 * Delete branch mutation
 */
export function useDeleteBranch(merchantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (branchId: string) => deleteBranch(merchantId, branchId),
    onSuccess: (_, branchId) => {
      // Invalidate all branches queries for this merchant
      queryClient.invalidateQueries({ queryKey: branchesKeys.all(merchantId) });
      toast.success('Branch deleted successfully');
    },
    onError: (error: any) => {
      const message = error?.data?.message || error?.response?.data?.message || error?.message || 'Failed to delete branch';
      const displayMessage = Array.isArray(message) ? message.join(', ') : message;
      toast.error(displayMessage);
    },
  });
}
