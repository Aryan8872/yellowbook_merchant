'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Building2, Tag, TrendingUp, Plus, Clock, ShieldAlert, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { getAdminDashboard } from '@/lib/api/admin/analytics-api';

interface DashboardStats {
  totalMerchants: number;
  pendingMerchants: number;
  totalUsers: number;
  activeOffers: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await getAdminDashboard();
        if (res?.data) {
          setStats(res.data);
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers ?? '—',
      icon: Users,
      description: 'Registered users',
      href: '/admin/users',
    },
    {
      title: 'Total Merchants',
      value: stats?.totalMerchants ?? '—',
      icon: Building2,
      description: 'All merchants',
      href: '/admin/merchants',
    },
    {
      title: 'Pending Approval',
      value: stats?.pendingMerchants ?? '—',
      icon: Clock,
      description: 'Awaiting review',
      href: '/admin/merchants',
    },
    {
      title: 'Active Offers',
      value: stats?.activeOffers ?? '—',
      icon: Tag,
      description: 'Live offers',
      href: '/admin/analytics',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to the OfferNepal admin panel
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/users">
            <Button variant="outline" size="sm">
              <Users className="mr-2 h-4 w-4" />
              Manage Users
            </Button>
          </Link>
          <Link href="/admin/merchants">
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Review Merchants
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Live Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:border-primary/40 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                {loading ? (
                  <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
                ) : (
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? (
                    <span className="text-muted-foreground text-lg">Loading...</span>
                  ) : (
                    stat.value.toLocaleString()
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions + System Status */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/admin/users" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Manage Users
              </Button>
            </Link>
            <Link href="/admin/merchants" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Building2 className="mr-2 h-4 w-4" />
                Manage Merchants
              </Button>
            </Link>
            <Link href="/admin/analytics" className="block">
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="mr-2 h-4 w-4" />
                View Analytics
              </Button>
            </Link>
            <Link href="/admin/fraud-flags" className="block">
              <Button variant="outline" className="w-full justify-start">
                <ShieldAlert className="mr-2 h-4 w-4" />
                Fraud Flags
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Merchants</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </div>
            ) : stats?.pendingMerchants && stats.pendingMerchants > 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <span className="text-2xl font-bold text-amber-500">{stats.pendingMerchants}</span>{' '}
                  merchant{stats.pendingMerchants !== 1 ? 's' : ''} awaiting approval.
                </p>
                <Link href="/admin/merchants">
                  <Button size="sm" className="mt-2">
                    Review Now
                  </Button>
                </Link>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No merchants pending review. ✓
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>API Status</span>
                <span className="flex items-center gap-1.5 text-green-600">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Database</span>
                <span className="flex items-center gap-1.5 text-green-600">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Cache</span>
                <span className="flex items-center gap-1.5 text-green-600">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Active
                </span>
              </div>
            </div>
            <Link href="/admin/metrics" className="block mt-3">
              <Button variant="outline" size="sm" className="w-full text-xs">
                View Live Metrics →
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
