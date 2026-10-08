"use client"

import * as React from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type PaginationState,
  type RowData,
  type SortingState,
  useTable,
} from "@tanstack/react-table"
import { Loader2 } from "lucide-react"

import { Input } from "@/components/ui/input"
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

import { features, type DataTableFeatures } from "./data-table-features"
import { DataTablePagination } from "./data-table-pagination"
import { DataTableViewOptions } from "./data-table-view-options"
import { useOfferStore } from "@/lib/offers/offer-store"

export interface TableQueryParams {
  pageIndex: number
  pageSize: number
  sorting: SortingState
  search: string
}

interface DataTableProps<TData extends RowData> {
  columns: ColumnDef<DataTableFeatures, TData>[]
  data: TData[]
  // Manual / Server-driven pagination
  manualPagination?: boolean
  pageCount?: number
  rowCount?: number
  // Search configuration
  searchKey?: string
  searchPlaceholder?: string
  // Loading & error states
  isLoading?: boolean
  // Optional controlled query callback for API syncing
  onQueryChange?: (params: TableQueryParams) => void
}

export function DataTable<TData extends RowData>({
  columns,
  data,
  manualPagination = false,
  pageCount,
  rowCount,
  searchKey = "title",
  searchPlaceholder = "Search by title...",
  isLoading = false,
  onQueryChange,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<ColumnVisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const { setSearchParams, getOffers, error } = useOfferStore();

  // Local text state so the input is never destroyed by store updates
  const [searchText, setSearchText] = React.useState("")

  // Debounce: push to store 400 ms after the user stops typing
  React.useEffect(() => {
    const t = setTimeout(() => {
      setSearchParams({ q: searchText || undefined })
    }, 400)
    return () => clearTimeout(t)
  }, [searchText])

  type SortOption = 'trending' | 'popular' | 'rating' | 'savings' | 'newest'
  const SORT_OPTIONS: { value: SortOption; label: string }[] = [
    { value: 'newest',   label: 'Newest' },
    { value: 'trending', label: 'Trending' },
    { value: 'popular',  label: 'Most Popular' },
    { value: 'rating',   label: 'Top Rated' },
    { value: 'savings',  label: 'Best Savings' },
  ]

  const [sortBy, setSortBy] = React.useState<SortOption>('newest')

  // Immediately push sort selection to store
  React.useEffect(() => {
    setSearchParams({ sortBy })
  }, [sortBy])

  // Debounced search query notify
  const searchValue = (columnFilters.find((f) => f.id === searchKey)?.value as string) ?? ""

  React.useEffect(() => {
    if (onQueryChange) {
      const handler = setTimeout(() => {
        onQueryChange({
          pageIndex: pagination.pageIndex,
          pageSize: pagination.pageSize,
          sorting,
          search: searchValue,
        })
      }, 300)

      return () => clearTimeout(handler)
    }
  }, [pagination.pageIndex, pagination.pageSize, sorting, searchValue, onQueryChange])

  const table = useTable({
    features,
    data,
    columns,
    manualPagination,
    pageCount,
    rowCount,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  })

  const searchColumn = table.getColumn(searchKey)

  return (
    <div className="space-y-4">
      {/* Table Toolbar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: search + sort */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            placeholder={searchPlaceholder}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="h-8 w-full sm:w-[250px] lg:w-[320px]"
          />
          <Select
            value={sortBy}
            onValueChange={(v) => setSortBy(v as SortOption)}
          >
            <SelectTrigger className="h-8 w-full sm:w-[160px]" aria-label="Sort offers by">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DataTableViewOptions table={table} />
      </div>

      {/* Main Table Container */}
      <div className="relative overflow-hidden rounded-md border">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-[1px]">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : (
                        <table.FlexRender header={header} />
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      <table.FlexRender cell={cell} />
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
                  {isLoading ? "Loading data..." : "No results found."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <DataTablePagination table={table} />
    </div>
  )
}