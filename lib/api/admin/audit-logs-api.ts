import { apiClient } from '../client';
import type { ApiResponse } from '../types';

export interface AuditLogItem {
  id: string;
  entity: string;
  entityId: string;
  action: string;
  actorId?: string | null;
  merchantId?: string | null;
  metadata?: any;
  createdAt: string;
  actor?: {
    id: string;
    name: string | null;
    email: string;
    role: string;
  } | null;
  merchant?: {
    id: string;
    name: string;
  } | null;
}

export interface AuditLogsQueryParams {
  page?: number;
  limit?: number;
  entity?: string;
  action?: string;
  search?: string;
}

export interface AuditLogsResponse {
  data: AuditLogItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export async function getAuditLogs(
  params?: AuditLogsQueryParams
): Promise<ApiResponse<AuditLogsResponse>> {
  return apiClient.get<AuditLogsResponse>('/admin/audit-logs', {
    params: params as Record<string, string | number | boolean | undefined>,
  });
}
