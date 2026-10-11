'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useMerchantAnalyticsStore } from "@/lib/merchant/stores/analytics-store";
import { useAuthStore } from "@/lib/auth";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, BarChart3 } from "lucide-react";
import ProfitGraph from "./offer/profitGraph/profitGraph";

export default function DashboardBody(){
    const { merchantId } = useAuthStore();
    const { analytics, loading, fetchAnalytics } = useMerchantAnalyticsStore();

    useEffect(() => {
        if (merchantId) {
            fetchAnalytics(merchantId, { range: '7d' });
        }
    }, [merchantId, fetchAnalytics]);

    // Transform analytics data to the format expected by the bar chart
    const graphData = analytics?.dailyRedemptions?.map((item: any) => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: item.count,
    })) || [];

    return(
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="flex flex-col gap-6">
                <Card className="border-border/50 hover:shadow-md transition-shadow">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <TrendingUp className="h-5 w-5 text-amber-500" />
                            Profit Overview
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ProfitGraph/>
                    </CardContent>
                </Card>
            </div>

            <div>
                <Card className="border-border/50 hover:shadow-md transition-shadow">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <BarChart3 className="h-5 w-5 text-blue-500" />
                            Daily Redemptions (Last 7 Days)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="h-64 bg-muted animate-pulse rounded-lg" />
                        ) : graphData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={graphData}>
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
            </div>
        </div>
    )
}