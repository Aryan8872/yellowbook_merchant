"use client"
import { useEffect, useState } from "react"
import { useAuthStore } from "@/lib/auth"
import { useMerchantOffersStore } from "@/lib/merchant/stores/offers-store"
import { OfferFormDialog } from "@/components/merchant/offer/OfferForm"
import { DataTable, StatusToggle, ActionMenu } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Eye } from "lucide-react"
import { Offer } from "@/lib/api/merchant/offers-api"

export default function MerchantOffersPage() {
  const { merchantId } = useAuthStore();
  const { offers, loading, error, pagination, fetchOffers, deleteOffer, toggleOfferStatus, toggleOfferFeatured, clearError } = useMerchantOffersStore();
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  useEffect(() => {
    if (merchantId) {
      fetchOffers(merchantId)
    }
  }, [merchantId, fetchOffers])

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

  const columns: any[] = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }: any) => <div className="font-medium">{row.original.title}</div>,
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }: any) => <Badge variant="outline">{row.original.categoryId}</Badge>,
    },
    {
      accessorKey: "estimatedSavingsNpr",
      header: "Savings",
      cell: ({ row }: any) => <span>Rs. {row.original.estimatedSavingsNpr}</span>,
    },
    {
      accessorKey: "redemptionCount",
      header: "Redemptions",
      cell: ({ row }: any) => <span>{row.original.redemptionCount}</span>,
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }: any) => (
        <StatusToggle
          isActive={row.original.isActive ?? false}
          onToggle={() => handleToggleStatus(row.original.id, !(row.original.isActive ?? false))}
        />
      ),
    },
    {
      accessorKey: "isFeatured",
      header: "Featured",
      cell: ({ row }: any) => (
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
      cell: ({ row }: any) => (
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Offers</h1>
          <p className="text-muted-foreground">Manage your deals and offers.</p>
        </div>
        <OfferFormDialog onCreated={() => merchantId && fetchOffers(merchantId)} />
      </div>

      <DataTable
        columns={columns}
        data={offers}
        isLoading={loading}
        manualPagination
        pageCount={pagination?.totalPages || 1}
        rowCount={pagination?.total || 0}
        searchPlaceholder="Search offers..."
        searchKey="title"
        toolbarActions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Export</Button>
          </div>
        }
        emptyMessage="No offers found. Create your first offer to get started."
      />

      <OfferFormDialog
        offer={editingOffer}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onUpdated={() => {
          setIsEditDialogOpen(false);
          setEditingOffer(null);
          merchantId && fetchOffers(merchantId);
        }}
      />
    </div>
  )
}
