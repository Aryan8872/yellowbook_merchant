import { apiClient } from './client';
import { ApiResponse } from './types';

export interface UploadResponse {
  url: string;
  publicId: string;
  filename: string;
  mimetype: string;
  size: number;
  provider: 'local' | 'cloudinary';
}

/**
 * Uploads a file to the OfferNepal media storage API.
 * Transparently supports both local disk and Cloudinary based on backend config.
 */
export async function uploadMediaFile(
  file: File,
  folder: string = 'general'
): Promise<ApiResponse<UploadResponse>> {
  const formData = new FormData();
  formData.append('file', file);

  return apiClient.post<UploadResponse>(
    `/api/v1/uploads?folder=${encodeURIComponent(folder)}`,
    formData
  );
}
