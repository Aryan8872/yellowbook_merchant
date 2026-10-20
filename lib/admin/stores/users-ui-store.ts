import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UsersQueryParams } from '@/lib/api/admin/users-api';

/**
 * Users UI State Store
 * 
 * This store manages client-side UI state for the users page only.
 * Server state (API data, caching, mutations) is handled by TanStack Query.
 * 
 * Responsibilities:
 * - UI filters and search preferences
 * - View preferences (list/grid, column visibility)
 * - Cross-page drafts (if needed)
 */
interface UsersUIState {
  // UI Filters (persisted across sessions)
  filters: UsersQueryParams;
  
  // View Preferences
  viewMode: 'list' | 'grid';
  selectedView: string;
  
  // Actions
  setFilters: (filters: UsersQueryParams) => void;
  setViewMode: (mode: 'list' | 'grid') => void;
  setSelectedView: (view: string) => void;
  resetFilters: () => void;
}

export const useUsersUIStore = create<UsersUIState>()(
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
      name: 'offernepal-admin-users-ui',
      partialize: (state) => ({ 
        filters: state.filters,
        viewMode: state.viewMode,
        selectedView: state.selectedView,
      }),
    }
  )
);
