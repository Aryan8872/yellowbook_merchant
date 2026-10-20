'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSubscriptionPlans,
  deleteSubscriptionPlan,
  getTrialConfigs,
  updateTrialConfig,
  overrideSubscription,
  SubscriptionPlanItem,
  SystemTrialConfigItem,
} from '@/lib/api/admin/subscriptions-api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ShieldCheck, Plus, RefreshCw, Trash2, Edit3, Gift, Settings2 } from 'lucide-react';
import CustomSpinner from '@/components/merchant/custom-spinner';
import { PlanFormDialog } from '@/components/admin/subscriptions/plan-form-dialog';

export default function AdminSubscriptionsPage() {
  const queryClient = useQueryClient();
  const [selectedAudience, setSelectedAudience] = useState<'MERCHANT' | 'USER'>('MERCHANT');
  const [overrideDialogOpen, setOverrideDialogOpen] = useState(false);
  const [overrideTargetType, setOverrideTargetType] = useState<'merchant' | 'user'>('merchant');
  const [targetId, setTargetId] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [customDays, setCustomDays] = useState(60);
  const [overrideReason, setOverrideReason] = useState('');

  // Plan Form Dialog states
  const [planFormOpen, setPlanFormOpen] = useState(false);
  const [planToEdit, setPlanToEdit] = useState<SubscriptionPlanItem | null>(null);

  // Fetch plans
  const { data: plansData, isLoading: plansLoading, refetch: refetchPlans } = useQuery({
    queryKey: ['admin', 'plans'],
    queryFn: async () => {
      const res: any = await getSubscriptionPlans({ includeArchived: true });
      return Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
    },
  });

  // Fetch trial configs
  const { data: trialConfigsData, isLoading: trialLoading, refetch: refetchTrials } = useQuery({
    queryKey: ['admin', 'trial-configs'],
    queryFn: async () => {
      const res: any = await getTrialConfigs();
      return Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
    },
  });

  const deletePlanMutation = useMutation({
    mutationFn: (id: string) => deleteSubscriptionPlan(id),
    onSuccess: () => {
      toast.success('Plan archived successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] });
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to archive plan'),
  });

  const updateTrialMutation = useMutation({
    mutationFn: (data: any) => updateTrialConfig(data),
    onSuccess: () => {
      toast.success('Trial settings saved successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'trial-configs'] });
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to update trial settings'),
  });

  const overrideMutation = useMutation({
    mutationFn: (data: any) => overrideSubscription(data),
    onSuccess: () => {
      toast.success('Manual subscription granted and stacked successfully');
      setOverrideDialogOpen(false);
      setTargetId('');
      setOverrideReason('');
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to grant override'),
  });

  const plans: SubscriptionPlanItem[] = Array.isArray(plansData) ? plansData : [];
  const trialConfigs: SystemTrialConfigItem[] = Array.isArray(trialConfigsData) ? trialConfigsData : [];

  const filteredPlans = plans.filter((p) => p.audience === selectedAudience);
  const currentTrialConfig = trialConfigs.find((c) => c.audience === selectedAudience);

  const handleToggleTrial = (enabled: boolean) => {
    updateTrialMutation.mutate({
      audience: selectedAudience,
      isEnabled: enabled,
    });
  };

  const handleUpdateTrialDays = (days: number) => {
    updateTrialMutation.mutate({
      audience: selectedAudience,
      defaultPeriodDays: days,
    });
  };

  const handleSaveOverride = () => {
    if (!targetId || !selectedPlanId || !overrideReason) {
      toast.error('Please enter target ID, plan, and audit reason');
      return;
    }
    overrideMutation.mutate({
      merchantId: overrideTargetType === 'merchant' ? targetId : undefined,
      userId: overrideTargetType === 'user' ? targetId : undefined,
      planId: selectedPlanId,
      customDays,
      isTrial: true,
      reason: overrideReason,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-indigo-500" />
            Plans & Subscriptions
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure partner tiers, trial duration, quotas, and manage custom overrides
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              setPlanToEdit(null);
              setPlanFormOpen(true);
            }}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Tier
          </Button>
          <Button onClick={() => setOverrideDialogOpen(true)} variant="outline">
            <Gift className="h-4 w-4 mr-2 text-indigo-500" />
            Grant Free Exception
          </Button>
          <Button variant="outline" size="sm" onClick={() => { refetchPlans(); refetchTrials(); }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Scope Selector: Merchant vs User */}
      <Tabs value={selectedAudience} onValueChange={(v) => setSelectedAudience(v as any)}>
        <TabsList className="grid w-[320px] grid-cols-2">
          <TabsTrigger value="MERCHANT">Merchant Tiers</TabsTrigger>
          <TabsTrigger value="USER">User / Consumer Tiers</TabsTrigger>
        </TabsList>

        {/* Global Trial Config Banner */}
        <Card className="mt-4 border-indigo-100 bg-indigo-50/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings2 className="h-5 w-5 text-indigo-600" />
                  {selectedAudience === 'MERCHANT' ? 'Founding Merchant Introductory Trial' : 'Consumer Launch Trial Promotion'}
                </CardTitle>
                <CardDescription>
                  {selectedAudience === 'MERCHANT'
                    ? 'Allow eligible founding launch partners to use the platform with zero fees'
                    : 'Provide unlimited offer redemptions without forcing subscription purchase'}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="trial-switch" className="text-sm font-medium">
                  {currentTrialConfig?.isEnabled ? 'Active' : 'Disabled'}
                </Label>
                <Switch
                  id="trial-switch"
                  checked={currentTrialConfig?.isEnabled ?? true}
                  onCheckedChange={handleToggleTrial}
                  disabled={updateTrialMutation.isPending}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex items-center gap-4 text-sm pt-0">
            <span className="text-muted-foreground">Default Duration:</span>
            <div className="flex items-center gap-2">
              {[30, 60, 90, 180].map((days) => (
                <Button
                  key={days}
                  variant={currentTrialConfig?.defaultPeriodDays === days ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => handleUpdateTrialDays(days)}
                  disabled={updateTrialMutation.isPending}
                >
                  {days === 180 ? '6 Months' : `${days / 30} Month(s)`}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Plans Table */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Configured Tiers ({filteredPlans.length})</CardTitle>
            <CardDescription>
              Tiered pricing, quotas, and feature flags. Archived plans prevent new purchases while active subscribers retain service.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {plansLoading ? (
              <div className="flex justify-center py-12">
                <CustomSpinner />
              </div>
            ) : filteredPlans.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No plans created for this audience yet.
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tier Code</TableHead>
                      <TableHead>Display Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Cycle</TableHead>
                      <TableHead>Key Quotas</TableHead>
                      <TableHead>Subscribers</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPlans.map((plan) => (
                      <TableRow key={plan.id}>
                        <TableCell className="font-mono text-xs font-semibold">{plan.code}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{plan.name}</p>
                            <p className="text-xs text-muted-foreground">{plan.description}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-sm">
                          {plan.priceNpr === 0 ? 'Free' : `Rs. ${Number(plan.priceNpr).toLocaleString()}`}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{plan.billingCycle}</Badge>
                        </TableCell>
                        <TableCell className="text-xs font-mono">
                          {selectedAudience === 'MERCHANT' ? (
                            <div>
                              <span>Branches: {plan.entitlementsJson?.maxBranches === -1 ? '∞' : plan.entitlementsJson?.maxBranches || '—'}</span> |{' '}
                              <span>Offers: {plan.entitlementsJson?.maxActiveOffers === -1 ? '∞' : plan.entitlementsJson?.maxActiveOffers || '—'}</span>
                            </div>
                          ) : (
                            <div>
                              <span>Redemptions: {plan.entitlementsJson?.maxRedemptionsPerMonth === -1 ? 'Unlimited' : `${plan.entitlementsJson?.maxRedemptionsPerMonth}/mo`}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1 items-start">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              {plan.activeSubscribersCount || 0} active
                            </span>
                            <span className="text-[11px] text-muted-foreground pl-1">
                              {plan.totalSubscribersCount || 0} total assigned
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {plan.isArchived ? (
                            <Badge variant="destructive">Archived</Badge>
                          ) : plan.isActive ? (
                            <Badge variant="default">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Draft</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setPlanToEdit(plan);
                              setPlanFormOpen(true);
                            }}
                            title="Edit Plan Tiers & Quotas"
                          >
                            <Edit3 className="h-4 w-4 text-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deletePlanMutation.mutate(plan.id)}
                            disabled={plan.isArchived || deletePlanMutation.isPending}
                            title="Soft delete / archive"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
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
      </Tabs>

      {/* Plan Form Modal (Create / Edit) */}
      <PlanFormDialog
        open={planFormOpen}
        onOpenChange={setPlanFormOpen}
        planToEdit={planToEdit}
        defaultAudience={selectedAudience}
      />

      {/* Manual Exception Dialog */}
      <Dialog open={overrideDialogOpen} onOpenChange={setOverrideDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Grant Subscription Exception</DialogTitle>
            <DialogDescription>
              Assign a complimentary plan or grant extension to a specific merchant or user with audit logging.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 text-sm">
            <div className="space-y-1">
              <Label>Target Entity Type</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="targetType"
                    checked={overrideTargetType === 'merchant'}
                    onChange={() => setOverrideTargetType('merchant')}
                  />
                  Merchant
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="targetType"
                    checked={overrideTargetType === 'user'}
                    onChange={() => setOverrideTargetType('user')}
                  />
                  User
                </label>
              </div>
            </div>
            <div className="space-y-1">
              <Label>{overrideTargetType === 'merchant' ? 'Merchant ID' : 'User ID'}</Label>
              <Input
                placeholder="Paste ID here..."
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Select Tier Plan</Label>
              <select
                className="w-full h-9 rounded-md border bg-background px-3 text-sm"
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
              >
                <option value="">Select Plan...</option>
                {plans
                  .filter((p) => p.audience === (overrideTargetType === 'merchant' ? 'MERCHANT' : 'USER'))
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code})
                    </option>
                  ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Duration (Days to Add/Grant)</Label>
              <Input
                type="number"
                min="1"
                value={customDays}
                onChange={(e) => setCustomDays(Number(e.target.value))}
              />
            </div>
            <div className="space-y-1">
              <Label>Audit Reason</Label>
              <Input
                placeholder="e.g. Founding partner agreement approval"
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOverrideDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveOverride} disabled={overrideMutation.isPending}>
              {overrideMutation.isPending ? 'Saving...' : 'Grant Plan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
