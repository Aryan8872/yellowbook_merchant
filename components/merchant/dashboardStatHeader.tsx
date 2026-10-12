'use client';

import { useMerchantAnalyticsStore } from "@/lib/merchant/stores/analytics-store";
import { useAuthStore } from "@/lib/auth";
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Users, Ticket, Building2, Shield, DollarSign } from "lucide-react";
import { ErrorFallback } from "@/components/ui/error-fallback";

export default function DashboardStatHeader() {
  const { merchantId } = useAuthStore();
  const { dashboard, revenueAnalytics, loading, error, fetchDashboard, fetchRevenueAnalytics } =
    useMerchantAnalyticsStore();

  const handleRetry = () => {
    if (merchantId) {
      fetchDashboard(merchantId);
      fetchRevenueAnalytics(merchantId, { range: '30d' });
    }
  };

  useEffect(() => {
    handleRetry();
  }, [merchantId, fetchDashboard, fetchRevenueAnalytics]);

  const totalRevenue = revenueAnalytics?.totalRevenue || 0;

  const statCards = [
    {
      title: "Gross Revenue",
      value: `Rs. ${totalRevenue.toLocaleString()}`,
      subtext: "Last 30 days",
      icon: DollarSign,
      gradient: "from-emerald-500 to-teal-600",
      shadow: "shadow-emerald-500/10",
    },
    {
      title: "Total Redemptions",
      value: (dashboard?.totalRedemptions || 0).toLocaleString(),
      subtext: "All time verified",
      icon: Users,
      gradient: "from-blue-500 to-indigo-600",
      shadow: "shadow-blue-500/10",
    },
    {
      title: "Active Offers",
      value: `${dashboard?.activeOffers || 0} / ${dashboard?.totalOffers || 0}`,
      subtext: "Live customer deals",
      icon: Ticket,
      gradient: "from-amber-500 to-orange-600",
      shadow: "shadow-amber-500/10",
    },
    {
      title: "Branches",
      value: dashboard?.totalBranches || 0,
      subtext: "Active locations",
      icon: Building2,
      gradient: "from-violet-500 to-purple-600",
      shadow: "shadow-purple-500/10",
    },
    {
      title: "Staff Members",
      value: dashboard?.totalStaff || 0,
      subtext: "Registered terminals",
      icon: Shield,
      gradient: "from-rose-500 to-pink-600",
      shadow: "shadow-rose-500/10",
    },
  ];

  if (error && !dashboard) {
    return (
      <ErrorFallback
        error={error}
        title="Failed to load merchant metrics"
        onRetry={handleRetry}
      />
    );
  }

  if (loading && !dashboard) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="border-border/50">
            <CardContent className="p-5">
              <div className="h-16 bg-muted animate-pulse rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className="border-border/50 bg-card hover:border-border transition-all duration-200 hover:shadow-sm"
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold tracking-tight text-foreground truncate">
                    {stat.value}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-medium">
                    {stat.subtext}
                  </p>
                </div>
                <div
                  className={`h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-white shadow-md ${stat.shadow}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}