import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { toast } from 'sonner'
import { Branch, CreateBranchDto, UpdateBranchDto } from '@/lib/types/branch'
import { getBranches, createBranch as apiCreateBranch, updateBranch as apiUpdateBranch, deleteBranch as apiDeleteBranch } from '@/lib/api/branches'

export interface ApiResult<T = unknown> {
  success: boolean
  message?: string
  data?: T
}

interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

interface BranchStoreState {
  branches: Branch[]
  isLoading: boolean
  error: string | null
  pagination: PaginationMeta | null
  listBranches: (merchantId: string, params?: { page?: number; limit?: number; search?: string }) => Promise<void>
  createBranch: (merchantId: string, dto: CreateBranchDto) => Promise<ApiResult<Branch>>
  updateBranch: (merchantId: string, branchId: string, dto: UpdateBranchDto) => Promise<ApiResult<Branch>>
  deleteBranch: (merchantId: string, branchId: string) => Promise<ApiResult<void>>
  toggleBranchActive: (merchantId: string, branchId: string, isActive: boolean) => Promise<ApiResult<Branch>>
  clearError: () => void
}

export const useBranchStore = create<BranchStoreState>()(
  persist(
    (set, get) => ({
      branches: [],
      isLoading: false,
      error: null,
      pagination: null,

      listBranches: async (merchantId, params) => {
        set({ isLoading: true, error: null })
        try {
          console.log('[Branch Store] Fetching branches for merchant:', merchantId, 'with params:', params)
          const response = await getBranches(merchantId, params)
          console.log('[Branch Store] Raw API response:', response)
          if (response.success && response.data) {
            console.log('[Branch Store] Branches data loaded:', response.data)
            // API returns data directly as array, not wrapped in data property
            set({
              branches: Array.isArray(response.data) ? response.data : response.data.data || [],
              pagination: response.data.pagination || null,
            })
            toast.success('Branches loaded successfully')
          } else {
            console.error('[Branch Store] Failed to fetch branches:', response.message)
            set({ error: response.message || 'Failed to fetch branches' })
            toast.error(response.message || 'Failed to fetch branches')
          }
        } catch (error: any) {
          console.error('[Branch Store] Error fetching branches:', error)
          set({ error: error?.message || 'Network error' })
          toast.error(error?.message || 'Network error')
        } finally {
          set({ isLoading: false })
        }
      },

      createBranch: async (merchantId, dto) => {
        set({ isLoading: true, error: null })
        try {
          const response = await apiCreateBranch(merchantId, dto)
          if (response.success && response.data) {
            set((state) => ({ branches: [...state.branches, response.data!] }))
            toast.success('Branch created successfully')
            return { success: true, data: response.data }
          }
          toast.error(response.message || 'Failed to create branch')
          return { success: false, message: response.message || 'Failed to create branch' }
        } catch (error: any) {
          toast.error(error?.message || 'Failed to create branch')
          return { success: false, message: error?.message || 'Failed to create branch' }
        } finally {
          set({ isLoading: false })
        }
      },

      updateBranch: async (merchantId: string, branchId: string, dto: UpdateBranchDto) => {
        set({ isLoading: true, error: null })
        try {
          const response = await apiUpdateBranch(merchantId, branchId, dto)
          if (response.success && response.data) {
            set((state) => ({
              branches: state.branches.map((b) => (b.id === branchId ? { ...b, ...response.data } : b)),
            }))
            toast.success('Branch updated successfully')
            return { success: true, data: response.data }
          }
          toast.error(response.message || 'Failed to update branch')
          return { success: false, message: response.message || 'Failed to update branch' }
        } catch (error: any) {
          toast.error(error?.message || 'Failed to update branch')
          return { success: false, message: error?.message || 'Failed to update branch' }
        } finally {
          set({ isLoading: false })
        }
      },

      deleteBranch: async (merchantId: string, branchId: string) => {
        const previous = get().branches
        set((state) => ({ branches: state.branches.filter((b) => b.id !== branchId) }))
        try {
          const response = await apiDeleteBranch(merchantId, branchId)
          if (response.success) {
            toast.success('Branch deleted successfully')
            return { success: true }
          }
          set({ branches: previous })
          toast.error(response.message || 'Failed to delete branch')
          return { success: false, message: response.message || 'Failed to delete branch' }
        } catch (error: any) {
          set({ branches: previous })
          toast.error(error?.message || 'Failed to delete branch')
          return { success: false, message: error?.message || 'Failed to delete branch' }
        }
      },

      toggleBranchActive: async (merchantId: string, branchId: string, isActive: boolean) => {
        const previous = get().branches
        set((state) => ({
          branches: state.branches.map((b) => (b.id === branchId ? { ...b, isActive } : b)),
        }))
        try {
          const response = await apiUpdateBranch(merchantId, branchId, { isActive })
          if (response.success && response.data) {
            toast.success('Branch status updated successfully')
            return { success: true, data: response.data }
          }
          set({ branches: previous })
          toast.error(response.message || 'Failed to update status')
          return { success: false, message: response.message || 'Failed to update status' }
        } catch (error: any) {
          set({ branches: previous })
          toast.error(error?.message || 'Failed to update status')
          return { success: false, message: error?.message || 'Failed to update status' }
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'branch-storage',
      partialize: (state) => ({ branches: state.branches }),
    }
  )
)
