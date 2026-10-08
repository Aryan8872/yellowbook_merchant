'use client';

import ActiveDayGraph from "./offer/activeDayGraph/activeDayGraph";
import OfferTable from "./offer/offerTable/page";
import ProfitGraph from "./offer/profitGraph/profitGraph";
import { useMerchantAnalyticsStore } from "@/lib/merchant/stores/analytics-store";
import { useAuthStore } from "@/lib/auth";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, BarChart3 } from "lucide-react";

export default function DashboardBody(){
    const { merchantId } = useAuthStore();
    const { analytics, loading, fetchAnalytics } = useMerchantAnalyticsStore();

    useEffect(() => {
        if (merchantId) {
            fetchAnalytics(merchantId, { range: '7d' });
        }
    }, [merchantId, fetchAnalytics]);

    // Transform analytics data to the format expected by ActiveDayGraph
    const graphData = analytics?.dailyRedemptions?.map((item: any) => ({
        day: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase(),
        value: item.count,
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
                            Daily Redemptions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="h-64 bg-muted animate-pulse rounded-lg" />
                        ) : (
                            <ActiveDayGraph data={graphData.length > 0 ? graphData : [{
                                day:"mon",
                                value:0,
                            },{
                                day:"tue",
                                value:0,
                            },{
                                day:"wed",
                                value:0,
                            },{
                                day:"thu",
                                value:0,
                            },{
                                day:"fri",
                                value:0,
                            },{
                                day:"sat",
                                value:0,
                            },{
                                day:"sun",
                                value:0,
                            }]}/>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}