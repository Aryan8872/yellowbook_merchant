import { create } from 'zustand';
import { toast } from 'sonner';
import {
  getMerchantDashboard,
  getMerchantAnalytics,
  getRevenueAnalytics,
  getCustomerAnalytics,
  getOfferPerformanceAnalytics,
  getBranchPerformanceAnalytics,
  getTimeBasedAnalytics,
  getGrowthMetrics,
  getCategoryAnalytics,
  DashboardStats,
  AnalyticsData,
  RevenueAnalytics,
  CustomerAnalytics,
  OfferPerformanceAnalytics,
  BranchPerformanceAnalytics,
  TimeBasedAnalytics,
  GrowthMetrics,
  CategoryAnalytics,
  TimeRangeParams,
} from '@/lib/api/merchant/analytics-api';

interface AnalyticsState {
  dashboard: DashboardStats | null;
  analytics: AnalyticsData | null;
  revenueAnalytics: RevenueAnalytics | null;
  customerAnalytics: CustomerAnalytics | null;
  offerPerformanceAnalytics: OfferPerformanceAnalytics | null;
  branchPerformanceAnalytics: BranchPerformanceAnalytics | null;
  timeBasedAnalytics: TimeBasedAnalytics | null;
  growthMetrics: GrowthMetrics | null;
  categoryAnalytics: CategoryAnalytics | null;
  loading: boolean;
  error: string | null;

  fetchDashboard: (merchantId: string) => Promise<void>;
  fetchAnalytics: (merchantId: string, params?: TimeRangeParams) => Promise<void>;
  fetchRevenueAnalytics: (merchantId: string, params?: TimeRangeParams) => Promise<void>;
  fetchCustomerAnalytics: (merchantId: string, params?: TimeRangeParams) => Promise<void>;
  fetchOfferPerformanceAnalytics: (merchantId: string, params?: TimeRangeParams) => Promise<void>;
  fetchBranchPerformanceAnalytics: (merchantId: string, params?: TimeRangeParams) => Promise<void>;
  fetchTimeBasedAnalytics: (merchantId: string, params?: TimeRangeParams) => Promise<void>;
  fetchGrowthMetrics: (merchantId: string, params?: TimeRangeParams) => Promise<void>;
  fetchCategoryAnalytics: (merchantId: string, params?: TimeRangeParams) => Promise<void>;
  clearError: () => void;
}

export const useMerchantAnalyticsStore = create<AnalyticsState>()((set) => ({
  dashboard: null,
  analytics: null,
  revenueAnalytics: null,
  customerAnalytics: null,
  offerPerformanceAnalytics: null,
  branchPerformanceAnalytics: null,
  timeBasedAnalytics: null,
  growthMetrics: null,
  categoryAnalytics: null,
  loading: false,
  error: null,

  fetchDashboard: async (merchantId: string) => {
    set({ loading: true, error: null });
    try {
      console.log('[Analytics Store] Fetching dashboard for merchant:', merchantId);
      const response = await getMerchantDashboard(merchantId);
      console.log('[Analytics Store] Raw dashboard API response:', response);

      if (response.success && response.data) {
        console.log('[Analytics Store] Dashboard data loaded:', response.data);
        set({ dashboard: response.data, loading: false });
        toast.success('Dashboard loaded successfully');
      } else {
        console.error('[Analytics Store] Failed to fetch dashboard:', response.message);
        set({
          error: response.message || 'Failed to fetch dashboard',
          loading: false,
        });
        toast.error(response.message || 'Failed to fetch dashboard');
      }
    } catch (error: any) {
      console.error('[Analytics Store] Error fetching dashboard:', error);
      set({
        error: error.message || 'Failed to fetch dashboard',
        loading: false,
      });
      toast.error(error.message || 'Failed to fetch dashboard');
    }
  },

  fetchAnalytics: async (merchantId: string, params?: TimeRangeParams) => {
    set({ loading: true, error: null });
    try {
      console.log('[Analytics Store] Fetching analytics for merchant:', merchantId, 'with range:', params?.range);
      const response = await getMerchantAnalytics(merchantId, params || { range: '7d' });
      console.log('[Analytics Store] Raw analytics API response:', response);

      if (response.success && response.data) {
        console.log('[Analytics Store] Analytics data loaded:', response.data);
        set({ analytics: response.data, loading: false });
        toast.success('Analytics loaded successfully');
      } else {
        console.error('[Analytics Store] Failed to fetch analytics:', response.message);
        set({
          error: response.message || 'Failed to fetch analytics',
          loading: false,
        });
        toast.error(response.message || 'Failed to fetch analytics');
      }
    } catch (error: any) {
      console.error('[Analytics Store] Error fetching analytics:', error);
      set({
        error: error.message || 'Failed to fetch analytics',
        loading: false,
      });
      toast.error(error.message || 'Failed to fetch analytics');
    }
  },

  fetchRevenueAnalytics: async (merchantId: string, params?: TimeRangeParams) => {
    set({ loading: true, error: null });
    try {
      const response = await getRevenueAnalytics(merchantId, params || { range: '30d' });
      if (response.success && response.data) {
        set({ revenueAnalytics: response.data, loading: false });
      } else {
        set({ error: response.message || 'Failed to fetch revenue analytics', loading: false });
        toast.error(response.message || 'Failed to fetch revenue analytics');
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch revenue analytics', loading: false });
      toast.error(error.message || 'Failed to fetch revenue analytics');
    }
  },

  fetchCustomerAnalytics: async (merchantId: string, params?: TimeRangeParams) => {
    set({ loading: true, error: null });
    try {
      const response = await getCustomerAnalytics(merchantId, params || { range: '30d' });
      if (response.success && response.data) {
        set({ customerAnalytics: response.data, loading: false });
      } else {
        set({ error: response.message || 'Failed to fetch customer analytics', loading: false });
        toast.error(response.message || 'Failed to fetch customer analytics');
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch customer analytics', loading: false });
      toast.error(error.message || 'Failed to fetch customer analytics');
    }
  },

  fetchOfferPerformanceAnalytics: async (merchantId: string, params?: TimeRangeParams) => {
    set({ loading: true, error: null });
    try {
      const response = await getOfferPerformanceAnalytics(merchantId, params || { range: '30d' });
      if (response.success && response.data) {
        set({ offerPerformanceAnalytics: response.data, loading: false });
      } else {
        set({ error: response.message || 'Failed to fetch offer performance analytics', loading: false });
        toast.error(response.message || 'Failed to fetch offer performance analytics');
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch offer performance analytics', loading: false });
      toast.error(error.message || 'Failed to fetch offer performance analytics');
    }
  },

  fetchBranchPerformanceAnalytics: async (merchantId: string, params?: TimeRangeParams) => {
    set({ loading: true, error: null });
    try {
      const response = await getBranchPerformanceAnalytics(merchantId, params || { range: '30d' });
      if (response.success && response.data) {
        set({ branchPerformanceAnalytics: response.data, loading: false });
      } else {
        set({ error: response.message || 'Failed to fetch branch performance analytics', loading: false });
        toast.error(response.message || 'Failed to fetch branch performance analytics');
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch branch performance analytics', loading: false });
      toast.error(error.message || 'Failed to fetch branch performance analytics');
    }
  },

  fetchTimeBasedAnalytics: async (merchantId: string, params?: TimeRangeParams) => {
    set({ loading: true, error: null });
    try {
      const response = await getTimeBasedAnalytics(merchantId, params || { range: '30d' });
      if (response.success && response.data) {
        set({ timeBasedAnalytics: response.data, loading: false });
      } else {
        set({ error: response.message || 'Failed to fetch time-based analytics', loading: false });
        toast.error(response.message || 'Failed to fetch time-based analytics');
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch time-based analytics', loading: false });
      toast.error(error.message || 'Failed to fetch time-based analytics');
    }
  },

  fetchGrowthMetrics: async (merchantId: string, params?: TimeRangeParams) => {
    set({ loading: true, error: null });
    try {
      const response = await getGrowthMetrics(merchantId, params || { range: '90d' });
      if (response.success && response.data) {
        set({ growthMetrics: response.data, loading: false });
      } else {
        set({ error: response.message || 'Failed to fetch growth metrics', loading: false });
        toast.error(response.message || 'Failed to fetch growth metrics');
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch growth metrics', loading: false });
      toast.error(error.message || 'Failed to fetch growth metrics');
    }
  },

  fetchCategoryAnalytics: async (merchantId: string, params?: TimeRangeParams) => {
    set({ loading: true, error: null });
    try {
      const response = await getCategoryAnalytics(merchantId, params || { range: '30d' });
      if (response.success && response.data) {
        set({ categoryAnalytics: response.data, loading: false });
      } else {
        set({ error: response.message || 'Failed to fetch category analytics', loading: false });
        toast.error(response.message || 'Failed to fetch category analytics');
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch category analytics', loading: false });
      toast.error(error.message || 'Failed to fetch category analytics');
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
