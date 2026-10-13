import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, getUser, createUser, updateUser, deleteUser, activateUser, deactivateUser, type UsersQueryParams } from '@/lib/api/admin/users-api';
import { toast } from 'sonner';

// Query keys
export const usersKeys = {
  all: ['users'] as const,
  lists: () => [...usersKeys.all, 'list'] as const,
  list: (params: UsersQueryParams) => [...usersKeys.lists(), params] as const,
  details: () => [...usersKeys.all, 'detail'] as const,
  detail: (id: string) => [...usersKeys.details(), id] as const,
};

// Fetch users list
export function useUsers(params?: UsersQueryParams) {
  return useQuery({
    queryKey: usersKeys.list(params || {}),
    queryFn: () => getUsers(params),
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Fetch single user
export function useUser(id: string) {
  return useQuery({
    queryKey: usersKeys.detail(id),
    queryFn: () => getUser(id),
    enabled: !!id,
    staleTime: 60 * 1000, // 1 minute
  });
}

// Create user mutation
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      // Invalidate users list to refetch
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      // Invalidate any user detail queries
      queryClient.invalidateQueries({ queryKey: usersKeys.details() });
      toast.success('User created successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Failed to create user';
      toast.error(message);
    },
  });
}

// Update user mutation
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateUser(id, data),
    onSuccess: (_, variables) => {
      // Invalidate both the list and the specific user
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: usersKeys.details() });
      queryClient.invalidateQueries({ queryKey: usersKeys.detail(variables.id) });
      toast.success('User updated successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Failed to update user';
      toast.error(message);
    },
  });
}

// Delete user mutation
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: usersKeys.details() });
      toast.success('User deleted successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Failed to delete user';
      toast.error(message);
    },
  });
}

// Activate user mutation
export function useActivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, notes }: { userId: string; notes?: string }) => activateUser(userId, notes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: usersKeys.details() });
      queryClient.invalidateQueries({ queryKey: usersKeys.detail(variables.userId) });
      toast.success('User activated successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Failed to activate user';
      toast.error(message);
    },
  });
}

// Deactivate user mutation
export function useDeactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason?: string }) => deactivateUser(userId, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: usersKeys.details() });
      queryClient.invalidateQueries({ queryKey: usersKeys.detail(variables.userId) });
      toast.success('User deactivated successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Failed to deactivate user';
      toast.error(message);
    },
  });
}
