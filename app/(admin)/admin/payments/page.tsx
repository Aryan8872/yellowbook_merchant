'use client';

import React, { useState } from 'react';
import { usePayments, useVerifyManualPayment } from '@/lib/admin/hooks/use-payments-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  CreditCard,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Eye,
  RefreshCw,
  Building2,
  User,
  ShieldCheck,
} from 'lucide-react';
import type { PaymentTransactionItem } from '@/lib/api/admin/payments-api';

function formatDate(isoString?: string | null) {
  if (!isoString) return 'N/A';
  try {
    return new Date(isoString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export default function AdminPaymentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [gateway, setGateway] = useState<string>('all');
  const [status, setStatus] = useState<string>('all');

  // Verify Dialog state
  const [verifyTarget, setVerifyTarget] = useState<PaymentTransactionItem | null>(null);
  const [verifyNotes, setVerifyNotes] = useState('');

  // Inspector Sheet state
  const [inspectedTx, setInspectedTx] = useState<PaymentTransactionItem | null>(null);

  const { data, isLoading, refetch } = usePayments({
    page,
    limit: 15,
    search: search.trim() || undefined,
    gateway: gateway !== 'all' ? gateway : undefined,
    status: status !== 'all' ? status : undefined,
  });

  const verifyMutation = useVerifyManualPayment();

  const transactions = data?.data || [];
  const pagination = data?.pagination;

  const handleConfirmVerify = async () => {
    if (!verifyTarget) return;
    await verifyMutation.mutateAsync({
      transactionId: verifyTarget.id,
      notes: verifyNotes.trim() || undefined,
    });
    setVerifyTarget(null);
    setVerifyNotes('');
  };

  const getGatewayBadge = (gw: string) => {
    switch (gw) {
      case 'KHALTI':
        return <Badge className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-[11px]">Khalti</Badge>;
      case 'ESEWA':
        return <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px]">eSewa</Badge>;
      case 'MANUAL_ADMIN':
        return <Badge variant="outline" className="border-amber-500/40 text-amber-500 text-[11px]">Manual Admin</Badge>;
      default:
        return <Badge variant="outline" className="text-[11px]">{gw}</Badge>;
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'SUCCESS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="h-3 w-3" />
            Success
          </span>
        );
      case 'PENDING':
      case 'INITIATED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            <Clock className="h-3 w-3" />
            {st}
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
            <AlertCircle className="h-3 w-3" />
            Failed
          </span>
        );
      default:
        return <Badge variant="outline">{st}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-amber-500" />
            Payments & Transactions Ledger
          </h1>
          <p className="text-xs text-muted-foreground">
            Audit, track, and manually verify eSewa, Khalti, and manual subscription billing payments
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading}
          className="text-xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Ledger
        </Button>
      </div>

      {/* Filter Toolbar */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by order ID or gateway ref ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 text-xs"
            />
          </div>

          <div className="flex gap-2">
            <Select
              value={gateway}
              onValueChange={(val) => {
                setGateway(val || 'all');
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[140px] text-xs">
                <SelectValue placeholder="All Gateways" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Gateways</SelectItem>
                <SelectItem value="KHALTI">Khalti</SelectItem>
                <SelectItem value="ESEWA">eSewa</SelectItem>
                <SelectItem value="MANUAL_ADMIN">Manual</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={status}
              onValueChange={(val) => {
                setStatus(val || 'all');
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[140px] text-xs">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="SUCCESS">Success</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="INITIATED">Initiated</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Order ID</TableHead>
                <TableHead className="text-xs">Gateway</TableHead>
                <TableHead className="text-xs">Amount</TableHead>
                <TableHead className="text-xs">Purchaser / Target</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Date</TableHead>
                <TableHead className="text-xs text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-xs text-muted-foreground">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-amber-500" />
                    Loading payment records...
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-xs text-muted-foreground">
                    No transactions found matching criteria.
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-mono text-xs font-semibold">
                      {tx.orderId}
                      {tx.gatewayRefId && (
                        <div className="text-[10px] text-muted-foreground font-normal">
                          Ref: {tx.gatewayRefId}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{getGatewayBadge(tx.gateway)}</TableCell>
                    <TableCell className="font-semibold text-xs">
                      NPR {Number(tx.amountNpr).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs">
                      {tx.merchantId ? (
                        <div className="flex items-center gap-1.5 text-foreground font-medium">
                          <Building2 className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          <span>Merchant</span>
                          <span className="text-[10px] text-muted-foreground font-mono">({tx.merchantId.slice(0, 8)}...)</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-foreground font-medium">
                          <User className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                          <span>{tx.user?.name || 'Consumer User'}</span>
                        </div>
                      )}
                      {tx.subscription?.plan && (
                        <div className="text-[11px] text-muted-foreground">
                          Plan: {tx.subscription.plan.name}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(tx.status)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(tx.createdAt)}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setInspectedTx(tx)}
                        className="h-7 px-2 text-xs"
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        Details
                      </Button>
                      {tx.status !== 'SUCCESS' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setVerifyTarget(tx);
                            setVerifyNotes('');
                          }}
                          className="h-7 px-2 text-xs border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                        >
                          <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                          Verify
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="p-3 border-t flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} records)
              </span>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!pagination.hasPrevious}
                  className="h-7 text-xs"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!pagination.hasNext}
                  className="h-7 text-xs"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Verification Dialog */}
      <Dialog open={Boolean(verifyTarget)} onOpenChange={(open) => !open && setVerifyTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-amber-500" />
              Manual Payment Verification
            </DialogTitle>
            <DialogDescription className="text-xs">
              Confirm that funds for order <strong>{verifyTarget?.orderId}</strong> (NPR {verifyTarget?.amountNpr}) have been received.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="p-3 bg-muted/40 rounded-lg space-y-1">
              <div><strong>Gateway:</strong> {verifyTarget?.gateway}</div>
              <div><strong>Amount:</strong> NPR {Number(verifyTarget?.amountNpr).toLocaleString()}</div>
              <div><strong>Current Status:</strong> {verifyTarget?.status}</div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-muted-foreground">Audit Reason / Admin Notes</label>
              <Input
                placeholder="e.g. Bank slip reference #99214 verified manually"
                value={verifyNotes}
                onChange={(e) => setVerifyNotes(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setVerifyTarget(null)}
              disabled={verifyMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmVerify}
              disabled={verifyMutation.isPending}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold"
            >
              {verifyMutation.isPending ? 'Verifying...' : 'Mark Verified & Activate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transaction Details Inspector Sheet */}
      <Sheet open={Boolean(inspectedTx)} onOpenChange={(open) => !open && setInspectedTx(null)}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader className="pb-4 border-b">
            <SheetTitle className="text-base font-bold flex items-center gap-2">
              <FileText className="h-5 w-5 text-amber-500" />
              Transaction #{inspectedTx?.orderId}
            </SheetTitle>
            <SheetDescription className="text-xs">
              Full relational metadata and invoice tracking
            </SheetDescription>
          </SheetHeader>

          {inspectedTx && (
            <div className="space-y-4 py-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-muted/40 rounded-lg">
                <div>
                  <span className="text-muted-foreground">Order ID</span>
                  <div className="font-mono font-semibold">{inspectedTx.orderId}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Gateway</span>
                  <div>{getGatewayBadge(inspectedTx.gateway)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Amount</span>
                  <div className="font-bold">NPR {Number(inspectedTx.amountNpr).toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Status</span>
                  <div>{getStatusBadge(inspectedTx.status)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Created At</span>
                  <div>{formatDate(inspectedTx.createdAt)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Paid At</span>
                  <div>{formatDate(inspectedTx.paidAt)}</div>
                </div>
              </div>

              {inspectedTx.invoice && (
                <div className="p-3 border rounded-lg space-y-1">
                  <div className="font-semibold text-foreground flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-emerald-500" />
                    Tax Invoice Generated
                  </div>
                  <div><strong>Number:</strong> {inspectedTx.invoice.invoiceNumber}</div>
                  <div><strong>Status:</strong> {inspectedTx.invoice.status}</div>
                </div>
              )}

              {inspectedTx.failureReason && (
                <div className="p-3 border border-rose-500/30 bg-rose-500/10 rounded-lg text-rose-500">
                  <strong>Failure Reason:</strong> {inspectedTx.failureReason}
                </div>
              )}

              <div className="space-y-1">
                <span className="text-muted-foreground font-semibold">Raw Transaction Object</span>
                <pre className="p-3 bg-slate-950 text-slate-100 rounded-lg text-[11px] font-mono overflow-x-auto max-h-60">
                  {JSON.stringify(inspectedTx, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
