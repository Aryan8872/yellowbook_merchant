'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  RefreshCw,
  Server,
  Database,
  Wifi,
  Users,
  Building2,
  Tag,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
  Store,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import {
  getSystemLiveness,
  getSystemReadiness,
  getLiveSystemMetrics,
  formatUptime,
  type SystemLiveness,
  type SystemReadiness,
  type LiveSystemMetrics,
  type PlanSubscriberBreakdown,
} from '@/lib/api/admin/metrics-api';
import { getAdminDashboard } from '@/lib/api/admin/analytics-api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const REFRESH_INTERVAL_MS = 30_000;

interface MetricsData {
  liveness: SystemLiveness | null;
  readiness: SystemReadiness | null;
  dashboard: {
    totalMerchants: number;
    pendingMerchants: number;
    totalUsers: number;
    activeOffers: number;
  } | null;
  liveMetrics: LiveSystemMetrics | null;
  lastRefreshed: Date | null;
}

function StatusPill({ status }: { status: 'UP' | 'DOWN' | 'PARTIAL_OUTAGE' | 'DEGRADED' | 'UNKNOWN' }) {
  const config = ({
    UP: { label: 'Operational', icon: CheckCircle2, cls: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    DOWN: { label: 'Down', icon: XCircle, cls: 'text-red-600 bg-red-50 border-red-200' },
    PARTIAL_OUTAGE: { label: 'Degraded', icon: AlertTriangle, cls: 'text-amber-600 bg-amber-50 border-amber-200' },
    DEGRADED: { label: 'Degraded', icon: AlertTriangle, cls: 'text-amber-600 bg-amber-50 border-amber-200' },
    UNKNOWN: { label: 'Unknown', icon: AlertTriangle, cls: 'text-slate-500 bg-slate-50 border-slate-200' },
  } as Record<string, { label: string; icon: React.ElementType; cls: string }>)[status] ?? { label: status, icon: AlertTriangle, cls: 'text-slate-500 bg-slate-50 border-slate-200' };

  return (
    <Badge variant="outline" className={`${config.cls} flex items-center gap-1 px-2 py-0.5`}>
      <config.icon className="h-3.5 w-3.5" />
      {config.label}
    </Badge>
  );
}

function MetricCard({
  icon: Icon,
  title,
  value,
  subtitle,
  loading,
  accentColor = 'text-indigo-500',
}: {
  icon: React.ElementType;
  title: string;
  value: string | number;
  subtitle?: string;
  loading?: boolean;
  accentColor?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${accentColor}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {loading ? (
            <span className="text-muted-foreground text-lg">-</span>
          ) : (
            typeof value === 'number' ? value.toLocaleString() : value
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminMetricsPage() {
  const [data, setData] = useState<MetricsData>({
    liveness: null,
    readiness: null,
    dashboard: null,
    liveMetrics: null,
    lastRefreshed: null,
  });
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL_MS / 1000);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [liveness, readiness, dashboardRes, liveMetricsRes] = await Promise.allSettled([
        getSystemLiveness(),
        getSystemReadiness(),
        getAdminDashboard(),
        getLiveSystemMetrics(),
      ]);

      let liveMetrics: LiveSystemMetrics | null = null;
      if (liveMetricsRes.status === 'fulfilled' && liveMetricsRes.value) {
        const raw = liveMetricsRes.value as any;
        liveMetrics = raw?.data ?? raw ?? null;
      }

      setData({
        liveness: liveness.status === 'fulfilled' ? liveness.value : null,
        readiness: readiness.status === 'fulfilled' ? readiness.value : null,
        dashboard:
          dashboardRes.status === 'fulfilled' && dashboardRes.value?.data
            ? dashboardRes.value.data
            : null,
        liveMetrics,
        lastRefreshed: new Date(),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);

    if (autoRefresh) {
      setCountdown(REFRESH_INTERVAL_MS / 1000);
      countdownRef.current = setInterval(() => {
        setCountdown((c) => (c <= 1 ? REFRESH_INTERVAL_MS / 1000 : c - 1));
      }, 1000);
      intervalRef.current = setInterval(() => {
        fetchAll();
        setCountdown(REFRESH_INTERVAL_MS / 1000);
      }, REFRESH_INTERVAL_MS);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [autoRefresh, fetchAll]);

  const handleManualRefresh = () => {
    fetchAll();
    setCountdown(REFRESH_INTERVAL_MS / 1000);
  };

  const apiStatus = data.liveness?.status ?? 'UNKNOWN';
  const redisStatus = data.readiness?.checks?.redis ?? 'UNKNOWN';
  const lm = data.liveMetrics;
  const plans: PlanSubscriberBreakdown[] = lm?.activeSubscribers?.byPlan ?? [];
  const totalActive = plans.reduce((s, p) => s + p.activeCount, 0);
  const sessTotal = lm?.liveSessions?.total ?? 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Activity className="h-7 w-7 text-indigo-500" />
            System Metrics
          </h1>
          <p className="text-muted-foreground mt-1">
            Live infrastructure health, real-time sessions &amp; subscriber analytics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoRefresh((v) => !v)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {autoRefresh ? (
              <ToggleRight className="h-5 w-5 text-indigo-500" />
            ) : (
              <ToggleLeft className="h-5 w-5" />
            )}
            {autoRefresh ? `Auto (${countdown}s)` : 'Auto-refresh off'}
          </button>
          <Button variant="outline" size="sm" onClick={handleManualRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {data.lastRefreshed && (
        <p className="-mt-4 text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          Last updated: {data.lastRefreshed.toLocaleTimeString()}
        </p>
      )}

      {/* Infrastructure Health */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Infrastructure Health</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">API Server</CardTitle>
              <Server className="h-4 w-4 text-indigo-500" />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <StatusPill status={apiStatus as any} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Uptime</span>
                <span className="text-sm font-mono font-medium">
                  {data.liveness ? formatUptime(data.liveness.uptime) : '-'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Redis Cache</CardTitle>
              <Database className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <StatusPill status={redisStatus as any} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Role</span>
                <span className="text-xs text-muted-foreground">Sessions / Rate limiter</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Overall Readiness</CardTitle>
              <Wifi className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <StatusPill status={(data.readiness?.status ?? 'UNKNOWN') as any} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Checked</span>
                <span className="text-xs font-mono text-muted-foreground">
                  {data.readiness ? new Date(data.readiness.timestamp).toLocaleTimeString() : '-'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Platform Statistics */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Platform Statistics</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard icon={Users} title="Total Users" value={data.dashboard?.totalUsers ?? '-'} subtitle="Registered accounts" loading={loading} accentColor="text-blue-500" />
          <MetricCard icon={Building2} title="Total Merchants" value={data.dashboard?.totalMerchants ?? '-'} subtitle="All merchant accounts" loading={loading} accentColor="text-indigo-500" />
          <MetricCard icon={Clock} title="Pending Approval" value={data.dashboard?.pendingMerchants ?? '-'} subtitle="Awaiting merchant review" loading={loading} accentColor="text-amber-500" />
          <MetricCard icon={Tag} title="Active Offers" value={data.dashboard?.activeOffers ?? '-'} subtitle="Live offers across merchants" loading={loading} accentColor="text-emerald-500" />
        </div>
      </section>

      {/* Live Sessions */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Live Sessions</h2>
        <Card className="border-emerald-100 bg-gradient-to-br from-background to-emerald-50/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              Live Active Sessions
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-normal">
                Real-time - {lm?.liveSessions?.windowMinutes ?? 5}m window
              </span>
            </CardTitle>
            <Activity className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-bold tracking-tight">
              {loading ? (
                <span className="text-muted-foreground text-lg">-</span>
              ) : (
                sessTotal.toLocaleString()
              )}
              <span className="text-xs text-muted-foreground font-normal ml-2">concurrent</span>
            </div>

            {!loading && (
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2">
                  <Users className="h-4 w-4 text-blue-500 shrink-0" />
                  <div>
                    <p className="text-base font-semibold text-blue-700">
                      {(lm?.liveSessions?.users ?? 0).toLocaleString()}
                    </p>
                    <p className="text-[10px] text-blue-500 leading-tight">
                      Users - {sessTotal > 0 ? Math.round(((lm?.liveSessions?.users ?? 0) / sessTotal) * 100) : 0}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-indigo-50 border border-indigo-100 px-3 py-2">
                  <Store className="h-4 w-4 text-indigo-500 shrink-0" />
                  <div>
                    <p className="text-base font-semibold text-indigo-700">
                      {(lm?.liveSessions?.merchants ?? 0).toLocaleString()}
                    </p>
                    <p className="text-[10px] text-indigo-500 leading-tight">
                      Merchants - {sessTotal > 0 ? Math.round(((lm?.liveSessions?.merchants ?? 0) / sessTotal) * 100) : 0}%
                    </p>
                  </div>
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Sliding Redis sorted-set window - JWT heartbeat recorded on every authenticated API request
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Active Subscribers */}
      <section>
        <h2 className="text-lg font-semibold mb-3">
          Active Subscribers
          <span className="text-xs font-normal text-muted-foreground ml-2">(non-expired subscriptions)</span>
        </h2>

        <div className="grid gap-4 md:grid-cols-3 mb-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Active Subscribers</CardTitle>
              <ShieldCheck className="h-4 w-4 text-violet-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '-' : (lm?.activeSubscribers?.total ?? 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">All plans with active subscriptions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Club Members (Users)</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {loading ? '-' : (lm?.activeSubscribers?.users ?? 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Active consumer tier subscriptions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Partner Merchants</CardTitle>
              <Store className="h-4 w-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600">
                {loading ? '-' : (lm?.activeSubscribers?.merchants ?? 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Active merchant plan subscriptions</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-400" />
              Subscription Plan Breakdown
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Distribution of active subscribers across all plan tiers
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            {loading ? (
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-10 rounded-md bg-muted animate-pulse" />
                ))}
              </div>
            ) : !plans.length ? (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
                <Sparkles className="h-8 w-8 opacity-30" />
                <p className="text-sm">No active subscriptions yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan</TableHead>
                    <TableHead>Audience</TableHead>
                    <TableHead>Billing</TableHead>
                    <TableHead className="text-right">Price (NPR)</TableHead>
                    <TableHead className="text-right">Active</TableHead>
                    <TableHead className="text-right">Share</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plans
                    .slice()
                    .sort((a, b) => b.activeCount - a.activeCount)
                    .map((plan) => {
                      const share = totalActive > 0 ? Math.round((plan.activeCount / totalActive) * 100) : 0;
                      return (
                        <TableRow key={plan.planId}>
                          <TableCell>
                            <p className="font-medium text-sm">{plan.name}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">{plan.code}</p>
                          </TableCell>
                          <TableCell>
                            {plan.audience === 'MERCHANT' ? (
                              <Badge variant="outline" className="text-indigo-600 bg-indigo-50 border-indigo-200 text-[10px] px-1.5">Merchant</Badge>
                            ) : (
                              <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200 text-[10px] px-1.5">User</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground capitalize">
                            {plan.billingCycle?.toLowerCase().replace('_', ' ') ?? '-'}
                          </TableCell>
                          <TableCell className="text-right text-sm font-mono">
                            {plan.priceNpr > 0 ? `Rs. ${plan.priceNpr.toLocaleString()}` : 'Free'}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-sm font-semibold">{plan.activeCount.toLocaleString()}</span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                                <div className="h-full rounded-full bg-indigo-400 transition-all" style={{ width: `${share}%` }} />
                              </div>
                              <span className="text-xs text-muted-foreground w-8 text-right">{share}%</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
