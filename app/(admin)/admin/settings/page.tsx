'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Server, Bell, Key } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground mt-1">
          Platform configurations, environment indicators, and administrative policies.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Server className="h-5 w-5 text-primary" />
              <CardTitle>Environment & Version</CardTitle>
            </div>
            <CardDescription>Active platform runtime parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm font-medium">Platform Mode</span>
              <Badge variant="outline">Enterprise Production</Badge>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm font-medium">API Gateway</span>
              <span className="text-xs text-muted-foreground font-mono">/api/v1</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium">Security Masking</span>
              <Badge variant="default" className="bg-emerald-600">Active (RFC 7807)</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <CardTitle>Security & Access Control</CardTitle>
            </div>
            <CardDescription>Authentication and session enforcement</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm font-medium">Role Level</span>
              <Badge variant="secondary">SUPER_ADMIN</Badge>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm font-medium">Session Auto-Refresh</span>
              <span className="text-xs text-emerald-600 font-medium">Enabled (Silent Rotation)</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium">Audit Trail Logging</span>
              <span className="text-xs text-muted-foreground font-mono">Enabled (Pino + Postgres)</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
