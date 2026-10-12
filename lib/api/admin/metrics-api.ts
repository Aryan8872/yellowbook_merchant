import { apiClient } from '../client';
import type { ApiResponse } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface SystemLiveness {
  status: 'UP' | 'DOWN';
  uptime: number;
  timestamp: string;
}

export interface SystemReadiness {
  status: 'UP' | 'PARTIAL_OUTAGE' | 'DOWN';
  checks: {
    redis: 'UP' | 'DOWN' | 'DEGRADED' | 'UNKNOWN';
    api: 'UP' | 'DOWN';
  };
  timestamp: string;
}

export interface AdminMetricsSummary {
  adminId: string;
  systemHealth: string;
  activeSubscribers: number;
}

/**
 * Get API liveness — public endpoint, no auth required.
 * Hits the backend directly (not via Next.js API proxy).
 */
export async function getSystemLiveness(): Promise<SystemLiveness> {
  try {
    const isBrowser = typeof window !== 'undefined';
    const url = isBrowser ? '/api/v1/health/liveness' : `${API_BASE_URL}/api/v1/health/liveness`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      return { status: 'DOWN', uptime: 0, timestamp: new Date().toISOString() };
    }
    const data = await res.json();
    return data?.data || data;
  } catch (err) {
    console.warn('[Metrics] Liveness check error:', err);
    return { status: 'DOWN', uptime: 0, timestamp: new Date().toISOString() };
  }
}

/**
 * Get API readiness (checks Redis etc.) — public endpoint, no auth required.
 */
export async function getSystemReadiness(): Promise<SystemReadiness> {
  try {
    const isBrowser = typeof window !== 'undefined';
    const url = isBrowser ? '/api/v1/health/readiness' : `${API_BASE_URL}/api/v1/health/readiness`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      return {
        status: 'DOWN',
        checks: { redis: 'UNKNOWN', api: 'DOWN' },
        timestamp: new Date().toISOString(),
      };
    }
    const data = await res.json();
    return data?.data || data;
  } catch (err) {
    console.warn('[Metrics] Readiness check error:', err);
    return {
      status: 'DOWN',
      checks: { redis: 'UNKNOWN', api: 'DOWN' },
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Get admin metrics summary — requires ADMIN JWT.
 */
export async function getAdminMetricsSummary(): Promise<ApiResponse<AdminMetricsSummary>> {
  return apiClient.get<AdminMetricsSummary>('/auth/admin/metrics-summary');
}

/** Format uptime seconds to human-readable string */
export function formatUptime(seconds: number): string {
  if (seconds < 60) return `${Math.floor(seconds)}s`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ${Math.floor(seconds % 60)}s`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ${mins % 60}m`;
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h`;
}
