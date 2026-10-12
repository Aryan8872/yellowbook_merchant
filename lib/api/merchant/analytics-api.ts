import { apiClient } from '../client';
import type { ApiResponse } from '../types';

export interface DashboardStats {
  totalOffers: number;
  activeOffers: number;
  totalRedemptions: number;
  totalBranches: number;
  totalStaff: number;
}

export interface AnalyticsData {
  totalRedemptions: number;
  dailyRedemptions: Array<{
    date: string;
    count: number;
  }>;
  topOffers: Array<{
    title: string;
    count: number;
  }>;
}

// Revenue Analytics
export interface RevenueAnalytics {
  totalRevenue: number;
  revenueByOffer: Array<{
    offerId: string;
    offerTitle: string;
    revenue: number;
    redemptionCount: number;
  }>;
  revenueByBranch: Array<{
    branchId: string;
    branchName: string;
    revenue: number;
    redemptionCount: number;
  }>;
  averageOrderValue: number;
  revenueGrowth: {
    mom: number; // Month over month percentage
    yoy: number; // Year over year percentage
  };
  revenueTrend: Array<{
    date: string;
    revenue: number;
  }>;
}

// Customer Analytics
export interface CustomerAnalytics {
  newCustomers: number;
  returningCustomers: number;
  retentionRate: number;
  topCustomers: Array<{
    userId: string;
    userName: string;
    userEmail: string;
    redemptionCount: number;
    totalSpent: number;
  }>;
  customerAcquisitionTrend: Array<{
    date: string;
    newCustomers: number;
  }>;
  geographicDistribution: Array<{
    city: string;
    customerCount: number;
  }>;
}

// Offer Performance Analytics
export interface OfferPerformanceAnalytics {
  conversionRate: number; // views to redemptions
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

// Branch Performance Analytics
export interface BranchPerformanceAnalytics {
  branchComparison: Array<{
    branchId: string;
    branchName: string;
    totalRedemptions: number;
    totalRevenue: number;
    activeOffers: number;
  }>;
  mostActiveBranch: {
    branchId: string;
    branchName: string;
    redemptionCount: number;
  };
  leastActiveBranch: {
    branchId: string;
    branchName: string;
    redemptionCount: number;
  };
  branchTrends: Array<{
    branchId: string;
    branchName: string;
    date: string;
    redemptionCount: number;
  }>;
  staffEfficiency: Array<{
    branchId: string;
    branchName: string;
    staffId: string;
    staffName: string;
    redemptionsHandled: number;
    averageTimeToProcess: number;
  }>;
}

// Time-Based Analytics
export interface TimeBasedAnalytics {
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

// Growth Metrics
export interface GrowthMetrics {
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
    achievedDate?: string;
    targetDate?: string;
  }>;
}

// Category Analytics
export interface CategoryAnalytics {
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
    customerCount: number;
  }>;
}

export interface TimeRangeParams {
  range?: '7d' | '30d' | '90d' | 'custom';
  startDate?: string;
  endDate?: string;
}

export async function getMerchantDashboard(
  merchantId: string
): Promise<ApiResponse<DashboardStats>> {
  return apiClient.get<DashboardStats>(
    `/api/v1/merchants/${merchantId}/dashboard`
  );
}

export async function getMerchantAnalytics(
  merchantId: string,
  params?: TimeRangeParams
): Promise<ApiResponse<AnalyticsData>> {
  return apiClient.get<AnalyticsData>(
    `/api/v1/merchants/${merchantId}/analytics`,
    { params: params as Record<string, string | undefined> }
  );
}

export async function getRevenueAnalytics(
  merchantId: string,
  params?: TimeRangeParams
): Promise<ApiResponse<RevenueAnalytics>> {
  return apiClient.get<RevenueAnalytics>(
    `/api/v1/merchants/${merchantId}/analytics/revenue`,
    { params: params as Record<string, string | undefined> }
  );
}

export async function getCustomerAnalytics(
  merchantId: string,
  params?: TimeRangeParams
): Promise<ApiResponse<CustomerAnalytics>> {
  return apiClient.get<CustomerAnalytics>(
    `/api/v1/merchants/${merchantId}/analytics/customers`,
    { params: params as Record<string, string | undefined> }
  );
}

export async function getOfferPerformanceAnalytics(
  merchantId: string,
  params?: TimeRangeParams
): Promise<ApiResponse<OfferPerformanceAnalytics>> {
  return apiClient.get<OfferPerformanceAnalytics>(
    `/api/v1/merchants/${merchantId}/analytics/offers`,
    { params: params as Record<string, string | undefined> }
  );
}

export async function getBranchPerformanceAnalytics(
  merchantId: string,
  params?: TimeRangeParams
): Promise<ApiResponse<BranchPerformanceAnalytics>> {
  return apiClient.get<BranchPerformanceAnalytics>(
    `/api/v1/merchants/${merchantId}/analytics/branches`,
    { params: params as Record<string, string | undefined> }
  );
}

export async function getTimeBasedAnalytics(
  merchantId: string,
  params?: TimeRangeParams
): Promise<ApiResponse<TimeBasedAnalytics>> {
  return apiClient.get<TimeBasedAnalytics>(
    `/api/v1/merchants/${merchantId}/analytics/time`,
    { params: params as Record<string, string | undefined> }
  );
}

export async function getGrowthMetrics(
  merchantId: string,
  params?: TimeRangeParams
): Promise<ApiResponse<GrowthMetrics>> {
  return apiClient.get<GrowthMetrics>(
    `/api/v1/merchants/${merchantId}/analytics/growth`,
    { params: params as Record<string, string | undefined> }
  );
}

export async function getCategoryAnalytics(
  merchantId: string,
  params?: TimeRangeParams
): Promise<ApiResponse<CategoryAnalytics>> {
  return apiClient.get<CategoryAnalytics>(
    `/api/v1/merchants/${merchantId}/analytics/categories`,
    { params: params as Record<string, string | undefined> }
  );
}
