/**
 * TanStack Query hooks for Users API
 * Handles server state for users with caching, invalidation, and mutations
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  activateUser,
  deactivateUser,
  User,
  CreateUserDto,
  UpdateUserDto,
  UsersQueryParams,
  UsersResponse,
} from '@/lib/api/admin/users-api';

// Query keys
export const usersKeys = {
  all: ['admin', 'users'] as const,
  lists: () => [...usersKeys.all, 'list'] as const,
  list: (params: UsersQueryParams) => [...usersKeys.lists(), params] as const,
  details: () => [...usersKeys.all, 'detail'] as const,
  detail: (id: string) => [...usersKeys.details(), id] as const,
};

/**
 * Fetch paginated users list
 */
export function useUsers(
  params?: UsersQueryParams,
  options?: Omit<UseQueryOptions<UsersResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: usersKeys.list(params || {}),
    queryFn: async () => {
      const response: any = await getUsers(params);
      if (!response) {
        throw new Error('Failed to fetch users');
      }
      if (Array.isArray(response.data)) {
        return {
          data: response.data,
          pagination: response.pagination || { page: 1, limit: 10, total: response.data.length, totalPages: 1, hasNext: false, hasPrevious: false },
        };
      }
      if (response.data && Array.isArray(response.data.data)) {
        return response.data;
      }
      if (Array.isArray(response)) {
        return {
          data: response,
          pagination: { page: 1, limit: 10, total: response.length, totalPages: 1, hasNext: false, hasPrevious: false },
        };
      }
      return {
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0, hasNext: false, hasPrevious: false },
      };
    },
    ...options,
  });
}

/**
 * Fetch single user by ID
 */
export function useUser(
  id: string,
  options?: Omit<UseQueryOptions<User>, 'queryKey' | 'queryFn' | 'enabled'>
) {
  return useQuery({
    queryKey: usersKeys.detail(id),
    queryFn: async () => {
      const response = await getUser(id);
      if (!response.data) {
        throw new Error('Failed to fetch user');
      }
      return response.data;
    },
    enabled: Boolean(id),
    ...options,
  });
}

/**
 * Create user mutation
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserDto) => createUser(data),
    onSuccess: (response) => {
      // Invalidate users list to refetch
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      toast.success('User created successfully');
      return response;
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to create user';
      // Handle validation error arrays
      const displayMessage = Array.isArray(message) ? message.join(', ') : message;
      toast.error(displayMessage);
    },
  });
}

/**
 * Update user mutation
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) =>
      updateUser(id, data),
    onSuccess: (_, variables) => {
      // Invalidate users list and detail
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: usersKeys.detail(variables.id) });
      toast.success('User updated successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to update user';
      // Handle validation error arrays
      const displayMessage = Array.isArray(message) ? message.join(', ') : message;
      toast.error(displayMessage);
    },
  });
}

/**
 * Delete user mutation
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      toast.success('User deleted successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to delete user';
      // Handle validation error arrays
      const displayMessage = Array.isArray(message) ? message.join(', ') : message;
      toast.error(displayMessage);
    },
  });
}

/**
 * Activate user mutation
 */
export function useActivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, notes }: { userId: string; notes?: string }) =>
      activateUser(userId, notes),
    onSuccess: (_, variables) => {
      // Invalidate users list and detail
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: usersKeys.detail(variables.userId) });
      toast.success('User activated successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to activate user';
      // Handle validation error arrays
      const displayMessage = Array.isArray(message) ? message.join(', ') : message;
      toast.error(displayMessage);
    },
  });
}

/**
 * Deactivate user mutation
 */
export function useDeactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason?: string }) =>
      deactivateUser(userId, reason),
    onSuccess: (_, variables) => {
      // Invalidate users list and detail
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: usersKeys.detail(variables.userId) });
      toast.success('User deactivated successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to deactivate user';
      // Handle validation error arrays
      const displayMessage = Array.isArray(message) ? message.join(', ') : message;
      toast.error(displayMessage);
    },
  });
}
