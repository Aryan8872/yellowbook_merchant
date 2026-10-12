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
    address: '',
    panNumber: '',
    vatNumber: '',
    logoUrl: '',
  });

  useEffect(() => {
    if (merchant && open) {
      setFormData({
        name: merchant.name || '',
        contactEmail: merchant.contactEmail || '',
        contactPhone: merchant.contactPhone || '',
        address: (merchant as any).address || '',
        panNumber: (merchant as any).panNumber || '',
        vatNumber: (merchant as any).vatNumber || '',
        logoUrl: merchant.logoUrl || '',
      });
    } else if (!merchant && open) {
      setFormData({
        name: '',
        contactEmail: '',
        contactPhone: '',
        address: '',
        panNumber: '',
        vatNumber: '',
        logoUrl: '',
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
          address: formData.address || undefined,
          panNumber: formData.panNumber || undefined,
          vatNumber: formData.vatNumber || undefined,
          logoUrl: formData.logoUrl || undefined,
        });
        onOpenChange(false);
      } else {
        const created = await createMerchant({
          name: formData.name,
          contactEmail: formData.contactEmail,
          contactPhone: formData.contactPhone || undefined,
          address: formData.address || undefined,
          panNumber: formData.panNumber || undefined,
          vatNumber: formData.vatNumber || undefined,
          logoUrl: formData.logoUrl || undefined,
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
      <DialogContent className="sm:max-w-[540px]">
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

          <div className="space-y-2">
            <Label htmlFor="merchant-address">Address / Head Office</Label>
            <Input
              id="merchant-address"
              placeholder="Thamel, Kathmandu"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="merchant-pan">PAN Number</Label>
              <Input
                id="merchant-pan"
                placeholder="9-digit PAN"
                value={formData.panNumber}
                onChange={(e) =>
                  setFormData({ ...formData, panNumber: e.target.value })
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

          <div className="space-y-2">
            <Label htmlFor="merchant-logo">Logo URL</Label>
            <Input
              id="merchant-logo"
              placeholder="https://example.com/logo.png"
              value={formData.logoUrl}
              onChange={(e) =>
                setFormData({ ...formData, logoUrl: e.target.value })
              }
            />
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
