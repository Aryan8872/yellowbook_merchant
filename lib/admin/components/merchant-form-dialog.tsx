'use client'

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Building2, Store, Sparkles } from 'lucide-react';
import { useCreateMerchant, useUpdateMerchant } from '@/lib/admin/hooks/use-merchants-query';
import { useSubscriptionPlans } from '@/lib/admin/hooks/use-subscriptions-query';
import { ImageUploadInput } from './image-upload-input';
import { createMerchantSchema, updateMerchantSchema, type CreateMerchantInput, type UpdateMerchantInput } from '@/lib/lib/validations/merchant-validation';
import { showFormErrors } from '@/lib/utils/form-toast';
import { cleanPayload } from '@/lib/utils/payload-cleanup';
import { Merchant } from '@/lib/api/admin/merchants-api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

interface MerchantFormDialogProps {
  merchant?: Merchant | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MerchantFormDialog({
  merchant,
  open,
  onOpenChange,
}: MerchantFormDialogProps) {
  const createMerchantMutation = useCreateMerchant();
  const updateMerchantMutation = useUpdateMerchant();
  const isEditing = Boolean(merchant);

  const { data: plansData } = useSubscriptionPlans({ audience: 'MERCHANT' });
  const merchantPlans: any[] = (Array.isArray(plansData) ? plansData : (plansData as any)?.data ?? []).filter(
    (p: any) => p.audience === 'MERCHANT' && p.isActive && !p.isArchived
  );

  const form = useForm<z.infer<typeof createMerchantSchema>>({
    resolver: zodResolver(createMerchantSchema),
    defaultValues: {
      name: '',
      contactEmail: '',
      contactPhone: '',
      panNumber: '',
      vatNumber: '',
      logoUrl: '',
      description: '',
      websiteUrl: '',
      address: '',
      coverUrl: '',
      planId: '',
      durationDays: 180,
      isTrial: false,
    },
  });

  const { reset } = form;

  useEffect(() => {
    if (merchant && open) {
      reset({
        name: merchant.name || '',
        contactEmail: merchant.contactEmail || '',
        contactPhone: merchant.contactPhone || '',
        panNumber: (merchant as any).panNumber || (merchant as any).registrationNumber || '',
        vatNumber: (merchant as any).vatNumber || '',
        logoUrl: merchant.logoUrl || '',
        description: (merchant as any).description || '',
        websiteUrl: (merchant as any).websiteUrl || '',
        address: (merchant as any).address || '',
        coverUrl: (merchant as any).coverUrl || '',
        planId: '',
        durationDays: 180,
        isTrial: false,
      });
    } else if (!merchant && open) {
      reset({
        name: '',
        contactEmail: '',
        contactPhone: '',
        panNumber: '',
        vatNumber: '',
        logoUrl: '',
        description: '',
        websiteUrl: '',
        address: '',
        coverUrl: '',
        planId: '',
        durationDays: 180,
        isTrial: false,
      });
    }
  }, [merchant, open, reset]);

  const onSubmit = async (data: z.infer<typeof createMerchantSchema>) => {
    if (isEditing && merchant) {
      const cleanedData = cleanPayload({
        name: data.name,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        description: data.description,
        websiteUrl: data.websiteUrl,
        panNumber: data.panNumber,
        vatNumber: data.vatNumber,
        logoUrl: data.logoUrl,
        coverUrl: data.coverUrl,
        address: data.address,
      });

      updateMerchantMutation.mutate(
        {
          id: merchant.id,
          data: cleanedData,
        },
        {
          onSuccess: () => {
            reset();
            onOpenChange(false);
          },
        }
      );
    } else {
      // For create, don't use cleanPayload as required fields must be present
      const createData: any = {
        name: data.name,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone || undefined,
        description: data.description || undefined,
        websiteUrl: data.websiteUrl || undefined,
        panNumber: data.panNumber || undefined,
        vatNumber: data.vatNumber || undefined,
        logoUrl: data.logoUrl || undefined,
        coverUrl: data.coverUrl || undefined,
        address: data.address || undefined,
        planId: data.planId || undefined,
        durationDays: data.durationDays ? Number(data.durationDays) : undefined,
        isTrial: data.isTrial ?? false,
      };

      createMerchantMutation.mutate(
        createData,
        {
          onSuccess: () => {
            reset();
            onOpenChange(false);
          },
        }
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-140 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>
                {isEditing ? 'Edit Merchant Details' : 'Add New Merchant'}
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? `Update information for ${merchant?.name}`
                  : 'Register a new merchant business into the platform.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={form.handleSubmit((data) => {
          if (Object.keys(form.formState.errors).length > 0) {
            showFormErrors(form.formState.errors)
            return
          }
          onSubmit(data)
        })} className="space-y-4 py-2">
          {/* Logo Upload */}
          <ImageUploadInput
            label="Business Logo"
            folder="merchants"
            hint="PNG, JPG, WEBP up to 5MB — shown in app listings"
            value={form.watch('logoUrl')}
            onChange={(url) => form.setValue('logoUrl', url)}
            disabled={createMerchantMutation.isPending || updateMerchantMutation.isPending}
          />
          {form.formState.errors.logoUrl && (
            <p className="text-sm text-destructive">{form.formState.errors.logoUrl.message}</p>
          )}

          {/* Cover Image Upload */}
          <ImageUploadInput
            label="Cover Image"
            folder="merchants"
            hint="PNG, JPG, WEBP up to 5MB — shown in merchant detail page"
            value={form.watch('coverUrl')}
            onChange={(url) => form.setValue('coverUrl', url)}
            disabled={createMerchantMutation.isPending || updateMerchantMutation.isPending}
          />
          {form.formState.errors.coverUrl && (
            <p className="text-sm text-destructive">{form.formState.errors.coverUrl.message}</p>
          )}

          {/* Business Name */}
          <div className="space-y-2">
            <Label htmlFor="merchant-name">Business Name *</Label>
            <Input
              id="merchant-name"
              placeholder="e.g. Himalayan Java Coffee"
              {...form.register('name')}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="merchant-description">Description</Label>
            <Input
              id="merchant-description"
              placeholder="Brief description of the business"
              {...form.register('description')}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
            )}
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="merchant-address">Address</Label>
            <Input
              id="merchant-address"
              placeholder="Business address"
              {...form.register('address')}
            />
            {form.formState.errors.address && (
              <p className="text-sm text-destructive">{form.formState.errors.address.message}</p>
            )}
          </div>

          {/* Website URL */}
          <div className="space-y-2">
            <Label htmlFor="merchant-website">Website URL (Optional)</Label>
            <Input
              id="merchant-website"
              type="url"
              placeholder="https://example.com"
              {...form.register('websiteUrl')}
            />
            {form.formState.errors.websiteUrl && (
              <p className="text-sm text-destructive">{form.formState.errors.websiteUrl.message}</p>
            )}
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="merchant-email">Contact Email *</Label>
              <Input
                id="merchant-email"
                type="email"
                placeholder="contact@business.com"
                {...form.register('contactEmail')}
              />
              {form.formState.errors.contactEmail && (
                <p className="text-sm text-destructive">{form.formState.errors.contactEmail.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="merchant-phone">Contact Phone</Label>
              <Input
                id="merchant-phone"
                placeholder="+977 9801234567"
                {...form.register('contactPhone')}
              />
              {form.formState.errors.contactPhone && (
                <p className="text-sm text-destructive">{form.formState.errors.contactPhone.message}</p>
              )}
            </div>
          </div>

          {/* Registration + VAT */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="merchant-reg">PAN Number</Label>
              <Input
                id="merchant-reg"
                placeholder="e.g. 123456789"
                {...form.register('panNumber')}
              />
              {(form.formState.errors as any).panNumber && (
                <p className="text-sm text-destructive">{(form.formState.errors as any).panNumber.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="merchant-vat">VAT Number</Label>
              <Input
                id="merchant-vat"
                placeholder="VAT registration"
                {...form.register('vatNumber')}
              />
              {(form.formState.errors as any).vatNumber && (
                <p className="text-sm text-destructive">{(form.formState.errors as any).vatNumber.message}</p>
              )}
            </div>
          </div>

          {/* Initial Subscription Plan (Create mode only) */}
          {!isEditing && (
            <div className="space-y-4 pt-2">
              <Separator />
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <Label className="font-semibold text-sm">Initial Subscription Plan</Label>
                <span className="text-xs text-muted-foreground">(Optional — defaults to Founding Partner)</span>
              </div>
              <div className="space-y-3 p-3 rounded-lg bg-muted/40 border">
                <div className="space-y-2">
                  <Label htmlFor="create-merchant-plan" className="text-xs">Plan Tier</Label>
                  <Select
                    value={form.watch('planId') || ''}
                    onValueChange={(val) => {
                      const selectedPlan = merchantPlans.find((p: any) => p.id === val);
                      form.setValue('planId', val || '');
                      if (selectedPlan?.durationDays) {
                        form.setValue('durationDays', selectedPlan.durationDays);
                      }
                    }}
                  >
                    <SelectTrigger id="create-merchant-plan">
                      <SelectValue placeholder="Choose initial plan (or let system assign default)..." />
                    </SelectTrigger>
                    <SelectContent>
                      {merchantPlans.map((p: any) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} — NPR {Number(p.priceNpr).toLocaleString()} / {p.billingCycle} ({p.durationDays ?? 30} days)
                        </SelectItem>
                      ))}
                      {merchantPlans.length === 0 && (
                        <SelectItem value="__none__" disabled>No active MERCHANT plans available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="create-merchant-days" className="text-xs">Duration (days)</Label>
                    <Input
                      id="create-merchant-days"
                      type="number"
                      min={1}
                      max={3650}
                      {...form.register('durationDays', { valueAsNumber: true })}
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <input
                      type="checkbox"
                      id="create-merchant-trial"
                      {...form.register('isTrial')}
                      className="rounded border-gray-300 text-amber-600 focus:ring-amber-500 h-4 w-4"
                    />
                    <Label htmlFor="create-merchant-trial" className="text-xs font-normal cursor-pointer">
                      Grant as Trial
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createMerchantMutation.isPending || updateMerchantMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMerchantMutation.isPending || updateMerchantMutation.isPending}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {createMerchantMutation.isPending || updateMerchantMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                'Save Changes'
              ) : (
                'Create Merchant'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
