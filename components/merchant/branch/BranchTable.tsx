"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Branch } from "@/lib/types/branch"
import { BranchFormDialog } from "./BranchForm"
import { DeleteBranchDialog } from "./DeleteBranchDialog"
import { useBranchStore } from "@/lib/merchant/branch-store"

interface BranchTableProps {
  branches: Branch[]
  isLoading?: boolean
  merchantId: string
  onRefresh: () => void
}

export function BranchTable({ branches, isLoading, merchantId, onRefresh }: BranchTableProps) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [deleteBranch, setDeleteBranch] = React.useState<Branch | null>(null)
  const { deleteBranch: deleteBranchAction } = useBranchStore()

  const filteredBranches = React.useMemo(() => {
    const branchesArray = branches || []
    if (!searchQuery) return branchesArray
    const query = searchQuery.toLowerCase()
    return branchesArray.filter(
      (branch) =>
        branch.name.toLowerCase().includes(query) ||
        branch.city.toLowerCase().includes(query) ||
        branch.address.toLowerCase().includes(query)
    )
  }, [branches, searchQuery])

  const handleDelete = (branch: Branch) => {
    setDeleteBranch(branch)
  }

  const handleDeleteConfirm = async (branch: Branch) => {
    const result = await deleteBranchAction(merchantId, branch.id)
    if (result.success) {
      onRefresh()
    }
    setDeleteBranch(null)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <Input
            placeholder="Search branches..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 w-full sm:w-[300px]"
          />
        </div>
        <BranchFormDialog
          merchantId={merchantId}
          onCreated={() => {
            onRefresh()
          }}
        />
      </div>

      {/* Table */}
      <div className="relative overflow-hidden rounded-md border">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-[1px]">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Branch Name</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBranches.length > 0 ? (
              filteredBranches.map((branch) => (
                <TableRow key={branch.id}>
                  <TableCell className="font-medium">{branch.name}</TableCell>
                  <TableCell className="text-muted-foreground">{branch.city}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{branch.address}</TableCell>
                  <TableCell className="text-sm">{branch.phone}</TableCell>
                  <TableCell>
                    <Badge variant={branch.isActive ? "default" : "secondary"}>
                      {branch.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <BranchFormDialog
                        merchantId={merchantId}
                        branch={branch}
                        onUpdated={() => {
                          onRefresh()
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(branch)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  {isLoading ? "Loading branches..." : "No branches found. Create your first branch to get started."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Dialog */}
      <DeleteBranchDialog
        branch={deleteBranch}
        onClose={() => setDeleteBranch(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
