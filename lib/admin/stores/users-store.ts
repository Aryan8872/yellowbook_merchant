import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import { getUsers, getUser, updateUser, deleteUser, deactivateUser, activateUser, User, UsersQueryParams, UpdateUserDto } from '@/lib/api/admin/users-api';

interface UsersState {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  filters: UsersQueryParams;
  
  fetchUsers: (params?: UsersQueryParams) => Promise<void>;
  fetchUser: (id: string) => Promise<User | null>;
  updateUser: (id: string, data: UpdateUserDto) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  deactivateUser: (userId: string, reason?: string) => Promise<void>;
  activateUser: (userId: string, notes?: string) => Promise<void>;
  setFilters: (filters: UsersQueryParams) => void;
  clearError: () => void;
}

export const useUsersStore = create<UsersState>()(
  persist(
    (set, get) => ({
      users: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
      loading: false,
      error: null,
      filters: {},

      fetchUsers: async (params?: UsersQueryParams) => {
        set({ loading: true, error: null });
        try {
          const response = await getUsers({ ...get().filters, ...params });
          if (response.success && response.data) {
            set({
              users: response.data.data,
              total: response.data.pagination.total,
              page: response.data.pagination.page,
              limit: response.data.pagination.limit,
              totalPages: response.data.pagination.totalPages,
              loading: false,
            });
            toast.success('Users loaded successfully');
          } else {
            set({
              error: response.message || 'Failed to fetch users',
              loading: false,
            });
            toast.error(response.message || 'Failed to fetch users');
          }
        } catch (error: any) {
          set({
            error: error.message || 'Failed to fetch users',
            loading: false,
          });
          toast.error(error.message || 'Failed to fetch users');
        }
      },

      fetchUser: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const response = await getUser(id);
          if (response.success && response.data) {
            set({ loading: false });
            toast.success('User loaded successfully');
            return response.data;
          } else {
            set({
              error: response.message || 'Failed to fetch user',
              loading: false,
            });
            toast.error(response.message || 'Failed to fetch user');
            return null;
          }
        } catch (error: any) {
          set({
            error: error.message || 'Failed to fetch user',
            loading: false,
          });
          toast.error(error.message || 'Failed to fetch user');
          return null;
        }
      },

      updateUser: async (id: string, data: UpdateUserDto) => {
        set({ loading: true, error: null });
        try {
          const response = await updateUser(id, data);
          if (response.success && response.data) {
            set((state) => ({
              users: state.users.map((u) => (u.id === id ? response.data! : u)),
              loading: false,
            }));
            toast.success('User updated successfully');
          } else {
            set({
              error: response.message || 'Failed to update user',
              loading: false,
            });
            toast.error(response.message || 'Failed to update user');
          }
        } catch (error: any) {
          set({
            error: error.message || 'Failed to update user',
            loading: false,
          });
          toast.error(error.message || 'Failed to update user');
        }
      },

      deleteUser: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const response = await deleteUser(id);
          if (response.success) {
            set((state) => ({
              users: state.users.filter((u) => u.id !== id),
              total: state.total - 1,
              loading: false,
            }));
            toast.success('User deleted successfully');
          } else {
            set({
              error: response.message || 'Failed to delete user',
              loading: false,
            });
            toast.error(response.message || 'Failed to delete user');
          }
        } catch (error: any) {
          set({
            error: error.message || 'Failed to delete user',
            loading: false,
          });
          toast.error(error.message || 'Failed to delete user');
        }
      },

      deactivateUser: async (userId: string, reason?: string) => {
        set({ loading: true, error: null });
        try {
          const response = await deactivateUser(userId, reason);
          if (response.success && response.data) {
            set((state) => ({
              users: state.users.map((u) => (u.id === userId ? response.data! : u)),
              loading: false,
            }));
            toast.success('User deactivated successfully');
          } else {
            set({
              error: response.message || 'Failed to deactivate user',
              loading: false,
            });
            toast.error(response.message || 'Failed to deactivate user');
          }
        } catch (error: any) {
          set({
            error: error.message || 'Failed to deactivate user',
            loading: false,
          });
          toast.error(error.message || 'Failed to deactivate user');
        }
      },

      activateUser: async (userId: string, notes?: string) => {
        set({ loading: true, error: null });
        try {
          const response = await activateUser(userId, notes);
          if (response.success && response.data) {
            set((state) => ({
              users: state.users.map((u) => (u.id === userId ? response.data! : u)),
              loading: false,
            }));
            toast.success('User activated successfully');
          } else {
            set({
              error: response.message || 'Failed to activate user',
              loading: false,
            });
            toast.error(response.message || 'Failed to activate user');
          }
        } catch (error: any) {
          set({
            error: error.message || 'Failed to activate user',
            loading: false,
          });
          toast.error(error.message || 'Failed to activate user');
        }
      },

      setFilters: (filters: UsersQueryParams) => {
        set({ filters });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'offernepal-admin-users',
      partialize: (state) => ({ filters: state.filters }),
    }
  )
);
