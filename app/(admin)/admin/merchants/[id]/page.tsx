'use client'

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMerchantsStore } from '@/lib/admin/stores/merchants-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Check, X, Ban, Building2, MapPin, Phone, Mail, Calendar, Package, Users, Activity } from 'lucide-react';

export default function MerchantDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const merchantId = params.id as string;
  const { fetchMerchant, approveMerchant, rejectMerchant, suspendMerchant, loading } = useMerchantsStore();
  const [merchant, setMerchant] = useState<any>(null);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    action: 'approve' | 'reject' | 'suspend';
  }>({ open: false, action: 'approve' });
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const loadMerchant = async () => {
      const data = await fetchMerchant(merchantId);
      if (data) {
        setMerchant(data);
      }
    };
    loadMerchant();
  }, [merchantId, fetchMerchant]);

  const handleAction = async () => {
    if (!merchant) return;

    try {
      if (actionDialog.action === 'approve') {
        await approveMerchant({ merchantId, notes });
      } else if (actionDialog.action === 'reject') {
        await rejectMerchant({ merchantId, reason });
      } else if (actionDialog.action === 'suspend') {
        await suspendMerchant({ merchantId, reason: reason || 'Suspended by admin' });
      }
      setActionDialog({ open: false, action: 'approve' });
      setReason('');
      setNotes('');
      const updated = await fetchMerchant(merchantId);
      if (updated) setMerchant(updated);
    } catch (error) {
      console.error('Failed to perform action:', error);
    }
  };

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

  if (!merchant) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading merchant details...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{merchant.name}</h1>
          <p className="text-muted-foreground">Merchant details and management</p>
        </div>
      </div>

      {/* Status and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Account Status</CardTitle>
            <Badge variant={getStatusColor(merchant.status)} className="text-sm px-3 py-1">
              {merchant.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {merchant.status === 'PENDING_REVIEW' && (
              <>
                <Button
                  onClick={() => setActionDialog({ open: true, action: 'approve' })}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setActionDialog({ open: true, action: 'reject' })}
                >
                  <X className="mr-2 h-4 w-4" />
                  Reject
                </Button>
              </>
            )}
            {merchant.status === 'ACTIVE' && (
              <Button
                variant="outline"
                onClick={() => setActionDialog({ open: true, action: 'suspend' })}
              >
                <Ban className="mr-2 h-4 w-4" />
                Suspend
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Business Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label className="text-muted-foreground text-sm">Business Name</Label>
              <p className="font-medium">{merchant.name}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground text-sm">Contact Email</Label>
              <p className="font-medium flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                {merchant.contactEmail}
              </p>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground text-sm">Contact Phone</Label>
              <p className="font-medium flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                {merchant.contactPhone || 'Not provided'}
              </p>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground text-sm">Created At</Label>
              <p className="font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {new Date(merchant.createdAt).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <span>Branches</span>
              </div>
              <span className="font-bold text-2xl">{merchant._count?.branches || 0}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-muted-foreground" />
                <span>Active Offers</span>
              </div>
              <span className="font-bold text-2xl">{merchant._count?.offers || 0}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <span>Redemptions</span>
              </div>
              <span className="font-bold text-2xl">{merchant._count?.redemptions || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Branches */}
      <Card>
        <CardHeader>
          <CardTitle>Branches ({merchant.branches?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {merchant.branches?.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {merchant.branches.map((branch: any) => (
                  <TableRow key={branch.id}>
                    <TableCell className="font-medium">{branch.name}</TableCell>
                    <TableCell>{branch.address || 'Not provided'}</TableCell>
                    <TableCell>
                      <Badge variant={branch.isActive ? 'default' : 'secondary'}>
                        {branch.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-8">No branches found</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Offers */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Offers ({merchant.offers?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {merchant.offers?.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {merchant.offers.map((offer: any) => (
                  <TableRow key={offer.id}>
                    <TableCell className="font-medium">{offer.title}</TableCell>
                    <TableCell>{offer.category || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={offer.isActive ? 'default' : 'secondary'}>
                        {offer.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(offer.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-8">No offers found</p>
          )}
        </CardContent>
      </Card>

      {/* Action Confirmation Dialog */}
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
              onClick={() => setActionDialog({ open: false, action: 'approve' })}
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
    </div>
  );
}
