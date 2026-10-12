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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, UserPlus, Eye, EyeOff } from 'lucide-react';
import { useUsersStore } from '@/lib/admin/stores/users-store';
import { useMerchantsStore } from '@/lib/admin/stores/merchants-store';
import { ImageUploadInput } from './image-upload-input';

interface UserCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserCreateDialog({ open, onOpenChange }: UserCreateDialogProps) {
  const { createUser, loading } = useUsersStore();
  const { merchants, fetchMerchants } = useMerchantsStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER',
    phone: '',
    merchantId: '',
    avatarUrl: '',
  });

  useEffect(() => {
    if (open) {
      fetchMerchants({ page: 1, limit: 100 });
    }
  }, [open, fetchMerchants]);

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'USER',
      phone: '',
      merchantId: '',
      avatarUrl: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) return;
    if ((formData.role === 'MERCHANT_ADMIN' || formData.role === 'MERCHANT_STAFF') && !formData.merchantId) return;

    setIsSubmitting(true);
    try {
      const merchantIdToSend = (formData.role === 'MERCHANT_ADMIN' || formData.role === 'MERCHANT_STAFF') && formData.merchantId ? formData.merchantId : undefined;
      
      const created = await createUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role as any,
        phone: formData.phone || undefined,
        merchantId: merchantIdToSend,
        avatarUrl: formData.avatarUrl || undefined,
      });

      if (created) {
        resetForm();
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Failed to create user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new platform user or merchant staff account.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Avatar Upload */}
          <div className="flex justify-center">
            <ImageUploadInput
              folder="avatars"
              shape="circle"
              hint="Profile photo"
              value={formData.avatarUrl}
              onChange={(url) => setFormData({ ...formData, avatarUrl: url })}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-name">Full Name *</Label>
            <Input
              id="create-name"
              placeholder="e.g. Aarav Sharma"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-email">Email Address *</Label>
            <Input
              id="create-email"
              type="email"
              placeholder="user@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-password">Password *</Label>
            <div className="relative">
              <Input
                id="create-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password (min 6 characters)"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="create-role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  value && setFormData({ ...formData, role: value as any })
                }
              >
                <SelectTrigger id="create-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">Customer / User</SelectItem>
                  <SelectItem value="MERCHANT_ADMIN">Merchant Admin</SelectItem>
                  <SelectItem value="MERCHANT_STAFF">Merchant Staff</SelectItem>
                  <SelectItem value="ADMIN">System Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-phone">Phone Number</Label>
              <Input
                id="create-phone"
                placeholder="+977 9800000000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          {(formData.role === 'MERCHANT_ADMIN' || formData.role === 'MERCHANT_STAFF') && (
            <div className="space-y-2">
              <Label htmlFor="create-merchantId">Associated Merchant *</Label>
              <Select
                value={formData.merchantId || ''}
                onValueChange={(value) => value && setFormData({ ...formData, merchantId: value })}
              >
                <SelectTrigger id="create-merchantId">
                  <SelectValue placeholder="Select a merchant" />
                </SelectTrigger>
                <SelectContent>
                  {merchants && merchants.length > 0 ? (
                    merchants.map((merchant: any) => (
                      <SelectItem key={merchant.id} value={merchant.id}>
                        {merchant.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>
                      No merchants available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Affiliates this user with their store branch.
              </p>
            </div>
          )}

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
                !formData.email ||
                !formData.password ||
                ((formData.role === 'MERCHANT_ADMIN' || formData.role === 'MERCHANT_STAFF') && !formData.merchantId)
              }
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create User'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
