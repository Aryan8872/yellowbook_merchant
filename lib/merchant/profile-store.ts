import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api/client';
import { MerchantProfile } from './types';
import { mockMerchantProfile } from '@/lib/api/mocks/merchant.mock';
import { useAuthStore } from '@/lib/auth';

// Mock data is a development-only stand-in while the backend profile
// endpoint is incomplete. Never show it in production.
const MOCK_FALLBACK_ENABLED = process.env.NODE_ENV !== 'production';

const fallbackProfile = () =>
  MOCK_FALLBACK_ENABLED ? mockMerchantProfile : null;

interface ProfileState {
  profile: MerchantProfile | null;
  isLoading: boolean;
  isSaving: boolean;

  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<MerchantProfile>) => Promise<{ success: boolean; message?: string }>;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profile: null,
      isLoading: false,
      isSaving: false,

      fetchProfile: async () => {
        set({ isLoading: true });
        try {
          const { merchantId } = useAuthStore.getState();
          console.log('[Profile Store] Fetching profile for merchant:', merchantId);
          if (!merchantId) {
            set({ profile: fallbackProfile(), isLoading: false });
            return;
          }

          const response = await apiClient.get<MerchantProfile>(`/api/v1/merchants/${merchantId}`);
          console.log('[Profile Store] Raw API response:', response);
          
          if (response.success && response.data) {
            console.log('[Profile Store] Profile data loaded:', response.data);
            set({ profile: response.data, isLoading: false });
            toast.success('Profile loaded successfully');
          } else {
            console.error('[Profile Store] Failed to load profile:', response.message);
            set({ profile: fallbackProfile(), isLoading: false });
            toast.error(response.message || 'Failed to load profile');
          }
        } catch (error: any) {
          console.error('[Profile Store] Error loading profile:', error);
          set({ profile: fallbackProfile(), isLoading: false });
          toast.error(error.message || 'Failed to load profile');
        }
      },

      updateProfile: async (data) => {
        set({ isSaving: true });
        try {
          const { merchantId } = useAuthStore.getState();
          console.log('[Profile Store] Updating profile:', data);
          if (!merchantId) {
            set({ isSaving: false });
            return { success: false, message: 'No merchant ID found' };
          }

          const res = await apiClient.put<MerchantProfile>(`/api/v1/merchants/${merchantId}`, data);
          console.log('[Profile Store] Update profile response:', res);
          
          if (res.success && res.data) {
            set({ profile: res.data, isSaving: false });
            toast.success('Profile updated successfully');
            return { success: true, message: 'Profile updated successfully' };
          } else {
            console.error('[Profile Store] Failed to update profile:', res.message);
            set({ isSaving: false });
            toast.error(res.message || 'Failed to update profile');
            return { success: false, message: res.message || 'Failed to update profile' };
          }
        } catch (error: any) {
          console.error('[Profile Store] Error updating profile:', error);
          set({ isSaving: false });
          toast.error(error.message || 'Failed to update profile');
          return { success: false, message: error?.message || 'Failed to update profile' };
        }
      },
    }),
    {
      name: 'offernepal-merchant-profile',
    }
  )
);
