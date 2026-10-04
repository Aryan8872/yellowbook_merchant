# Roadmap: OfferNepal Merchant Web Portal

## Overview

The OfferNepal Merchant Web Portal equips partner merchants with full autonomy over their offerings, branch footprints, and footfall ROI. This roadmap breaks down delivery into 6 targeted phases—starting with API client infrastructure & resilient authentication, progressing through venue and offer operational tools, and culminating in redemption audits, financial reconciliation, and rich ROI performance analytics.

---

## Phases

- [x] **Phase 1: API Foundation & Authentication** - Establish standard NestJS API envelope client, mock fallbacks, JWT/Google OAuth session management, and auth route guards.
- [ ] **Phase 2: Merchant Profile & Venue Settings** - Business info, legal KYC/PAN details, bank payout configurations, and notification preferences.
- [ ] **Phase 3: Branch Management & Geofencing** - Complete branch CRUD with interactive operating hours, GPS coordinate capture, and geofence radius settings.
- [ ] **Phase 4: Offer Lifecycle & BOGO Management** - Deal creation wizard, category mapping, validity/blackout rules, per-branch scoping, and instant status toggling.
- [ ] **Phase 5: Redemption Audit Ledger & Fraud Monitoring** - Real-time redemption activity feed, advanced multi-attribute filtering, CSV/Excel export, and velocity/fraud alert tags.
- [ ] **Phase 6: Performance Analytics & ROI Dashboard** - Footfall impact metrics, redemption time-series charts, branch comparisons, top offers leaderboard, and off-peak hour heatmaps.

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
- [ ] 02-01: Profile API service layer, schema validation, and merchant information editing view.
- [ ] 02-02: Bank payout account management form and notification preference toggles.

---

### Phase 3: Branch Management & Geofencing
**Goal**: Provide full CRUD control over physical merchant venues, GPS coordinates, operating schedules, and geofence radius limits.
**Depends on**: Phase 1
**Requirements**: [BRANCH-01, BRANCH-02, BRANCH-03, BRANCH-04, BRANCH-05, INFRA-03]
**Success Criteria**:
  1. Merchant can view all branches in a searchable, paginated DataTable with active/inactive indicators.
  2. Merchant can add a new branch with contact details, opening hours schedule, and GPS lat/lng coordinates.
  3. Merchant can edit branch info, toggle branch status (active/paused), and configure geofence radius.
**Plans**: 3 plans

Plans:
- [ ] 03-01: Branch API client, data models, and branch listing table with search/filtering.
- [ ] 03-02: Branch creation and editing modal/page with operating hours schedule builder.
- [ ] 03-03: Geolocation picker / coordinate validator and geofence radius configuration.

---

### Phase 4: Offer Lifecycle & BOGO Management
**Goal**: Deliver a comprehensive deal management engine for creating, scheduling, and activating 2-for-1 BOGO offers.
**Depends on**: Phase 3
**Requirements**: [OFFER-01, OFFER-02, OFFER-03, OFFER-04, OFFER-05, OFFER-06, INFRA-03]
**Success Criteria**:
  1. Merchant can view offers organized by status tabs (Active, Draft, Pending, Paused, Expired).
  2. Merchant can create a BOGO deal defining title, category, terms, validity dates, and blackout holidays.
  3. Merchant can target an offer to specific branches or apply globally, and pause/reactivate with one click.
**Plans**: 3 plans

Plans:
- [ ] 04-01: Offer management data table with status filtering, quick toggles, and detail view.
- [ ] 04-02: Multi-step offer creation form (deal mechanics, pricing/estimated value, terms).
- [ ] 04-03: Branch assignment selector, validity calendar, and blackout date picker.

---

### Phase 5: Redemption Audit Ledger & Fraud Monitoring
**Goal**: Give merchants an auditable, real-time log of customer redemptions with filtering, CSV export, and fraud detection flags.
**Depends on**: Phase 4
**Requirements**: [REDEMPTION-01, REDEMPTION-02, REDEMPTION-03, REDEMPTION-04, REDEMPTION-05, INFRA-03]
**Success Criteria**:
  1. Merchant can review real-time redemptions with customer details, verifying staff/PIN ID, and timestamp.
  2. Merchant can filter by date ranges, specific branches, and search by transaction reference code.
  3. Merchant can export ledger records to CSV format for financial auditing.
  4. Redemptions flagged for velocity anomalies or security issues display distinct alert badges.
**Plans**: 2 plans

Plans:
- [ ] 05-01: Redemption ledger DataTable with date-range filters, branch filters, and transaction search.
- [ ] 05-02: Detailed redemption transaction drawer, fraud/anomaly alert badges, and CSV export utility.

---

### Phase 6: Performance Analytics & ROI Dashboard
**Goal**: Deliver actionable business intelligence proving footfall impact, customer savings, and off-peak table/capacity utilization.
**Depends on**: Phase 5
**Requirements**: [ANALYTICS-01, ANALYTICS-02, ANALYTICS-03, ANALYTICS-04, ANALYTICS-05]
**Success Criteria**:
  1. Dashboard displays core KPI summary cards (Total Footfall, Customer Savings, Active Offers, Total Redemptions).
  2. Interactive time-series charts show redemption trends across selectable time periods (Day/Week/Month).
  3. Visual branch comparison chart highlights footfall performance across venues.
  4. Leaderboard displays top-performing BOGO offers by redemption count.
  5. Peak hour heatmap visually displays customer redemption concentration by hour and weekday.
**Plans**: 3 plans

Plans:
- [ ] 06-01: Analytics data aggregators, KPI stat cards, and time-series redemption volume charts.
- [ ] 06-02: Branch performance comparative bar charts and top-performing offers leaderboard.
- [ ] 06-03: Capacity & off-peak hour heatmap component showing redemption density.

---

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|---|---|---|---|
| 1. API Foundation & Authentication | 3/3 | Complete | 2026-10-05 |
| 2. Merchant Profile & Venue Settings | 0/2 | Not started | - |
| 3. Branch Management & Geofencing | 0/3 | Not started | - |
| 4. Offer Lifecycle & BOGO Management | 0/3 | Not started | - |
| 5. Redemption Audit Ledger & Fraud Monitoring | 0/2 | Not started | - |
| 6. Performance Analytics & ROI Dashboard | 0/3 | Not started | - |
