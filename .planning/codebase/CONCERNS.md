---
title: Concerns
last_mapped_at: 2026-10-05
---

# CONCERNS.md — Technical Debt, Issues & Fragile Areas

**Analysis Date:** 2026-10-05

## Summary

The codebase is in early scaffolding stage (pre-alpha). Most concerns are expected at this stage, but several represent architectural decisions that should be made deliberately before scaling.

---

## 🔴 High Priority

### 1. All Data is Hardcoded Mock Data
**Location:** `components/merchant/dashboardStatHeader.tsx`, `components/merchant/offer/offerTable/page.tsx`, `components/merchant/offer/profitGraph/profitGraph.tsx`

Every component renders static, hardcoded arrays. There's no API layer, no data fetching, no loading states connected to real data.

```ts
// dashboardStatHeader.tsx — all statData values are hardcoded 12
const statData: StatCardProps[] = [
  { title: "Active offers", statData: 12 },
  { title: "Expired offers", statData: 12 }, // ← same value for everything
  { title: "Total offers", statData: 12 },
]
```

**Risk:** Dashboard currently shows misleading identical values. The `DataTable` infrastructure is API-ready, but it's never been connected to real data.

---

### 2. No Authentication
**Location:** `app/(merchant)/merchant/auth/` (empty directory)

There is zero authentication. Any user can access all merchant routes. The sidebar footer shows a hardcoded `merchant@demo.com` with a non-functional logout button.

```tsx
// app-sidebar.tsx — no auth, no session
<p className="text-muted-foreground">merchant@demo.com</p>
<Button variant="ghost" size="icon">  {/* no onClick handler */}
  <LogOut className="h-4 w-4" />
</Button>
```

**Risk:** All merchant data would be publicly accessible if the app were deployed.

---

### 3. Most Routes are Empty
**Location:** `app/(merchant)/merchant/` subdirectories

| Route | Status |
|-------|--------|
| `/merchant/offers` | Empty directory — no `page.tsx` |
| `/merchant/branches` | Empty directory — no `page.tsx` |
| `/merchant/analytics` | Empty directory — no `page.tsx` |
| `/merchant/redemption` | Empty directory — no `page.tsx` |
| `/merchant/auth` | Empty directory — no `page.tsx` |
| `/admin/*` | Stub pages only |

Navigation items exist in `sidebar-item.ts` for all these routes, but clicking them will result in a 404.

---

## 🟡 Medium Priority

### 4. Duplicate StatCard Titles in Mock Data
**Location:** `components/merchant/dashboardStatHeader.tsx` (lines 11–22)

Three cards have the identical title `"Total offers"` — clearly copy-paste artifact, not intentional:

```ts
{ title: "Total offers", statData: 12 },
{ title: "Total offers", statData: 12 },  // ← duplicate
{ title: "Total offers", statData: 12 },  // ← duplicate
```

Also, the `StatCard` renders `statData.map((data, index) => ...)` using `index` as `key` — should use a stable id when real data arrives.

---

### 5. Hardcoded Color in ActiveDayGraph
**Location:** `components/merchant/offer/activeDayGraph/activeDayGraph.tsx` (line 12)

```tsx
fill={d.value === max ? "#3b82f6" : "#f3f4f6"}
```

These hex colors are hardcoded and don't respond to the dark/light theme. In dark mode the light grey (`#f3f4f6`) will be nearly invisible against a dark background. Should use CSS variables:
```tsx
fill={d.value === max ? "hsl(var(--primary))" : "hsl(var(--muted))"}
```

---

### 6. TanStack Table v9 Is Bleeding Edge
**Location:** `components/merchant/offer/offerTable/data-table-features.ts`

`@tanstack/react-table@^9.2.6` is a very recent major version with significant API changes from v8 (which most documentation, tutorials, and AI training data covers). Key gotchas already hit:

- `table.getState()` removed → use `table.state`
- Column defs use `createColumnHelper<Features, TData>()` with two generics
- `tableFeatures({})` required for tree-shaking
- `table.FlexRender` is a JSX component, not `flexRender()` function

**Risk:** Future developers or AI assistants will likely reference v8 patterns which will fail. The v9 patterns must be documented (done in `CONVENTIONS.md`).

---

### 7. `totalprofit.tsx` is an Empty Stub
**Location:** `components/merchant/totalprofit.tsx` (93 bytes)

This file exists but contains almost nothing. It's unclear if it's intentional or a forgotten work-in-progress.

---

### 8. `app/page.tsx` is a Placeholder
**Location:** `app/page.tsx`

The root route `/` renders a "Project ready! You may now add components." placeholder from shadcn scaffolding. This should be replaced with a redirect to `/merchant/dashboard` or a landing page.

---

### 9. No Error Boundaries
No React error boundaries are defined anywhere. A runtime error in any component will crash the entire merchant portal with no graceful recovery.

---

### 10. No Loading State Skeleton for Charts
**Location:** `components/merchant/dashboardBody.tsx`

`ProfitGraph` and `ActiveDayGraph` have no loading/skeleton states. When these are connected to real API data, there will be a flash of empty content before data loads.

---

## 🟢 Low Priority / Notes

### 11. `lib/utils.ts` is a One-Liner
```ts
export { cn } from "cn"
```
This exists purely to satisfy the conventional `@/lib/utils` shadcn import path. This is intentional but worth noting — `cn` from the `cn` package is used directly, not `clsx + tailwind-merge`. This is simpler but slightly less flexible.

### 12. Next.js 16 Breaking Changes Risk
`AGENTS.md` (auto-generated by Next.js) explicitly warns: "This is NOT the Next.js you know — APIs, conventions, and file structure may all differ from your training data." The project should keep the `AGENTS.md` file committed (next dev regenerates it) to ensure AI agents read it before making changes.

### 13. Admin Portal Has No Layout
The admin route group has no `layout.tsx`. Admin pages are direct children of the root layout with no sidebar, auth check, or shell. Admin is essentially unbuilt.

### 14. No `.env` Validation
When environment variables are added for API endpoints, auth secrets, etc., there's currently no validation layer (e.g., `zod` schema on `process.env`). This is a pre-emptive note for when API integration begins.

### 15. `Geist` Font Imported but Unused
In `app/layout.tsx`, `Geist` is imported but never used — only `Geist_Mono`, `Space_Grotesk`, and `Montserrat` are applied. Minor dead import.

```ts
import { Geist, Geist_Mono, Space_Grotesk, Montserrat } from "next/font/google"
// Geist is imported ↑ but never instantiated or used below
```

---

## Debt Register Summary

| # | Severity | Area | Description |
|---|----------|------|-------------|
| 1 | 🔴 High | Data | All data hardcoded, no API calls |
| 2 | 🔴 High | Security | No authentication on any route |
| 3 | 🔴 High | Routing | 5 navigable routes have no page |
| 4 | 🟡 Medium | UX | Duplicate/identical stat card data |
| 5 | 🟡 Medium | Theming | Hardcoded hex in ActiveDayGraph |
| 6 | 🟡 Medium | Library | TanStack v9 non-standard patterns |
| 7 | 🟡 Medium | Code | Empty `totalprofit.tsx` stub |
| 8 | 🟡 Medium | UX | Root `/` is a scaffold placeholder |
| 9 | 🟡 Medium | Reliability | No error boundaries |
| 10 | 🟡 Medium | UX | No chart loading skeletons |
| 11 | 🟢 Low | Code | `lib/utils.ts` is a pass-through |
| 12 | 🟢 Low | DX | Next.js 16 breaking changes awareness |
| 13 | 🟢 Low | Routing | Admin has no layout or shell |
| 14 | 🟢 Low | Config | No env variable validation |
| 15 | 🟢 Low | Code | Unused `Geist` font import |

---
*Concerns analysis: 2026-10-05*
