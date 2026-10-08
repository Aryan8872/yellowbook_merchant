import { apiClient } from './client'
import { ApiResponse } from './types'
import { Branch, CreateBranchDto, UpdateBranchDto } from '@/lib/types/branch'

export interface BranchListParams {
  page?: number
  limit?: number
  search?: string
  [key: string]: string | number | boolean | undefined
}

export interface BranchListResponse {
  data: Branch[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrevious: boolean
  }
}

export async function getBranches(
  merchantId: string,
  params?: BranchListParams
): Promise<ApiResponse<BranchListResponse>> {
  return apiClient.get<BranchListResponse>(
    `/api/v1/merchants/${merchantId}/branches`,
    { params }
  )
}

export async function createBranch(
  merchantId: string,
  data: CreateBranchDto
): Promise<ApiResponse<Branch>> {
  return apiClient.post<Branch>(
    `/api/v1/merchants/${merchantId}/branches`,
    data
  )
}

export async function updateBranch(
  merchantId: string,
  branchId: string,
  data: UpdateBranchDto
): Promise<ApiResponse<Branch>> {
  return apiClient.put<Branch>(
    `/api/v1/merchants/${merchantId}/branches/${branchId}`,
    data
  )
}

export async function deleteBranch(
  merchantId: string,
  branchId: string
): Promise<ApiResponse<void>> {
  return apiClient.delete<void>(`/api/v1/merchants/${merchantId}/branches/${branchId}`)
}
