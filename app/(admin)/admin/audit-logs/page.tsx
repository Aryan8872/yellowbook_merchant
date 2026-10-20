'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAuditLogs, AuditLogItem } from '@/lib/api/admin/audit-logs-api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Activity, Search, RefreshCw, Eye, Download } from 'lucide-react';
import { useDebounce } from '@/lib/utils/use-debounce';
import CustomSpinner from '@/components/merchant/custom-spinner';

export default function AdminAuditLogsPage() {
  const [search, setSearch] = useState('');
  const [selectedEntity, setSelectedEntity] = useState('all');
  const [selectedAction, setSelectedAction] = useState('all');
  const [activeLog, setActiveLog] = useState<AuditLogItem | null>(null);

  const debouncedSearch = useDebounce(search.trim(), 300);

  const { data: response, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['admin', 'audit-logs', { debouncedSearch, selectedEntity, selectedAction }],
    queryFn: async () => {
      const res: any = await getAuditLogs({
        search: debouncedSearch || undefined,
        entity: selectedEntity !== 'all' ? selectedEntity : undefined,
        action: selectedAction !== 'all' ? selectedAction : undefined,
      });
      return res?.data?.data ? res.data : (res?.data || res || { data: [], pagination: {} });
    },
  });

  const logs: AuditLogItem[] = Array.isArray(response)
    ? response
    : (Array.isArray(response?.data) ? response.data : []);

  const total = response?.pagination?.total ?? logs.length;

  const exportCsv = () => {
    if (logs.length === 0) return;
    const headers = ['ID', 'Timestamp', 'Entity', 'Entity ID', 'Action', 'Actor Name', 'Actor Email', 'Metadata'];
    const rows = logs.map((l) => [
      l.id,
      new Date(l.createdAt).toISOString(),
      l.entity,
      l.entityId,
      l.action,
      l.actor?.name || 'System',
      l.actor?.email || '-',
      JSON.stringify(l.metadata || {}).replace(/"/g, '""'),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Activity className="h-7 w-7 text-indigo-500" />
            Audit Logs
          </h1>
          <p className="text-muted-foreground mt-1">
            System-wide compliance history, actor operations, and state changes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportCsv} disabled={logs.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by entity ID or action..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={selectedEntity} onValueChange={(val) => setSelectedEntity(val || 'all')}>
              <SelectTrigger>
                <SelectValue placeholder="All Entities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entities</SelectItem>
                <SelectItem value="User">User</SelectItem>
                <SelectItem value="Merchant">Merchant</SelectItem>
                <SelectItem value="SubscriptionPlan">Subscription Plan</SelectItem>
                <SelectItem value="SubscriptionRecord">Subscription</SelectItem>
                <SelectItem value="SystemTrialConfig">Trial Config</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedAction} onValueChange={(val) => setSelectedAction(val || 'all')}>
              <SelectTrigger>
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete_archive">Delete / Archive</SelectItem>
                <SelectItem value="manual_override">Manual Override</SelectItem>
                <SelectItem value="approve">Approve</SelectItem>
                <SelectItem value="reject">Reject</SelectItem>
                <SelectItem value="suspend">Suspend</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <CustomSpinner />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No audit logs recorded matching the criteria.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Actor</TableHead>
                    <TableHead>Target ID</TableHead>
                    <TableHead className="text-right">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.entity}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-xs uppercase">{log.action}</span>
                      </TableCell>
                      <TableCell className="text-xs">
                        {log.actor ? (
                          <div>
                            <p className="font-medium">{log.actor.name || log.actor.email}</p>
                            <span className="text-muted-foreground text-[10px]">{log.actor.role}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">System</span>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground truncate max-w-[140px]">
                        {log.entityId}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setActiveLog(log)}
                          title="View Payload"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* JSON Context Drawer */}
      <Sheet open={!!activeLog} onOpenChange={(open) => !open && setActiveLog(null)}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader className="pb-4 border-b">
            <SheetTitle>Audit Log Details</SheetTitle>
            <SheetDescription>
              {activeLog?.action} on {activeLog?.entity} at{' '}
              {activeLog && new Date(activeLog.createdAt).toLocaleString()}
            </SheetDescription>
          </SheetHeader>
          {activeLog && (
            <div className="space-y-4 pt-4 text-sm">
              <div>
                <span className="text-xs text-muted-foreground font-medium uppercase">Log ID</span>
                <p className="font-mono text-xs">{activeLog.id}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground font-medium uppercase">Target Entity ID</span>
                <p className="font-mono text-xs">{activeLog.entityId}</p>
              </div>
              {activeLog.actor && (
                <div>
                  <span className="text-xs text-muted-foreground font-medium uppercase">Actor</span>
                  <p className="font-medium">{activeLog.actor.name || 'Admin'} ({activeLog.actor.email})</p>
                  <p className="text-xs text-muted-foreground">Role: {activeLog.actor.role}</p>
                </div>
              )}
              <div>
                <span className="text-xs text-muted-foreground font-medium uppercase">Context & Changes JSON</span>
                <pre className="mt-1 p-3 bg-muted rounded-md text-xs font-mono overflow-x-auto max-h-[300px]">
                  {JSON.stringify(activeLog.metadata || {}, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
