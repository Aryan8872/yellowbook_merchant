import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LoginDto, User } from '@/lib/api/types';
import { UserRole } from './permissions';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  merchantId: string | null;
  isInitialized: boolean;
  login: (credentials: LoginDto) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  setUser: (user: User | null) => void;
  getRoleBasedRedirect: () => string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      merchantId: null,
      isLoading: false,
      isInitialized: false,

      setUser: (user) => set({ user, merchantId: user?.merchantId }),

      fetchCurrentUser: async () => {
        set({ isLoading: true });
        try {
          const res = await fetch('/api/auth/me');
          if (res.ok) {
            const json = await res.json();
            if (json?.data) {
              set({ user: json.data, merchantId: json.data.merchantId ?? null, isInitialized: true, isLoading: false });
              return;
            }
          }
          set({ user: null, isInitialized: true, isLoading: false });
        } catch {
          set({ user: null, isInitialized: true, isLoading: false });
        }
      },

      login: async (credentials: LoginDto) => {
        set({ isLoading: true });
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
          });
        

          const data = await res.json();
          if (!res.ok || !data.success) {
            set({ isLoading: false });
            return {
              success: false,
              message: data?.message || 'Login failed. Please check your credentials.',
            };
          }

          if (data.data?.user) {
            set({ user: data.data.user, merchantId: data.data.user?.merchantId ?? null, isInitialized: true, isLoading: false });
          } else {
            await get().fetchCurrentUser();
          }

          return { success: true };
        } catch (error: any) {
          set({ isLoading: false });
          return {
            success: false,
            message: error?.message || 'An unexpected error occurred during login.',
          };
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await fetch('/api/auth/logout', { method: 'POST' });
        } finally {
          set({ user: null, merchantId:null, isLoading: false });
          if (typeof window !== 'undefined') {
            window.location.href = '/merchant/auth/login';
          }
        }
      },

      getRoleBasedRedirect: () => {
        const user = get().user;
        if (!user) return '/merchant/auth/login';
        
        const role = user.role as UserRole;
        switch (role) {
          case UserRole.ADMIN:
            return '/admin/dashboard';
          case UserRole.MERCHANT_ADMIN:
          case UserRole.MERCHANT_STAFF:
            return '/merchant/dashboard';
          case UserRole.USER:
          default:
            return '/';
        }
      },
    }),
    {
      name: 'offernepal-merchant-auth',
      partialize: (state) => ({ user: state.user, merchantId: state.merchantId }),
    }
  )
);
