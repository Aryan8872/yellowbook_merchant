'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMerchants, useApproveMerchant, useRejectMerchant, useSuspendMerchant } from '@/lib/admin/hooks/use-merchants-query';
import { useSubscriptionPlans } from '@/lib/admin/hooks/use-subscriptions-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Search, MoreHorizontal, Check, X, Ban, Eye, Plus, Pencil } from 'lucide-react';
import CustomSpinner from '@/components/merchant/custom-spinner';
import { ErrorFallback } from '@/components/ui/error-fallback';
import { MerchantFormDialog } from '@/lib/admin/components/merchant-form-dialog';
import { MerchantMap } from '@/components/map/merchant-map';
import { Map, MapPinned } from 'lucide-react';
import { useDebounce } from '@/lib/utils/use-debounce';

export default function AdminMerchantsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'table' | 'map'>('table');
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    action: 'approve' | 'reject' | 'suspend';
    merchantId: string;
  }>({ open: false, action: 'approve', merchantId: '' });
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [approveForm, setApproveForm] = useState({
    planId: '',
    durationDays: '180',
    isTrial: false,
  });
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState<any>(null);

  const debouncedSearch = useDebounce(searchQuery.trim(), 300);

  // TanStack Query for fetching merchants
  const { data: merchantsData, isLoading, error, refetch } = useMerchants({
    search: debouncedSearch || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  // Mutations
  const approveMerchantMutation = useApproveMerchant();
  const rejectMerchantMutation = useRejectMerchant();
  const suspendMerchantMutation = useSuspendMerchant();

  const merchants = Array.isArray(merchantsData)
    ? merchantsData
    : (Array.isArray(merchantsData?.data) ? merchantsData.data : []);
  const total = merchantsData?.pagination?.total ?? merchants.length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'default';
      case 'PENDING_REVIEW':
        return 'secondary';
      case 'ARCHIVED':
        return 'destructive';
      case 'SUSPENDED':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const { data: plansData } = useSubscriptionPlans({ audience: 'MERCHANT' });
  const merchantPlans: any[] = (Array.isArray(plansData) ? plansData : (plansData as any)?.data ?? []).filter(
    (p: any) => p.audience === 'MERCHANT' && p.isActive && !p.isArchived
  );

  const handleAction = async () => {
    try {
      if (actionDialog.action === 'approve') {
        await approveMerchantMutation.mutateAsync({
          merchantId: actionDialog.merchantId,
          notes: notes || undefined,
          planId: approveForm.planId || undefined,
          durationDays: approveForm.durationDays ? parseInt(approveForm.durationDays, 10) : undefined,
          isTrial: approveForm.isTrial,
        });
      } else if (actionDialog.action === 'reject') {
        await rejectMerchantMutation.mutateAsync({ merchantId: actionDialog.merchantId, reason });
      } else if (actionDialog.action === 'suspend') {
        await suspendMerchantMutation.mutateAsync({ merchantId: actionDialog.merchantId, reason: reason || 'Suspended by admin' });
      }
      setActionDialog({ open: false, action: 'approve', merchantId: '' });
      setReason('');
      setNotes('');
    } catch (error) {
      console.error('Failed to perform action:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Merchants</h1>
          <p className="text-muted-foreground">
            Manage merchant accounts and approvals
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedMerchant(null);
            setFormDialogOpen(true);
          }}
          className="bg-amber-600 hover:bg-amber-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Merchant
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search merchants by name, email, phone..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={(val) => val && setStatusFilter(val)}>
          <SelectTrigger className="w-45">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="PENDING_REVIEW">Pending</SelectItem>
            <SelectItem value="ACTIVE">Approved</SelectItem>
            <SelectItem value="ARCHIVED">Rejected</SelectItem>
            <SelectItem value="SUSPENDED">Suspended</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('table')}
          >
            <Table className="h-4 w-4 mr-2" />
            Table
          </Button>
          <Button
            variant={viewMode === 'map' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('map')}
          >
            <Map className="h-4 w-4 mr-2" />
            Map
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="py-12">
          <CustomSpinner />
        </div>
      )}
      
      {error && !isLoading && (
        <ErrorFallback
          title="Failed to Load Merchants"
          message={error.message || 'An error occurred'}
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !error && (
        <>
          {viewMode === 'map' ? (
            <div className="border rounded-lg overflow-hidden">
              <MerchantMap
                merchants={merchants.map((m) => ({
                  id: m.id,
                  name: m.name,
                  lat: m.branches?.[0]?.lat || 27.7172,
                  lng: m.branches?.[0]?.lng || 85.324,
                  status: m.status,
                }))}
                className="h-150"
              />
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business Name</TableHead>
                    <TableHead>Contact Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Branches</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {merchants.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No merchants found
                      </TableCell>
                    </TableRow>
                  ) : (
                    merchants.map((merchant) => (
                  <TableRow key={merchant.id}>
                    <TableCell className="font-medium">{merchant.name}</TableCell>
                    <TableCell>{merchant.contactEmail}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(merchant.status)}>
                        {merchant.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {merchant.activeSubscription ? (
                        <div className="flex flex-col gap-1 items-start">
                          <Badge
                            variant="outline"
                            className="text-xs border-amber-400 text-amber-700 bg-amber-50 dark:bg-amber-950 dark:text-amber-300"
                          >
                            {merchant.activeSubscription.plan.name}
                            {merchant.activeSubscription.isTrial && (
                              <span className="ml-1 text-[10px] opacity-70">(Trial)</span>
                            )}
                          </Badge>
                          {(() => {
                            const end = merchant.activeSubscription.currentPeriodEnd;
                            if (!end) return null;
                            const days = Math.ceil((new Date(end).getTime() - Date.now()) / 86400000);
                            if (days <= 0) {
                              return <span className="inline-flex items-center text-[10px] font-medium text-rose-600 dark:text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">Expired</span>;
                            }
                            if (days <= 14) {
                              return <span className="inline-flex items-center text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">{days}d left</span>;
                            }
                            return <span className="inline-flex items-center text-[10px] text-muted-foreground">{days}d left</span>;
                          })()}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">No Plan</span>
                      )}
                    </TableCell>
                    <TableCell>{merchant.branches?.length || 0}</TableCell>
                    <TableCell>{new Date(merchant.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedMerchant(merchant);
                              setFormDialogOpen(true);
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/admin/merchants/${merchant.id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {merchant.status === 'PENDING_REVIEW' && (
                            <>
                              <DropdownMenuItem onClick={() => setActionDialog({ open: true, action: 'approve', merchantId: merchant.id })}>
                                <Check className="mr-2 h-4 w-4" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setActionDialog({ open: true, action: 'reject', merchantId: merchant.id })}>
                                <X className="mr-2 h-4 w-4" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                          {merchant.status === 'ACTIVE' && (
                            <DropdownMenuItem onClick={() => setActionDialog({ open: true, action: 'suspend', merchantId: merchant.id })}>
                              <Ban className="mr-2 h-4 w-4" />
                              Suspend
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
          )}
        </>
      )}

      <Dialog open={actionDialog.open} onOpenChange={(open) => setActionDialog({ ...actionDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.action === 'approve' && 'Approve Merchant'}
              {actionDialog.action === 'reject' && 'Reject Merchant'}
              {actionDialog.action === 'suspend' && 'Suspend Merchant'}
            </DialogTitle>
            <DialogDescription>
              {actionDialog.action === 'approve' && 'This will activate the merchant account and allow them to manage their offers.'}
              {actionDialog.action === 'reject' && 'This will reject the merchant application. The merchant will need to reapply.'}
              {actionDialog.action === 'suspend' && 'This will suspend the merchant account. They will not be able to manage their offers.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {actionDialog.action === 'approve' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="merchants-approve-plan">Assign Initial Subscription</Label>
                  <Select
                    value={approveForm.planId}
                    onValueChange={(val) => {
                      const selectedPlan = merchantPlans.find((p: any) => p.id === val);
                      setApproveForm((prev) => ({
                        ...prev,
                        planId: val ?? '',
                        durationDays: selectedPlan?.durationDays ? String(selectedPlan.durationDays) : prev.durationDays,
                      }));
                    }}
                  >
                    <SelectTrigger id="merchants-approve-plan">
                      <SelectValue placeholder="Select initial plan..." />
                    </SelectTrigger>
                    <SelectContent>
                      {merchantPlans.map((p: any) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} — {p.billingCycle} ({p.durationDays ?? 30} days)
                        </SelectItem>
                      ))}
                      {merchantPlans.length === 0 && (
                        <SelectItem value="__none__" disabled>No active plans available (will use default)</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Defaults to Founding Partner tier if not specified.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="merchants-approve-days">Initial Duration (days)</Label>
                    <Input
                      id="merchants-approve-days"
                      type="number"
                      min={1}
                      max={3650}
                      value={approveForm.durationDays}
                      onChange={(e) => setApproveForm((prev) => ({ ...prev, durationDays: e.target.value }))}
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-8">
                    <input
                      type="checkbox"
                      id="merchants-approve-trial"
                      checked={approveForm.isTrial}
                      onChange={(e) => setApproveForm((prev) => ({ ...prev, isTrial: e.target.checked }))}
                      className="rounded border-gray-300 text-amber-600 focus:ring-amber-500 h-4 w-4"
                    />
                    <Label htmlFor="merchants-approve-trial" className="text-sm font-normal cursor-pointer">
                      Mark as Trial
                    </Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any notes for this approval..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
            )}
            {(actionDialog.action === 'reject' || actionDialog.action === 'suspend') && (
              <div className="space-y-2">
                <Label htmlFor="reason">
                  {actionDialog.action === 'reject' ? 'Rejection Reason' : 'Suspension Reason'}
                </Label>
                <Textarea
                  id="reason"
                  placeholder={`Enter the ${actionDialog.action} reason...`}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionDialog({ open: false, action: 'approve', merchantId: '' })}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              disabled={
                approveMerchantMutation.isPending || 
                rejectMerchantMutation.isPending || 
                suspendMerchantMutation.isPending || 
                (actionDialog.action !== 'approve' && !reason)
              }
              variant={actionDialog.action === 'approve' ? 'default' : 'destructive'}
            >
              {(approveMerchantMutation.isPending || rejectMerchantMutation.isPending || suspendMerchantMutation.isPending) 
                ? 'Processing...' 
                : actionDialog.action === 'approve' ? 'Approve' : actionDialog.action === 'reject' ? 'Reject' : 'Suspend'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <MerchantFormDialog
        merchant={selectedMerchant}
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
      />
    </div>
  );
}
