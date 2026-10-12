'use client'

import { useState, useEffect } from 'react';
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
import { Loader2, Store } from 'lucide-react';
import { useMerchantsStore } from '@/lib/admin/stores/merchants-store';
import { Merchant } from '@/lib/api/admin/merchants-api';
import { ImageUploadInput } from './image-upload-input';

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
  const { createMerchant, updateMerchant, loading } = useMerchantsStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = Boolean(merchant);

  const [formData, setFormData] = useState({
    name: '',
    contactEmail: '',
    contactPhone: '',
    registrationNumber: '',
    vatNumber: '',
    logoUrl: '',
    description: '',
    websiteUrl: '',
    coverUrl: '',
  });

  useEffect(() => {
    if (merchant && open) {
      setFormData({
        name: merchant.name || '',
        contactEmail: merchant.contactEmail || '',
        contactPhone: merchant.contactPhone || '',
        registrationNumber: (merchant as any).registrationNumber || '',
        vatNumber: (merchant as any).vatNumber || '',
        logoUrl: merchant.logoUrl || '',
        description: (merchant as any).description || '',
        websiteUrl: (merchant as any).websiteUrl || '',
        coverUrl: (merchant as any).coverUrl || '',
      });
    } else if (!merchant && open) {
      setFormData({
        name: '',
        contactEmail: '',
        contactPhone: '',
        registrationNumber: '',
        vatNumber: '',
        logoUrl: '',
        description: '',
        websiteUrl: '',
        coverUrl: '',
      });
    }
  }, [merchant, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.contactEmail) return;

    setIsSubmitting(true);
    try {
      if (isEditing && merchant) {
        await updateMerchant(merchant.id, {
          name: formData.name,
          contactEmail: formData.contactEmail,
          contactPhone: formData.contactPhone || undefined,
          vatNumber: formData.vatNumber || undefined,
          logoUrl: formData.logoUrl || undefined,
          description: formData.description || undefined,
          websiteUrl: formData.websiteUrl || undefined,
          coverUrl: formData.coverUrl || undefined,
        });
        onOpenChange(false);
      } else {
        const created = await createMerchant({
          name: formData.name,
          contactEmail: formData.contactEmail,
          contactPhone: formData.contactPhone || undefined,
          registrationNumber: formData.registrationNumber || undefined,
          panNumber: formData.registrationNumber || undefined,
          vatNumber: formData.vatNumber || undefined,
          logoUrl: formData.logoUrl || undefined,
          description: formData.description || undefined,
          websiteUrl: formData.websiteUrl || undefined,
          coverUrl: formData.coverUrl || undefined,
        });
        if (created) {
          onOpenChange(false);
        }
      }
    } catch (error) {
      console.error('Failed to save merchant:', error);
    } finally {
      setIsSubmitting(false);
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

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Logo Upload */}
          <ImageUploadInput
            label="Business Logo"
            folder="merchants"
            hint="PNG, JPG, WEBP up to 5MB — shown in app listings"
            value={formData.logoUrl}
            onChange={(url) => setFormData({ ...formData, logoUrl: url })}
            disabled={isSubmitting}
          />

          {/* Cover Image Upload */}
          <ImageUploadInput
            label="Cover Image"
            folder="merchants"
            hint="PNG, JPG, WEBP up to 5MB — shown in merchant detail page"
            value={formData.coverUrl}
            onChange={(url) => setFormData({ ...formData, coverUrl: url })}
            disabled={isSubmitting}
          />

          {/* Business Name */}
          <div className="space-y-2">
            <Label htmlFor="merchant-name">Business Name *</Label>
            <Input
              id="merchant-name"
              placeholder="e.g. Himalayan Java Coffee"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="merchant-description">Description</Label>
            <Input
              id="merchant-description"
              placeholder="Brief description of the business"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Website URL */}
          <div className="space-y-2">
            <Label htmlFor="merchant-website">Website URL</Label>
            <Input
              id="merchant-website"
              placeholder="https://example.com"
              value={formData.websiteUrl}
              onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
            />
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="merchant-email">Contact Email *</Label>
              <Input
                id="merchant-email"
                type="email"
                placeholder="contact@business.com"
                value={formData.contactEmail}
                onChange={(e) =>
                  setFormData({ ...formData, contactEmail: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="merchant-phone">Contact Phone</Label>
              <Input
                id="merchant-phone"
                placeholder="+977 9801234567"
                value={formData.contactPhone}
                onChange={(e) =>
                  setFormData({ ...formData, contactPhone: e.target.value })
                }
              />
            </div>
          </div>

          {/* Registration + VAT */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="merchant-reg">Registration / PAN Number</Label>
              <Input
                id="merchant-reg"
                placeholder="e.g. 123456789"
                value={formData.registrationNumber}
                onChange={(e) =>
                  setFormData({ ...formData, registrationNumber: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="merchant-vat">VAT Number</Label>
              <Input
                id="merchant-vat"
                placeholder="VAT registration"
                value={formData.vatNumber}
                onChange={(e) =>
                  setFormData({ ...formData, vatNumber: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                loading ||
                !formData.name ||
                !formData.contactEmail
              }
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {isSubmitting ? (
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
