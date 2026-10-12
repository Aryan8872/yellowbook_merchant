'use client';

import { useEffect, useState } from 'react';
import { useFraudFlagsStore } from '@/lib/admin/stores/fraud-flags-store';
import { FraudReviewDialog } from '@/lib/admin/components/fraud-review-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, RefreshCw, Search, Eye } from 'lucide-react';
import type { FraudFlag, FraudFlagStatus } from '@/lib/api/admin/fraud-flags-api';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700 border-amber-300',
  REVIEWED: 'bg-blue-100 text-blue-700 border-blue-300',
  DISMISSED: 'bg-slate-100 text-slate-600 border-slate-300',
  ESCALATED: 'bg-red-100 text-red-700 border-red-300',
};

export default function AdminFraudFlagsPage() {
  const { flags, loading, error, pagination, currentFilter, fetchFraudFlags, setFilter } =
    useFraudFlagsStore();
  const [selectedFlag, setSelectedFlag] = useState<FraudFlag | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchFraudFlags({ page });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFilter, page]);

  const handleReview = (flag: FraudFlag) => {
    setSelectedFlag(flag);
    setReviewOpen(true);
  };

  const handleFilterChange = (val: string | null) => {
    if (!val) return;
    setFilter(val as FraudFlagStatus | 'ALL');
    setPage(1);
  };

  const formatReason = (reason: string) =>
    reason
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ShieldAlert className="h-7 w-7 text-amber-500" />
            Fraud Flags
          </h1>
          <p className="text-muted-foreground mt-1">
            Review and resolve suspicious redemption activity
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchFraudFlags({ page })}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {(['ALL', 'PENDING', 'ESCALATED', 'REVIEWED'] as const).map((status) => (
          <Card
            key={status}
            className={`cursor-pointer transition-colors ${currentFilter === status ? 'border-primary ring-1 ring-primary/30' : 'hover:border-primary/40'}`}
            onClick={() => handleFilterChange(status)}
          >
            <CardHeader className="pb-1 pt-3 px-4">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {status === 'ALL' ? 'All Flags' : status}
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-3 px-4">
              <div className="text-2xl font-bold">
                {status === 'ALL'
                  ? (pagination?.total ?? '—')
                  : flags.filter((f) => f.status === status).length}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search flags..." className="pl-9 text-sm" disabled />
        </div>
        <Select value={currentFilter} onValueChange={handleFilterChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="REVIEWED">Reviewed</SelectItem>
            <SelectItem value="DISMISSED">Dismissed</SelectItem>
            <SelectItem value="ESCALATED">Escalated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Reason</TableHead>
              <TableHead>Offer / Merchant</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reported</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                  Loading fraud flags...
                </TableCell>
              </TableRow>
            ) : flags.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  <ShieldAlert className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  No fraud flags found
                  {currentFilter !== 'ALL' && ` with status "${currentFilter}"`}
                </TableCell>
              </TableRow>
            ) : (
              flags.map((flag) => (
                <TableRow key={flag.id} className="hover:bg-muted/20">
                  <TableCell className="font-medium">
                    {formatReason(flag.reason)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {flag.redemptionSession?.offer?.title ? (
                        <>
                          <div className="font-medium truncate max-w-[160px]">
                            {flag.redemptionSession.offer.title}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {flag.redemptionSession.offer?.merchant?.name || '—'}
                          </div>
                        </>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {flag.redemptionSession?.user?.email || '—'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={STATUS_COLORS[flag.status] || ''}
                    >
                      {flag.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(flag.reportedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReview(flag)}
                      disabled={flag.status !== 'PENDING' && flag.status !== 'ESCALATED'}
                    >
                      <Eye className="h-3.5 w-3.5 mr-1.5" />
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {((page - 1) * pagination.limit) + 1}–
            {Math.min(page * pagination.limit, pagination.total)} of {pagination.total}
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!pagination.hasPrevious || loading}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((p) => p + 1)}
              disabled={!pagination.hasNext || loading}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Review Dialog */}
      <FraudReviewDialog
        flag={selectedFlag}
        open={reviewOpen}
        onOpenChange={setReviewOpen}
      />
    </div>
  );
}
