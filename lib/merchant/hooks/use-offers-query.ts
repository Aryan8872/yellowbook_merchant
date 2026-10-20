/**
 * TanStack Query hooks for Offers API
 * Handles server state for offers with caching, invalidation, and mutations
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getOffers,
  getOffer,
  createOffer,
  updateOffer,
  deleteOffer,
  toggleOfferStatus,
  toggleOfferFeatured,
  uploadOfferCoverImage,
  uploadOfferGalleryImage,
  Offer,
  CreateOfferDto,
  UpdateOfferDto,
  OffersQueryParams,
  OffersResponse,
} from '@/lib/api/merchant/offers-api';

// Query keys
export const offersKeys = {
  all: (merchantId: string) => ['merchant', merchantId, 'offers'] as const,
  lists: (merchantId: string) => [...offersKeys.all(merchantId), 'list'] as const,
  list: (merchantId: string, params: OffersQueryParams) => [...offersKeys.lists(merchantId), params] as const,
  details: (merchantId: string) => [...offersKeys.all(merchantId), 'detail'] as const,
  detail: (merchantId: string, offerId: string) => [...offersKeys.details(merchantId), offerId] as const,
};

/**
 * Fetch paginated offers list for a merchant
 */
export function useOffers(
  merchantId: string,
  params?: OffersQueryParams,
  options?: Omit<UseQueryOptions<OffersResponse>, 'queryKey' | 'queryFn' | 'enabled'>
) {
  return useQuery({
    queryKey: offersKeys.list(merchantId, params || {}),
    queryFn: async (): Promise<OffersResponse> => {
      const response = await getOffers(merchantId, params);
      const rawData = response.data;
      if (!rawData) {
        return {
          data: [],
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 1,
          },
        };
      }

      // If response.data is an array (the TransformResponseInterceptor unpacked data: offers)
      if (Array.isArray(rawData)) {
        const pagination = (response as any).pagination || {
          page: 1,
          limit: rawData.length || 20,
          total: rawData.length,
          totalPages: 1,
        };
        return {
          data: rawData,
          pagination,
        };
      }

      // If response.data is an object with { data: Offer[], pagination }
      const offersList = Array.isArray((rawData as any).data)
        ? (rawData as any).data
        : [];
      const pagination = (rawData as any).pagination || (response as any).pagination || {
        page: 1,
        limit: 20,
        total: offersList.length,
        totalPages: 1,
      };

      return {
        data: offersList,
        pagination,
      };
    },
    enabled: Boolean(merchantId),
    ...options,
  });
}

/**
 * Fetch single offer by ID
 */
export function useOffer(
  merchantId: string,
  offerId: string,
  enabled: boolean = true,
  options?: Omit<UseQueryOptions<Offer>, 'queryKey' | 'queryFn' | 'enabled'>
) {
  return useQuery({
    queryKey: offersKeys.detail(merchantId, offerId),
    queryFn: async () => {
      const response = await getOffer(merchantId, offerId);
      if (!response.data) {
        throw new Error('Failed to fetch offer');
      }
      return response.data;
    },
    enabled: enabled && Boolean(merchantId) && Boolean(offerId),
    ...options,
  });
}

/**
 * Create offer mutation
 */
export function useCreateOffer(merchantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOfferDto) => createOffer(merchantId, data),
    onSuccess: () => {
      // Invalidate offers list to refetch
      queryClient.invalidateQueries({ queryKey: offersKeys.lists(merchantId) });
      toast.success('Offer created successfully');
    },
    onError: (error: any) => {
      const errData = error?.data || error?.response?.data || error?.details;
      const errorCode = errData?.errorCode;
      const raw =
        errData?.message ||
        error?.message ||
        'Failed to create offer';
      const displayMessage = Array.isArray(raw) ? raw.join(', ') : String(raw);

      if (errorCode === 'QUOTA_OFFERS_EXCEEDED') {
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
 * Update offer mutation
 */
export function useUpdateOffer(merchantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ offerId, data }: { offerId: string; data: UpdateOfferDto }) =>
      updateOffer(merchantId, offerId, data),
    onSuccess: (_, variables) => {
      // Invalidate offers list and detail
      queryClient.invalidateQueries({ queryKey: offersKeys.lists(merchantId) });
      queryClient.invalidateQueries({ queryKey: offersKeys.detail(merchantId, variables.offerId) });
      toast.success('Offer updated successfully');
    },
    onError: (error: any) => {
      const raw =
        error?.data?.message ||
        error?.response?.data?.message ||
        error?.details?.message ||
        error?.message ||
        'Failed to update offer';
      const displayMessage = Array.isArray(raw) ? raw.join(', ') : String(raw);
      toast.error(displayMessage);
    },
  });
}

/**
 * Delete offer mutation
 */
export function useDeleteOffer(merchantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (offerId: string) => deleteOffer(merchantId, offerId),
    onSuccess: (_, offerId) => {
      // Invalidate all offers queries for this merchant
      queryClient.invalidateQueries({ queryKey: offersKeys.all(merchantId) });
      toast.success('Offer deleted successfully');
    },
    onError: (error: any) => {
      const message = error?.data?.message || error?.response?.data?.message || error?.message || 'Failed to delete offer';
      toast.error(message);
    },
  });
}

/**
 * Toggle offer status mutation
 */
export function useToggleOfferStatus(merchantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ offerId, isActive }: { offerId: string; isActive: boolean }) =>
      toggleOfferStatus(merchantId, offerId, isActive),
    onSuccess: (_, variables) => {
      // Invalidate all offers queries for this merchant
      queryClient.invalidateQueries({ queryKey: offersKeys.all(merchantId) });
      toast.success(variables.isActive ? 'Offer activated successfully' : 'Offer deactivated successfully');
    },
    onError: (error: any) => {
      const message = error?.data?.message || error?.response?.data?.message || error?.message || 'Failed to toggle offer status';
      toast.error(message);
    },
  });
}

/**
 * Toggle offer featured mutation
 */
export function useToggleOfferFeatured(merchantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ offerId, isFeatured }: { offerId: string; isFeatured: boolean }) =>
      toggleOfferFeatured(merchantId, offerId, isFeatured),
    onSuccess: (_, variables) => {
      // Invalidate all offers queries for this merchant
      queryClient.invalidateQueries({ queryKey: offersKeys.all(merchantId) });
      toast.success(variables.isFeatured ? 'Offer featured successfully' : 'Offer unfeatured successfully');
    },
    onError: (error: any) => {
      const message = error?.data?.message || error?.response?.data?.message || error?.message || 'Failed to toggle offer featured';
      toast.error(message);
    },
  });
}

/**
 * Upload offer cover image mutation
 */
export function useUploadOfferCoverImage(merchantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ offerId, file }: { offerId: string; file: File }) =>
      uploadOfferCoverImage(merchantId, offerId, file),
    onSuccess: (_, variables) => {
      // Invalidate offers list and detail
      queryClient.invalidateQueries({ queryKey: offersKeys.lists(merchantId) });
      queryClient.invalidateQueries({ queryKey: offersKeys.detail(merchantId, variables.offerId) });
      toast.success('Cover image uploaded successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to upload cover image';
      toast.error(message);
    },
  });
}

/**
 * Upload offer gallery image mutation
 */
export function useUploadOfferGalleryImage(merchantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ offerId, file }: { offerId: string; file: File }) =>
      uploadOfferGalleryImage(merchantId, offerId, file),
    onSuccess: (_, variables) => {
      // Invalidate offers list and detail
      queryClient.invalidateQueries({ queryKey: offersKeys.lists(merchantId) });
      queryClient.invalidateQueries({ queryKey: offersKeys.detail(merchantId, variables.offerId) });
      toast.success('Gallery image uploaded successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to upload gallery image';
      toast.error(message);
    },
  });
}
