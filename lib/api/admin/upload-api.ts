import { apiClient } from '../client';

export interface UploadResult {
  url: string;
  publicId: string;
  filename: string;
  mimetype: string;
  size: number;
  provider: 'local' | 'cloudinary';
}

export type UploadFolder = 'merchants' | 'avatars' | 'offers' | 'general';

/**
 * Upload a single file to the backend storage (local or Cloudinary).
 * The endpoint is authenticated — the JWT token is automatically attached by apiClient.
 *
 * @param file     - The browser File object selected by the user
 * @param folder   - Storage sub-folder to group assets (merchants, avatars, offers, etc.)
 * @returns        UploadResult with `url` ready to be saved to the DB
 */
export async function uploadFile(
  file: File,
  folder: UploadFolder = 'general',
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);

  // apiClient.post already handles FormData without setting Content-Type header
  const response = await apiClient.post<UploadResult>(
    `/uploads?folder=${folder}`,
    formData,
  );

  // The upload endpoint returns the result directly (not wrapped in { success, data })
  const result = (response as any)?.url
    ? (response as unknown as UploadResult)
    : (response as any)?.data;

  if (!result?.url) {
    throw new Error('Upload failed: no URL returned from server');
  }

  return result;
}
