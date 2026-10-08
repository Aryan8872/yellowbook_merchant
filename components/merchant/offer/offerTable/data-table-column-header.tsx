"use client"

import * as React from "react"
import { type Column, type RowData } from "@tanstack/react-table"
import { cn } from "cn"
import { ArrowDown, ArrowUp, ChevronsUpDown, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { type DataTableFeatures } from "./data-table-features"
import { useOffer } from "@/lib/offers/offer-context"

interface DataTableColumnHeaderProps<TData extends RowData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<DataTableFeatures, TData, TValue>
  title: string
}

export function DataTableColumnHeader<TData extends RowData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
    const {setSearchParams,searchParams} =useOffer()
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>
  }

  const isSorted = searchParams.sortBy===column.id? searchParams.sortOrder:false

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="sm"
              className="-ml-3 h-8 data-[state=open]:bg-accent"
            />
          }
        >
          <span>{title}</span>
          {isSorted === "desc" ? (
            <ArrowDown className="ml-1 h-3.5 w-3.5" />
          ) : isSorted === "asc" ? (
            <ArrowUp className="ml-1 h-3.5 w-3.5" />
          ) : (
            <ChevronsUpDown className="ml-1 h-3.5 w-3.5 text-muted-foreground" />
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => 
            {
              setSearchParams({'sortBy':column.id as any,sortOrder:'asc'})
              }}>
              <ArrowUp className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
              Asc
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              setSearchParams({'sortBy':column.id as any,sortOrder:'desc'})
            }}>
              <ArrowDown className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
              Desc
            </DropdownMenuItem>
            {column.getCanHide() && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
                  <EyeOff className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                  Hide
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
