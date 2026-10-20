"use client"

import { useState, useCallback } from "react"
import { useAuthStore } from "@/lib/auth/auth-store"
import { useBranches, useDeleteBranch, useUpdateBranch } from "@/lib/merchant/hooks/use-branches-query"
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
import { MapPin, Phone, Building2, Plus, Search, Filter, Map, Table } from "lucide-react"
import { BranchFormDialog } from "@/components/merchant/branch/BranchForm"
import { DeleteBranchDialog } from "@/components/merchant/branch/DeleteBranchDialog"
import { BranchMap } from "@/components/map/branch-map"
import { Branch } from "@/lib/types/branch"

export default function Page() {
  const { merchantId } = useAuthStore()
  const [deleteBranchState, setDeleteBranchState] = useState<Branch | null>(null)
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null)
  const [viewMode, setViewMode] = useState<'table' | 'map'>('table')

  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');

  const [appliedSearch, setAppliedSearch] = useState('');

  // TanStack Query for fetching branches
  const { data: branchesData, isLoading, error, refetch } = useBranches(merchantId || '', {
    page: currentPage,
    limit: 20,
    search: appliedSearch.trim() || undefined,
    isActive: status === 'active' ? true : status === 'inactive' ? false : undefined,
  });

  // Mutations
  const deleteBranchMutation = useDeleteBranch(merchantId || '');
  const updateBranchMutation = useUpdateBranch(merchantId || '');

  const branches = branchesData?.data || [];
  const pagination = branchesData?.pagination;
  const limit = pagination?.limit || 20;
  const total = pagination?.total || 0;
  const totalPages = pagination?.totalPages || 1;

  const handleToggleStatus = async (branch: Branch) => {
    await updateBranchMutation.mutateAsync({
      branchId: branch.id,
      data: { isActive: !branch.isActive },
    });
  }

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch)
  }

  const handleDelete = (branch: Branch) => {
    setDeleteBranchState(branch)
  }

  const handleDeleteConfirm = async (branch: Branch) => {
    await deleteBranchMutation.mutateAsync(branch.id)
    setDeleteBranchState(null)
  }

  const handleSearch = () => {
    setAppliedSearch(search);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setSearch('');
    setAppliedSearch('');
    setStatus('');
    setCurrentPage(1);
  };

  const handleFilter = () => {
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const columns: ColumnDef<DataTableFeatures, Branch>[] = [
    {
      accessorKey: "name",
      header: "Branch Name",
      cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
    },
    {
      accessorKey: "district",
      header: "District",
      cell: ({ row }) => (
        <Badge variant="outline" className="font-normal capitalize">
          {row.original.district || 'N/A'}
        </Badge>
      ),
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
            onClick={() => refetch()}
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
            refetch()
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
                  placeholder="Search by name or city... (Press Enter to search)"
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
              <SelectTrigger className="w-45">
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
            {(appliedSearch || status) && (
              <Button variant="outline" onClick={handleReset}>
                Reset
              </Button>
            )}
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                <Table className="h-4 w-4 mr-2" />
                Table
              </Button>
              <Button
                variant={viewMode === 'map' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('map')}
              >
                <Map className="h-4 w-4 mr-2" />
                Map
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {viewMode === 'map' ? (
        <Card>
          <CardContent className="p-0">
            <BranchMap
              branches={branches.map((b) => ({
                id: b.id,
                name: b.name,
                lat: b.lat,
                lng: b.lng,
                address: b.address,
                city: b.city,
                district: b.district,
                phone: b.phone,
                isActive: b.isActive,
                operatingHours: b.operatingHours,
              }))}
              selectedBranchId={editingBranch?.id}
              onEditBranch={(branch) => {
                const fullBranch = branches.find((b) => b.id === branch.id)
                if (fullBranch) {
                  setEditingBranch(fullBranch)
                }
              }}
              className="h-150"
            />
          </CardContent>
        </Card>
      ) : (
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
      )}

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
            refetch()
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