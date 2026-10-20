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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Check,
  X,
  Ban,
  Building2,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Package,
  Users,
  Activity,
  Pencil,
  Plus,
  CreditCard,
  Clock,
  RefreshCw,
  AlertTriangle,
  Infinity,
  Sparkles,
} from 'lucide-react';
import { MerchantFormDialog } from '@/lib/admin/components/merchant-form-dialog';
import { BranchForm } from '@/components/merchant/branch/BranchForm';
import { useMerchantBilling } from '@/lib/admin/hooks/use-merchants-query';
import { useSubscriptionPlans, useOverrideSubscription } from '@/lib/admin/hooks/use-subscriptions-query';

export default function MerchantDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const merchantId = params.id as string;
  const { fetchMerchant, approveMerchant, rejectMerchant, suspendMerchant, reactivateMerchant, loading } = useMerchantsStore();
  const [merchant, setMerchant] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    action: 'approve' | 'reject' | 'suspend' | 'reactivate';
  }>({ open: false, action: 'approve' });
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  const [editingBranch, setEditingBranch] = useState<any>(null);
  const [branchDialogOpen, setBranchDialogOpen] = useState(false);

  // Subscription state and queries
  const { data: billingData, refetch: refetchBilling } = useMerchantBilling(merchantId);
  const { data: plansData } = useSubscriptionPlans({ audience: 'MERCHANT' });
  const overrideSubscription = useOverrideSubscription();

  const [overrideDialogOpen, setOverrideDialogOpen] = useState(false);
  const [overrideForm, setOverrideForm] = useState({
    planId: '',
    mode: 'REPLACE' as 'REPLACE' | 'EXTEND' | 'RENEW',
    customDays: '30',
    reason: '',
  });

  // Approval plan selection state
  const [approveForm, setApproveForm] = useState({
    planId: '',
    durationDays: '180',
    isTrial: false,
  });

  const merchantPlans: any[] = (Array.isArray(plansData) ? plansData : (plansData as any)?.data ?? []).filter(
    (p: any) => p.audience === 'MERCHANT' && p.isActive && !p.isArchived
  );

  const activeSub = billingData?.subscription || merchant?.activeSubscription;
  const remainingDays = billingData?.subscription?.remainingDays ?? (activeSub?.currentPeriodEnd ? Math.max(0, Math.ceil((new Date(activeSub.currentPeriodEnd).getTime() - Date.now()) / 86400000)) : null);

  const openOverrideDialog = () => {
    // When opening in REPLACE mode: pre-hydrate with actual remaining days if positive, otherwise plan duration or 30
    const initialDays = remainingDays !== null && remainingDays > 0
      ? String(remainingDays)
      : (activeSub?.plan?.durationDays ? String(activeSub.plan.durationDays) : '30');

    setOverrideForm({
      planId: activeSub?.plan?.id ?? (merchantPlans[0]?.id || ''),
      mode: 'REPLACE',
      customDays: initialDays,
      reason: '',
    });
    setOverrideDialogOpen(true);
  };

  const loadMerchant = async () => {
    const data = await fetchMerchant(merchantId);
    if (data) {
      setMerchant(data);
    }
    refetchBilling();
  };

  useEffect(() => {
    loadMerchant();
  }, [merchantId, fetchMerchant]);

  // Set default plan for approval when plans load
  useEffect(() => {
    if (merchantPlans.length > 0 && !approveForm.planId) {
      const foundingPlan = merchantPlans.find((p: any) => p.code === 'MERCHANT_FOUNDING') || merchantPlans[0];
      setApproveForm((prev) => ({
        ...prev,
        planId: foundingPlan.id,
        durationDays: foundingPlan.durationDays ? String(foundingPlan.durationDays) : '180',
      }));
    }
  }, [merchantPlans, approveForm.planId]);

  const handleAction = async () => {
    if (!merchant) return;

    try {
      if (actionDialog.action === 'approve') {
        await approveMerchant({
          merchantId,
          notes: notes || undefined,
          planId: approveForm.planId || undefined,
          durationDays: approveForm.durationDays ? parseInt(approveForm.durationDays, 10) : undefined,
          isTrial: approveForm.isTrial,
        });
      } else if (actionDialog.action === 'reject') {
        await rejectMerchant({ merchantId, reason });
      } else if (actionDialog.action === 'suspend') {
        await suspendMerchant({ merchantId, reason: reason || 'Suspended by admin' });
      } else if (actionDialog.action === 'reactivate') {
        await reactivateMerchant({ merchantId, notes: reason || undefined });
      }
      setActionDialog({ open: false, action: 'approve' });
      setReason('');
      setNotes('');
      const updated = await fetchMerchant(merchantId);
      if (updated) setMerchant(updated);
      refetchBilling();
    } catch (error) {
      console.error('Failed to perform action:', error);
    }
  };

  const handleOverrideSubmit = async () => {
    if (!overrideForm.planId || !overrideForm.reason.trim()) return;
    try {
      await overrideSubscription.mutateAsync({
        merchantId,
        planId: overrideForm.planId,
        mode: overrideForm.mode,
        customDays: overrideForm.mode !== 'RENEW' ? parseInt(overrideForm.customDays, 10) : undefined,
        reason: overrideForm.reason.trim(),
      });
      setOverrideDialogOpen(false);
      setOverrideForm({ planId: '', mode: 'REPLACE', customDays: '30', reason: '' });
      refetchBilling();
      loadMerchant();
    } catch (e) {
      console.error('Failed to override subscription:', e);
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{merchant.name}</h1>
            <p className="text-muted-foreground">Merchant details and management</p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => setEditDialogOpen(true)}
        >
          <Pencil className="mr-2 h-4 w-4" />
          Edit Merchant
        </Button>
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
            {(merchant.status === 'SUSPENDED' || merchant.status === 'ARCHIVED') && (
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => setActionDialog({ open: true, action: 'reactivate' })}
              >
                <Check className="mr-2 h-4 w-4" />
                Reactivate Merchant
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

      {/* Subscription & Entitlements Card */}
      {(() => {
        const sub = billingData?.subscription || merchant.activeSubscription;
        const quotas = billingData?.quotas;
        const plan = sub?.plan;
        const remainingDays = billingData?.subscription?.remainingDays ?? (sub?.currentPeriodEnd ? Math.max(0, Math.ceil((new Date(sub.currentPeriodEnd).getTime() - Date.now()) / 86400000)) : null);
        const isExpired = remainingDays !== null && remainingDays <= 0;
        const isExpiringSoon = remainingDays !== null && remainingDays > 0 && remainingDays <= 14;

        return (
          <Card className="border-amber-200/60 dark:border-amber-900/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <CardTitle className="text-lg">Subscription & Quota Entitlements</CardTitle>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={openOverrideDialog}
                className="border-amber-400 text-amber-700 hover:bg-amber-50 dark:border-amber-600 dark:text-amber-300"
              >
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                {sub ? 'Manage Plan' : 'Assign Plan'}
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {sub ? (
                <>
                  <div className="grid gap-4 md:grid-cols-4 p-4 rounded-lg bg-muted/40 border">
                    <div>
                      <Label className="text-muted-foreground text-xs uppercase tracking-wide">Active Plan</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-bold text-lg">{plan?.name || 'Active Plan'}</span>
                        {sub.isTrial && (
                          <Badge variant="outline" className="text-[11px] bg-amber-500/10 text-amber-700 border-amber-300 dark:text-amber-300">
                            Trial
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {plan?.code} &middot; NPR {Number(plan?.priceNpr || 0).toLocaleString()} / {plan?.billingCycle?.toLowerCase() || 'cycle'}
                      </p>
                    </div>

                    <div>
                      <Label className="text-muted-foreground text-xs uppercase tracking-wide">Status</Label>
                      <div className="mt-1">
                        <Badge
                          variant={sub.status === 'ACTIVE' && !isExpired ? 'default' : 'destructive'}
                          className="capitalize"
                        >
                          {isExpired ? 'Expired' : sub.status.toLowerCase()}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Started {sub.startedAt ? new Date(sub.startedAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>

                    <div>
                      <Label className="text-muted-foreground text-xs uppercase tracking-wide">Period End</Label>
                      <div className="mt-1 flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold text-sm">
                          {sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <div className="mt-1">
                        {remainingDays !== null && (
                          <span
                            className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
                              isExpired
                                ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                                : isExpiringSoon
                                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                                : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                            }`}
                          >
                            {isExpired ? 'Expired' : `${remainingDays} days remaining`}
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label className="text-muted-foreground text-xs uppercase tracking-wide">Type</Label>
                      <div className="mt-1">
                        {sub.isManualOverride ? (
                          <span className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-300/40">
                            Manual Override
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Standard Billing</span>
                        )}
                      </div>
                      {sub.overrideReason && (
                        <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1" title={sub.overrideReason}>
                          Reason: {sub.overrideReason}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Quotas & Limits Progress Section */}
                  <div>
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      Entitlement Quota Usage
                    </h4>
                    <div className="grid gap-4 md:grid-cols-3">
                      {/* Branches Quota */}
                      <div className="p-3.5 rounded-lg border bg-card">
                        <div className="flex justify-between items-center text-xs mb-1.5">
                          <span className="font-medium">Branches</span>
                          <span className="text-muted-foreground font-mono">
                            {quotas?.branches.used ?? merchant._count?.branches ?? 0} / {quotas?.branches.isUnlimited ? '∞ Unlimited' : (quotas?.branches.max ?? (plan?.entitlementsJson?.maxBranches === -1 ? '∞' : (plan?.entitlementsJson?.maxBranches ?? 3)))}
                          </span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          {(() => {
                            const used = quotas?.branches.used ?? merchant._count?.branches ?? 0;
                            const max = quotas?.branches.max ?? plan?.entitlementsJson?.maxBranches ?? 3;
                            const isUnlim = quotas?.branches.isUnlimited || max === -1;
                            const pct = isUnlim ? 15 : Math.min(100, Math.round((used / Math.max(1, max)) * 100));
                            const color = pct >= 100 ? 'bg-rose-500' : pct >= 80 ? 'bg-amber-500' : 'bg-emerald-500';
                            return <div className={`h-full ${color} transition-all`} style={{ width: `${pct}%` }} />;
                          })()}
                        </div>
                      </div>

                      {/* Offers Quota */}
                      <div className="p-3.5 rounded-lg border bg-card">
                        <div className="flex justify-between items-center text-xs mb-1.5">
                          <span className="font-medium">Active Offers</span>
                          <span className="text-muted-foreground font-mono">
                            {quotas?.offers.used ?? merchant._count?.offers ?? 0} / {quotas?.offers.isUnlimited ? '∞ Unlimited' : (quotas?.offers.max ?? (plan?.entitlementsJson?.maxActiveOffers === -1 ? '∞' : (plan?.entitlementsJson?.maxActiveOffers ?? 7)))}
                          </span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          {(() => {
                            const used = quotas?.offers.used ?? merchant._count?.offers ?? 0;
                            const max = quotas?.offers.max ?? plan?.entitlementsJson?.maxActiveOffers ?? 7;
                            const isUnlim = quotas?.offers.isUnlimited || max === -1;
                            const pct = isUnlim ? 15 : Math.min(100, Math.round((used / Math.max(1, max)) * 100));
                            const color = pct >= 100 ? 'bg-rose-500' : pct >= 80 ? 'bg-amber-500' : 'bg-emerald-500';
                            return <div className={`h-full ${color} transition-all`} style={{ width: `${pct}%` }} />;
                          })()}
                        </div>
                      </div>

                      {/* Boosts / Extra Entitlements */}
                      <div className="p-3.5 rounded-lg border bg-card">
                        <div className="flex justify-between items-center text-xs mb-1.5">
                          <span className="font-medium">Featured Boosts</span>
                          <span className="text-muted-foreground font-mono">
                            {quotas?.featuredBoosts.allowed ?? plan?.entitlementsJson?.featuredBoostCount ?? 0} included
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground pt-1 flex items-center justify-between">
                          <span>POS Integration:</span>
                          <span className="font-semibold text-foreground">
                            {plan?.entitlementsJson?.posIntegration ? 'Enabled' : 'Not included'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <p className="text-sm">No active subscription plan assigned to this merchant.</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setOverrideDialogOpen(true)}
                    className="mt-3 border-amber-400 text-amber-700 hover:bg-amber-50"
                  >
                    Assign Subscription Plan
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })()}

      {/* Branches */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Branches ({merchant.branches?.length || 0})</CardTitle>
          <Button
            size="sm"
            onClick={() => {
              setEditingBranch(null);
              setBranchDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Branch
          </Button>
        </CardHeader>
        <CardContent>
          {merchant.branches?.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {merchant.branches.map((branch: any) => (
                  <TableRow key={branch.id}>
                    <TableCell className="font-medium">{branch.name}</TableCell>
                    <TableCell>{[branch.address, branch.city].filter(Boolean).join(', ') || 'Not provided'}</TableCell>
                    <TableCell>{branch.phone || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={branch.isActive ? 'default' : 'secondary'}>
                        {branch.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingBranch(branch);
                          setBranchDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
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
                    <TableCell>{typeof offer.category === 'object' ? offer.category?.name : (offer.category || 'N/A')}</TableCell>
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
              {actionDialog.action === 'reactivate' && 'Reactivate Merchant'}
            </DialogTitle>
            <DialogDescription>
              {actionDialog.action === 'approve' && 'This will activate the merchant account and allow them to manage their offers.'}
              {actionDialog.action === 'reject' && 'This will reject the merchant application. The merchant will need to reapply.'}
              {actionDialog.action === 'suspend' && 'This will suspend the merchant account. They will not be able to manage their offers.'}
              {actionDialog.action === 'reactivate' && 'This will restore the merchant account to ACTIVE status, enabling merchant portal logins and offer management.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {actionDialog.action === 'approve' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="approve-plan">Assign Initial Subscription</Label>
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
                    <SelectTrigger id="approve-plan">
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
                    <Label htmlFor="approve-days">Initial Duration (days)</Label>
                    <Input
                      id="approve-days"
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
                      id="approve-trial"
                      checked={approveForm.isTrial}
                      onChange={(e) => setApproveForm((prev) => ({ ...prev, isTrial: e.target.checked }))}
                      className="rounded border-gray-300 text-amber-600 focus:ring-amber-500 h-4 w-4"
                    />
                    <Label htmlFor="approve-trial" className="text-sm font-normal cursor-pointer">
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
            {(actionDialog.action === 'reject' || actionDialog.action === 'suspend' || actionDialog.action === 'reactivate') && (
              <div className="space-y-2">
                <Label htmlFor="reason">
                  {actionDialog.action === 'reject' ? 'Rejection Reason' : actionDialog.action === 'suspend' ? 'Suspension Reason' : 'Reactivation Reason (Optional)'}
                </Label>
                <Textarea
                  id="reason"
                  placeholder={`Enter the ${actionDialog.action} reason...`}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
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
              disabled={loading || ((actionDialog.action === 'reject' || actionDialog.action === 'suspend') && !reason)}
              className={actionDialog.action === 'reactivate' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : undefined}
              variant={actionDialog.action === 'approve' ? 'default' : actionDialog.action === 'reactivate' ? 'default' : 'destructive'}
            >
              {loading ? 'Processing...' : actionDialog.action === 'approve' ? 'Approve' : actionDialog.action === 'reject' ? 'Reject' : actionDialog.action === 'reactivate' ? 'Reactivate' : 'Suspend'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <MerchantFormDialog
        merchant={merchant}
        open={editDialogOpen}
        onOpenChange={async (open) => {
          setEditDialogOpen(open);
          if (!open) {
            const updated = await fetchMerchant(merchantId);
            if (updated) setMerchant(updated);
          }
        }}
      />

      {merchant && (
        <BranchForm
          merchantId={merchantId}
          merchant={merchant}
          branch={editingBranch}
          open={branchDialogOpen}
          onOpenChange={(open) => {
            setBranchDialogOpen(open);
            if (!open) setEditingBranch(null);
          }}
          onCreated={loadMerchant}
          onUpdated={loadMerchant}
        />
      )}

      {/* Override Plan Dialog */}
      <Dialog open={overrideDialogOpen} onOpenChange={setOverrideDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{activeSub ? 'Manage Merchant Subscription' : 'Assign Merchant Subscription'}</DialogTitle>
            <DialogDescription>
              {activeSub
                ? `Currently on: ${activeSub.plan?.name} — ${
                    activeSub.remainingDays != null && activeSub.remainingDays > 0
                      ? `${activeSub.remainingDays} days remaining`
                      : 'Expired'
                  }`
                : `Manually assign a subscription plan for ${merchant.name}. This is logged for audit purposes.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Mode selector — only shown when merchant already has a subscription */}
            {activeSub && (
              <div className="space-y-2">
                <Label>Action</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(['REPLACE', 'EXTEND', 'RENEW'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setOverrideForm((f) => {
                          let nextDays = f.customDays;
                          if (m === 'EXTEND') {
                            // Default sensible extension increment: 30 days
                            nextDays = '30';
                          } else if (m === 'REPLACE') {
                            // Current remaining days or 30
                            nextDays = remainingDays !== null && remainingDays > 0 ? String(remainingDays) : '30';
                          }
                          return { ...f, mode: m, customDays: nextDays };
                        });
                      }}
                      className={`px-3 py-2 rounded-md border text-xs font-medium transition-colors ${
                        overrideForm.mode === m
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'border-border text-muted-foreground hover:border-amber-400'
                      }`}
                    >
                      {m === 'REPLACE' ? '🔄 Replace' : m === 'EXTEND' ? '➕ Extend' : '🔃 Renew'}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {overrideForm.mode === 'REPLACE' && 'Sets an exact new period from today. Ignores remaining days.'}
                  {overrideForm.mode === 'EXTEND' && 'Adds days on top of current period end date.'}
                  {overrideForm.mode === 'RENEW' && "Restarts with the plan's default duration from today."}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="merchant-plan">Select Plan</Label>
              <Select
                value={overrideForm.planId}
                onValueChange={(val) => {
                  const targetPlan = merchantPlans.find((p: any) => p.id === val);
                  setOverrideForm((f) => ({
                    ...f,
                    planId: val ?? '',
                    customDays: targetPlan?.durationDays ? String(targetPlan.durationDays) : f.customDays,
                  }));
                }}
              >
                <SelectTrigger id="merchant-plan">
                  <SelectValue placeholder="Choose a MERCHANT plan..." />
                </SelectTrigger>
                <SelectContent>
                  {merchantPlans.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} — NPR {Number(p.priceNpr).toLocaleString()} / {p.billingCycle}
                    </SelectItem>
                  ))}
                  {merchantPlans.length === 0 && (
                    <SelectItem value="__none__" disabled>No active MERCHANT plans available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {overrideForm.mode !== 'RENEW' && (
              <div className="space-y-2">
                <Label htmlFor="merchant-override-days">
                  {overrideForm.mode === 'EXTEND' ? 'Days to add' : 'Duration (days)'}
                </Label>
                <Input
                  id="merchant-override-days"
                  type="number"
                  min={1}
                  max={3650}
                  value={overrideForm.customDays}
                  onChange={(e) => setOverrideForm((f) => ({ ...f, customDays: e.target.value }))}
                />
                {overrideForm.mode === 'EXTEND' && activeSub?.currentPeriodEnd && (
                  <p className="text-xs text-muted-foreground">
                    New end: {new Date(new Date(activeSub.currentPeriodEnd).getTime() + parseInt(overrideForm.customDays || '0') * 86400000).toLocaleDateString()}
                  </p>
                )}
                {overrideForm.mode === 'REPLACE' && (
                  <p className="text-xs text-muted-foreground">
                    New end: {new Date(Date.now() + parseInt(overrideForm.customDays || '0') * 86400000).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="merchant-override-reason">Reason <span className="text-destructive">*</span></Label>
              <Textarea
                id="merchant-override-reason"
                placeholder="e.g. Founding partner agreement, onboarding extension, custom SLA..."
                rows={2}
                value={overrideForm.reason}
                onChange={(e) => setOverrideForm((f) => ({ ...f, reason: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOverrideDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleOverrideSubmit}
              disabled={!overrideForm.planId || !overrideForm.reason.trim() || overrideSubscription.isPending}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {overrideSubscription.isPending ? 'Saving...' : activeSub ? 'Update Plan' : 'Assign Plan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
