import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import { getAdminDashboard, AdminDashboardStats } from '@/lib/api/admin/analytics-api';

interface AnalyticsState {
  dashboardStats: AdminDashboardStats | null;
  loading: boolean;
  error: string | null;
  
  fetchAdminDashboard: () => Promise<void>;
  clearError: () => void;
}

export const useAnalyticsStore = create<AnalyticsState>()(
  persist(
    (set) => ({
      dashboardStats: null,
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

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'offernepal-admin-analytics',
    }
  )
);
