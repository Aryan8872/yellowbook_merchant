'use client';

import { useEffect } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useMerchantAnalyticsStore } from '@/lib/merchant/stores/analytics-store';
import { useAuthStore } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  TrendingUp,
  BarChart3,
  ArrowUpRight,
  Ticket,
  Store,
  Receipt,
  Sparkles,
} from 'lucide-react';
import { cn } from 'cn';

export default function DashboardBody() {
  const { merchantId } = useAuthStore();
  const {
    analytics,
    revenueAnalytics,
    loading,
    fetchAnalytics,
    fetchRevenueAnalytics,
  } = useMerchantAnalyticsStore();

  useEffect(() => {
    if (merchantId) {
      fetchAnalytics(merchantId, { range: '7d' });
      fetchRevenueAnalytics(merchantId, { range: '30d' });
    }
  }, [merchantId, fetchAnalytics, fetchRevenueAnalytics]);

  // Daily redemption trend
  const redemptionTrendData =
    analytics?.dailyRedemptions?.map((item: any) => ({
      date: new Date(item.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      count: item.count,
    })) || [];

  // Revenue trend (actual real data from revenueAnalytics)
  const revenueTrendData =
    revenueAnalytics?.revenueTrend?.map((item: any) => ({
      date: new Date(item.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      revenue: item.revenue,
    })) || [];

  const topOffers = analytics?.topOffers || [];

  return (
    <div className="space-y-6">
      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* REVENUE TREND */}
        <Card className="border-border/50 hover:shadow-sm transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                Revenue Trend
              </CardTitle>
              <CardDescription>
                Gross revenue from redeemed vouchers (Last 30 Days)
              </CardDescription>
            </div>
            {revenueAnalytics?.averageOrderValue ? (
              <Badge variant="outline" className="text-xs font-mono font-medium">
                Avg Order: Rs. {Math.round(revenueAnalytics.averageOrderValue)}
              </Badge>
            ) : null}
          </CardHeader>
          <CardContent className="pt-4">
            {loading ? (
              <div className="h-72 bg-muted animate-pulse rounded-lg" />
            ) : revenueTrendData.length > 0 ? (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueTrendData}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                    <XAxis
                      dataKey="date"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => `Rs.${val}`}
                    />
                    <Tooltip
                      formatter={(val: any) => [`Rs. ${Number(val).toLocaleString()}`, 'Revenue']}
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid hsl(var(--border))',
                        background: 'hsl(var(--card))',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10b981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#revenueGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 flex flex-col items-center justify-center text-muted-foreground gap-2">
                <p className="text-sm">No revenue transactions in this period</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* DAILY REDEMPTIONS */}
        <Card className="border-border/50 hover:shadow-sm transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-amber-500" />
                Customer Redemptions
              </CardTitle>
              <CardDescription>
                Activity breakdown over the last 7 days
              </CardDescription>
            </div>
            {analytics?.totalRedemptions !== undefined && (
              <Badge variant="outline" className="text-xs font-mono">
                {analytics.totalRedemptions} total
              </Badge>
            )}
          </CardHeader>
          <CardContent className="pt-4">
            {loading ? (
              <div className="h-72 bg-muted animate-pulse rounded-lg" />
            ) : redemptionTrendData.length > 0 ? (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={redemptionTrendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                    <XAxis
                      dataKey="date"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      formatter={(val: any) => [val, 'Redemptions']}
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid hsl(var(--border))',
                        background: 'hsl(var(--card))',
                      }}
                    />
                    <Bar
                      dataKey="count"
                      fill="#f59e0b"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 flex flex-col items-center justify-center text-muted-foreground gap-2">
                <p className="text-sm">No redemptions recorded yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* LOWER SECTION: TOP PERFORMING OFFERS & QUICK ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* TOP PERFORMING OFFERS */}
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">
                Top Performing Offers
              </CardTitle>
              <CardDescription>
                Your most frequently claimed deals
              </CardDescription>
            </div>
            <Link
              href="/merchant/offers"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-xs flex items-center gap-1")}
            >
              View all offers
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : topOffers.length > 0 ? (
              <div className="divide-y divide-border/50">
                {topOffers.slice(0, 5).map((offer, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-xs font-semibold text-amber-600">
                        {idx + 1}
                      </span>
                      <p className="font-medium text-sm text-foreground truncate">
                        {offer.title}
                      </p>
                    </div>
                    <Badge variant="secondary" className="font-mono text-xs shrink-0">
                      {offer.count} claims
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No offer claims recorded yet. Active offers will appear here once customers redeem them.
              </p>
            )}
          </CardContent>
        </Card>

        {/* QUICK SHORTCUTS & SYSTEM STATUS */}
        <Card className="border-border/50 flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Direct shortcuts for venue management
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href="/merchant/redemption"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "w-full justify-start gap-2.5 h-11 border-border/60 hover:bg-muted font-medium text-foreground"
              )}
            >
              <Receipt className="h-4 w-4 text-emerald-500" />
              Verify Customer QR
            </Link>

            <Link
              href="/merchant/offers"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "w-full justify-start gap-2.5 h-11 border-border/60 hover:bg-muted font-medium text-foreground"
              )}
            >
              <Ticket className="h-4 w-4 text-amber-500" />
              Create New Offer
            </Link>

            <Link
              href="/merchant/branches"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "w-full justify-start gap-2.5 h-11 border-border/60 hover:bg-muted font-medium text-foreground"
              )}
            >
              <Store className="h-4 w-4 text-blue-500" />
              Manage Branches
            </Link>

            <div className="pt-2 border-t border-border/40 mt-3">
              <div className="rounded-lg bg-muted/50 p-3 text-xs space-y-1">
                <p className="font-medium text-foreground">💡 Promotion Tip</p>
                <p className="text-muted-foreground">
                  BOGO (Buy-One-Get-One) deals typically convert 40% higher on weekends in Nepal.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}