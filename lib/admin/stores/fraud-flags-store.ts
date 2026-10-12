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
      console.log('[FraudFlags Store] Raw response:', res);
      if (res && (res.success || res.data)) {
        const rawData = res.data;
        const flagsList = Array.isArray(rawData)
          ? rawData
          : Array.isArray((rawData as any)?.data)
          ? (rawData as any).data
          : Array.isArray((res as any).fraudFlags)
          ? (res as any).fraudFlags
          : [];

        const paginationObj =
          (rawData as any)?.pagination ||
          (res as any).pagination ||
          (res as any).meta?.pagination ||
          null;

        set({
          flags: flagsList,
          pagination: paginationObj,
          loading: false,
        });
      } else {
        set({ flags: [], loading: false });
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
