import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MerchantsQueryParams } from '@/lib/api/admin/merchants-api';

/**
 * Merchants UI State Store
 * 
 * This store manages client-side UI state for the merchants page only.
 * Server state (API data, caching, mutations) is handled by TanStack Query.
 * 
 * Responsibilities:
 * - UI filters and search preferences
 * - View preferences (list/grid, column visibility)
 * - Cross-page drafts (if needed)
 */
interface MerchantsUIState {
  // UI Filters (persisted across sessions)
  filters: MerchantsQueryParams;
  
  // View Preferences
  viewMode: 'list' | 'grid';
  selectedView: string;
  
  // Actions
  setFilters: (filters: MerchantsQueryParams) => void;
  setViewMode: (mode: 'list' | 'grid') => void;
  setSelectedView: (view: string) => void;
  resetFilters: () => void;
}

export const useMerchantsUIStore = create<MerchantsUIState>()(
  persist(
    (set) => ({
      filters: {},
      viewMode: 'list',
      selectedView: 'all',

      setFilters: (filters) => set({ filters }),
      
      setViewMode: (mode) => set({ viewMode: mode }),
      
      setSelectedView: (view) => set({ selectedView: view }),
      
      resetFilters: () => set({ filters: {} }),
    }),
    {
      name: 'offernepal-admin-merchants-ui',
      partialize: (state) => ({ 
        filters: state.filters,
        viewMode: state.viewMode,
        selectedView: state.selectedView,
      }),
    }
  )
);
