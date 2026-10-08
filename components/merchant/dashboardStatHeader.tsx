'use client';

import StatCard, { StatCardProps } from "./statcard";
import { useMerchantAnalyticsStore } from "@/lib/merchant/stores/analytics-store";
import { useAuthStore } from "@/lib/auth";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, Ticket, Building2, Shield } from "lucide-react";

export default function DashboardStatHeader(){
    const { merchantId } = useAuthStore();
    const { dashboard, loading, fetchDashboard } = useMerchantAnalyticsStore();

    useEffect(() => {
        if (merchantId) {
            fetchDashboard(merchantId);
        }
    }, [merchantId, fetchDashboard]);

    const statData: StatCardProps[] = [
        {
            title: "Total offers",
            statData: dashboard?.totalOffers || 0,
        },
        {
            title: "Active offers",
            statData: dashboard?.activeOffers || 0,
        },
        {
            title: "Total redemptions",
            statData: dashboard?.totalRedemptions || 0,
        },
        {
            title: "Total branches",
            statData: dashboard?.totalBranches || 0,
        },
        {
            title: "Total staff",
            statData: dashboard?.totalStaff || 0,
        }
    ];

    const statCards = [
        {
            title: "Total Offers",
            value: dashboard?.totalOffers || 0,
            icon: Ticket,
            color: "from-blue-500 to-blue-600",
            bgColor: "bg-blue-500/10",
            textColor: "text-blue-600",
        },
        {
            title: "Active Offers",
            value: dashboard?.activeOffers || 0,
            icon: TrendingUp,
            color: "from-emerald-500 to-emerald-600",
            bgColor: "bg-emerald-500/10",
            textColor: "text-emerald-600",
        },
        {
            title: "Total Redemptions",
            value: dashboard?.totalRedemptions || 0,
            icon: Users,
            color: "from-purple-500 to-purple-600",
            bgColor: "bg-purple-500/10",
            textColor: "text-purple-600",
        },
        {
            title: "Total Branches",
            value: dashboard?.totalBranches || 0,
            icon: Building2,
            color: "from-amber-500 to-amber-600",
            bgColor: "bg-amber-500/10",
            textColor: "text-amber-600",
        },
        {
            title: "Total Staff",
            value: dashboard?.totalStaff || 0,
            icon: Shield,
            color: "from-rose-500 to-rose-600",
            bgColor: "bg-rose-500/10",
            textColor: "text-rose-600",
        },
    ];

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <Card key={i} className="border-border/50">
                        <CardContent className="p-6">
                            <div className="h-20 bg-muted animate-pulse rounded-lg" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return(
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {statCards.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <Card key={index} className="border-border/50 hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                                </div>
                                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg shadow-${stat.color.split('-')[1]}-500/20`}>
                                    <Icon className="h-6 w-6 text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}