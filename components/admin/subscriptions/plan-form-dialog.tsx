'use client';

import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createSubscriptionPlan,
  updateSubscriptionPlan,
  type SubscriptionPlanItem,
} from '@/lib/api/admin/subscriptions-api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sparkles, Layers, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface PlanFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planToEdit?: SubscriptionPlanItem | null;
  defaultAudience?: 'MERCHANT' | 'USER';
}

export function PlanFormDialog({
  open,
  onOpenChange,
  planToEdit,
  defaultAudience = 'MERCHANT',
}: PlanFormDialogProps) {
  const queryClient = useQueryClient();
  const isEdit = Boolean(planToEdit);

  // Form states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [audience, setAudience] = useState<'MERCHANT' | 'USER'>(defaultAudience);
  const [priceNpr, setPriceNpr] = useState<number>(0);
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY');
  const [durationDays, setDurationDays] = useState<number>(30);
  const [trialDays, setTrialDays] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isPublic, setIsPublic] = useState<boolean>(true);

  // Entitlements
  const [maxBranches, setMaxBranches] = useState<number>(3);
  const [maxActiveOffers, setMaxActiveOffers] = useState<number>(7);
  const [featuredBoostCount, setFeaturedBoostCount] = useState<number>(0);
  const [maxRedemptionsPerMonth, setMaxRedemptionsPerMonth] = useState<number>(-1);
  const [posIntegration, setPosIntegration] = useState<boolean>(false);

  useEffect(() => {
    if (planToEdit) {
      setCode(planToEdit.code);
      setName(planToEdit.name);
      setDescription(planToEdit.description || '');
      setAudience(planToEdit.audience);
      setPriceNpr(Number(planToEdit.priceNpr) || 0);
      setBillingCycle((planToEdit.billingCycle as any) || 'MONTHLY');
      setDurationDays(planToEdit.durationDays || 30);
      setTrialDays(planToEdit.trialDays || 0);
      setIsActive(planToEdit.isActive);
      setIsPublic(planToEdit.isPublic);

      const ent = planToEdit.entitlementsJson || {};
      setMaxBranches(ent.maxBranches ?? 3);
      setMaxActiveOffers(ent.maxActiveOffers ?? 7);
      setFeaturedBoostCount(ent.featuredBoostCount ?? 0);
      setMaxRedemptionsPerMonth(ent.maxRedemptionsPerMonth ?? -1);
      setPosIntegration(Boolean(ent.posIntegration));
    } else {
      setCode('');
      setName('');
      setDescription('');
      setAudience(defaultAudience);
      setPriceNpr(0);
      setBillingCycle('MONTHLY');
      setDurationDays(30);
      setTrialDays(0);
      setIsActive(true);
      setIsPublic(true);
      setMaxBranches(3);
      setMaxActiveOffers(7);
      setFeaturedBoostCount(0);
      setMaxRedemptionsPerMonth(-1);
      setPosIntegration(false);
    }
  }, [planToEdit, defaultAudience, open]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const entitlementsJson: Record<string, any> = audience === 'MERCHANT'
        ? {
            maxBranches: Number(maxBranches),
            maxActiveOffers: Number(maxActiveOffers),
            featuredBoostCount: Number(featuredBoostCount),
            posIntegration,
          }
        : {
            maxRedemptionsPerMonth: Number(maxRedemptionsPerMonth),
          };

      const payload = {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        description: description.trim() || undefined,
        audience,
        priceNpr: Number(priceNpr) || 0,
        billingCycle,
        durationDays: Number(durationDays) || 30,
        trialDays: Number(trialDays) || 0,
        isActive,
        isPublic,
        entitlements: entitlementsJson,
        entitlementsJson,
      };

      if (isEdit && planToEdit) {
        return updateSubscriptionPlan(planToEdit.id, payload);
      } else {
        return createSubscriptionPlan(payload);
      }
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Subscription tier updated' : 'New subscription tier created');
      queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] });
      onOpenChange(false);
    },
    onError: (err: any) => {
      // NestJS can return message as string or string[]
      const raw = err?.response?.data?.message || err?.message || 'Failed to save subscription tier';
      const message = Array.isArray(raw) ? raw.join(' · ') : String(raw);
      toast.error(message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // ── Validation ──────────────────────────────────────────────────
    if (!code.trim()) {
      toast.error('Plan Code is required');
      return;
    }
    if (!name.trim()) {
      toast.error('Display Name is required');
      return;
    }
    if (isNaN(Number(priceNpr)) || Number(priceNpr) < 0) {
      toast.error('Price must be a valid non-negative number');
      return;
    }
    if (!Number.isInteger(Number(durationDays)) || Number(durationDays) < 1) {
      toast.error('Cycle Duration must be a positive integer (days)');
      return;
    }
    if (!Number.isInteger(Number(trialDays)) || Number(trialDays) < 0) {
      toast.error('Trial Days must be a non-negative integer');
      return;
    }
    if (audience === 'MERCHANT') {
      const mb = Number(maxBranches);
      const mo = Number(maxActiveOffers);
      const fb = Number(featuredBoostCount);
      if (!Number.isInteger(mb) || (mb < 1 && mb !== -1)) {
        toast.error('Max Outlets must be a positive integer or -1 for unlimited');
        return;
      }
      if (!Number.isInteger(mo) || (mo < 1 && mo !== -1)) {
        toast.error('Max Live Deals must be a positive integer or -1 for unlimited');
        return;
      }
      if (!Number.isInteger(fb) || fb < 0) {
        toast.error('Monthly Boosts must be a non-negative integer');
        return;
      }
    } else {
      const mr = Number(maxRedemptionsPerMonth);
      if (!Number.isInteger(mr) || (mr < 1 && mr !== -1)) {
        toast.error('Monthly Voucher Limit must be a positive integer or -1 for unlimited');
        return;
      }
    }

    saveMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="pb-3 border-b">
            <DialogTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-amber-500" />
              {isEdit ? `Edit Tier: ${planToEdit?.name}` : 'Create Subscription Plan'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Configure tier specifications, pricing, and quota entitlements
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 text-xs">
            {/* General Info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="planCode" className="text-xs">Plan Code (Unique ID)</Label>
                <Input
                  id="planCode"
                  placeholder="e.g. MERCHANT_PRO"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled={isEdit}
                  className="font-mono uppercase text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="planName" className="text-xs">Display Name</Label>
                <Input
                  id="planName"
                  placeholder="e.g. Professional Growth"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="planDesc" className="text-xs">Description</Label>
              <Input
                id="planDesc"
                placeholder="Brief summary of who this plan is designed for"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="text-xs"
              />
            </div>

            {/* Audience & Pricing */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Audience</Label>
                <Select
                  value={audience}
                  onValueChange={(val: any) => setAudience(val)}
                  disabled={isEdit}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MERCHANT">Merchant</SelectItem>
                    <SelectItem value="USER">Consumer User</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="priceNpr" className="text-xs">Price (NPR)</Label>
                <Input
                  id="priceNpr"
                  type="number"
                  min="0"
                  step="1"
                  value={priceNpr}
                  onChange={(e) => setPriceNpr(Number(e.target.value))}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Billing Cycle</Label>
                <Select
                  value={billingCycle}
                  onValueChange={(val: any) => setBillingCycle(val)}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                    <SelectItem value="ANNUAL">Annual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Cycle Durations */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="durationDays" className="text-xs">Cycle Duration (Days)</Label>
                <Input
                  id="durationDays"
                  type="number"
                  min="1"
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="trialDays" className="text-xs">Included Trial Days</Label>
                <Input
                  id="trialDays"
                  type="number"
                  min="0"
                  value={trialDays}
                  onChange={(e) => setTrialDays(Number(e.target.value))}
                  className="text-xs"
                />
              </div>
            </div>

            {/* Entitlements Section */}
            <div className="p-3 border rounded-lg bg-muted/30 space-y-3">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                Resource Quotas & Entitlements ({audience})
              </span>

              {audience === 'MERCHANT' ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[11px]">Max Outlets (-1 = ∞)</Label>
                      <Input
                        type="number"
                        value={maxBranches}
                        onChange={(e) => setMaxBranches(Number(e.target.value))}
                        className="text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px]">Max Live Deals (-1 = ∞)</Label>
                      <Input
                        type="number"
                        value={maxActiveOffers}
                        onChange={(e) => setMaxActiveOffers(Number(e.target.value))}
                        className="text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px]">Monthly Boosts</Label>
                      <Input
                        type="number"
                        min="0"
                        value={featuredBoostCount}
                        onChange={(e) => setFeaturedBoostCount(Number(e.target.value))}
                        className="text-xs"
                      />
                    </div>
                  </div>
                  {/* POS Integration toggle */}
                  <div className="flex items-center gap-2 pt-1">
                    <Switch
                      id="posIntegration"
                      checked={posIntegration}
                      onCheckedChange={setPosIntegration}
                    />
                    <Label htmlFor="posIntegration" className="text-[11px] font-normal">
                      POS / Scanner Integration
                    </Label>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-[11px]">Monthly Voucher Limit (-1 = Unlimited)</Label>
                    <button
                      type="button"
                      onClick={() => setMaxRedemptionsPerMonth(-1)}
                      className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Set Unlimited
                    </button>
                  </div>
                  <Input
                    type="number"
                    value={maxRedemptionsPerMonth}
                    onChange={(e) => setMaxRedemptionsPerMonth(Number(e.target.value))}
                    className="text-xs"
                  />
                  {maxRedemptionsPerMonth === -1 && (
                    <p className="text-[10px] text-indigo-600 dark:text-indigo-400">
                      ∞ Unlimited redemptions per month
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Toggles */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <Switch
                  id="planActive"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
                <Label htmlFor="planActive" className="text-xs font-normal">Active (Purchasable)</Label>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="planPublic"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
                <Label htmlFor="planPublic" className="text-xs font-normal">Public Catalog Listing</Label>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={saveMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={saveMutation.isPending}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold"
            >
              {saveMutation.isPending ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Saving...
                </>
              ) : isEdit ? (
                'Save Changes'
              ) : (
                'Create Plan'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
