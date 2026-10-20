/**
 * TanStack Query hook for categories reference data
 * Cached with long staleTime to avoid duplicate refetches
 */

import { useQuery } from '@tanstack/react-query';
import { getCategories, Category } from '@/lib/api/categories-api';

export const categoriesKeys = {
  all: ['categories'] as const,
};

export function useCategories() {
  return useQuery<Category[], Error>({
    queryKey: categoriesKeys.all,
    queryFn: async () => {
      const response = await getCategories();
      if (!response.success || !response.data) {
        return [];
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 60, // 1 hour cache
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
}
