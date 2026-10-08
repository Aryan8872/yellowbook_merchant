import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/auth';
import {
  getRedemptions,
  Redemption,
  RedemptionsQueryParams,
  RedemptionsResponse,
} from '@/lib/api/merchant/redemptions-api';

interface RedemptionsState {
  redemptions: Redemption[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  loading: boolean;
  error: string | null;
  filters: RedemptionsQueryParams;

  fetchRedemptions: (merchantId: string, params?: RedemptionsQueryParams) => Promise<void>;
  setFilters: (filters: RedemptionsQueryParams) => void;
  clearError: () => void;
}

export const useMerchantRedemptionsStore = create<RedemptionsState>()(
  persist(
    (set, get) => ({
      redemptions: [],
      pagination: null,
      loading: false,
      error: null,
      filters: {},

      fetchRedemptions: async (merchantId, params) => {
        set({ loading: true, error: null });
        try {
          console.log('[Redemptions Store] Fetching redemptions for merchant:', merchantId, 'with params:', params);
          if (!merchantId) {
            set({ loading: false });
            toast.error('No merchant ID found');
            return;
          }

          const response = await getRedemptions(merchantId, params);
          console.log('[Redemptions Store] Raw API response:', response);
          
          if (response.success && response.data) {
            console.log('[Redemptions Store] Redemptions data loaded:', response.data);
            set({
              redemptions: response.data.data || [],
              pagination: response.data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 },
              loading: false,
            });
            toast.success('Redemptions loaded successfully');
          } else {
            console.error('[Redemptions Store] Failed to fetch redemptions:', response.message);
            set({
              error: response.message || 'Failed to fetch redemptions',
              loading: false,
            });
            toast.error(response.message || 'Failed to fetch redemptions');
          }
        } catch (error: any) {
          console.error('[Redemptions Store] Error fetching redemptions:', error);
          set({
            error: error.message || 'Failed to fetch redemptions',
            loading: false,
          });
          toast.error(error.message || 'Failed to fetch redemptions');
        }
      },

      setFilters: (filters: RedemptionsQueryParams) => {
        set({ filters });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'offernepal-merchant-redemptions',
      partialize: (state) => ({ filters: state.filters }),
    }
  )
);
