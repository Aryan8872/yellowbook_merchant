import { apiClient } from './client';
import type { ApiResponse } from './types';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconUrl: string;
  imageUrl: string;
  color: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export async function getCategories(): Promise<ApiResponse<Category[]>> {
  return apiClient.get<Category[]>('/api/v1/categories');
}
