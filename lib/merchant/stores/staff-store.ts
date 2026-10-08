import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import {
  getStaff,
  createStaff,
  updateStaff,
  Staff,
  CreateStaffDto,
  UpdateStaffDto,
} from '@/lib/api/merchant/staff-api';
import { useAuthStore } from '@/lib/auth';

interface StaffState {
  staff: Staff[];
  loading: boolean;
  error: string | null;
  merchantId: string | null;

  fetchStaff: () => Promise<void>;
  createStaff: (data: CreateStaffDto) => Promise<void>;
  updateStaff: (staffId: string, data: UpdateStaffDto) => Promise<void>;
  clearError: () => void;
}

export const useMerchantStaffStore = create<StaffState>()(
  persist(
    (set, get) => ({
      staff: [],
      loading: false,
      error: null,
      merchantId: null,

      fetchStaff: async () => {
        set({ loading: true, error: null });
        try {
          const authStore = useAuthStore.getState();
          const merchantId = authStore.merchantId;
          set({ merchantId });
          
          if (!merchantId) {
            set({ error: 'No merchant ID found', loading: false });
            return;
          }

          console.log('[Staff Store] Fetching staff for merchant:', merchantId);
          const response = await getStaff(merchantId);
          console.log('[Staff Store] Raw API response:', response);
          
          if (response.success && response.data) {
            console.log('[Staff Store] Staff data loaded:', response.data);
            set({
              staff: Array.isArray(response.data) ? response.data : [],
              loading: false,
            });
            toast.success('Staff loaded successfully');
          } else {
            console.error('[Staff Store] Failed to fetch staff:', response.message);
            set({
              error: response.message || 'Failed to fetch staff',
              loading: false,
            });
            toast.error(response.message || 'Failed to fetch staff');
          }
        } catch (error: any) {
          console.error('[Staff Store] Error fetching staff:', error);
          set({
            error: error?.message || 'Network error',
            loading: false,
          });
          toast.error(error?.message || 'Network error');
        }
      },

      createStaff: async (data: CreateStaffDto) => {
        set({ loading: true, error: null });
        try {
          const { merchantId } = useAuthStore.getState();
          if (!merchantId) {
            set({ loading: false });
            toast.error('No merchant ID found');
            return;
          }

          console.log('[Staff Store] Creating staff:', data);
          const response = await createStaff(merchantId, data);
          console.log('[Staff Store] Create staff response:', response);
          
          if (response.success && response.data) {
            set((state) => ({
              staff: [...state.staff, response.data!],
              loading: false,
            }));
            toast.success('Staff created successfully');
          } else {
            console.error('[Staff Store] Failed to create staff:', response.message);
            set({
              error: response.message || 'Failed to create staff',
              loading: false,
            });
            toast.error(response.message || 'Failed to create staff');
          }
        } catch (error: any) {
          console.error('[Staff Store] Error creating staff:', error);
          set({
            error: error.message || 'Failed to create staff',
            loading: false,
          });
          toast.error(error.message || 'Failed to create staff');
        }
      },

      updateStaff: async (staffId: string, data: UpdateStaffDto) => {
        set({ loading: true, error: null });
        try {
          console.log('[Staff Store] Updating staff:', staffId, data);
          const merchantId = get().merchantId || '';
          const response = await updateStaff(merchantId, staffId, data);
          console.log('[Staff Store] Update staff response:', response);
          
          if (response.success && response.data) {
            set((state) => ({
              staff: state.staff.map((s) => (s.id === staffId ? response.data! : s)),
              loading: false,
            }));
            toast.success('Staff updated successfully');
          } else {
            console.error('[Staff Store] Failed to update staff:', response.message);
            set({
              error: response.message || 'Failed to update staff',
              loading: false,
            });
            toast.error(response.message || 'Failed to update staff');
          }
        } catch (error: any) {
          console.error('[Staff Store] Error updating staff:', error);
          set({
            error: error?.message || 'Failed to update staff',
            loading: false,
          });
          toast.error(error?.message || 'Failed to update staff');
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'offernepal-merchant-staff',
    }
  )
);
