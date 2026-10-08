# Roadmap: OfferNepal Merchant Web Portal

## Overview

The OfferNepal Merchant Web Portal equips partner merchants with full autonomy over their offerings, branch footprints, and footfall ROI. This roadmap breaks down delivery into 6 targeted phases—starting with API client infrastructure & resilient authentication, progressing through venue and offer operational tools, and culminating in redemption audits, financial reconciliation, and rich ROI performance analytics.

---

## Phases

- [x] **Phase 1: API Foundation & Authentication** - Establish standard NestJS API envelope client, mock fallbacks, JWT/Google OAuth session management, and auth route guards.
- [x] **Phase 2: Merchant Profile & Venue Settings** - Business info, legal KYC/PAN details, bank payout configurations, and notification preferences.
- [ ] **Phase 3: Admin Panel & RBAC Implementation** - Role-based access control middleware, admin dashboard UIs with shadcn components, and admin API integration.
- [ ] **Phase 4: Admin Panel Completion & Testing** - Verify backend admin endpoints, test authentication flow, complete admin UI components, and test with real API data.
- [ ] **Phase 5: Branch Management & Geofencing** - Complete branch CRUD with interactive operating hours, GPS coordinate capture, and geofence radius settings.
- [ ] **Phase 6: Offer Lifecycle & BOGO Management** - Deal creation wizard, category mapping, validity/blackout rules, per-branch scoping, and instant status toggling.
- [ ] **Phase 7: Redemption Audit Ledger & Fraud Monitoring** - Real-time redemption activity feed, advanced multi-attribute filtering, CSV/Excel export, and velocity/fraud alert tags.
- [ ] **Phase 8: Performance Analytics & ROI Dashboard** - Footfall impact metrics, redemption time-series charts, branch comparisons, top offers leaderboard, and off-peak hour heatmaps.

---

## Phase Details

### Phase 1: API Foundation & Authentication
**Goal**: Build a resilient API client layer with fallback mocking and deliver merchant login, Google OAuth, session refresh, and protected route access.
**Depends on**: Nothing
**Requirements**: [AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, INFRA-01, INFRA-02, INFRA-05]
**Success Criteria**:
  1. Merchant can log in using email/password or Google OAuth and receive a valid JWT session.
  2. Unauthenticated visits to `/merchant/*` redirect to `/login`; expired tokens refresh automatically without UI disruption.
  3. API requests conform to the backend envelope (`{ success, data, errorCode, meta }`) and gracefully switch to mock data when endpoints are offline.
**Plans**: 3 plans

Plans:
- [x] 01-01: Standardized NestJS API envelope client, TypeScript DTO contracts, and resilient mock provider.
- [x] 01-02: Auth state management, JWT token persistence, refresh interceptors, and route middleware protection.
- [x] 01-03: Login, Google OAuth button, and Password Reset UI pages integrated with auth service.

---

### Phase 2: Merchant Profile & Venue Settings
**Goal**: Enable merchants to view and update their business identity, legal PAN/VAT documentation, and bank settlement details.
**Depends on**: Phase 1
**Requirements**: [PROFILE-01, PROFILE-02, PROFILE-03]
**Success Criteria**:
  1. Merchant can update business name, contact info, PAN/VAT number, and upload/preview brand logo.
  2. Merchant can register and update verified bank account details for settlement payouts.
  3. Merchant can adjust notification toggles for daily summaries and critical alerts.
**Plans**: 2 plans

Plans:
- [x] 02-01: Profile API service layer, schema validation, and merchant information editing view.
- [x] 02-02: Bank payout account management form and notification preference toggles.

---

### Phase 3: Admin Panel & RBAC Implementation
**Goal**: Implement role-based access control middleware, create admin dashboard UIs with shadcn components, and integrate admin-specific API endpoints.
**Depends on**: Phase 1
**Requirements**: [RBAC-01, RBAC-02, RBAC-03, ADMIN-01, ADMIN-02, ADMIN-03]
**Success Criteria**:
  1. RBAC middleware enforces role-based access (ADMIN, MERCHANT_ADMIN, MERCHANT_STAFF) to protected routes.
  2. Admin dashboard displays with shadcn components for user management, merchant management, and system overview.
  3. Admin API endpoints are connected and properly authenticated with role validation.
  4. Unauthorized users are redirected to appropriate login pages based on their role.
**Plans**: 3 plans

Plans:
- [x] 03-01: RBAC middleware implementation with role validation and route protection.
- [x] 03-02: Admin dashboard layout with shadcn components and navigation.
- [x] 03-03: Admin API integration for user management, merchant management, and system analytics.

---

### Phase 4: Admin Panel Completion & Testing
**Goal**: Verify backend admin endpoints exist, test authentication flow, complete remaining admin UI components, and test admin panel with real API data.
**Depends on**: Phase 3
**Requirements**: [RBAC-01, RBAC-02, RBAC-03, ADMIN-01, ADMIN-02, ADMIN-03]
**Success Criteria**:
  1. Backend admin endpoints (`/api/v1/admin/users`, `/api/v1/admin/merchants`, `/api/v1/admin/analytics`) are verified to exist and match frontend expectations.
  2. Authentication flow (login, token refresh, role-based redirects) works correctly with enhanced middleware.
  3. Admin user edit dialog component is implemented.
  4. Admin merchant details page is created.
  5. Toast notifications are added for success/error messages in admin pages.
  6. Admin panel is tested with real API data.
  7. Merchant dashboard is tested with real analytics data.
**Plans**: 4 plans

Plans:
- [ ] 04-01: Verify backend admin endpoints and API contract compatibility.
- [ ] 04-02: Test complete authentication flow (login, token refresh, role-based redirects).
- [ ] 04-03: Complete admin UI components (user edit dialog, merchant details page).
- [ ] 04-04: Add error handling and toast notifications to admin pages.

---

### Phase 5: Branch Management & Geofencing
**Goal**: Provide full CRUD control over physical merchant venues, GPS coordinates, operating schedules, and geofence radius limits.
**Depends on**: Phase 1
**Requirements**: [BRANCH-01, BRANCH-02, BRANCH-03, BRANCH-04, BRANCH-05, INFRA-03]
**Success Criteria**:
  1. Merchant can view all branches in a searchable, paginated DataTable with active/inactive indicators.
  2. Merchant can add a new branch with contact details, opening hours schedule, and GPS lat/lng coordinates.
  3. Merchant can edit branch info, toggle branch status (active/paused), and configure geofence radius.
**Plans**: 3 plans

Plans:
- [ ] 05-01: Branch API client, data models, and branch listing table with search/filtering.
- [ ] 05-02: Branch creation and editing modal/page with operating hours schedule builder.
- [ ] 05-03: Geolocation picker / coordinate validator and geofence radius configuration.

---

### Phase 6: Offer Lifecycle & BOGO Management
**Goal**: Deliver a comprehensive deal management engine for creating, scheduling, and activating 2-for-1 BOGO offers.
**Depends on**: Phase 5
**Requirements**: [OFFER-01, OFFER-02, OFFER-03, OFFER-04, OFFER-05, OFFER-06, INFRA-03]
**Success Criteria**:
  1. Merchant can view offers organized by status tabs (Active, Draft, Pending, Paused, Expired).
  2. Merchant can create a BOGO deal defining title, category, terms, validity dates, and blackout holidays.
  3. Merchant can target an offer to specific branches or apply globally, and pause/reactivate with one click.
**Plans**: 3 plans

Plans:
- [ ] 06-01: Offer management data table with status filtering, quick toggles, and detail view.
- [ ] 06-02: Multi-step offer creation form (deal mechanics, pricing/estimated value, terms).
- [ ] 06-03: Branch assignment selector, validity calendar, and blackout date picker.

---

### Phase 7: Redemption Audit Ledger & Fraud Monitoring
**Goal**: Give merchants an auditable, real-time log of customer redemptions with filtering, CSV export, and fraud detection flags.
**Depends on**: Phase 5
**Requirements**: [REDEMPTION-01, REDEMPTION-02, REDEMPTION-03, REDEMPTION-04, REDEMPTION-05, INFRA-03]
**Success Criteria**:
  1. Merchant can review real-time redemptions with customer details, verifying staff/PIN ID, and timestamp.
  2. Merchant can filter by date ranges, specific branches, and search by transaction reference code.
  3. Merchant can export ledger records to CSV format for financial auditing.
  4. Redemptions flagged for velocity anomalies or security issues display distinct alert badges.
**Plans**: 2 plans

Plans:
- [ ] 07-01: Redemption ledger DataTable with date-range filters, branch filters, and transaction search.
- [ ] 07-02: Detailed redemption transaction drawer, fraud/anomaly alert badges, and CSV export utility.

---

### Phase 8: Performance Analytics & ROI Dashboard
**Goal**: Deliver actionable business intelligence proving footfall impact, customer savings, and off-peak table/capacity utilization.
**Depends on**: Phase 6
**Requirements**: [ANALYTICS-01, ANALYTICS-02, ANALYTICS-03, ANALYTICS-04, ANALYTICS-05]
**Success Criteria**:
  1. Dashboard displays core KPI summary cards (Total Footfall, Customer Savings, Active Offers, Total Redemptions).
  2. Interactive time-series charts show redemption trends across selectable time periods (Day/Week/Month).
  3. Visual branch comparison chart highlights footfall performance across venues.
  4. Leaderboard displays top-performing BOGO offers by redemption count.
  5. Peak hour heatmap visually displays customer redemption concentration by hour and weekday.
**Plans**: 3 plans

Plans:
- [ ] 08-01: Analytics data aggregators, KPI stat cards, and time-series redemption volume charts.
- [ ] 08-02: Branch performance comparative bar charts and top-performing offers leaderboard.
- [ ] 08-03: Capacity & off-peak hour heatmap component showing redemption density.

---

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8

| Phase | Plans Complete | Status | Completed |
|---|---|---|---|
| 1. API Foundation & Authentication | 3/3 | Complete | 2026-10-05 |
| 2. Merchant Profile & Venue Settings | 2/2 | Complete | 2026-10-05 |
| 3. Admin Panel & RBAC Implementation | 3/3 | Complete | 2026-10-06 |
| 4. Admin Panel Completion & Testing | 0/4 | Not started | - |
| 5. Branch Management & Geofencing | 0/3 | Not started | - |
| 6. Offer Lifecycle & BOGO Management | 0/3 | Not started | - |
| 7. Redemption Audit Ledger & Fraud Monitoring | 0/2 | Not started | - |
| 8. Performance Analytics & ROI Dashboard | 0/3 | Not started | - |
