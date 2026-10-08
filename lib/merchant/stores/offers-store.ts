import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import {
  getOffers,
  createOffer,
  updateOffer,
  deleteOffer,
  toggleOfferStatus,
  toggleOfferFeatured,
  Offer,
  CreateOfferDto,
  UpdateOfferDto,
  OffersQueryParams,
  OffersResponse,
} from '@/lib/api/merchant/offers-api';

interface OffersState {
  offers: Offer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  loading: boolean;
  error: string | null;
  filters: OffersQueryParams;

  fetchOffers: (merchantId: string, params?: OffersQueryParams) => Promise<void>;
  fetchOffer: (merchantId: string, offerId: string) => Promise<Offer | null>;
  createOffer: (merchantId: string, data: CreateOfferDto) => Promise<void>;
  updateOffer: (merchantId: string, offerId: string, data: UpdateOfferDto) => Promise<void>;
  deleteOffer: (merchantId: string, offerId: string) => Promise<void>;
  toggleOfferStatus: (merchantId: string, offerId: string, isActive: boolean) => Promise<void>;
  toggleOfferFeatured: (merchantId: string, offerId: string, isFeatured: boolean) => Promise<void>;
  setFilters: (filters: OffersQueryParams) => void;
  clearError: () => void;
}

export const useMerchantOffersStore = create<OffersState>()(
  persist(
    (set, get) => ({
      offers: [],
      pagination: null,
      loading: false,
      error: null,
      filters: {},

      fetchOffers: async (merchantId: string, params?: OffersQueryParams) => {
        set({ loading: true, error: null });
        try {
          console.log('[Offers Store] Fetching offers for merchant:', merchantId, 'with params:', params);
          const response = await getOffers(merchantId, { ...get().filters, ...params });
          console.log('[Offers Store] Raw API response:', response);
          if (response.success && response.data) {
            console.log('[Offers Store] Offers data loaded:', response.data);
            // API returns data directly as array or wrapped in data property
            const offersData = Array.isArray(response.data) ? response.data : response.data.data;
            const paginationData = response.data.pagination || null;
            set({
              offers: offersData || [],
              pagination: paginationData,
              loading: false,
            });
            toast.success('Offers loaded successfully');
          } else {
            console.error('[Offers Store] Failed to fetch offers:', response.message);
            set({
              error: response.message || 'Failed to fetch offers',
              loading: false,
            });
            toast.error(response.message || 'Failed to fetch offers');
          }
        } catch (error: any) {
          console.error('[Offers Store] Error fetching offers:', error);
          set({
            error: error.message || 'Failed to fetch offers',
            loading: false,
          });
          toast.error(error.message || 'Failed to fetch offers');
        }
      },

      fetchOffer: async (merchantId: string, offerId: string) => {
        set({ loading: true, error: null });
        try {
          // TODO: Implement getOffer API call
          // For now, find the offer in the current list
          const offer = get().offers.find(o => o.id === offerId);
          if (offer) {
            set({ loading: false });
            return offer;
          } else {
            set({
              error: 'Offer not found',
              loading: false,
            });
            return null;
          }
        } catch (error: any) {
          set({
            error: error.message || 'Failed to fetch offer',
            loading: false,
          });
          toast.error(error.message || 'Failed to fetch offer');
          return null;
        }
      },

      createOffer: async (merchantId: string, data: CreateOfferDto) => {
        set({ loading: true, error: null });
        try {
          const response = await createOffer(merchantId, data);
          if (response.success && response.data) {
            set((state) => ({
              offers: [response.data!, ...state.offers],
              pagination: state.pagination ? { ...state.pagination, total: state.pagination.total + 1 } : null,
              loading: false,
            }));
            toast.success('Offer created successfully');
          } else {
            set({
              error: response.message || 'Failed to create offer',
              loading: false,
            });
            toast.error(response.message || 'Failed to create offer');
          }
        } catch (error: any) {
          set({
            error: error.message || 'Failed to create offer',
            loading: false,
          });
          toast.error(error.message || 'Failed to create offer');
        }
      },

      updateOffer: async (merchantId: string, offerId: string, data: UpdateOfferDto) => {
        set({ loading: true, error: null });
        try {
          const response = await updateOffer(merchantId, offerId, data);
          if (response.success && response.data) {
            set((state) => ({
              offers: state.offers.map((o) => (o.id === offerId ? response.data! : o)),
              loading: false,
            }));
            toast.success('Offer updated successfully');
          } else {
            set({
              error: response.message || 'Failed to update offer',
              loading: false,
            });
            toast.error(response.message || 'Failed to update offer');
          }
        } catch (error: any) {
          set({
            error: error.message || 'Failed to update offer',
            loading: false,
          });
          toast.error(error.message || 'Failed to update offer');
        }
      },

      deleteOffer: async (merchantId: string, offerId: string) => {
        set({ loading: true, error: null });
        try {
          const response = await deleteOffer(merchantId, offerId);
          if (response.success) {
            set((state) => ({
              offers: state.offers.filter((o) => o.id !== offerId),
              pagination: state.pagination ? { ...state.pagination, total: state.pagination.total - 1 } : null,
              loading: false,
            }));
            toast.success('Offer deleted successfully');
          } else {
            set({
              error: response.message || 'Failed to delete offer',
              loading: false,
            });
            toast.error(response.message || 'Failed to delete offer');
          }
        } catch (error: any) {
          set({
            error: error.message || 'Failed to delete offer',
            loading: false,
          });
          toast.error(error.message || 'Failed to delete offer');
        }
      },

      toggleOfferStatus: async (merchantId: string, offerId: string, isActive: boolean) => {
        set({ loading: true, error: null });
        try {
          const response = await toggleOfferStatus(merchantId, offerId, isActive);
          if (response.success && response.data) {
            set((state) => ({
              offers: state.offers.map((o) => (o.id === offerId ? response.data! : o)),
              loading: false,
            }));
            toast.success('Offer status updated successfully');
          } else {
            set({
              error: response.message || 'Failed to toggle offer status',
              loading: false,
            });
            toast.error(response.message || 'Failed to toggle offer status');
          }
        } catch (error: any) {
          set({
            error: error.message || 'Failed to toggle offer status',
            loading: false,
          });
          toast.error(error.message || 'Failed to toggle offer status');
        }
      },

      toggleOfferFeatured: async (merchantId: string, offerId: string, isFeatured: boolean) => {
        set({ loading: true, error: null });
        try {
          const response = await toggleOfferFeatured(merchantId, offerId, isFeatured);
          if (response.success && response.data) {
            set((state) => ({
              offers: state.offers.map((o) => (o.id === offerId ? response.data! : o)),
              loading: false,
            }));
            toast.success('Offer featured status updated successfully');
          } else {
            set({
              error: response.message || 'Failed to toggle offer featured status',
              loading: false,
            });
            toast.error(response.message || 'Failed to toggle offer featured status');
          }
        } catch (error: any) {
          set({
            error: error.message || 'Failed to toggle offer featured status',
            loading: false,
          });
          toast.error(error.message || 'Failed to toggle offer featured status');
        }
      },

      setFilters: (filters: OffersQueryParams) => {
        set({ filters });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'offernepal-merchant-offers',
      partialize: (state) => ({ filters: state.filters }),
    }
  )
);
