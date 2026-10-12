'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMerchantsStore } from '@/lib/admin/stores/merchants-store';
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
import { useState } from 'react';

export default function AdminMerchantsPage() {
  const router = useRouter();
  const { merchants, loading, error, fetchMerchants, approveMerchant, rejectMerchant, suspendMerchant } = useMerchantsStore();
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    action: 'approve' | 'reject' | 'suspend';
    merchantId: string;
  }>({ open: false, action: 'approve', merchantId: '' });
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMerchants({
        search: searchQuery.trim() || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter, fetchMerchants]);

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

  const handleAction = async () => {
    try {
      if (actionDialog.action === 'approve') {
        await approveMerchant({ merchantId: actionDialog.merchantId, notes });
      } else if (actionDialog.action === 'reject') {
        await rejectMerchant({ merchantId: actionDialog.merchantId, reason });
      } else if (actionDialog.action === 'suspend') {
        await suspendMerchant({ merchantId: actionDialog.merchantId, reason: reason || 'Suspended by admin' });
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
          <SelectTrigger className="w-[180px]">
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
      </div>

      {loading && (
        <div className="py-12">
          <CustomSpinner />
        </div>
      )}
      
      {error && !loading && (
        <ErrorFallback
          title="Failed to Load Merchants"
          message={error}
          onRetry={() => fetchMerchants()}
        />
      )}

      {!loading && !error && (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business Name</TableHead>
                <TableHead>Contact Email</TableHead>
                <TableHead>Status</TableHead>
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
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes for this approval..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
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
              disabled={loading || (actionDialog.action !== 'approve' && !reason)}
              variant={actionDialog.action === 'approve' ? 'default' : 'destructive'}
            >
              {loading ? 'Processing...' : actionDialog.action === 'approve' ? 'Approve' : actionDialog.action === 'reject' ? 'Reject' : 'Suspend'}
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
