import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import { getMerchants, getMerchant, updateMerchant, approveMerchant, rejectMerchant, suspendMerchant, Merchant, MerchantsQueryParams, ApproveMerchantDto, RejectMerchantDto, SuspendMerchantDto, UpdateMerchantDto } from '@/lib/api/admin/merchants-api';

interface MerchantsState {
  merchants: Merchant[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  filters: MerchantsQueryParams;
  
  fetchMerchants: (params?: MerchantsQueryParams) => Promise<void>;
  fetchMerchant: (id: string) => Promise<Merchant | null>;
  updateMerchant: (id: string, data: UpdateMerchantDto) => Promise<void>;
  approveMerchant: (data: ApproveMerchantDto) => Promise<void>;
  rejectMerchant: (data: RejectMerchantDto) => Promise<void>;
  suspendMerchant: (data: SuspendMerchantDto) => Promise<void>;
  setFilters: (filters: MerchantsQueryParams) => void;
  clearError: () => void;
}

export const useMerchantsStore = create<MerchantsState>()(
  persist(
    (set, get) => ({
      merchants: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
      loading: false,
      error: null,
      filters: {},

      fetchMerchants: async (params?: MerchantsQueryParams) => {
        set({ loading: true, error: null });
        try {
          const response = await getMerchants({ ...get().filters, ...params });
          if (response.success && response.data) {
            set({
              merchants: response.data.data,
              total: response.data.pagination.total,
              page: response.data.pagination.page,
              limit: response.data.pagination.limit,
              totalPages: response.data.pagination.totalPages,
              loading: false,
            });
            toast.success('Merchants loaded successfully');
          } else {
            set({
              error: response.message || 'Failed to fetch merchants',
              loading: false,
            });
            toast.error(response.message || 'Failed to fetch merchants');
          }
        } catch (error: any) {
          set({
            error: error.message || 'Failed to fetch merchants',
            loading: false,
          });
          toast.error(error.message || 'Failed to fetch merchants');
        }
      },

      fetchMerchant: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const response = await getMerchant(id);
          if (response.success && response.data) {
            set({ loading: false });
            toast.success('Merchant loaded successfully');
            return response.data;
          } else {
            set({
              error: response.message || 'Failed to fetch merchant',
              loading: false,
            });
            toast.error(response.message || 'Failed to fetch merchant');
            return null;
          }
        } catch (error: any) {
          set({
            error: error.message || 'Failed to fetch merchant',
            loading: false,
          });
          toast.error(error.message || 'Failed to fetch merchant');
          return null;
        }
      },

      updateMerchant: async (id: string, data: UpdateMerchantDto) => {
        set({ loading: true, error: null });
        try {
          const response = await updateMerchant(id, data);
          if (response.success && response.data) {
            set((state) => ({
              merchants: state.merchants.map((m) => (m.id === id ? response.data! : m)),
              loading: false,
            }));
            toast.success('Merchant updated successfully');
          } else {
            set({
              error: response.message || 'Failed to update merchant',
              loading: false,
            });
            toast.error(response.message || 'Failed to update merchant');
          }
        } catch (error: any) {
          set({
            error: error.message || 'Failed to update merchant',
            loading: false,
          });
          toast.error(error.message || 'Failed to update merchant');
        }
      },

      approveMerchant: async (data: ApproveMerchantDto) => {
        set({ loading: true, error: null });
        try {
          const response = await approveMerchant(data);
          if (response.success && response.data) {
            set((state) => ({
              merchants: state.merchants.map((m) => (m.id === data.merchantId ? response.data! : m)),
              loading: false,
            }));
            toast.success('Merchant approved successfully');
          } else {
            set({
              error: response.message || 'Failed to approve merchant',
              loading: false,
            });
            toast.error(response.message || 'Failed to approve merchant');
          }
        } catch (error: any) {
          set({
            error: error.message || 'Failed to approve merchant',
            loading: false,
          });
          toast.error(error.message || 'Failed to approve merchant');
        }
      },

      rejectMerchant: async (data: RejectMerchantDto) => {
        set({ loading: true, error: null });
        try {
          const response = await rejectMerchant(data);
          if (response.success && response.data) {
            set((state) => ({
              merchants: state.merchants.map((m) => (m.id === data.merchantId ? response.data! : m)),
              loading: false,
            }));
            toast.success('Merchant rejected successfully');
          } else {
            set({
              error: response.message || 'Failed to reject merchant',
              loading: false,
            });
            toast.error(response.message || 'Failed to reject merchant');
          }
        } catch (error: any) {
          set({
            error: error.message || 'Failed to reject merchant',
            loading: false,
          });
          toast.error(error.message || 'Failed to reject merchant');
        }
      },

      suspendMerchant: async (data: SuspendMerchantDto) => {
        set({ loading: true, error: null });
        try {
          const response = await suspendMerchant(data);
          if (response.success && response.data) {
            set((state) => ({
              merchants: state.merchants.map((m) => (m.id === data.merchantId ? response.data! : m)),
              loading: false,
            }));
            toast.success('Merchant suspended successfully');
          } else {
            set({
              error: response.message || 'Failed to suspend merchant',
              loading: false,
            });
            toast.error(response.message || 'Failed to suspend merchant');
          }
        } catch (error: any) {
          set({
            error: error.message || 'Failed to suspend merchant',
            loading: false,
          });
          toast.error(error.message || 'Failed to suspend merchant');
        }
      },

      setFilters: (filters: MerchantsQueryParams) => {
        set({ filters });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'offernepal-admin-merchants',
      partialize: (state) => ({ filters: state.filters }),
    }
  )
);
