"use client"

import { createColumnHelper } from "@tanstack/react-table"
import { useState } from "react"

import { type DataTableFeatures } from "./data-table-features"
import { Offer } from "@/lib/types/offer"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "./data-table-column-header"
import Link from "next/link"
import { OfferFormDialog } from "../OfferForm"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

// Use `accessor` for data columns and `display` for columns without one.
const columnHelper = createColumnHelper<DataTableFeatures, Offer>()

export const columns = columnHelper.columns([
  columnHelper.display({
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={
          table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  }),
  columnHelper.accessor("id", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} className="hidden lg:block" title="ID" />
    ),
    cell: ({ getValue }) => (
      <div className="hidden lg:block w-[100px] truncate font-medium" title={getValue()}>
        {getValue()}
      </div>
    )
  }),
  columnHelper.accessor("title", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ getValue }) => (
      <div className="w-[100px] lg:w-[200px] truncate font-medium" title={getValue()}>
        {getValue()}
      </div>
    )
  }),
  columnHelper.accessor("description", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} className="xl:block hidden" title="Description" />
    ),
    cell: ({ getValue }) => (
      <div className={`hidden xl:block w-[280px] truncate font-medium`} title={getValue()}>
        {getValue()}
      </div>
    )
  }),
  // columnHelper.accessor("redemptionCount", {
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Redeem Count" />
  //   ),
  //   cell: ({ getValue }) => (
  //     <div className="w-[300px] truncate font-medium">
  //       {getValue()}
  //     </div>
  //   )
  // }),
    columnHelper.accessor("rating", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Rating" />
    ),
    cell: ({ getValue }) => (
      <div className="w-[50px] truncate font-medium">
        {getValue()}
      </div>
    )
  }),
  columnHelper.accessor("isActive", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Active" />
    ),
    cell: ({ getValue }) => (
      <input type="checkbox" checked={getValue()} readOnly disabled />
    )
  }),
  columnHelper.display({
    id: "actions",
    header:"Actions",
    cell: ({ row }) => {
      const offer = row.original;
      const [editingOffer, setEditingOffer] = useState<Offer | undefined>(undefined);
      const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
      
      const handleEditClick = () => {
        setEditingOffer(offer);
        setIsEditDialogOpen(true);
      };
      
      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant={"ghost"} className={"h-8 w-8 p-0"} />}>
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(offer.title)}
                >
                  Copy title
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleEditClick}>
                  Edit Offer
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href={`/merchant/offers/${offer.id}`}>
                    View Details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>Delete Offer</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <OfferFormDialog
            offer={editingOffer}
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            onUpdated={() => {
              setEditingOffer(undefined);
              setIsEditDialogOpen(false);
              // TODO: Refresh offers list
            }}
          />
        </>
      )
    }
  })
])