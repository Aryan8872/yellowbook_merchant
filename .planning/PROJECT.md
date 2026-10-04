# OfferNepal Merchant Portal

## What This Is

A Next.js 16 web dashboard for **Merchant Admins** partnered with OfferNepal — a BOGO lifestyle subscription platform inspired by The ENTERTAINER. Merchants use this portal to publish and manage their 2-for-1 offers, configure branch locations, monitor redemption activity, and review their platform ROI through an analytics dashboard.

## Core Value

Merchants must be able to create and manage their offers and see proof that OfferNepal is driving real footfall — everything else is secondary.

## Business Context

- **Customer**: Restaurant, salon, gym, and retail merchant partners of OfferNepal
- **Revenue model**: Merchants pay nothing upfront; OfferNepal captures value through consumer subscription fees and optional commission settlements
- **Success metric**: Merchant retention — measured by active offer count and weekly portal logins
- **Strategy notes**: Modeled on The ENTERTAINER; zero customer acquisition cost for merchants in exchange for accepting BOGO discount costs

## Requirements

### Validated

- ✓ Merchant sidebar navigation (Dashboard, Offers, Branches, Analytics) — existing
- ✓ Collapsible sidebar with icon-mode — existing
- ✓ Dark/light theme with `d` hotkey toggle — existing
- ✓ Reusable `DataTable` component with server-side pagination, sorting, and search hooks — existing
- ✓ App shell (SidebarProvider + layout) — existing
- ✓ Design system (Tailwind v4 + CSS variables, oklch color space) — existing

### Active

- [ ] Email/password + Google OAuth authentication with JWT session management
- [ ] Merchant offer CRUD — create, edit, delete, and list own offers (category, savings, limits, validity, availability)
- [ ] Redemption ledger — paginated, filterable view of all redemption history per merchant (by date, offer, branch)
- [ ] Branch management — full CRUD: add/edit/delete branches, GPS coordinates, opening hours
- [ ] Analytics dashboard — redemption trends over time, total savings generated, top offers by redemption count
- [ ] Account & settings — merchant profile view, plan/subscription info (read from API)
- [ ] API integration layer — connect all data tables and forms to the NestJS backend using the standardized response schema

### Out of Scope

- Staff management UI — merchant staff operate via a separate mobile/POS terminal app, not this portal
- In-app / push notifications — deferred; not integrating notification infrastructure in v1
- Platform Operator / Admin panel — separate product (different actor, different portal)
- Consumer-facing pages — this portal is merchant-only

## Context

- **Backend**: NestJS Fastify cluster with Prisma + PostgreSQL + Redis; being built in parallel — endpoints exist but may be incomplete. API uses a standardized response envelope: `{ success, statusCode, errorCode, message, data, meta, timestamp, correlationId }`.
- **Auth flow**: JWT Bearer tokens; Google OAuth also supported. Merchant PIN auth is for staff at POS — NOT for this portal.
- **Redemption model**: Dual-key redemption (consumer generates code → merchant validates with PIN). This portal shows the *ledger* of past redemptions; it does not initiate or validate redemptions.
- **Domain**: Offers span categories: DINING, WELLNESS, ENTERTAINMENT, RETAIL, TRAVEL, OTHER. Branches have GPS coordinates used for geo-proximity fraud scoring.
- **Existing codebase**: Next.js 16 App Router, React 19, TanStack Table v9, Base UI, Tailwind v4, Recharts. All data is currently mock/hardcoded — no live API calls yet.
- **Codebase map**: See `.planning/codebase/` for full tech stack, architecture, and concern inventory.

## Constraints

- **Tech stack**: Next.js 16 App Router + React 19 — locked, no migration
- **UI library**: shadcn/ui (base-rhea style, Base UI primitives) — use `render` prop, not `asChild`
- **Table**: TanStack Table v9 (NOT v8) — `useTable`, `tableFeatures`, `table.state.pagination` patterns
- **API**: NestJS backend in parallel development — must design API client layer to be resilient when endpoints are incomplete (use mock fallbacks during dev)
- **Currency**: NPR (Nepali Rupee) throughout
- **Authentication**: Merchant Admin only — email/password + Google OAuth via JWT

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js App Router (not Pages Router) | Next.js 16 default; RSC-first for layout and data fetching | — Pending |
| TanStack Table v9 for all data tables | Already scaffolded; server-state API ready | — Pending |
| Base UI (not Radix) for primitives | shadcn `base-rhea` style ships with Base UI; use `render` prop pattern | — Pending |
| Staff management excluded from portal | Staff redemption is a POS/mobile workflow, not a web admin task | — Pending |
| Notifications deferred | No notification infrastructure in v1; reduces backend coupling | — Pending |
| Mock-data fallbacks during API dev | Backend is in parallel dev; portal must remain runnable without live API | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-10-05 after initialization*
