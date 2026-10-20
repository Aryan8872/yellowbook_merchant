import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Branch UI State Store
 * 
 * This store manages client-side UI state for the branches page only.
 * Server state (API data, caching, mutations) is handled by TanStack Query.
 * 
 * Responsibilities:
 * - UI filters and search preferences
 * - View preferences (list/grid, column visibility)
 * - Cross-page drafts (if needed)
 */
interface BranchUIState {
  // UI Filters (persisted across sessions)
  searchQuery: string;
  statusFilter: string;
  
  // View Preferences
  viewMode: 'list' | 'grid';
  selectedView: string;
  
  // Actions
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: string) => void;
  setViewMode: (mode: 'list' | 'grid') => void;
  setSelectedView: (view: string) => void;
  resetFilters: () => void;
}

export const useBranchUIStore = create<BranchUIState>()(
  persist(
    (set) => ({
      searchQuery: '',
      statusFilter: '',
      viewMode: 'list',
      selectedView: 'all',

      setSearchQuery: (query) => set({ searchQuery: query }),
      
      setStatusFilter: (status) => set({ statusFilter: status }),
      
      setViewMode: (mode) => set({ viewMode: mode }),
      
      setSelectedView: (view) => set({ selectedView: view }),
      
      resetFilters: () => set({ searchQuery: '', statusFilter: '' }),
    }),
    {
      name: 'offernepal-merchant-branch-ui',
      partialize: (state) => ({ 
        searchQuery: state.searchQuery,
        statusFilter: state.statusFilter,
        viewMode: state.viewMode,
        selectedView: state.selectedView,
      }),
    }
  )
);
