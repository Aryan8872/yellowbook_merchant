'use client'

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { useUpdateUser } from '@/lib/admin/hooks/use-users-query';
import { useMerchants } from '@/lib/admin/hooks/use-merchants-query';
import { User } from '@/lib/api/admin/users-api';
import { ImageUploadInput } from './image-upload-input';
import { updateUserSchema, type UpdateUserInput } from '@/lib/lib/validations/user-validation';
import { showFormErrors } from '@/lib/utils/form-toast';
import { cleanPayload } from '@/lib/utils/payload-cleanup';

interface UserEditDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserEditDialog({ user, open, onOpenChange }: UserEditDialogProps) {
  const updateUserMutation = useUpdateUser();
  const { data: merchantsData } = useMerchants({ page: 1, limit: 100 });

  const form = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: '',
      role: 'USER',
      phone: '',
      avatarUrl: '',
      isActive: true,
      merchantId: '',
    },
  });

  const { watch, reset } = form;
  const role = watch('role');

  useEffect(() => {
    if (user && open) {
      reset({
        name: user.name || '',
        role: user.role || 'USER',
        phone: user.phone || '',
        avatarUrl: user.avatarUrl || '',
        isActive: user.isActive ?? true,
        merchantId: user.merchantId || '',
      });
    }
  }, [user, open, reset]);

  const onSubmit = async (data: UpdateUserInput) => {
    if (!user) return;

    try {
      const cleanedData = cleanPayload({
        name: data.name,
        role: data.role as any,
        phone: data.phone,
        avatarUrl: data.avatarUrl,
        isActive: data.isActive,
        merchantId: data.role !== 'USER' ? data.merchantId : undefined,
      });

      await updateUserMutation.mutateAsync({
        id: user.id,
        data: cleanedData,
      });
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the mutation's onError callback
      // Dialog stays open on error
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125 max-h-[90vh] overflow-y-auto">
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

        <form onSubmit={form.handleSubmit((data) => {
          if (Object.keys(form.formState.errors).length > 0) {
            showFormErrors(form.formState.errors)
            return
          }
          onSubmit(data)
        })} className="space-y-4 py-4">
          {/* Avatar Upload (circle shape) */}
          <div className="flex items-start gap-4">
            <ImageUploadInput
              folder="avatars"
              shape="circle"
              hint="Avatar image"
              value={form.watch('avatarUrl')}
              onChange={(url) => form.setValue('avatarUrl', url)}
              disabled={updateUserMutation.isPending}
            />
            <div className="flex-1 space-y-2 pt-1">
              <Label htmlFor="user-name">Full Name</Label>
              <Input
                id="user-name"
                placeholder="John Doe"
                {...form.register('name')}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Click the circle to upload a profile photo
              </p>
            </div>
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label htmlFor="user-role">Role</Label>
            <Select
              value={form.watch('role')}
              onValueChange={(value) => form.setValue('role', value as any)}
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
            {form.formState.errors.role && (
              <p className="text-sm text-destructive">{form.formState.errors.role.message}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="user-phone">Phone</Label>
            <Input
              id="user-phone"
              placeholder="+977 9800000000"
              {...form.register('phone')}
            />
            {form.formState.errors.phone && (
              <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>
            )}
          </div>

          {/* Merchant ID (only shown for merchant roles) */}
          {(role === 'MERCHANT_ADMIN' || role === 'MERCHANT_STAFF') && (
            <div className="space-y-2">
              <Label htmlFor="user-merchantId">Associated Merchant</Label>
              <Select
                value={form.watch('merchantId') || ''}
                onValueChange={(value) => value && form.setValue('merchantId', value)}
              >
                <SelectTrigger id="user-merchantId">
                  <SelectValue placeholder="Select a merchant" />
                </SelectTrigger>
                <SelectContent>
                  {merchantsData?.data && Array.isArray(merchantsData.data) && merchantsData.data.length > 0 ? (
                    merchantsData.data.map((merchant: any) => (
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
              {form.formState.errors.merchantId && (
                <p className="text-sm text-destructive">{form.formState.errors.merchantId.message}</p>
              )}
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
              checked={form.watch('isActive')}
              onCheckedChange={(checked) => form.setValue('isActive', checked)}
            />
          </div>
        </form>

        <DialogFooter>
          <Button
            variant="outline"
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={updateUserMutation.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={updateUserMutation.isPending}>
            {updateUserMutation.isPending ? (
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
