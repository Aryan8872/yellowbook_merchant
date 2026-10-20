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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, UserPlus, Eye, EyeOff } from 'lucide-react';
import { useMerchants } from '@/lib/admin/hooks/use-merchants-query';
import { useCreateUser } from '@/lib/admin/hooks/use-users-query';
import { ImageUploadInput } from './image-upload-input';
import { createUserSchema, type CreateUserInput } from '@/lib/lib/validations/user-validation';
import { showFormErrors } from '@/lib/utils/form-toast';

interface UserCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserCreateDialog({ open, onOpenChange }: UserCreateDialogProps) {
  const { data: merchantsData } = useMerchants({ page: 1, limit: 100 });
  const createUserMutation = useCreateUser();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'USER',
      phone: '',
      merchantId: '',
      avatarUrl: '',
    },
  });

  const { watch, reset } = form;
  const role = watch('role');

  useEffect(() => {
    if (open) {
      reset();
    }
  }, [open, reset]);

  const onSubmit = async (data: CreateUserInput) => {
    const merchantIdToSend = (role === 'MERCHANT_ADMIN' || role === 'MERCHANT_STAFF') && data.merchantId ? data.merchantId : undefined;
    
    createUserMutation.mutate({
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role as any,
      phone: data.phone || undefined,
      merchantId: merchantIdToSend,
      avatarUrl: data.avatarUrl || undefined,
    }, {
      onSuccess: () => {
        reset();
        onOpenChange(false);
      },
    });
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

        <form onSubmit={form.handleSubmit((data) => {
          if (Object.keys(form.formState.errors).length > 0) {
            showFormErrors(form.formState.errors)
            return
          }
          onSubmit(data)
        })} className="space-y-4 py-2">
          {/* Avatar Upload */}
          <div className="flex justify-center">
            <ImageUploadInput
              folder="avatars"
              shape="circle"
              hint="Profile photo"
              value={form.watch('avatarUrl')}
              onChange={(url) => form.setValue('avatarUrl', url)}
              disabled={createUserMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-name">Full Name *</Label>
            <Input
              id="create-name"
              placeholder="e.g. Aarav Sharma"
              {...form.register('name')}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-email">Email Address *</Label>
            <Input
              id="create-email"
              type="email"
              placeholder="user@example.com"
              {...form.register('email')}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-password">Password *</Label>
            <div className="relative">
              <Input
                id="create-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password (min 6 characters)"
                {...form.register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {form.formState.errors.password && (
              <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="create-role">Role</Label>
              <Select
                value={form.watch('role')}
                onValueChange={(value) => form.setValue('role', value as any)}
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
              {form.formState.errors.role && (
                <p className="text-sm text-destructive">{form.formState.errors.role.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-phone">Phone Number</Label>
              <Input
                id="create-phone"
                placeholder="+977 9800000000"
                {...form.register('phone')}
              />
              {form.formState.errors.phone && (
                <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>
              )}
            </div>
          </div>

          {(role === 'MERCHANT_ADMIN' || role === 'MERCHANT_STAFF') && (
            <div className="space-y-2">
              <Label htmlFor="create-merchantId">Associated Merchant *</Label>
              <Select
                value={form.watch('merchantId') || ''}
                onValueChange={(value) => value && form.setValue('merchantId', value)}
              >
                <SelectTrigger id="create-merchantId">
                  <SelectValue placeholder="Select a merchant" />
                </SelectTrigger>
                <SelectContent>
                  {merchantsData && Array.isArray(merchantsData) && merchantsData.length > 0 ? (
                    merchantsData.map((merchant: any) => (
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
              disabled={createUserMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createUserMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {createUserMutation.isPending ? (
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
