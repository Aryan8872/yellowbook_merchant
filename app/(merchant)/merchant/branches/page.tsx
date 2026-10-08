"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/lib/auth/auth-store"
import { useBranchStore } from "@/lib/merchant/branch-store"
import { DataTable, StatusToggle, ActionMenu } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Phone, Building2, Plus } from "lucide-react"
import { BranchFormDialog } from "@/components/merchant/branch/BranchForm"
import { DeleteBranchDialog } from "@/components/merchant/branch/DeleteBranchDialog"
import { Branch } from "@/lib/types/branch"

export default function Page() {
  const { merchantId } = useAuthStore()
  const { branches, isLoading, error, listBranches, clearError, toggleBranchActive, deleteBranch } = useBranchStore()
  const [deleteBranchState, setDeleteBranchState] = useState<Branch | null>(null)
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null)

  useEffect(() => {
    if (merchantId) {
      listBranches(merchantId)
    }
  }, [merchantId, listBranches])

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
      listBranches(merchantId)
    }
    setDeleteBranchState(null)
  }

  const columns: any[] = [
    {
      accessorKey: "name",
      header: "Branch Name",
      cell: ({ row }: any) => <div className="font-medium">{row.original.name}</div>,
    },
    {
      accessorKey: "city",
      header: "City",
      cell: ({ row }: any) => <span className="text-muted-foreground">{row.original.city}</span>,
    },
    {
      accessorKey: "address",
      header: "Address",
      cell: ({ row }: any) => <span className="text-sm text-muted-foreground">{row.original.address}</span>,
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-1">
          <Phone className="h-3 w-3 text-muted-foreground" />
          <span className="text-sm">{row.original.phone}</span>
        </div>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }: any) => (
        <StatusToggle
          isActive={row.original.isActive}
          onToggle={() => handleToggleStatus(row.original)}
        />
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => (
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Branches</h1>
        <p className="text-muted-foreground">
          Manage your branch locations and operating hours
        </p>
      </div>

      <DataTable
        columns={columns}
        data={branches}
        isLoading={isLoading}
        searchPlaceholder="Search branches..."
        searchKey="name"
        toolbarActions={
          <BranchFormDialog
            merchantId={merchantId!}
            onCreated={() => {
              if (merchantId) listBranches(merchantId)
            }}
          />
        }
        emptyMessage="No branches found. Create your first branch to get started."
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
            if (merchantId) listBranches(merchantId)
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