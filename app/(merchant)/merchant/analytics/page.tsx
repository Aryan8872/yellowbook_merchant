'use client';

import { useEffect, useState } from 'react';
import { useMerchantAnalyticsStore } from '@/lib/merchant/stores/analytics-store';
import { useAuthStore } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, DollarSign, Users, Target, Building2, Clock, BarChart3, Tag } from 'lucide-react';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6'];

export default function Analytics() {
  const { merchantId } = useAuthStore();
  const {
    analytics,
    revenueAnalytics,
    customerAnalytics,
    offerPerformanceAnalytics,
    branchPerformanceAnalytics,
    timeBasedAnalytics,
    growthMetrics,
    categoryAnalytics,
    loading,
    fetchAnalytics,
    fetchRevenueAnalytics,
    fetchCustomerAnalytics,
    fetchOfferPerformanceAnalytics,
    fetchBranchPerformanceAnalytics,
    fetchTimeBasedAnalytics,
    fetchGrowthMetrics,
    fetchCategoryAnalytics,
  } = useMerchantAnalyticsStore();

  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (merchantId) {
      fetchAnalytics(merchantId, { range: timeRange });
      fetchRevenueAnalytics(merchantId, { range: timeRange });
      fetchCustomerAnalytics(merchantId, { range: timeRange });
      fetchOfferPerformanceAnalytics(merchantId, { range: timeRange });
      fetchBranchPerformanceAnalytics(merchantId, { range: timeRange });
      fetchTimeBasedAnalytics(merchantId, { range: timeRange });
      fetchGrowthMetrics(merchantId, { range: timeRange === '90d' ? '90d' : '30d' });
      fetchCategoryAnalytics(merchantId, { range: timeRange });
    }
  }, [merchantId, timeRange, fetchAnalytics, fetchRevenueAnalytics, fetchCustomerAnalytics, fetchOfferPerformanceAnalytics, fetchBranchPerformanceAnalytics, fetchTimeBasedAnalytics, fetchGrowthMetrics, fetchCategoryAnalytics]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            View your offer performance and redemption trends
          </p>
        </div>
        <Select value={timeRange} onValueChange={(value) => value && setTimeRange(value as '7d' | '30d' | '90d')}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="offers">Offers</TabsTrigger>
          <TabsTrigger value="branches">Branches</TabsTrigger>
          <TabsTrigger value="time">Time</TabsTrigger>
          <TabsTrigger value="growth">Growth</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2">
              {[1, 2].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="h-6 bg-muted animate-pulse rounded w-32" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 bg-muted animate-pulse rounded-lg" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Daily Redemption Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics?.dailyRedemptions && analytics.dailyRedemptions.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analytics.dailyRedemptions}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#6366f1" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      No data available
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Offers</CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics?.topOffers && analytics.topOffers.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={analytics.topOffers}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry: any) => `${entry.title}: ${((entry.count / analytics.totalRedemptions) * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {analytics.topOffers.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      No data available
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Redemptions</p>
                      <p className="text-2xl font-bold">{analytics?.totalRedemptions || 0}</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Unique Offers</p>
                      <p className="text-2xl font-bold">{analytics?.topOffers?.length || 0}</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Avg Daily Redemptions</p>
                      <p className="text-2xl font-bold">
                        {analytics?.dailyRedemptions?.length
                          ? Math.round(analytics.totalRedemptions / analytics.dailyRedemptions.length)
                          : 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-green-600">
                  Rs. {revenueAnalytics?.totalRevenue?.toLocaleString() || 0}
                </p>
                <div className="mt-4 flex gap-4">
                  <div className="text-sm">
                    <span className="text-muted-foreground">MoM: </span>
                    <span className={(revenueAnalytics?.revenueGrowth?.mom ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {revenueAnalytics?.revenueGrowth?.mom || 0}%
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">YoY: </span>
                    <span className={(revenueAnalytics?.revenueGrowth?.yoy ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {revenueAnalytics?.revenueGrowth?.yoy || 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Average Order Value</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">
                  Rs. {revenueAnalytics?.averageOrderValue?.toLocaleString() || 0}
                </p>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                {revenueAnalytics?.revenueTrend && revenueAnalytics.revenueTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueAnalytics.revenueTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Revenue by Offer</CardTitle>
              </CardHeader>
              <CardContent>
                {revenueAnalytics?.revenueByOffer && revenueAnalytics.revenueByOffer.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenueAnalytics.revenueByOffer}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="offerTitle" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="revenue" fill="#22c55e" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Revenue by Branch</CardTitle>
              </CardHeader>
              <CardContent>
                {revenueAnalytics?.revenueByBranch && revenueAnalytics.revenueByBranch.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenueAnalytics.revenueByBranch}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="branchName" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="revenue" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  New Customers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{customerAnalytics?.newCustomers || 0}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Returning Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{customerAnalytics?.returningCustomers || 0}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Retention Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{customerAnalytics?.retentionRate?.toFixed(1) || 0}%</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Customers</CardTitle>
            </CardHeader>
            <CardContent>
              {customerAnalytics?.topCustomers && customerAnalytics.topCustomers.length > 0 ? (
                <div className="space-y-4">
                  {customerAnalytics.topCustomers.map((customer, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">{customer.userName}</p>
                        <p className="text-sm text-muted-foreground">{customer.userEmail}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">Rs. {customer.totalSpent.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">{customer.redemptionCount} redemptions</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Offers Tab */}
        <TabsContent value="offers" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-500" />
                  Conversion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{offerPerformanceAnalytics?.conversionRate?.toFixed(1) || 0}%</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Average Discount Value</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">Rs. {offerPerformanceAnalytics?.averageDiscountValue?.toLocaleString() || 0}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{offerPerformanceAnalytics?.engagementRate?.toFixed(1) || 0}%</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Categories</CardTitle>
            </CardHeader>
            <CardContent>
              {offerPerformanceAnalytics?.topCategories && offerPerformanceAnalytics.topCategories.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={offerPerformanceAnalytics.topCategories}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="categoryName" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="redemptionCount" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branches Tab */}
        <TabsContent value="branches" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-amber-500" />
                Branch Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              {branchPerformanceAnalytics?.branchComparison && branchPerformanceAnalytics.branchComparison.length > 0 ? (
                <div className="space-y-4">
                  {branchPerformanceAnalytics.branchComparison.map((branch, index) => (
                    <div key={index} className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">{branch.branchName}</p>
                        <Badge variant={branch.averageRating >= 4 ? 'default' : 'secondary'}>
                          Rating: {branch.averageRating.toFixed(1)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Redemptions</p>
                          <p className="font-bold">{branch.totalRedemptions}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Revenue</p>
                          <p className="font-bold">Rs. {branch.totalRevenue.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Active Offers</p>
                          <p className="font-bold">{branch.activeOffers}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Time Tab */}
        <TabsContent value="time" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-cyan-500" />
                Peak Redemption Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              {timeBasedAnalytics?.hourlyRedemptions && timeBasedAnalytics.hourlyRedemptions.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={timeBasedAnalytics.hourlyRedemptions}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="redemptionCount" fill="#06b6d4" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Day of Week Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {timeBasedAnalytics?.dayOfWeekPerformance && timeBasedAnalytics.dayOfWeekPerformance.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={timeBasedAnalytics.dayOfWeekPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="redemptionCount" fill="#0891b2" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Growth Tab */}
        <TabsContent value="growth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Month-over-Month Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              {growthMetrics?.momGrowth && growthMetrics.momGrowth.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={growthMetrics.momGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="growthRate" stroke="#22c55e" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Projections</CardTitle>
            </CardHeader>
            <CardContent>
              {growthMetrics?.projections && growthMetrics.projections.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={growthMetrics.projections}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="projectedRedemptions" stroke="#6366f1" strokeWidth={2} strokeDasharray="5 5" />
                    <Line type="monotone" dataKey="projectedRevenue" stroke="#22c55e" strokeWidth={2} strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-pink-500" />
                Category Performance Ranking
              </CardTitle>
            </CardHeader>
            <CardContent>
              {categoryAnalytics?.categoryRanking && categoryAnalytics.categoryRanking.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryAnalytics.categoryRanking}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="categoryName" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="redemptionCount" fill="#ec4899" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Category Trends</CardTitle>
            </CardHeader>
            <CardContent>
              {categoryAnalytics?.categoryTrends && categoryAnalytics.categoryTrends.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={categoryAnalytics.categoryTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="redemptionCount" stroke="#ec4899" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}