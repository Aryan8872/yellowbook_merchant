import { apiClient } from '../client';
import type { ApiResponse } from '../types';

export interface Offer {
  id: string;
  merchantId: string;
  title: string;
  description: string;
  terms: string;
  categoryId: string;
  estimatedSavingsNpr: number;
  originalPriceNpr?: number;
  discountPercentage?: number;
  coverImage?: string;
  images?: string[];
  highlights?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
  operatingHours?: {
    days: string[];
    hours: { start: string; end: string };
  };
  validFrom?: string;
  validUntil?: string;
  branchIds?: string[];
  redemptionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOfferDto {
  title: string;
  description: string;
  terms: string;
  categoryId: string;
  estimatedSavingsNpr: number;
  originalPriceNpr?: number;
  discountPercentage?: number;
  coverImage?: string;
  images?: string[];
  highlights?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
  operatingHours?: {
    days: string[];
    hours: { start: string; end: string };
  };
  validFrom?: string;
  validUntil?: string;
  branchIds?: string[];
}

export interface UpdateOfferDto {
  title?: string;
  description?: string;
  terms?: string;
  categoryId?: string;
  estimatedSavingsNpr?: number;
  originalPriceNpr?: number;
  discountPercentage?: number;
  coverImage?: string;
  images?: string[];
  highlights?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
  operatingHours?: {
    days: string[];
    hours: { start: string; end: string };
  };
  validFrom?: string;
  validUntil?: string;
  branchIds?: string[];
}

export interface OffersQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  isActive?: boolean;
  isFeatured?: boolean;
}

export interface OffersResponse {
  data: Offer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getOffers(
  merchantId: string,
  params?: OffersQueryParams
): Promise<ApiResponse<OffersResponse>> {
  return apiClient.get<OffersResponse>(`/api/v1/merchants/${merchantId}/offers`, {
    params: params as Record<string, string | number | boolean | undefined>,
  });
}

export async function getOffer(
  merchantId: string,
  offerId: string
): Promise<ApiResponse<Offer>> {
  return apiClient.get<Offer>(`/api/v1/merchants/${merchantId}/offers/${offerId}`);
}

export async function createOffer(
  merchantId: string,
  data: CreateOfferDto
): Promise<ApiResponse<Offer>> {
  console.log('createOffer called with:', merchantId, data)
  try {
    const result = await apiClient.post<Offer>(`/api/v1/merchants/${merchantId}/offers`, data);
    console.log('createOffer apiClient.post result:', result)
    console.log('createOffer about to return result, result.success:', result?.success)
    const returnValue = result;
    console.log('createOffer returnValue:', returnValue)
    return returnValue;
  } catch (error) {
    console.error('createOffer caught error:', error)
    throw error;
  }
}

export async function updateOffer(
  merchantId: string,
  offerId: string,
  data: UpdateOfferDto
): Promise<ApiResponse<Offer>> {
  return apiClient.patch<Offer>(
    `/api/v1/merchants/${merchantId}/offers/${offerId}`,
    data
  );
}

export async function deleteOffer(
  merchantId: string,
  offerId: string
): Promise<ApiResponse<void>> {
  return apiClient.delete<void>(
    `/api/v1/merchants/${merchantId}/offers/${offerId}`
  );
}

export async function toggleOfferStatus(
  merchantId: string,
  offerId: string,
  isActive: boolean
): Promise<ApiResponse<Offer>> {
  return apiClient.patch<Offer>(
    `/api/v1/merchants/${merchantId}/offers/${offerId}`,
    { isActive }
  );
}

export async function toggleOfferFeatured(
  merchantId: string,
  offerId: string,
  isFeatured: boolean
): Promise<ApiResponse<Offer>> {
  return apiClient.patch<Offer>(
    `/api/v1/merchants/${merchantId}/offers/${offerId}`,
    { isFeatured }
  );
}

export async function uploadOfferCoverImage(
  merchantId: string,
  offerId: string,
  file: File
): Promise<ApiResponse<{ url: string; publicId: string }>> {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.post<{ url: string; publicId: string }>(
    `/api/v1/merchants/${merchantId}/offers/${offerId}/upload-cover`,
    formData
  );
}

export async function uploadOfferGalleryImage(
  merchantId: string,
  offerId: string,
  file: File
): Promise<ApiResponse<{ url: string; publicId: string; images: string[] }>> {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.post<{ url: string; publicId: string; images: string[] }>(
    `/api/v1/merchants/${merchantId}/offers/${offerId}/upload-images`,
    formData
  );
}
