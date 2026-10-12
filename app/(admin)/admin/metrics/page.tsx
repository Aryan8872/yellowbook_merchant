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
} from 'lucide-react';
import {
  getSystemLiveness,
  getSystemReadiness,
  getAdminMetricsSummary,
  formatUptime,
  type SystemLiveness,
  type SystemReadiness,
} from '@/lib/api/admin/metrics-api';
import { getAdminDashboard } from '@/lib/api/admin/analytics-api';

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
  activeSubscribers: number | null;
  lastRefreshed: Date | null;
}

function StatusPill({ status }: { status: 'UP' | 'DOWN' | 'PARTIAL_OUTAGE' | 'DEGRADED' | 'UNKNOWN' }) {
  const config = {
    UP: { label: 'Operational', icon: CheckCircle2, cls: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    DOWN: { label: 'Down', icon: XCircle, cls: 'text-red-600 bg-red-50 border-red-200' },
    PARTIAL_OUTAGE: { label: 'Degraded', icon: AlertTriangle, cls: 'text-amber-600 bg-amber-50 border-amber-200' },
    DEGRADED: { label: 'Degraded', icon: AlertTriangle, cls: 'text-amber-600 bg-amber-50 border-amber-200' },
    UNKNOWN: { label: 'Unknown', icon: AlertTriangle, cls: 'text-slate-500 bg-slate-50 border-slate-200' },
  }[status] ?? { label: status, icon: AlertTriangle, cls: 'text-slate-500 bg-slate-50 border-slate-200' };

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
            <span className="text-muted-foreground text-lg">—</span>
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
    activeSubscribers: null,
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
      const [liveness, readiness, dashboardRes, metricsRes] = await Promise.allSettled([
        getSystemLiveness(),
        getSystemReadiness(),
        getAdminDashboard(),
        getAdminMetricsSummary(),
      ]);

      setData({
        liveness: liveness.status === 'fulfilled' ? liveness.value : null,
        readiness: readiness.status === 'fulfilled' ? readiness.value : null,
        dashboard: dashboardRes.status === 'fulfilled' && dashboardRes.value?.data
          ? dashboardRes.value.data
          : null,
        activeSubscribers:
          metricsRes.status === 'fulfilled' && metricsRes.value?.data
            ? metricsRes.value.data.activeSubscribers
            : null,
        lastRefreshed: new Date(),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);

    if (autoRefresh) {
      setCountdown(REFRESH_INTERVAL_MS / 1000);

      countdownRef.current = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) return REFRESH_INTERVAL_MS / 1000;
          return c - 1;
        });
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Activity className="h-7 w-7 text-indigo-500" />
            System Metrics
          </h1>
          <p className="text-muted-foreground mt-1">
            Live infrastructure health and platform statistics
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Auto-refresh toggle */}
          <button
            onClick={() => setAutoRefresh((v) => !v)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            title={autoRefresh ? 'Disable auto-refresh' : 'Enable auto-refresh'}
          >
            {autoRefresh ? (
              <ToggleRight className="h-5 w-5 text-indigo-500" />
            ) : (
              <ToggleLeft className="h-5 w-5" />
            )}
            {autoRefresh ? `Auto (${countdown}s)` : 'Auto-refresh off'}
          </button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Last refreshed */}
      {data.lastRefreshed && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          Last updated: {data.lastRefreshed.toLocaleTimeString()}
        </p>
      )}

      {/* Infrastructure Health */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Infrastructure Health</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {/* API Status */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                API Server
              </CardTitle>
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
                  {data.liveness ? formatUptime(data.liveness.uptime) : '—'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Redis Status */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Redis Cache
              </CardTitle>
              <Database className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <StatusPill status={redisStatus as any} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Role</span>
                <span className="text-sm text-muted-foreground">Session store / Rate limiter</span>
              </div>
            </CardContent>
          </Card>

          {/* Overall Readiness */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Overall Readiness
              </CardTitle>
              <Wifi className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <StatusPill status={(data.readiness?.status ?? 'UNKNOWN') as any} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Timestamp</span>
                <span className="text-xs font-mono text-muted-foreground">
                  {data.readiness
                    ? new Date(data.readiness.timestamp).toLocaleTimeString()
                    : '—'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Platform Statistics */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Platform Statistics</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            icon={Users}
            title="Total Users"
            value={data.dashboard?.totalUsers ?? '—'}
            subtitle="Registered accounts"
            loading={loading}
            accentColor="text-blue-500"
          />
          <MetricCard
            icon={Building2}
            title="Total Merchants"
            value={data.dashboard?.totalMerchants ?? '—'}
            subtitle="All merchant accounts"
            loading={loading}
            accentColor="text-indigo-500"
          />
          <MetricCard
            icon={Clock}
            title="Pending Approval"
            value={data.dashboard?.pendingMerchants ?? '—'}
            subtitle="Merchants awaiting review"
            loading={loading}
            accentColor="text-amber-500"
          />
          <MetricCard
            icon={Tag}
            title="Active Offers"
            value={data.dashboard?.activeOffers ?? '—'}
            subtitle="Live offers across merchants"
            loading={loading}
            accentColor="text-emerald-500"
          />
        </div>
      </div>

      {/* Active Subscribers */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Engagement</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Subscribers
                <span className="ml-2 text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-normal">
                  Estimated
                </span>
              </CardTitle>
              <Users className="h-4 w-4 text-violet-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '—' : (data.activeSubscribers ?? '—').toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Estimated active platform subscribers
              </p>
            </CardContent>
          </Card>

          <Card className="bg-muted/20 border-dashed">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Live Sessions
                <span className="ml-2 text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-normal">
                  Coming Soon
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Real-time concurrent session tracking requires Redis session key enumeration — planned for a future infrastructure update.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
