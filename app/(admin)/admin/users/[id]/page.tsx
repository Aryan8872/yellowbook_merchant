'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useActivateUser, useDeactivateUser, useUpdateUser } from '@/lib/admin/hooks/use-users-query';
import { useSubscriptionPlans, useOverrideSubscription } from '@/lib/admin/hooks/use-subscriptions-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Shield,
  Calendar,
  ShieldCheck,
  ShieldX,
  CreditCard,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Infinity,
} from 'lucide-react';
import CustomSpinner from '@/components/merchant/custom-spinner';
import { ErrorFallback } from '@/components/ui/error-fallback';

function formatDate(dateStr?: string | null) {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function formatDateTime(dateStr?: string | null) {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function daysUntil(dateStr?: string | null): number | null {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

function EntitlementRow({ label, value }: { label: string; value: any }) {
  const isUnlimited = value === -1 || value === 999999;
  const display =
    value === null || value === undefined ? 'N/A'
    : typeof value === 'boolean' ? (value ? 'Yes' : 'No')
    : isUnlimited ? 'Unlimited'
    : String(value);

  return (
    <div className="flex items-center justify-between py-2 text-sm">
      <span className="text-muted-foreground capitalize">
        {label.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
      </span>
      <span className={`font-medium flex items-center gap-1 ${isUnlimited ? 'text-indigo-600 dark:text-indigo-400' : ''}`}>
        {isUnlimited && <Infinity className="h-3 w-3" />}
        {display}
      </span>
    </div>
  );
}

export default function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const { data: user, isLoading, error, refetch } = useUser(id);
  const { data: plansData } = useSubscriptionPlans({ audience: 'USER' });
  const activateUser = useActivateUser();
  const deactivateUser = useDeactivateUser();
  const overrideSubscription = useOverrideSubscription();
  const updateUser = useUpdateUser();

  const [overrideDialogOpen, setOverrideDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [deactivateReason, setDeactivateReason] = useState('');
  const [editForm, setEditForm] = useState({
    name: '',
    role: 'USER' as 'USER' | 'MERCHANT_ADMIN' | 'MERCHANT_STAFF' | 'ADMIN',
    isActive: true,
    phone: '',
    avatarUrl: '',
  });
  const [overrideForm, setOverrideForm] = useState({
    planId: '',
    mode: 'REPLACE' as 'REPLACE' | 'EXTEND' | 'RENEW',
    customDays: '30',
    reason: '',
  });

  const plans: any[] = Array.isArray(plansData) ? plansData : (plansData as any)?.data ?? [];
  const userPlans = plans.filter((p: any) => p.audience === 'USER' && p.isActive && !p.isArchived);

  const sub = (user as any)?.activeSubscription;
  const entitlements: Record<string, any> = sub?.plan?.entitlementsJson ?? {};
  const daysLeft = daysUntil(sub?.currentPeriodEnd);

  // Pre-hydrate the override form with current subscription data when opening
  const openOverrideDialog = () => {
    const initialDays = daysLeft !== null && daysLeft > 0
      ? String(daysLeft)
      : (sub?.plan?.durationDays ? String(sub.plan.durationDays) : '30');

    setOverrideForm({
      planId: sub?.plan?.id ?? (userPlans[0]?.id || ''),
      mode: 'REPLACE',
      customDays: initialDays,
      reason: '',
    });
    setOverrideDialogOpen(true);
  };

  const openEditDialog = () => {
    if (!user) return;
    setEditForm({
      name: user.name || '',
      role: user.role,
      isActive: user.isActive,
      phone: user.phone || '',
      avatarUrl: user.avatarUrl || '',
    });
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!user) return;
    await updateUser.mutateAsync({
      id: user.id,
      data: {
        name: editForm.name,
        role: editForm.role,
        isActive: editForm.isActive,
        phone: editForm.phone,
        avatarUrl: editForm.avatarUrl,
      },
    });
    setEditDialogOpen(false);
    refetch();
  };

  const handleActivateToggle = async () => {
    if (!user) return;
    if (user.isActive) {
      setDeactivateDialogOpen(true);
    } else {
      await activateUser.mutateAsync({ userId: user.id });
    }
  };

  const handleDeactivateSubmit = async () => {
    if (!user) return;
    await deactivateUser.mutateAsync({ userId: user.id, reason: deactivateReason });
    setDeactivateDialogOpen(false);
    setDeactivateReason('');
    refetch();
  };

  const handleOverrideSubmit = async () => {
    if (!overrideForm.planId || !overrideForm.reason.trim()) return;
    await overrideSubscription.mutateAsync({
      userId: id,
      planId: overrideForm.planId,
      mode: overrideForm.mode,
      customDays: overrideForm.mode !== 'RENEW' ? parseInt(overrideForm.customDays, 10) : undefined,
      reason: overrideForm.reason,
    });
    setOverrideDialogOpen(false);
    refetch();
  };

  if (isLoading) return <div className="flex items-center justify-center py-24"><CustomSpinner /></div>;
  if (error || !user) return (
    <ErrorFallback
      title="Failed to Load User"
      message={(error as any)?.message || 'User not found'}
      onRetry={() => refetch()}
    />
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{user.name || user.email}</h1>
          <p className="text-muted-foreground text-sm">User Profile &amp; Subscription</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={openEditDialog}
          >
            Edit Profile
          </Button>
          <Button
            variant={user.isActive ? 'destructive' : 'default'}
            size="sm"
            onClick={handleActivateToggle}
            disabled={activateUser.isPending || deactivateUser.isPending}
          >
            {user.isActive
              ? <><ShieldX className="mr-2 h-4 w-4" />Deactivate</>
              : <><ShieldCheck className="mr-2 h-4 w-4" />Activate</>}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={openOverrideDialog}
            className="border-indigo-400 text-indigo-700 hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-indigo-950"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            {sub ? 'Manage Plan' : 'Assign Plan'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Profile Card ─────────────────────────────────────────────── */}
        <div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name || 'avatar'} className="w-14 h-14 rounded-full object-cover border" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                    <User className="h-7 w-7 text-indigo-600 dark:text-indigo-300" />
                  </div>
                )}
                <div>
                  <p className="font-semibold">{user.name || 'Unnamed'}</p>
                  <Badge variant="outline" className="text-xs mt-0.5">{user.role}</Badge>
                </div>
              </div>
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    <span>{user.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Shield className="h-3.5 w-3.5 shrink-0" />
                  <span>Email {user.isVerified ? 'verified' : 'not verified'}</span>
                  {user.isVerified
                    ? <CheckCircle2 className="h-3 w-3 text-green-500 ml-auto" />
                    : <AlertTriangle className="h-3 w-3 text-amber-500 ml-auto" />}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                  <span>Joined {formatDate(user.createdAt)}</span>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={user.isActive ? 'default' : 'secondary'}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              {(user as any)._count && (
                <>
                  <Separator />
                  <div className="grid grid-cols-2 gap-2 text-center text-sm">
                    <div className="rounded-md bg-muted/40 p-2">
                      <p className="font-semibold text-lg">{(user as any)._count.redemptions}</p>
                      <p className="text-xs text-muted-foreground">Redemptions</p>
                    </div>
                    <div className="rounded-md bg-muted/40 p-2">
                      <p className="font-semibold text-lg">{(user as any)._count.subscriptionRecords}</p>
                      <p className="text-xs text-muted-foreground">Sub History</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Subscription + Entitlements ───────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          <Card className={sub ? 'border-indigo-200 dark:border-indigo-800' : ''}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Active Subscription
                </CardTitle>
                {sub && (
                  <Badge
                    variant="outline"
                    className={sub.isTrial
                      ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900 dark:text-amber-200'
                      : 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900 dark:text-indigo-200'
                    }
                  >
                    {sub.isTrial ? 'Trial' : 'Active'}
                  </Badge>
                )}
              </div>
              {!sub && <CardDescription>This user has no active subscription plan.</CardDescription>}
            </CardHeader>
            <CardContent>
              {sub ? (
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xl font-bold">{sub.plan.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {sub.plan.code} &middot; {sub.plan.billingCycle}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">
                        NPR {Number(sub.plan.priceNpr).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">/ {sub.plan.billingCycle?.toLowerCase()}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Period Start</p>
                      <p className="font-medium flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />{formatDate(sub.currentPeriodStart)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Period End</p>
                      <p className={`font-medium flex items-center gap-1 ${
                        daysLeft !== null && daysLeft <= 7 ? 'text-red-600 dark:text-red-400'
                        : daysLeft !== null && daysLeft <= 14 ? 'text-amber-600 dark:text-amber-400'
                        : ''
                      }`}>
                        <Clock className="h-3.5 w-3.5" />
                        {formatDate(sub.currentPeriodEnd)}
                        {daysLeft !== null && (
                          <span className="text-xs opacity-70 ml-1">
                            ({daysLeft > 0 ? `${daysLeft}d left` : 'Expired'})
                          </span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Auto Renew</p>
                      <p className="font-medium flex items-center gap-1">
                        <RefreshCw className="h-3.5 w-3.5" />{sub.autoRenew ? 'Yes' : 'No'}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Source</p>
                      <p className="font-medium">
                        {sub.isManualOverride
                          ? <span className="text-amber-600 dark:text-amber-400">Manual Override</span>
                          : 'Standard'}
                      </p>
                    </div>
                  </div>
                  {sub.isManualOverride && sub.overrideReason && (
                    <div className="rounded-md bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-3 text-sm text-amber-800 dark:text-amber-200">
                      <strong>Override reason:</strong> {sub.overrideReason}
                    </div>
                  )}
                  {sub.gracePeriodEndsAt && (
                    <div className="rounded-md bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 p-3 text-sm text-red-800 dark:text-red-200 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      Grace period ends {formatDateTime(sub.gracePeriodEndsAt)}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
                  <CreditCard className="h-10 w-10 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">
                    No active plan. Use <strong>Assign Plan</strong> to assign one manually.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={openOverrideDialog}
                    className="border-indigo-400 text-indigo-700 hover:bg-indigo-50 dark:text-indigo-300"
                  >
                    <CreditCard className="mr-2 h-3.5 w-3.5" />
                    Assign Plan
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {sub && Object.keys(entitlements).length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Plan Entitlements</CardTitle>
                <CardDescription>Quota limits granted by the active plan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="divide-y divide-border">
                  {Object.entries(entitlements).map(([key, val]) => (
                    <EntitlementRow key={key} label={key} value={val} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* ── Override Plan Dialog ─────────────────────────────────────────── */}
      <Dialog open={overrideDialogOpen} onOpenChange={setOverrideDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{sub ? 'Manage Subscription Plan' : 'Assign Subscription Plan'}</DialogTitle>
            <DialogDescription>
              {sub
                ? `Currently on: ${sub.plan?.name} — ${daysLeft != null && daysLeft > 0 ? `${daysLeft} days remaining` : 'Expired'}`
                : 'Manually assign a USER subscription plan. This creates an override record in the system.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Mode selector — only shown when user already has a subscription */}
            {sub && (
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
                            nextDays = '30';
                          } else if (m === 'REPLACE') {
                            nextDays = daysLeft !== null && daysLeft > 0 ? String(daysLeft) : '30';
                          }
                          return { ...f, mode: m, customDays: nextDays };
                        });
                      }}
                      className={`px-3 py-2 rounded-md border text-xs font-medium transition-colors ${
                        overrideForm.mode === m
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'border-border text-muted-foreground hover:border-indigo-400'
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
              <Label htmlFor="override-plan">Select Plan</Label>
              <Select
                value={overrideForm.planId}
                onValueChange={(val) => {
                  const targetPlan = userPlans.find((p: any) => p.id === val);
                  setOverrideForm((f) => ({
                    ...f,
                    planId: val ?? '',
                    customDays: targetPlan?.durationDays ? String(targetPlan.durationDays) : f.customDays,
                  }));
                }}
              >
                <SelectTrigger id="override-plan">
                  <SelectValue placeholder="Choose a USER plan..." />
                </SelectTrigger>
                <SelectContent>
                  {userPlans.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} — NPR {Number(p.priceNpr).toLocaleString()} / {p.billingCycle}
                    </SelectItem>
                  ))}
                  {userPlans.length === 0 && (
                    <SelectItem value="__none__" disabled>No active USER plans available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            {overrideForm.mode !== 'RENEW' && (
              <div className="space-y-2">
                <Label htmlFor="override-days">
                  {overrideForm.mode === 'EXTEND' ? 'Days to add' : 'Duration (days)'}
                </Label>
                <Input
                  id="override-days"
                  type="number"
                  min={1}
                  max={3650}
                  value={overrideForm.customDays}
                  onChange={(e) => setOverrideForm((f) => ({ ...f, customDays: e.target.value }))}
                />
                {overrideForm.mode === 'EXTEND' && sub?.currentPeriodEnd && (
                  <p className="text-xs text-muted-foreground">
                    New end: {new Date(new Date(sub.currentPeriodEnd).getTime() + parseInt(overrideForm.customDays || '0') * 86400000).toLocaleDateString()}
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
              <Label htmlFor="override-reason">Reason <span className="text-destructive">*</span></Label>
              <Textarea
                id="override-reason"
                placeholder="e.g. Promo grant, compensation, beta access..."
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
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {overrideSubscription.isPending ? 'Saving...' : sub ? 'Update Plan' : 'Assign Plan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Profile Dialog ─────────────────────────────────────────── */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User Profile</DialogTitle>
            <DialogDescription>Update user information and settings.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select
                value={editForm.role}
                onValueChange={(val) => setEditForm((f) => ({ ...f, role: val as any }))}
              >
                <SelectTrigger id="edit-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="MERCHANT_STAFF">Merchant Staff</SelectItem>
                  <SelectItem value="MERCHANT_ADMIN">Merchant Admin</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={editForm.phone}
                onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-avatar">Avatar URL</Label>
              <Input
                id="edit-avatar"
                value={editForm.avatarUrl}
                onChange={(e) => setEditForm((f) => ({ ...f, avatarUrl: e.target.value }))}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-active"
                checked={editForm.isActive}
                onChange={(e) => setEditForm((f) => ({ ...f, isActive: e.target.checked }))}
                className="h-4 w-4"
              />
              <Label htmlFor="edit-active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleEditSubmit}
              disabled={updateUser.isPending}
            >
              {updateUser.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Deactivate Dialog ─────────────────────────────────────────── */}
      <Dialog open={deactivateDialogOpen} onOpenChange={setDeactivateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Deactivate User</DialogTitle>
            <DialogDescription>
              Are you sure you want to deactivate this user? They will no longer be able to access the platform.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="deactivate-reason">Reason <span className="text-destructive">*</span></Label>
              <Textarea
                id="deactivate-reason"
                placeholder="Please provide a reason for deactivation..."
                rows={3}
                value={deactivateReason}
                onChange={(e) => setDeactivateReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeactivateDialogOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleDeactivateSubmit}
              disabled={!deactivateReason.trim() || deactivateUser.isPending}
            >
              {deactivateUser.isPending ? 'Deactivating...' : 'Deactivate User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

