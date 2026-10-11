import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import {
  getAdminDashboard,
  getPlatformRevenueAnalytics,
  getPlatformCustomerAnalytics,
  getPlatformOfferPerformanceAnalytics,
  getPlatformMerchantPerformanceAnalytics,
  getPlatformTimeBasedAnalytics,
  getPlatformGrowthMetrics,
  getPlatformCategoryAnalytics,
  AdminDashboardStats,
  PlatformRevenueAnalytics,
  PlatformCustomerAnalytics,
  PlatformOfferPerformanceAnalytics,
  PlatformMerchantPerformanceAnalytics,
  PlatformTimeBasedAnalytics,
  PlatformGrowthMetrics,
  PlatformCategoryAnalytics,
  TimeRangeParams,
} from '@/lib/api/admin/analytics-api';

interface AnalyticsState {
  dashboardStats: AdminDashboardStats | null;
  revenueAnalytics: PlatformRevenueAnalytics | null;
  customerAnalytics: PlatformCustomerAnalytics | null;
  offerPerformanceAnalytics: PlatformOfferPerformanceAnalytics | null;
  merchantPerformanceAnalytics: PlatformMerchantPerformanceAnalytics | null;
  timeBasedAnalytics: PlatformTimeBasedAnalytics | null;
  growthMetrics: PlatformGrowthMetrics | null;
  categoryAnalytics: PlatformCategoryAnalytics | null;
  loading: boolean;
  error: string | null;

  fetchAdminDashboard: () => Promise<void>;
  fetchPlatformRevenueAnalytics: (params?: TimeRangeParams) => Promise<void>;
  fetchPlatformCustomerAnalytics: (params?: TimeRangeParams) => Promise<void>;
  fetchPlatformOfferPerformanceAnalytics: (params?: TimeRangeParams) => Promise<void>;
  fetchPlatformMerchantPerformanceAnalytics: (params?: TimeRangeParams) => Promise<void>;
  fetchPlatformTimeBasedAnalytics: (params?: TimeRangeParams) => Promise<void>;
  fetchPlatformGrowthMetrics: (params?: TimeRangeParams) => Promise<void>;
  fetchPlatformCategoryAnalytics: (params?: TimeRangeParams) => Promise<void>;
  clearError: () => void;
}

export const useAnalyticsStore = create<AnalyticsState>()(
  persist(
    (set) => ({
      dashboardStats: null,
      revenueAnalytics: null,
      customerAnalytics: null,
      offerPerformanceAnalytics: null,
      merchantPerformanceAnalytics: null,
      timeBasedAnalytics: null,
      growthMetrics: null,
      categoryAnalytics: null,
      loading: false,
      error: null,

      fetchAdminDashboard: async () => {
        set({ loading: true, error: null });
        try {
          const response = await getAdminDashboard();
          if (response.success && response.data) {
            set({ dashboardStats: response.data, loading: false });
          } else {
            set({
              error: response.message || 'Failed to fetch dashboard stats',
              loading: false,
            });
            toast.error(response.message || 'Failed to fetch dashboard stats');
          }
        } catch (error: any) {
          set({
            error: error.message || 'Failed to fetch dashboard stats',
            loading: false,
          });
          toast.error(error.message || 'Failed to fetch dashboard stats');
        }
      },

      fetchPlatformRevenueAnalytics: async (params?: TimeRangeParams) => {
        set({ loading: true, error: null });
        try {
          const response = await getPlatformRevenueAnalytics(params || { range: '30d' });
          if (response.success && response.data) {
            set({ revenueAnalytics: response.data, loading: false });
          } else {
            set({
              error: response.message || 'Failed to fetch revenue analytics',
              loading: false,
            });
            toast.error(response.message || 'Failed to fetch revenue analytics');
          }
        } catch (error: any) {
          set({
            error: error.message || 'Failed to fetch revenue analytics',
            loading: false,
          });
          toast.error(error.message || 'Failed to fetch revenue analytics');
        }
      },

      fetchPlatformCustomerAnalytics: async (params?: TimeRangeParams) => {
        set({ loading: true, error: null });
        try {
          const response = await getPlatformCustomerAnalytics(params || { range: '30d' });
          if (response.success && response.data) {
            set({ customerAnalytics: response.data, loading: false });
          } else {
            set({
              error: response.message || 'Failed to fetch customer analytics',
              loading: false,
            });
            toast.error(response.message || 'Failed to fetch customer analytics');
          }
        } catch (error: any) {
          set({
            error: error.message || 'Failed to fetch customer analytics',
            loading: false,
          });
          toast.error(error.message || 'Failed to fetch customer analytics');
        }
      },

      fetchPlatformOfferPerformanceAnalytics: async (params?: TimeRangeParams) => {
        set({ loading: true, error: null });
        try {
          const response = await getPlatformOfferPerformanceAnalytics(params || { range: '30d' });
          if (response.success && response.data) {
            set({ offerPerformanceAnalytics: response.data, loading: false });
          } else {
            set({
              error: response.message || 'Failed to fetch offer performance analytics',
              loading: false,
            });
            toast.error(response.message || 'Failed to fetch offer performance analytics');
          }
        } catch (error: any) {
          set({
            error: error.message || 'Failed to fetch offer performance analytics',
            loading: false,
          });
          toast.error(error.message || 'Failed to fetch offer performance analytics');
        }
      },

      fetchPlatformMerchantPerformanceAnalytics: async (params?: TimeRangeParams) => {
        set({ loading: true, error: null });
        try {
          const response = await getPlatformMerchantPerformanceAnalytics(params || { range: '30d' });
          if (response.success && response.data) {
            set({ merchantPerformanceAnalytics: response.data, loading: false });
          } else {
            set({
              error: response.message || 'Failed to fetch merchant performance analytics',
              loading: false,
            });
            toast.error(response.message || 'Failed to fetch merchant performance analytics');
          }
        } catch (error: any) {
          set({
            error: error.message || 'Failed to fetch merchant performance analytics',
            loading: false,
          });
          toast.error(error.message || 'Failed to fetch merchant performance analytics');
        }
      },

      fetchPlatformTimeBasedAnalytics: async (params?: TimeRangeParams) => {
        set({ loading: true, error: null });
        try {
          const response = await getPlatformTimeBasedAnalytics(params || { range: '30d' });
          if (response.success && response.data) {
            set({ timeBasedAnalytics: response.data, loading: false });
          } else {
            set({
              error: response.message || 'Failed to fetch time-based analytics',
              loading: false,
            });
            toast.error(response.message || 'Failed to fetch time-based analytics');
          }
        } catch (error: any) {
          set({
            error: error.message || 'Failed to fetch time-based analytics',
            loading: false,
          });
          toast.error(error.message || 'Failed to fetch time-based analytics');
        }
      },

      fetchPlatformGrowthMetrics: async (params?: TimeRangeParams) => {
        set({ loading: true, error: null });
        try {
          const response = await getPlatformGrowthMetrics(params || { range: '90d' });
          if (response.success && response.data) {
            set({ growthMetrics: response.data, loading: false });
          } else {
            set({
              error: response.message || 'Failed to fetch growth metrics',
              loading: false,
            });
            toast.error(response.message || 'Failed to fetch growth metrics');
          }
        } catch (error: any) {
          set({
            error: error.message || 'Failed to fetch growth metrics',
            loading: false,
          });
          toast.error(error.message || 'Failed to fetch growth metrics');
        }
      },

      fetchPlatformCategoryAnalytics: async (params?: TimeRangeParams) => {
        set({ loading: true, error: null });
        try {
          const response = await getPlatformCategoryAnalytics(params || { range: '30d' });
          if (response.success && response.data) {
            set({ categoryAnalytics: response.data, loading: false });
          } else {
            set({
              error: response.message || 'Failed to fetch category analytics',
              loading: false,
            });
            toast.error(response.message || 'Failed to fetch category analytics');
          }
        } catch (error: any) {
          set({
            error: error.message || 'Failed to fetch category analytics',
            loading: false,
          });
          toast.error(error.message || 'Failed to fetch category analytics');
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'offernepal-admin-analytics',
    }
  )
);
