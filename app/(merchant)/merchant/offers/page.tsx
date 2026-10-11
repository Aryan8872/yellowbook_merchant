"use client"
import { useEffect, useState, useCallback, useRef } from "react"
import { useAuthStore } from "@/lib/auth"
import { useMerchantOffersStore } from "@/lib/merchant/stores/offers-store"
import { OfferFormDialog } from "@/components/merchant/offer/OfferForm"
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
import { Search, Filter } from "lucide-react"
import { Offer } from "@/lib/api/merchant/offers-api"

export default function MerchantOffersPage() {
  const { merchantId } = useAuthStore();
  const { offers, loading, error, pagination, fetchOffers, deleteOffer, toggleOfferStatus, toggleOfferFeatured, clearError } = useMerchantOffersStore();
  const [editingOffer, setEditingOffer] = useState<Offer | undefined>(undefined);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const limit = pagination?.limit || 20;
  const total = pagination?.total || 0;
  const totalPages = pagination?.totalPages || 1;

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');

  const loadData = useCallback((targetPage: number = 1) => {
    if (merchantId) {
      setCurrentPage(targetPage);
      fetchOffers(merchantId, {
        page: targetPage,
        limit,
        search: search.trim() || undefined,
        isActive: status === 'active' ? true : status === 'inactive' ? false : undefined,
      });
    }
  }, [merchantId, limit, search, status, fetchOffers]);

  const hasFetchedRef = useRef(false);
  useEffect(() => {
    if (merchantId && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchOffers(merchantId, { page: 1, limit });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [merchantId]);

  const handleDelete = async (offerId: string) => {
    if (confirm("Are you sure you want to delete this offer?")) {
      await deleteOffer(merchantId!, offerId)
    }
  }

  const handleToggleStatus = async (offerId: string, isActive: boolean) => {
    await toggleOfferStatus(merchantId!, offerId, isActive)
  }

  const handleToggleFeatured = async (offerId: string, isFeatured: boolean) => {
    await toggleOfferFeatured(merchantId!, offerId, isFeatured)
  }

  const handleEdit = (offer: Offer) => {
    setEditingOffer(offer);
    setIsEditDialogOpen(true);
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

  const columns: ColumnDef<DataTableFeatures, Offer>[] = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => <div className="font-medium">{row.original.title}</div>,
    },
    {
      accessorKey: "category.name",
      header: "Category",
      cell: ({ row }) => <Badge variant="outline">{row.original.category?.name || row.original.categoryId}</Badge>,
    },
    {
      accessorKey: "estimatedSavingsNpr",
      header: "Savings",
      cell: ({ row }) => <span>Rs. {row.original.estimatedSavingsNpr}</span>,
    },
    {
      accessorKey: "redemptionCount",
      header: "Redemptions",
      cell: ({ row }) => <span>{row.original.redemptionCount}</span>,
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <StatusToggle
          isActive={row.original.isActive ?? false}
          onToggle={() => handleToggleStatus(row.original.id, !(row.original.isActive ?? false))}
        />
      ),
    },
    {
      accessorKey: "isFeatured",
      header: "Featured",
      cell: ({ row }) => (
        <Badge
          variant={row.original.isFeatured ? "default" : "secondary"}
          className="cursor-pointer"
          onClick={() => handleToggleFeatured(row.original.id, !row.original.isFeatured)}
        >
          {row.original.isFeatured ? "Featured" : "No"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <ActionMenu
          onEdit={() => handleEdit(row.original)}
          onDelete={() => handleDelete(row.original.id)}
          onToggle={() => handleToggleStatus(row.original.id, row.original.isActive ?? false)}
          toggleLabel={row.original.isActive ? "Deactivate" : "Activate"}
        />
      ),
    },
  ]

  const isInitialLoad = loading && offers.length === 0

  if (isInitialLoad) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (error && offers.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">Offers</h1>
        <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/10">
          <p className="text-destructive font-medium">Unable to load offers</p>
          <p className="text-sm text-muted-foreground mt-1">
            Please check your connection and try again.
          </p>
          <button
            onClick={() => {
              clearError()
              if (merchantId) fetchOffers(merchantId)
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
          <h1 className="text-3xl font-bold tracking-tight">Offers</h1>
          <p className="text-muted-foreground">Manage your deals and offers.</p>
        </div>
        <OfferFormDialog onCreated={() => merchantId && loadData(1)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Offers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title..."
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
        data={offers}
        isLoading={loading}
        manualPagination
        pageCount={totalPages}
        rowCount={total}
        pageIndex={currentPage - 1}
        onPageChange={(zeroBasedPage) => handlePageChange(zeroBasedPage + 1)}
        showToolbar={false}
        emptyMessage="No offers found."
      />

      <OfferFormDialog
        offer={editingOffer}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onUpdated={() => {
          setIsEditDialogOpen(false);
          setEditingOffer(undefined);
          merchantId && loadData(1);
        }}
      />
    </div>
  )
}
