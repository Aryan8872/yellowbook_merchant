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
import { Loader2, Building2, Store } from 'lucide-react';
import { useCreateMerchant, useUpdateMerchant } from '@/lib/lib/react-query/hooks/use-merchants';
import { ImageUploadInput } from './image-upload-input';
import { createMerchantSchema, updateMerchantSchema, type CreateMerchantInput, type UpdateMerchantInput } from '@/lib/lib/validations/merchant-validation';
import { Merchant } from '@/lib/api/admin/merchants-api';

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
      coverUrl: '',
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
        coverUrl: (merchant as any).coverUrl || '',
      });
    } else if (!merchant && open) {
      reset();
    }
  }, [merchant, open, reset]);

  const onSubmit = async (data: z.infer<typeof createMerchantSchema>) => {
    if (isEditing && merchant) {
      updateMerchantMutation.mutate(
        { id: merchant.id, data: data as any },
        {
          onSuccess: () => {
            onOpenChange(false);
          },
        }
      );
    } else {
      createMerchantMutation.mutate(data, {
        onSuccess: () => {
          reset();
          onOpenChange(false);
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
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

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
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
