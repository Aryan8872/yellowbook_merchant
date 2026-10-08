"use client"

import * as React from "react"
import {
  Loader2,
  MoreHorizontal,
} from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface TableQueryParams {
  pageIndex: number
  pageSize: number
  sorting: any
  search: string
}

export interface DataTableProps<TData> {
  columns: any[]
  data: TData[]
  // Manual / Server-driven pagination
  manualPagination?: boolean
  pageCount?: number
  rowCount?: number
  pageIndex?: number
  onPageChange?: (pageIndex: number) => void
  // Search configuration
  searchKey?: string
  searchPlaceholder?: string
  showToolbar?: boolean
  // Loading & error states
  isLoading?: boolean
  // Optional controlled query callback for API syncing
  onQueryChange?: (params: TableQueryParams) => void
  // Toolbar actions
  toolbarActions?: React.ReactNode
  // Empty state message
  emptyMessage?: string
}

export function DataTable<TData>({
  columns,
  data,
  manualPagination = false,
  pageCount,
  rowCount,
  pageIndex,
  onPageChange,
  searchKey = "name",
  searchPlaceholder = "Search...",
  showToolbar = true,
  isLoading = false,
  onQueryChange,
  toolbarActions,
  emptyMessage = "No results found.",
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<any>([])
  const [columnFilters, setColumnFilters] = React.useState<any>([])
  const [columnVisibility, setColumnVisibility] = React.useState<any>({})
  const [rowSelection, setRowSelection] = React.useState<any>({})
  const [internalPagination, setInternalPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })

  const pagination = {
    pageIndex: pageIndex !== undefined ? pageIndex : internalPagination.pageIndex,
    pageSize: internalPagination.pageSize,
  }

  const setPagination = (updater: any) => {
    if (typeof updater === 'function') {
      const next = updater(pagination)
      setInternalPagination(next)
      if (onPageChange && next.pageIndex !== pagination.pageIndex) {
        onPageChange(next.pageIndex)
      }
    } else {
      setInternalPagination(updater)
      if (onPageChange && updater.pageIndex !== pagination.pageIndex) {
        onPageChange(updater.pageIndex)
      }
    }
  }

  // Local text state so the input is never destroyed by store updates
  const [searchText, setSearchText] = React.useState("")

  // Single debounced effect to notify parent of query changes
  React.useEffect(() => {
    if (onQueryChange) {
      const handler = setTimeout(() => {
        onQueryChange({
          pageIndex: pagination.pageIndex,
          pageSize: pagination.pageSize,
          sorting,
          search: searchText,
        })
      }, 400)

      return () => clearTimeout(handler)
    }
  }, [searchText, pagination.pageIndex, pagination.pageSize, sorting, onQueryChange])

  const searchColumn = columns.find((col: any) => col.accessorKey === searchKey)

  return (
    <div className="space-y-4">
      {/* Table Toolbar */}
      {showToolbar && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {/* Left: search */}
          <div className="flex flex-1 items-center gap-2">
            <Input
              placeholder={searchPlaceholder}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="h-8 w-full sm:w-[250px] lg:w-[320px]"
            />
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2">
            {toolbarActions}
          </div>
        </div>
      )}

      {/* Main Table Container */}
      <div className="relative overflow-hidden rounded-md border">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-[1px]">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col: any, index: number) => (
                <TableHead key={index}>
                  {col.header || col.id}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {data?.length > 0 ? (
              data.map((row: any, rowIndex: number) => (
                <TableRow key={row.id || rowIndex}>
                  {columns.map((col: any, colIndex: number) => (
                    <TableCell key={colIndex}>
                      {col.cell ? col.cell({ row: { original: row } }) : (row[col.accessorKey])}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {isLoading ? "Loading data..." : emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {manualPagination && pageCount && (
        <div className="flex items-center justify-between px-2">
          <div className="flex-1 text-sm text-muted-foreground">
            Showing {pagination.pageIndex * pagination.pageSize + 1} to{" "}
            {Math.min((pagination.pageIndex + 1) * pagination.pageSize, rowCount || 0)} of{" "}
            {rowCount || 0} results
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination((prev: any) => ({ ...prev, pageIndex: prev.pageIndex - 1 }))}
              disabled={pagination.pageIndex === 0}
            >
              Previous
            </Button>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">
                Page {pagination.pageIndex + 1} of {pageCount}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination((prev: any) => ({ ...prev, pageIndex: prev.pageIndex + 1 }))}
              disabled={pagination.pageIndex >= pageCount - 1}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper components for common column patterns
export const StatusToggle = ({
  isActive,
  onToggle,
  label = "Active",
}: {
  isActive: boolean
  onToggle: () => void
  label?: string
}) => (
  <Badge variant={isActive ? "default" : "secondary"} className="cursor-pointer" onClick={onToggle}>
    {isActive ? label : "Inactive"}
  </Badge>
)

export const ActionMenu = ({
  onEdit,
  onDelete,
  onToggle,
  toggleLabel = "Toggle Status",
}: {
  onEdit?: () => void
  onDelete?: () => void
  onToggle?: () => void
  toggleLabel?: string
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger>
      <Button variant="ghost" className="h-8 w-8 p-0">
        <span className="sr-only">Open menu</span>
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      {onEdit && <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>}
      {onToggle && <DropdownMenuItem onClick={onToggle}>{toggleLabel}</DropdownMenuItem>}
      {onDelete && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onDelete} className="text-destructive">
            Delete
          </DropdownMenuItem>
        </>
      )}
    </DropdownMenuContent>
  </DropdownMenu>
)
