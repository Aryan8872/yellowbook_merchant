'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  DollarSign,
  Users,
  Target,
  Building2,
  Clock,
  BarChart3,
  Tag,
} from 'lucide-react';
import { useAnalyticsStore } from '@/lib/admin/stores/analytics-store';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6'];

export default function AdminAnalyticsPage() {
  const {
    revenueAnalytics,
    customerAnalytics,
    offerPerformanceAnalytics,
    merchantPerformanceAnalytics,
    timeBasedAnalytics,
    growthMetrics,
    categoryAnalytics,
    loading,
    fetchPlatformRevenueAnalytics,
    fetchPlatformCustomerAnalytics,
    fetchPlatformOfferPerformanceAnalytics,
    fetchPlatformMerchantPerformanceAnalytics,
    fetchPlatformTimeBasedAnalytics,
    fetchPlatformGrowthMetrics,
    fetchPlatformCategoryAnalytics,
  } = useAnalyticsStore();

  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchPlatformRevenueAnalytics({ range: timeRange });
    fetchPlatformCustomerAnalytics({ range: timeRange });
    fetchPlatformOfferPerformanceAnalytics({ range: timeRange });
    fetchPlatformMerchantPerformanceAnalytics({ range: timeRange });
    fetchPlatformTimeBasedAnalytics({ range: timeRange });
    fetchPlatformGrowthMetrics({ range: timeRange === '90d' ? '90d' : '30d' });
    fetchPlatformCategoryAnalytics({ range: timeRange });
  }, [
    timeRange,
    fetchPlatformRevenueAnalytics,
    fetchPlatformCustomerAnalytics,
    fetchPlatformOfferPerformanceAnalytics,
    fetchPlatformMerchantPerformanceAnalytics,
    fetchPlatformTimeBasedAnalytics,
    fetchPlatformGrowthMetrics,
    fetchPlatformCategoryAnalytics,
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platform Analytics</h1>
          <p className="text-muted-foreground">
            Platform-wide performance metrics and insights
          </p>
        </div>
        <Select
          value={timeRange}
          onValueChange={(value) => {
            if (value) setTimeRange(value as '7d' | '30d' | '90d');
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading analytics...</div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="offers">Offers</TabsTrigger>
          <TabsTrigger value="merchants">Merchants</TabsTrigger>
          <TabsTrigger value="time">Time</TabsTrigger>
          <TabsTrigger value="growth">Growth</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {revenueAnalytics?.totalRevenue ? `Rs. ${revenueAnalytics.totalRevenue.toLocaleString()}` : 'N/A'}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{customerAnalytics?.totalUsers || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Offers</CardTitle>
                <Tag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{offerPerformanceAnalytics?.activeOffers || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Merchants</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{merchantPerformanceAnalytics?.activeMerchants || 0}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Merchant</CardTitle>
              </CardHeader>
              <CardContent>
                {revenueAnalytics?.revenueByMerchant.length ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenueAnalytics.revenueByMerchant}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="merchantName" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="revenue" fill="#6366f1" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground">No data available</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Category</CardTitle>
              </CardHeader>
              <CardContent>
                {revenueAnalytics?.revenueByCategory.length ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={revenueAnalytics.revenueByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(props) => {
                          const { percent, payload } = props as {
                            percent?: number;
                            payload?: { categoryName?: string };
                          };
                          return `${payload?.categoryName ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`;
                        }}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="revenue"
                      >
                        {revenueAnalytics.revenueByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground">No data available</p>
                )}
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              {revenueAnalytics?.revenueTrend.length ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueAnalytics.revenueTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground">No data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>User Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Users</span>
                  <span className="font-bold">{customerAnalytics?.totalUsers || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Active Users</span>
                  <span className="font-bold">{customerAnalytics?.activeUsers || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">New Users</span>
                  <span className="font-bold">{customerAnalytics?.newUsers || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Retention Rate</span>
                  <span className="font-bold">{customerAnalytics?.userRetentionRate?.toFixed(1) || 0}%</span>
                </div>
              </CardContent>
            </Card>
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>User Acquisition Trend</CardTitle>
              </CardHeader>
              <CardContent>
                {customerAnalytics?.userAcquisitionTrend.length ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={customerAnalytics.userAcquisitionTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="newUsers" stroke="#8b5cf6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground">No data available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="offers" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Offer Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Offers</span>
                  <span className="font-bold">{offerPerformanceAnalytics?.totalOffers || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Active Offers</span>
                  <span className="font-bold">{offerPerformanceAnalytics?.activeOffers || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Conversion Rate</span>
                  <span className="font-bold">{offerPerformanceAnalytics?.conversionRate?.toFixed(2) || 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Avg Discount</span>
                  <span className="font-bold">Rs. {offerPerformanceAnalytics?.averageDiscountValue?.toFixed(0) || 0}</span>
                </div>
              </CardContent>
            </Card>
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Top Categories</CardTitle>
              </CardHeader>
              <CardContent>
                {offerPerformanceAnalytics?.topCategories.length ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={offerPerformanceAnalytics.topCategories}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="categoryName" />
                      <YAxis />
                      <Tooltip />
                  <Bar dataKey="redemptionCount" fill="#ec4899" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground">No data available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="merchants" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Merchant Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Merchants</span>
                  <span className="font-bold">{merchantPerformanceAnalytics?.totalMerchants || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Active Merchants</span>
                  <span className="font-bold">{merchantPerformanceAnalytics?.activeMerchants || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Pending Merchants</span>
                  <span className="font-bold">{merchantPerformanceAnalytics?.pendingMerchants || 0}</span>
                </div>
              </CardContent>
            </Card>
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Top Merchants by Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                {merchantPerformanceAnalytics?.merchantComparison.length ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={merchantPerformanceAnalytics.merchantComparison.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="merchantName" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="totalRevenue" fill="#f43f5e" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground">No data available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="time" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Hourly Redemptions</CardTitle>
              </CardHeader>
              <CardContent>
                {timeBasedAnalytics?.hourlyRedemptions.length ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={timeBasedAnalytics.hourlyRedemptions}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="redemptionCount" fill="#f97316" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground">No data available</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Day of Week Performance</CardTitle>
              </CardHeader>
              <CardContent>
                {timeBasedAnalytics?.dayOfWeekPerformance.length ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={timeBasedAnalytics.dayOfWeekPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="redemptionCount" fill="#eab308" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground">No data available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="growth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Month-over-Month Growth</CardTitle>
            </CardHeader>
            <CardContent>
              {growthMetrics?.momGrowth.length ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={growthMetrics.momGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} name="Revenue" />
                    <Line type="monotone" dataKey="redemptions" stroke="#14b8a6" strokeWidth={2} name="Redemptions" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground">No data available</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 md:grid-cols-4">
                {growthMetrics?.milestones.map((milestone) => (
                  <div
                    key={milestone.milestone}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      milestone.achieved ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <span className="text-sm font-medium">{milestone.milestone}</span>
                    <Badge variant={milestone.achieved ? 'default' : 'secondary'}>
                      {milestone.achieved ? 'Achieved' : 'Pending'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Category Ranking</CardTitle>
            </CardHeader>
            <CardContent>
              {categoryAnalytics?.categoryRanking.length ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={categoryAnalytics.categoryRanking} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="categoryName" type="category" width={150} />
                    <Tooltip />
                    <Bar dataKey="redemptionCount" fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground">No data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
