"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useAuthStore } from "@/lib/auth/auth-store"
import { useBranchStore } from "@/lib/merchant/branch-store"
import { DataTable, StatusToggle, ActionMenu } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import type { DataTableFeatures } from "@/components/merchant/offer/offerTable/data-table-features"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { MapPin, Phone, Building2, Plus, Search, Filter } from "lucide-react"
import { BranchFormDialog } from "@/components/merchant/branch/BranchForm"
import { DeleteBranchDialog } from "@/components/merchant/branch/DeleteBranchDialog"
import { Branch } from "@/lib/types/branch"

export default function Page() {
  const { merchantId } = useAuthStore()
  const { branches, isLoading, error, pagination, listBranches, clearError, toggleBranchActive, deleteBranch } = useBranchStore()
  const [deleteBranchState, setDeleteBranchState] = useState<Branch | null>(null)
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null)

  const [currentPage, setCurrentPage] = useState(1);
  const limit = pagination?.limit || 20;
  const total = pagination?.total || 0;
  const totalPages = pagination?.totalPages || 1;

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');

  const loadData = useCallback((targetPage: number = 1) => {
    if (merchantId) {
      setCurrentPage(targetPage);
      listBranches(merchantId, {
        page: targetPage,
        limit,
        search: search.trim() || undefined,
        isActive: status === 'active' ? true : status === 'inactive' ? false : undefined,
      });
    }
  }, [merchantId, limit, search, status, listBranches]);

  const hasFetchedRef = useRef(false);
  useEffect(() => {
    if (merchantId && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      listBranches(merchantId, { page: 1, limit });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [merchantId]);

  const handleToggleStatus = async (branch: Branch) => {
    await toggleBranchActive(merchantId!, branch.id, !branch.isActive)
  }

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch)
  }

  const handleDelete = (branch: Branch) => {
    setDeleteBranchState(branch)
  }

  const handleDeleteConfirm = async (branch: Branch) => {
    const result = await deleteBranch(merchantId!, branch.id)
    if (result.success && merchantId) {
      loadData(1)
    }
    setDeleteBranchState(null)
  }

  const handleSearch = () => {
    loadData(1);
  };

  const handleFilter = () => {
    loadData(1);
  };

  const handlePageChange = (newPage: number) => {
    loadData(newPage);
  };

  const columns: ColumnDef<DataTableFeatures, Branch>[] = [
    {
      accessorKey: "name",
      header: "Branch Name",
      cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
    },
    {
      accessorKey: "city",
      header: "City",
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.city}</span>,
    },
    {
      accessorKey: "address",
      header: "Address",
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.address}</span>,
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Phone className="h-3 w-3 text-muted-foreground" />
          <span className="text-sm">{row.original.phone}</span>
        </div>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <StatusToggle
          isActive={row.original.isActive}
          onToggle={() => handleToggleStatus(row.original)}
        />
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <ActionMenu
          onEdit={() => handleEdit(row.original)}
          onDelete={() => handleDelete(row.original)}
          onToggle={() => handleToggleStatus(row.original)}
          toggleLabel={row.original.isActive ? "Deactivate" : "Activate"}
        />
      ),
    },
  ]

  const isInitialLoad = isLoading && (branches?.length ?? 0) === 0

  if (isInitialLoad) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Branches</h1>
          <p className="text-muted-foreground">
            Manage your branch locations and operating hours
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    )
  }

  if (error && (branches?.length ?? 0) === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Branches</h1>
          <p className="text-muted-foreground">
            Manage your branch locations and operating hours
          </p>
        </div>
        <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/10">
          <p className="text-destructive font-medium">Unable to load branches</p>
          <p className="text-sm text-muted-foreground mt-1">
            Please check your connection and try again.
          </p>
          <button
            onClick={() => {
              clearError()
              if (merchantId) listBranches(merchantId)
            }}
            className="mt-3 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:opacity-90"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Branches</h1>
          <p className="text-muted-foreground">
            Manage your branch locations and operating hours
          </p>
        </div>
        <BranchFormDialog
          merchantId={merchantId!}
          onCreated={() => {
            if (merchantId) loadData(1)
          }}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Branches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or city..."
                  value={search}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
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
            <Button onClick={handleFilter}>
              <Filter className="mr-2 h-4 w-4" />
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <DataTable
        columns={columns}
        data={branches}
        isLoading={isLoading}
        manualPagination
        pageCount={totalPages}
        rowCount={total}
        pageIndex={currentPage - 1}
        onPageChange={(zeroBasedPage) => handlePageChange(zeroBasedPage + 1)}
        showToolbar={false}
        emptyMessage="No branches found."
      />

      {/* Edit Branch Dialog */}
      {editingBranch && (
        <BranchFormDialog
          merchantId={merchantId!}
          branch={editingBranch}
          open={!!editingBranch}
          onOpenChange={(open) => {
            if (!open) setEditingBranch(null)
          }}
          onUpdated={() => {
            setEditingBranch(null)
            if (merchantId) loadData(1)
          }}
        />
      )}

      {/* Delete Dialog */}
      <DeleteBranchDialog
        branch={deleteBranchState}
        onClose={() => setDeleteBranchState(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}