---
title: Architecture
last_mapped_at: 2026-10-05
---

# ARCHITECTURE.md — System Design & Patterns

**Analysis Date:** 2026-10-05

## Architectural Pattern

**Multi-tenant SPA Shell with Next.js App Router**

The app is structured as a Next.js 16 App Router application with two distinct user portals sharing a single codebase:

1. **Merchant Portal** — `/merchant/*` routes (actively developed)
2. **Admin Portal** — `/admin/*` routes (stub, not yet built)

Both portals live under route groups (`(merchant)` and `(admin)`) which are invisible in the URL but allow separate layouts, auth wrappers, and navigation structures.

## Route Group Architecture

```
/                          → app/page.tsx (placeholder "Project ready" screen)
/merchant                  → app/(merchant)/merchant/dashboard/page.tsx
/merchant/offers           → app/(merchant)/merchant/offers/ (empty)
/merchant/branches         → app/(merchant)/merchant/branches/ (empty)
/merchant/analytics        → app/(merchant)/merchant/analytics/ (empty)
/merchant/redemption       → app/(merchant)/merchant/redemption/ (empty)
/merchant/auth             → app/(merchant)/merchant/auth/ (empty)
/admin/dashboard           → app/(admin)/admin/dashboard/page.tsx (stub)
/admin/analytics           → app/(admin)/admin/analytics/page.tsx (stub)
/admin/users               → app/(admin)/admin/users/page.tsx (stub)
```

## Layout Hierarchy

```
app/layout.tsx (RootLayout)
  └─ ThemeProvider (next-themes)
      ├─ app/(merchant)/merchant/layout.tsx (MerchantLayout)
      │     └─ SidebarProvider
      │           ├─ AppSidebar (collapsible="icon")
      │           └─ SidebarInset > main > {children}
      └─ app/(admin)/admin/ (no layout yet)
```

**Key design decisions:**
- `SidebarProvider` wraps the entire merchant section — sidebar state (expanded/collapsed) is shared across all merchant pages
- `suppressHydrationWarning` on `<html>` is used to prevent theme flash on hydration

## Component Architecture

### Layer 1: UI Primitives (`components/ui/`)
shadcn/ui components backed by `@base-ui/react`. These are the raw building blocks:
- `Button`, `Card`, `Input`, `Select`, `Badge`, `Checkbox`
- `DropdownMenu`, `Dialog`, `Sheet`, `Tooltip`, `Toast`
- `Table`, `Separator`, `Skeleton`
- `Sidebar` (large: 21KB — handles collapsible state, responsive behavior)

**Important:** `@base-ui/react` uses `render` prop for composition, NOT Radix's `asChild`. Example:
```tsx
<DropdownMenuTrigger render={<Button variant="ghost" />}>
  Content
</DropdownMenuTrigger>
```

### Layer 2: Feature Components (`components/merchant/`)
Domain-specific, assembled from UI primitives:

```
components/merchant/
  statcard.tsx              — KPI stat card (takes array of StatCardProps)
  dashboardStatHeader.tsx   — Row of stat cards (hardcoded data currently)
  dashboardBody.tsx         — Grid layout: ProfitGraph + OfferTable + ActiveDayGraph
  offer/
    profitGraph/profitGraph.tsx   — Recharts BarChart: monthly profit (mock data)
    activeDayGraph/activeDayGraph.tsx — Recharts BarChart: daily activity (prop-driven)
    offerTable/
      page.tsx              — Wrapper: assembles columns + mock data → <DataTable>
      column.tsx            — Column definitions using createColumnHelper
      data-table.tsx        — Core DataTable component (server-state ready)
      data-table-features.ts— TanStack v9 feature registration
      data-table-pagination.tsx  — Pagination controls
      data-table-column-header.tsx — Sortable column header with dropdown
      data-table-view-options.tsx  — Column visibility toggle dropdown
```

### Layer 3: App Pages (`app/`)
Thin page components that compose feature components:
```tsx
// dashboard/page.tsx — typical pattern
export default function MerchantDashboardPage() {
  return (
    <div className="space-y-4">
      <h1>Merchant Dashboard</h1>
      <DashboardStatHeader />
      <DashboardBody />
    </div>
  )
}
```

## Data Flow

### Current (Mock Data)
```
page.tsx
  └─ DashboardBody
        ├─ ProfitGraph (hardcoded const data[])
        ├─ MostRedeemedOfferTable
        │     └─ DataTable (columns, data: Offer[])  ← hardcoded offerData[]
        └─ ActiveDayGraph (data prop: {day, value}[])
```

### Target (API-Integrated)
```
page.tsx (server or client component)
  └─ DataTable
        onQueryChange={(params) => {
          // params: { pageIndex, pageSize, sorting, search }
          // fire API request here
        }}
        manualPagination={true}
        pageCount={apiResponse.totalPages}
        data={apiResponse.items}
```

## State Management

- **No global state library** (no Redux, Zustand, Jotai etc.)
- **Theme state:** `next-themes` (localStorage-backed)
- **Sidebar state:** `useSidebar()` hook from shadcn sidebar context
- **Table state:** Local `useState` within `DataTable` (pagination, sorting, filters, column visibility, row selection)
- **Mobile detection:** `useIsMobile()` custom hook in `hooks/use-mobile.ts`

## Server vs. Client Components

| Component | Directive | Reason |
|-----------|-----------|--------|
| `app/layout.tsx` | (none, server) | Static HTML shell |
| `app/(merchant)/merchant/layout.tsx` | (none, server) | Static layout |
| `app/(merchant)/merchant/dashboard/page.tsx` | (none, server) | Static page shell |
| `components/theme-provider.tsx` | `"use client"` | Uses `useEffect`, browser events |
| `app/(merchant)/merchant/app-sidebar.tsx` | `"use client"` | Uses `usePathname`, `useSidebar` |
| `components/merchant/offer/offerTable/data-table.tsx` | `"use client"` | Uses `useState`, `useEffect` |
| `components/merchant/offer/profitGraph/profitGraph.tsx` | `"use client"` | Recharts requires browser APIs |
| `components/merchant/offer/activeDayGraph/activeDayGraph.tsx` | `"use client"` | Recharts requires browser APIs |
| `components/merchant/offer/offerTable/column.tsx` | `"use client"` | Click handlers, clipboard API |

## Key Abstractions

### `DataTable` — The Central Table Component
Location: `components/merchant/offer/offerTable/data-table.tsx`

Accepts:
- `columns: ColumnDef<DataTableFeatures, TData>[]`
- `data: TData[]`
- `manualPagination?: boolean`
- `pageCount?: number`, `rowCount?: number`
- `searchKey?: string`, `searchPlaceholder?: string`
- `isLoading?: boolean`
- `onQueryChange?: (params: TableQueryParams) => void`

This is the primary reusable table abstraction — all future listing pages (offers, branches, redemptions) should use it.

### `features` Object
Location: `components/merchant/offer/offerTable/data-table-features.ts`

Registers TanStack Table v9 features tree-shakeably. **Must be imported and passed to `useTable()`** and all generic types.

---
*Architecture analysis: 2026-10-05*
