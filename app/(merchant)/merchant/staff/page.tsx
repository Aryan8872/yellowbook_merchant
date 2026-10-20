'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useMerchantStaffStore } from '@/lib/merchant/stores/staff-store';
import { useAuthStore } from '@/lib/auth/auth-store';
import { Staff } from '@/lib/api/merchant/staff-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable, StatusToggle, ActionMenu } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import type { DataTableFeatures } from '@/components/merchant/offer/offerTable/data-table-features';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Shield, Plus, Users, Search, Filter, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

// Canonical staff permissions (mirrors backend STAFF_PERMISSIONS).
const STAFF_PERMISSIONS = ['redeem', 'manage_offers', 'view_reports'] as const;
type StaffPermission = (typeof STAFF_PERMISSIONS)[number];

const PERMISSION_LABELS: Record<StaffPermission, string> = {
  redeem: 'Verify & redeem (QR)',
  manage_offers: 'Manage offers',
  view_reports: 'View reports',
};

const PERMISSION_SHORT_LABELS: Record<StaffPermission, string> = {
  redeem: 'Redeem',
  manage_offers: 'Offers',
  view_reports: 'Reports',
};

export default function StaffPage() {
  const { merchantId } = useAuthStore();
  const { staff, loading, pagination, fetchStaff, createStaff, updateStaff } = useMerchantStaffStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'MERCHANT_STAFF' as 'MERCHANT_ADMIN' | 'MERCHANT_STAFF',
    password: '',
    permissions: [] as string[],
  });

  const [currentPage, setCurrentPage] = useState(1);
  const limit = pagination?.limit || 20;
  const total = pagination?.total || 0;
  const totalPages = pagination?.totalPages || 1;

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');

  const loadData = useCallback((targetPage: number = 1) => {
    setCurrentPage(targetPage);
    fetchStaff({
      page: targetPage,
      limit,
      search: search.trim() || undefined,
      isActive: status === 'active' ? true : status === 'inactive' ? false : undefined,
    });
  }, [limit, search, status, fetchStaff]);

  const hasFetchedRef = useRef(false);
  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchStaff({ page: 1, limit });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      permissions: staffMember.permissions || [],
    });
    setIsDialogOpen(true);
  }

  const handleTogglePermission = (permission: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      permissions: checked
        ? Array.from(new Set([...prev.permissions, permission]))
        : prev.permissions.filter((p) => p !== permission),
    }));
  };

  const handleSearch = () => {
    loadData(1);
  };

  const handleReset = () => {
    setSearch('');
    setStatus('');
    setCurrentPage(1);
    fetchStaff({
      page: 1,
      limit,
    });
  };

  const handleFilter = () => {
    loadData(1);
  };

  const handlePageChange = (newPage: number) => {
    loadData(newPage);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingStaff) {
      await updateStaff(editingStaff.id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        ...(formData.role === 'MERCHANT_STAFF' ? { permissions: formData.permissions } : {}),
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
        ...(formData.role === 'MERCHANT_STAFF' ? { permissions: formData.permissions } : {}),
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
      permissions: [],
    });
  };

  const columns: ColumnDef<DataTableFeatures, Staff>[] = [
    {
      accessorKey: 'user.name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <User className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <span className="font-medium">{row.original.user?.name || 'Unknown'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'user.email',
      header: 'Email',
      cell: ({ row }) => <span>{row.original.user?.email || '-'}</span>,
    },
    {
      accessorKey: 'user.phone',
      header: 'Phone',
      cell: ({ row }) => <span>{row.original.user?.phone || '-'}</span>,
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Shield className="h-3 w-3 text-muted-foreground" />
          <Badge variant={row.original.role === 'MERCHANT_ADMIN' ? 'default' : 'secondary'}>
            {row.original.role === 'MERCHANT_ADMIN' ? 'Admin' : 'Staff'}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: 'permissions',
      header: 'Permissions',
      cell: ({ row }) => {
        if (row.original.role === 'MERCHANT_ADMIN') {
          return <Badge variant="outline">All</Badge>;
        }
        const perms = (row.original.permissions || []).filter((p: string) =>
          (STAFF_PERMISSIONS as readonly string[]).includes(p)
        );
        if (perms.length === 0) {
          return <span className="text-muted-foreground text-sm">None</span>;
        }
        return (
          <div className="flex flex-wrap gap-1">
            {perms.map((p: string) => (
              <Badge key={p} variant="secondary">
                {PERMISSION_SHORT_LABELS[p as StaffPermission] || p}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <StatusToggle
          isActive={row.original.isActive}
          onToggle={() => handleToggleStatus(row.original)}
        />
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
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
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
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

      <Card>
        <CardHeader>
          <CardTitle>Staff</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or phone... (Press Enter)"
                  value={search}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSearch();
                    }
                  }}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={status} onValueChange={(value) => setStatus(value || '')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            {(search || status) && (
              <Button variant="outline" onClick={handleReset}>
                Reset
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={staff}
        isLoading={loading}
        manualPagination
        pageCount={totalPages}
        rowCount={total}
        pageIndex={currentPage - 1}
        onPageChange={(zeroBasedPage) => handlePageChange(zeroBasedPage + 1)}
        showToolbar={false}
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
              {formData.role === 'MERCHANT_STAFF' ? (
                <div className="grid gap-2">
                  <Label>Permissions</Label>
                  <div className="grid gap-2 rounded-md border p-3">
                    {STAFF_PERMISSIONS.map((permission) => {
                      const checked = formData.permissions.includes(permission);
                      return (
                        <label
                          key={permission}
                          className="flex items-center gap-2 text-sm font-normal"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => handleTogglePermission(permission, e.target.checked)}
                          />
                          <span>{PERMISSION_LABELS[permission]}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Admins implicitly have all permissions.
                </p>
              )}
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
