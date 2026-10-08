import { create } from 'zustand';
import { toast } from 'sonner';
import {
  getMerchantDashboard,
  getMerchantAnalytics,
  DashboardStats,
  AnalyticsData,
  TimeRangeParams,
} from '@/lib/api/merchant/analytics-api';

interface AnalyticsState {
  dashboard: DashboardStats | null;
  analytics: AnalyticsData | null;
  loading: boolean;
  error: string | null;

  fetchDashboard: (merchantId: string) => Promise<void>;
  fetchAnalytics: (merchantId: string, params?: TimeRangeParams) => Promise<void>;
  clearError: () => void;
}

export const useMerchantAnalyticsStore = create<AnalyticsState>()((set) => ({
  dashboard: null,
  analytics: null,
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

  clearError: () => {
    set({ error: null });
  },
}));
