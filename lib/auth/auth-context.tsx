// Backwards-compatible export wrapping Zustand store
export { useAuthStore } from './auth-store';

import { useAuthStore } from './auth-store';

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const refreshProfile = useAuthStore((state) => state.fetchCurrentUser);
  const merchantId = useAuthStore((state)=>state.merchantId);

  return {
    user,
    isLoading,
    merchantId,
    login,
    logout,
    refreshProfile,
  };
}
