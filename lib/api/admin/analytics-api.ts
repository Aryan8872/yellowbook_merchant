import { apiClient } from '../client';
import type { ApiResponse } from '../types';

export interface AdminDashboardStats {
  totalMerchants: number;
  pendingMerchants: number;
  totalUsers: number;
  activeOffers: number;
}

export interface TimeRangeParams {
  range?: '7d' | '30d' | '90d' | 'custom';
  startDate?: string;
  endDate?: string;
}

// Platform-wide Revenue Analytics
export interface PlatformRevenueAnalytics {
  totalRevenue: number;
  revenueByMerchant: Array<{
    merchantId: string;
    merchantName: string;
    revenue: number;
    redemptionCount: number;
  }>;
  revenueByCategory: Array<{
    categoryId: string;
    categoryName: string;
    revenue: number;
    redemptionCount: number;
  }>;
  averageOrderValue: number;
  revenueGrowth: {
    mom: number;
    yoy: number;
  };
  revenueTrend: Array<{
    date: string;
    revenue: number;
  }>;
}

// Platform-wide Customer Analytics
export interface PlatformCustomerAnalytics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  returningUsers: number;
  userRetentionRate: number;
  topUsers: Array<{
    userId: string;
    userName: string;
    userEmail: string;
    redemptionCount: number;
    totalSpent: number;
  }>;
  userAcquisitionTrend: Array<{
    date: string;
    newUsers: number;
  }>;
  geographicDistribution: Array<{
    city: string;
    userCount: number;
  }>;
}

// Platform-wide Offer Performance
export interface PlatformOfferPerformanceAnalytics {
  totalOffers: number;
  activeOffers: number;
  conversionRate: number;
  averageDiscountValue: number;
  engagementRate: number;
  topCategories: Array<{
    categoryId: string;
    categoryName: string;
    redemptionCount: number;
    revenue: number;
  }>;
  expirationImpact: Array<{
    expiredOffers: number;
    nearExpiringOffers: number;
    expiredRedemptions: number;
  }>;
}

// Platform-wide Merchant Performance
export interface PlatformMerchantPerformanceAnalytics {
  totalMerchants: number;
  activeMerchants: number;
  pendingMerchants: number;
  merchantComparison: Array<{
    merchantId: string;
    merchantName: string;
    totalRedemptions: number;
    totalRevenue: number;
    activeOffers: number;
  }>;
  mostActiveMerchant: {
    merchantId: string;
    merchantName: string;
    redemptionCount: number;
  } | null;
  leastActiveMerchant: {
    merchantId: string;
    merchantName: string;
    redemptionCount: number;
  } | null;
  merchantTrends: Array<{
    merchantId: string;
    merchantName: string;
    date: string;
    redemptionCount: number;
  }>;
}

// Platform-wide Time-Based Analytics
export interface PlatformTimeBasedAnalytics {
  hourlyRedemptions: Array<{
    hour: number;
    redemptionCount: number;
  }>;
  dayOfWeekPerformance: Array<{
    day: string;
    redemptionCount: number;
    revenue: number;
  }>;
  seasonalTrends: Array<{
    month: string;
    redemptionCount: number;
    revenue: number;
  }>;
}

// Platform-wide Growth Metrics
export interface PlatformGrowthMetrics {
  momGrowth: Array<{
    date: string;
    redemptions: number;
    revenue: number;
    growthRate: number;
  }>;
  yoyComparison: Array<{
    year: number;
    redemptions: number;
    revenue: number;
    growthRate: number;
  }>;
  projections: Array<{
    date: string;
    projectedRedemptions: number;
    projectedRevenue: number;
  }>;
  milestones: Array<{
    milestone: string;
    achieved: boolean;
  }>;
}

// Platform-wide Category Analytics
export interface PlatformCategoryAnalytics {
  categoryRanking: Array<{
    categoryId: string;
    categoryName: string;
    redemptionCount: number;
    revenue: number;
    averageOrderValue: number;
  }>;
  categoryTrends: Array<{
    categoryId: string;
    categoryName: string;
    date: string;
    redemptionCount: number;
  }>;
  crossCategoryBehavior: Array<{
    fromCategory: string;
    toCategory: string;
    userCount: number;
  }>;
}

/**
 * Get admin dashboard stats
 */
export async function getAdminDashboard(): Promise<ApiResponse<AdminDashboardStats>> {
  return apiClient.get<AdminDashboardStats>('/admin/dashboard');
}

/**
 * Get platform-wide revenue analytics
 */
export async function getPlatformRevenueAnalytics(
  params?: TimeRangeParams
): Promise<ApiResponse<PlatformRevenueAnalytics>> {
  return apiClient.get<PlatformRevenueAnalytics>(
    '/analytics/platform/revenue',
    { params: params as Record<string, string | undefined> }
  );
}

/**
 * Get platform-wide customer analytics
 */
export async function getPlatformCustomerAnalytics(
  params?: TimeRangeParams
): Promise<ApiResponse<PlatformCustomerAnalytics>> {
  return apiClient.get<PlatformCustomerAnalytics>(
    '/analytics/platform/customers',
    { params: params as Record<string, string | undefined> }
  );
}

/**
 * Get platform-wide offer performance analytics
 */
export async function getPlatformOfferPerformanceAnalytics(
  params?: TimeRangeParams
): Promise<ApiResponse<PlatformOfferPerformanceAnalytics>> {
  return apiClient.get<PlatformOfferPerformanceAnalytics>(
    '/analytics/platform/offers',
    { params: params as Record<string, string | undefined> }
  );
}

/**
 * Get platform-wide merchant performance analytics
 */
export async function getPlatformMerchantPerformanceAnalytics(
  params?: TimeRangeParams
): Promise<ApiResponse<PlatformMerchantPerformanceAnalytics>> {
  return apiClient.get<PlatformMerchantPerformanceAnalytics>(
    '/analytics/platform/merchants',
    { params: params as Record<string, string | undefined> }
  );
}

/**
 * Get platform-wide time-based analytics
 */
export async function getPlatformTimeBasedAnalytics(
  params?: TimeRangeParams
): Promise<ApiResponse<PlatformTimeBasedAnalytics>> {
  return apiClient.get<PlatformTimeBasedAnalytics>(
    '/analytics/platform/time',
    { params: params as Record<string, string | undefined> }
  );
}

/**
 * Get platform-wide growth metrics
 */
export async function getPlatformGrowthMetrics(
  params?: TimeRangeParams
): Promise<ApiResponse<PlatformGrowthMetrics>> {
  return apiClient.get<PlatformGrowthMetrics>(
    '/analytics/platform/growth',
    { params: params as Record<string, string | undefined> }
  );
}

/**
 * Get platform-wide category analytics
 */
export async function getPlatformCategoryAnalytics(
  params?: TimeRangeParams
): Promise<ApiResponse<PlatformCategoryAnalytics>> {
  return apiClient.get<PlatformCategoryAnalytics>(
    '/analytics/platform/categories',
    { params: params as Record<string, string | undefined> }
  );
}
