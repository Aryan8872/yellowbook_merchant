import { create } from 'zustand';
import {
  getFraudFlags,
  reviewFraudFlag,
  type FraudFlag,
  type FraudFlagsQueryParams,
  type ReviewFraudFlagDto,
  type FraudFlagStatus,
} from '@/lib/api/admin/fraud-flags-api';

interface FraudFlagsState {
  flags: FraudFlag[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  } | null;
  currentFilter: FraudFlagStatus | 'ALL';

  fetchFraudFlags: (params?: FraudFlagsQueryParams) => Promise<void>;
  reviewFlag: (data: ReviewFraudFlagDto) => Promise<{ success: boolean; message?: string }>;
  setFilter: (status: FraudFlagStatus | 'ALL') => void;
}

export const useFraudFlagsStore = create<FraudFlagsState>((set, get) => ({
  flags: [],
  loading: false,
  error: null,
  pagination: null,
  currentFilter: 'ALL',

  setFilter: (status) => set({ currentFilter: status }),

  fetchFraudFlags: async (params) => {
    set({ loading: true, error: null });
    try {
      const filter = get().currentFilter;
      const queryParams: FraudFlagsQueryParams = {
        page: 1,
        limit: 20,
        ...params,
        ...(filter !== 'ALL' ? { status: filter } : {}),
      };
      const res = await getFraudFlags(queryParams);
      if (res?.data) {
        set({
          flags: res.data.data,
          pagination: res.data.pagination,
          loading: false,
        });
      } else {
        set({ loading: false });
      }
    } catch (err: any) {
      set({
        error: err?.message || 'Failed to load fraud flags',
        loading: false,
      });
    }
  },

  reviewFlag: async (data: ReviewFraudFlagDto) => {
    try {
      await reviewFraudFlag(data);
      // Refresh list after review
      await get().fetchFraudFlags();
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Failed to review fraud flag',
      };
    }
  },
}));
