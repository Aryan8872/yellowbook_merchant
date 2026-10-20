'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/auth';
import {
  getMerchantBilling,
  initiateMerchantCheckout,
  type MerchantBillingData,
} from '@/lib/api/merchant/billing-api';
import { getSubscriptionPlans, type SubscriptionPlanItem } from '@/lib/api/admin/subscriptions-api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Store,
  Tag,
  Rocket,
  Calendar,
  CreditCard,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

export function BillingPlanTab() {
  const { merchantId } = useAuthStore();
  const [billing, setBilling] = useState<MerchantBillingData | null>(null);
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlanItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Upgrade Modal State
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanItem | null>(null);
  const [selectedGateway, setSelectedGateway] = useState<'KHALTI' | 'ESEWA'>('KHALTI');
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const loadData = async () => {
    if (!merchantId) return;
    setIsLoading(true);
    try {
      const [billingRes, plansRes] = await Promise.all([
        getMerchantBilling(merchantId),
        getSubscriptionPlans({ audience: 'MERCHANT' }),
      ]);

      if (billingRes.success && billingRes.data) {
        setBilling(billingRes.data);
      }
      if (plansRes.success && plansRes.data) {
        setAvailablePlans(plansRes.data.filter((p) => !p.isArchived));
      }
    } catch (err: any) {
      toast.error('Failed to load subscription & billing data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [merchantId]);

  const handleInitiateCheckout = async () => {
    if (!selectedPlan || !merchantId) return;
    setIsCheckingOut(true);
    try {
      const returnUrl = typeof window !== 'undefined' ? `${window.location.origin}/merchant/settings?payment=success` : '';
      const res = await initiateMerchantCheckout({
        planId: selectedPlan.id,
        gateway: selectedGateway,
        merchantId,
        returnUrl,
      });

      if (res.success && res.data) {
        toast.success(`Redirecting to ${selectedGateway} gateway...`);
        if (res.data.paymentUrl) {
          window.location.href = res.data.paymentUrl;
        } else if (res.data.formData && selectedGateway === 'ESEWA') {
          // Auto-submit eSewa form
          const form = document.createElement('form');
          form.method = 'POST';
          form.action = 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';
          Object.entries(res.data.formData).forEach(([k, v]) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = k;
            input.value = v;
            form.appendChild(input);
          });
          document.body.appendChild(form);
          form.submit();
        }
      } else {
        toast.error(res.message || 'Payment initiation failed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error connecting to payment provider');
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-muted-foreground gap-3">
        <RefreshCw className="h-6 w-6 animate-spin text-amber-500" />
        <span className="text-sm">Fetching merchant billing status...</span>
      </div>
    );
  }

  const sub = billing?.subscription;
  const quotas = billing?.quotas;
  const remainingDays = sub?.remainingDays ?? 0;

  // Remaining days pill styling
  let badgeVariant = 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
  if (remainingDays <= 3) {
    badgeVariant = 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 animate-pulse';
  } else if (remainingDays <= 14) {
    badgeVariant = 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';
  }

  return (
    <div className="space-y-6">
      {/* 1. Current Plan Card */}
      <Card className="border-border bg-card/60 backdrop-blur-sm overflow-hidden relative shadow-sm">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10">
                <Sparkles className="h-3 w-3 mr-1" />
                Active Subscription
              </Badge>
              {sub?.isTrial && (
                <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                  Introductory Trial
                </Badge>
              )}
            </div>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              {sub?.plan?.name || 'Founding Partner Tier'}
            </CardTitle>
            <CardDescription className="text-xs">
              {sub?.plan?.description || 'Exclusive partner package for early-stage OfferNepal merchants'}
            </CardDescription>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className={`px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 ${badgeVariant}`}>
              <Calendar className="h-3.5 w-3.5" />
              <span>{remainingDays > 0 ? `${remainingDays} days remaining` : 'Subscription Expired'}</span>
            </div>
            <Button
              onClick={() => {
                const nextPlan = availablePlans.find((p) => p.code !== sub?.plan?.code) || availablePlans[0];
                setSelectedPlan(nextPlan || null);
                setIsUpgradeModalOpen(true);
              }}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs shadow-sm"
            >
              <Rocket className="h-3.5 w-3.5 mr-1.5" />
              Upgrade / Renew Plan
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-2 border-t border-border/50 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <span className="text-[11px] text-muted-foreground uppercase font-semibold">Billing Rate</span>
            <p className="text-sm font-semibold mt-0.5">
              {sub?.plan?.priceNpr === 0 ? 'Free Partner Program' : `NPR ${sub?.plan?.priceNpr?.toLocaleString() || 0} / month`}
            </p>
          </div>
          <div>
            <span className="text-[11px] text-muted-foreground uppercase font-semibold">Current Cycle Ends</span>
            <p className="text-sm font-semibold mt-0.5">
              {sub?.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString('en-US', { dateStyle: 'medium' }) : 'N/A'}
            </p>
          </div>
          <div>
            <span className="text-[11px] text-muted-foreground uppercase font-semibold">Account Status</span>
            <p className="text-sm font-semibold mt-0.5 flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              Good Standing ({sub?.status || 'ACTIVE'})
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 2. Quotas & Resource Consumption */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Branches Quota */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Store className="h-4 w-4 text-amber-500" />
                Physical Branch Outlets
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                {quotas?.branches?.isUnlimited
                  ? 'Unlimited Outlets'
                  : `${quotas?.branches?.used ?? 0} / ${quotas?.branches?.max ?? 3} Used`}
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Authorized locations enabled for QR verification and voucher redemption
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  quotas?.branches?.hasReachedLimit ? 'bg-rose-500' : 'bg-amber-500'
                }`}
                style={{
                  width: quotas?.branches?.isUnlimited
                    ? '25%'
                    : `${Math.min(100, ((quotas?.branches?.used ?? 0) / (quotas?.branches?.max ?? 1)) * 100)}%`,
                }}
              />
            </div>
            {quotas?.branches?.hasReachedLimit && (
              <p className="text-[11px] text-rose-500 flex items-center gap-1 font-medium">
                <AlertTriangle className="h-3 w-3" />
                Outlet quota reached. Upgrade to Growth or Enterprise to add more branches.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Active Offers Quota */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Tag className="h-4 w-4 text-amber-500" />
                Active Published Deals
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                {quotas?.offers?.isUnlimited
                  ? 'Unlimited Offers'
                  : `${quotas?.offers?.used ?? 0} / ${quotas?.offers?.max ?? 7} Used`}
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Live promotional discounts discoverable by consumers on the app
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  quotas?.offers?.hasReachedLimit ? 'bg-rose-500' : 'bg-amber-500'
                }`}
                style={{
                  width: quotas?.offers?.isUnlimited
                    ? '25%'
                    : `${Math.min(100, ((quotas?.offers?.used ?? 0) / (quotas?.offers?.max ?? 1)) * 100)}%`,
                }}
              />
            </div>
            {quotas?.offers?.hasReachedLimit && (
              <p className="text-[11px] text-rose-500 flex items-center gap-1 font-medium">
                <AlertTriangle className="h-3 w-3" />
                Active deal quota reached. Deactivate existing offers or upgrade your plan.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 3. Tier Comparison Grid */}
      <div className="space-y-3 pt-2">
        <div>
          <h3 className="text-base font-semibold">Available Partner Tiers</h3>
          <p className="text-xs text-muted-foreground">Select an elevated subscription plan to expand your reach</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {availablePlans.map((plan) => {
            const isCurrent = sub?.plan?.code === plan.code;
            const ent = plan.entitlementsJson || {};
            return (
              <Card
                key={plan.id}
                className={`relative flex flex-col justify-between transition-all ${
                  isCurrent ? 'border-amber-500 shadow-sm bg-amber-500/5' : 'border-border hover:border-border/80'
                }`}
              >
                {isCurrent && (
                  <div className="absolute -top-2.5 right-4">
                    <Badge className="bg-amber-500 text-slate-950 font-bold text-[10px]">Current Plan</Badge>
                  </div>
                )}
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-xs min-h-[32px]">{plan.description}</CardDescription>
                  <div className="pt-2">
                    <span className="text-2xl font-black">
                      {plan.priceNpr === 0 ? 'Free' : `Rs. ${plan.priceNpr.toLocaleString()}`}
                    </span>
                    {plan.priceNpr > 0 && <span className="text-xs text-muted-foreground font-medium"> / {plan.billingCycle.toLowerCase()}</span>}
                  </div>
                </CardHeader>

                <CardContent className="space-y-2 pb-4 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>{ent.maxBranches === -1 ? 'Unlimited Branch Outlets' : `Up to ${ent.maxBranches || 3} Branch Outlets`}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>{ent.maxActiveOffers === -1 ? 'Unlimited Live Deals' : `Up to ${ent.maxActiveOffers || 7} Live Deals`}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>{ent.featuredBoostCount ? `${ent.featuredBoostCount} Monthly Spotlight Boosts` : 'Organic Feed Placement'}</span>
                  </div>
                  {ent.posIntegration && (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span>Direct POS & Webhook Integration</span>
                    </div>
                  )}
                  {ent.dedicatedManager && (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span>Dedicated Account Strategist</span>
                    </div>
                  )}
                </CardContent>

                <div className="p-4 pt-0">
                  <Button
                    variant={isCurrent ? 'outline' : 'default'}
                    onClick={() => {
                      setSelectedPlan(plan);
                      setIsUpgradeModalOpen(true);
                    }}
                    className={`w-full text-xs font-semibold ${
                      !isCurrent && 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                    }`}
                  >
                    {isCurrent ? 'Renew Current Plan' : `Upgrade to ${plan.name}`}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 4. Checkout Modal Dialog */}
      <Dialog open={isUpgradeModalOpen} onOpenChange={setIsUpgradeModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-amber-500" />
              Complete Plan Subscription
            </DialogTitle>
            <DialogDescription className="text-xs">
              Confirm your billing tier selection and choose an instantaneous gateway
            </DialogDescription>
          </DialogHeader>

          {selectedPlan && (
            <div className="space-y-4 py-2">
              <div className="p-3 rounded-lg border border-border bg-muted/40 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-sm">{selectedPlan.name}</span>
                  <span className="font-bold text-base text-amber-600 dark:text-amber-400">
                    {selectedPlan.priceNpr === 0 ? 'Complimentary' : `NPR ${selectedPlan.priceNpr.toLocaleString()}`}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{selectedPlan.description}</p>
                <div className="text-[11px] text-muted-foreground pt-1 border-t border-border/50 flex justify-between">
                  <span>Cycle Duration:</span>
                  <span className="font-medium text-foreground">{selectedPlan.durationDays} Days ({selectedPlan.billingCycle})</span>
                </div>
              </div>

              {/* Gateway Selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Select Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedGateway('KHALTI')}
                    className={`p-3 rounded-lg border text-left flex flex-col gap-1 transition-all ${
                      selectedGateway === 'KHALTI'
                        ? 'border-purple-600 bg-purple-500/10 text-purple-600 dark:text-purple-400'
                        : 'border-border hover:bg-muted/50'
                    }`}
                  >
                    <span className="font-bold text-xs">Khalti ePayment</span>
                    <span className="text-[10px] text-muted-foreground">Instant Wallet & Banking</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedGateway('ESEWA')}
                    className={`p-3 rounded-lg border text-left flex flex-col gap-1 transition-all ${
                      selectedGateway === 'ESEWA'
                        ? 'border-emerald-600 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'border-border hover:bg-muted/50'
                    }`}
                  >
                    <span className="font-bold text-xs">eSewa EPAY v2</span>
                    <span className="text-[10px] text-muted-foreground">Direct Wallet Checkout</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsUpgradeModalOpen(false)}
              disabled={isCheckingOut}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleInitiateCheckout}
              disabled={isCheckingOut}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold"
            >
              {isCheckingOut ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Initiating...
                </>
              ) : (
                <>
                  Proceed to {selectedGateway}
                  <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
