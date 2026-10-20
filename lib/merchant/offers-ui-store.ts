import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Offers UI State Store
 * 
 * This store manages client-side UI state for the offers page only.
 * Server state (API data, caching, mutations) is handled by TanStack Query.
 * 
 * Responsibilities:
 * - UI filters and search preferences
 * - View preferences (list/grid, column visibility)
 * - Cross-page drafts (if needed)
 */
interface OffersUIState {
  // UI Filters (persisted across sessions)
  searchQuery: string;
  statusFilter: string;
  categoryFilter: string;
  
  // View Preferences
  viewMode: 'list' | 'grid';
  selectedView: string;
  
  // Actions
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: string) => void;
  setCategoryFilter: (category: string) => void;
  setViewMode: (mode: 'list' | 'grid') => void;
  setSelectedView: (view: string) => void;
  resetFilters: () => void;
}

export const useOffersUIStore = create<OffersUIState>()(
  persist(
    (set) => ({
      searchQuery: '',
      statusFilter: '',
      categoryFilter: '',
      viewMode: 'list',
      selectedView: 'all',

      setSearchQuery: (query) => set({ searchQuery: query }),
      
      setStatusFilter: (status) => set({ statusFilter: status }),
      
      setCategoryFilter: (category) => set({ categoryFilter: category }),
      
      setViewMode: (mode) => set({ viewMode: mode }),
      
      setSelectedView: (view) => set({ selectedView: view }),
      
      resetFilters: () => set({ searchQuery: '', statusFilter: '', categoryFilter: '' }),
    }),
    {
      name: 'offernepal-merchant-offers-ui',
      partialize: (state) => ({ 
        searchQuery: state.searchQuery,
        statusFilter: state.statusFilter,
        categoryFilter: state.categoryFilter,
        viewMode: state.viewMode,
        selectedView: state.selectedView,
      }),
    }
  )
);
