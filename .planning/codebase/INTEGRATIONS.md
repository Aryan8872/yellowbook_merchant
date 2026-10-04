---
title: Integrations
last_mapped_at: 2026-10-05
---

# INTEGRATIONS.md — External Services & APIs

**Analysis Date:** 2026-10-05

## Current State

> **No external API integrations are active yet.** The codebase is in early frontend development — all data is currently hardcoded as static mock data. The table infrastructure (`DataTable`) has been scaffolded with API-ready hooks, but no actual API calls exist.

## External Services (Planned / Wired but Not Yet Called)

### Backend API (TBD)
- **Status:** Not yet integrated
- **Evidence:** `DataTable` exports `TableQueryParams` interface and `onQueryChange` callback prop — designed to send `{ pageIndex, pageSize, sorting, search }` to a backend on state change
- **Pattern to use:** Pass `onQueryChange` to fire `fetch()` / Axios requests; set `manualPagination={true}` + `pageCount` to enable server-side pagination
- **Where to wire:** `components/merchant/offer/offerTable/page.tsx` wraps `<DataTable>`

## Font Loading (Google Fonts)

| Font | Variable | Use |
|------|----------|-----|
| Space Grotesk | `--font-sans` | Body text |
| Montserrat | `--font-heading` | Headings |
| Geist Mono | `--font-mono` | Monospace / code |

- Loaded at build time via `next/font/google` in `app/layout.tsx`
- No runtime network requests — fonts are self-hosted by Next.js

## Authentication

- **Status:** Not yet implemented
- **Evidence:** Route `app/(merchant)/merchant/auth/` directory exists (empty)
- **Sidebar footer:** Hardcoded `merchant@demo.com` placeholder (no auth state)
- **Logout button:** Present in sidebar footer but has no `onClick` handler

## Databases / Storage

- **Status:** None
- All data currently lives in hardcoded arrays inside components

## Third-Party Analytics / Tracking

- **Status:** None detected

## CDN / Asset Hosting

- **Status:** Default Next.js public folder (`/public/`)
- No custom CDN configured

## Environment Variables

- **Status:** No `.env` or `.env.local` files found
- **No secrets** present in the codebase

## What the Codebase Is Ready For

When backend integration begins, the following infrastructure is already in place:

| Feature | Ready Component | Notes |
|---------|----------------|-------|
| Server-side pagination | `DataTable` (`manualPagination` prop) | Pass `pageCount`, `rowCount` |
| Server-side sorting | `DataTable` (`onQueryChange`) | `sorting: SortingState` in params |
| Server-side search | `DataTable` (`onQueryChange`) | `search: string` in params with 300ms debounce |
| Auth routing | `app/(merchant)/merchant/auth/` | Directory exists, needs page |
| Theme persistence | `next-themes` | Already wired in root layout |

---
*Integrations analysis: 2026-10-05*
