'use client';

import React, { useEffect, useState } from 'react';
import { useMerchantStaffStore } from '@/lib/merchant/stores/staff-store';
import { useAuthStore } from '@/lib/auth/auth-store';
import { Staff } from '@/lib/api/merchant/staff-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable, StatusToggle, ActionMenu } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Shield, Plus, Users, Search, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function StaffPage() {
  const { merchantId } = useAuthStore();
  const { staff, loading, fetchStaff, createStaff, updateStaff } = useMerchantStaffStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'MERCHANT_STAFF' as 'MERCHANT_ADMIN' | 'MERCHANT_STAFF',
    password: '',
  });

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleToggleStatus = async (staffMember: Staff) => {
    await updateStaff(staffMember.id, {
      isActive: !staffMember.isActive,
    });
  };

  const handleEdit = (staffMember: Staff) => {
    console.log('[Staff Page] Editing staff:', staffMember);
    setEditingStaff(staffMember);
    setFormData({
      name: staffMember.user?.name || '',
      email: staffMember.user?.email || '',
      phone: staffMember.user?.phone || '',
      role: staffMember.role,
      password: '',
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingStaff) {
      await updateStaff(editingStaff.id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
      });
    } else {
      if (!formData.password) {
        toast.error('Password is required for new staff');
        return;
      }
      await createStaff({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        password: formData.password,
      });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingStaff(null);
    setShowPassword(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'MERCHANT_STAFF',
      password: '',
    });
  };

  const columns: any[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <User className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <span className="font-medium">{row.original.user?.name || 'Unknown'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }: any) => <span>{row.original.user?.email || '-'}</span>,
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }: any) => <span>{row.original.user?.phone || '-'}</span>,
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-1">
          <Shield className="h-3 w-3 text-muted-foreground" />
          <Badge variant={row.original.role === 'MERCHANT_ADMIN' ? 'default' : 'secondary'}>
            {row.original.role === 'MERCHANT_ADMIN' ? 'Admin' : 'Staff'}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }: any) => (
        <StatusToggle
          isActive={row.original.isActive}
          onToggle={() => handleToggleStatus(row.original)}
        />
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <ActionMenu
          onEdit={() => handleEdit(row.original)}
          onToggle={() => handleToggleStatus(row.original)}
          toggleLabel={row.original.isActive ? 'Deactivate' : 'Activate'}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-amber-500" />
            Staff Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your venue staff members and their access permissions
          </p>
        </div>
        <Button
          className="bg-amber-500 hover:bg-amber-600"
          onClick={() => setIsDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Staff
        </Button>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={staff}
        isLoading={loading}
        searchPlaceholder="Search staff by name or email..."
        searchKey="name"
        emptyMessage="No staff members found. Add your first staff member to get started."
      />

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingStaff ? 'Edit Staff Member' : 'Add New Staff'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone (Optional)</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => {
                    if (value === 'MERCHANT_ADMIN' || value === 'MERCHANT_STAFF') {
                      setFormData({ ...formData, role: value });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MERCHANT_STAFF">Staff</SelectItem>
                    <SelectItem value="MERCHANT_ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {!editingStaff && (
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      className="pr-10"
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
              )}
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-amber-500 hover:bg-amber-600">
                {editingStaff ? 'Update Staff' : 'Add Staff'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
