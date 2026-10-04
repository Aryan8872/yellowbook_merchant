---
title: Conventions
last_mapped_at: 2026-10-05
---

# CONVENTIONS.md — Code Style & Patterns

**Analysis Date:** 2026-10-05

## Formatting (Prettier)

Enforced via `.prettierrc`:

| Rule | Value |
|------|-------|
| Semicolons | **No** (`"semi": false`) |
| Quotes | **Double** (`"singleQuote": false`) |
| Tab width | **2 spaces** |
| Trailing commas | **ES5** (arrays, objects — not function params) |
| Print width | 80 characters |
| End of line | LF |
| Tailwind sorting | **Enabled** via `prettier-plugin-tailwindcss` |
| Tailwind functions | `cn()`, `cva()` |

Example:
```tsx
// ✅ Correct
export function StatCard({ statData }: { statData: StatCardProps[] }) {
  return statData.map((data, index) => (
    <Card key={index}>
```

## TypeScript Patterns

### Strict Mode
TypeScript runs with `strict: true`. All types must be explicit.

### Interface vs Type
Both used; prefer `interface` for component props, `type` for domain models:
```ts
// Domain model → type
export type Offer = {
  id: string
  title: string
  // ...
}

// Component props → interface
export interface StatCardProps {
  title: string
  subtitle?: string
  statData: number
  change?: number
}
```

### Generic components with TanStack Table
Always pass `DataTableFeatures` as first generic argument:
```tsx
import { type DataTableFeatures } from "./data-table-features"

// Column type
type Col = ColumnDef<DataTableFeatures, TData>

// Table ref type
type Table = ReactTable<DataTableFeatures, TData>
```

### No `any`
Strict mode prevents implicit `any`. Use `unknown` for uncertain types and narrow with type guards.

## Component Patterns

### Server vs Client
Default to **Server Components**. Only add `"use client"` when the component:
- Uses React hooks (`useState`, `useEffect`, `useContext`)
- Uses browser APIs (clipboard, window, localStorage)
- Uses event handlers bound in JSX
- Uses libraries that require browser (Recharts, etc.)

```tsx
// ✅ Server component (no directive needed)
export default function MerchantDashboardPage() { ... }

// ✅ Client component
"use client"
export function DataTable<TData>(...) { ... }
```

### Named Exports for Components
Feature components use **named exports**:
```tsx
export function DataTable<TData>(...) { ... }
export function DataTablePagination<TData>(...) { ... }
```

Page/layout files use **default exports** (Next.js requirement):
```tsx
export default function MerchantDashboardPage() { ... }
```

### Props Pattern
Inline object destructuring in function signature:
```tsx
export function DataTable<TData extends RowData>({
  columns,
  data,
  manualPagination = false,
  isLoading = false,
}: DataTableProps<TData>) {
```

### Generics in Table Components
Table components are generic over `TData extends RowData` for type safety:
```tsx
export function DataTablePagination<TData extends RowData>({
  table,
  pageSizeOptions = [5, 10, 20, 30, 50],
}: DataTablePaginationProps<TData>) {
```

## Styling Conventions

### Class Names via `cn()`
Always use `cn()` to merge conditional and static Tailwind classes:
```tsx
import { cn } from "@/lib/utils"

<Link
  href={item.href}
  className={cn(
    "flex items-center gap-2",
    isActive && "bg-accent text-accent-foreground"
  )}
>
```

### CSS Variable Colors
Charts and components reference CSS variables via `hsl(var(...))`:
```tsx
// ✅ Correct — theme-aware
fill="hsl(var(--primary))"
stroke="hsl(var(--muted-foreground))"

// ❌ Avoid — hardcoded hex breaks dark mode
fill="#3b82f6"  // Only acceptable for chart highlights where intentional
```

### Tailwind Class Order
Classes are auto-sorted by `prettier-plugin-tailwindcss`. Don't manually sort.

### Variants with CVA
UI primitives use `cva()` for variant logic (from `class-variance-authority`):
```tsx
// Pattern in components/ui/button.tsx
const buttonVariants = cva("base-classes", {
  variants: {
    variant: { default: "...", ghost: "...", outline: "..." },
    size: { sm: "...", icon: "...", default: "..." }
  }
})
```

## Base UI Composition Pattern

`@base-ui/react` uses `render` prop — NOT Radix's `asChild`:

```tsx
// ✅ Correct (Base UI style)
<DropdownMenuTrigger render={<Button variant="ghost" />}>
  Content
</DropdownMenuTrigger>

// ❌ Wrong (Radix UI style — will cause React warning)
<DropdownMenuTrigger asChild>
  <Button variant="ghost">Content</Button>
</DropdownMenuTrigger>
```

## DropdownMenu Group Convention

All `DropdownMenuLabel` components must be inside a `DropdownMenuGroup`:
```tsx
// ✅ Correct — prevents Base UI MenuGroupContext error
<DropdownMenuContent>
  <DropdownMenuGroup>
    <DropdownMenuLabel>Actions</DropdownMenuLabel>
    <DropdownMenuItem>...</DropdownMenuItem>
  </DropdownMenuGroup>
</DropdownMenuContent>
```

## Import Conventions

1. External packages first
2. Then `@/` path aliases
3. Then relative imports
4. Type-only imports use `import { type X }`

```tsx
import * as React from "react"
import { createColumnHelper } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { type DataTableFeatures } from "./data-table-features"
import { Offer } from "@/lib/types/offer"
```

## Error Handling

- No error handling patterns established yet (early development stage)
- No error boundary components visible
- No `try/catch` blocks (no async operations yet)

## Constants

Navigation items and similar configuration live in `lib/constants/`:
```ts
// lib/constants/sidebar-item.ts
export const sidebarItems = [
  { title: "Dashboard", href: "/merchant", icon: Home },
  // ...
]
```

---
*Conventions analysis: 2026-10-05*
