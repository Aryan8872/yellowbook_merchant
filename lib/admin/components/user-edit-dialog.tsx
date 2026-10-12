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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2, UserCircle2 } from 'lucide-react';
import { useUsersStore } from '@/lib/admin/stores/users-store';
import { User } from '@/lib/api/admin/users-api';
import { ImageUploadInput } from './image-upload-input';

interface UserEditDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserEditDialog({ user, open, onOpenChange }: UserEditDialogProps) {
  const { updateUser, loading } = useUsersStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: 'USER',
    phone: '',
    avatarUrl: '',
    isActive: true,
    merchantId: '',
  });

  useEffect(() => {
    if (user && open) {
      setFormData({
        name: user.name || '',
        role: user.role || 'USER',
        phone: user.phone || '',
        avatarUrl: user.avatarUrl || '',
        isActive: user.isActive ?? true,
        merchantId: user.merchantId || '',
      });
    }
  }, [user, open]);

  const handleSubmit = async () => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      await updateUser(user.id, {
        name: formData.name,
        role: formData.role as any,
        phone: formData.phone || undefined,
        avatarUrl: formData.avatarUrl || undefined,
        isActive: formData.isActive,
        merchantId: formData.role !== 'USER' ? formData.merchantId : undefined,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setFormData({
        name: user?.name || '',
        role: user?.role || 'USER',
        phone: user?.phone || '',
        avatarUrl: user?.avatarUrl || '',
        isActive: user?.isActive ?? true,
        merchantId: user?.merchantId || '',
      });
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <UserCircle2 className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user information. Click save when you&apos;re done.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Avatar Upload (circle shape) */}
          <div className="flex items-start gap-4">
            <ImageUploadInput
              folder="avatars"
              shape="circle"
              hint="Avatar image"
              value={formData.avatarUrl}
              onChange={(url) => setFormData({ ...formData, avatarUrl: url })}
              disabled={isSubmitting}
            />
            <div className="flex-1 space-y-2 pt-1">
              <Label htmlFor="user-name">Full Name</Label>
              <Input
                id="user-name"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Click the circle to upload a profile photo
              </p>
            </div>
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label htmlFor="user-role">Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => value && setFormData({ ...formData, role: value as any })}
            >
              <SelectTrigger id="user-role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="MERCHANT_ADMIN">Merchant Admin</SelectItem>
                <SelectItem value="MERCHANT_STAFF">Merchant Staff</SelectItem>
                <SelectItem value="USER">User</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="user-phone">Phone</Label>
            <Input
              id="user-phone"
              placeholder="+977 9800000000"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          {/* Merchant ID (only shown for merchant roles) */}
          {(formData.role === 'MERCHANT_ADMIN' || formData.role === 'MERCHANT_STAFF') && (
            <div className="space-y-2">
              <Label htmlFor="user-merchantId">Merchant ID</Label>
              <Input
                id="user-merchantId"
                placeholder="merchant-uuid"
                value={formData.merchantId}
                onChange={(e) => setFormData({ ...formData, merchantId: e.target.value })}
              />
            </div>
          )}

          {/* Active Toggle */}
          <div className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">Active Status</Label>
              <p className="text-sm text-muted-foreground">
                Enable or disable this user account
              </p>
            </div>
            <Switch
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || loading}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
