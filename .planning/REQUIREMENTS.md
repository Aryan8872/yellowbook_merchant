# Requirements: OfferNepal Merchant Web Portal

## Overview

OfferNepal is an omni-channel lifestyle subscription and BOGO redemption engine inspired by *The ENTERTAINER*. This web portal provides **Merchant Admins** with a centralized interface to manage their partnership: publishing deals, monitoring live redemptions, configuring branch venues, auditing financial settlements, and evaluating ROI.

---

## Functional Requirements

### 1. Authentication & Session Management (AUTH)

- **AUTH-01**: Merchant admin can sign in via email and password with JWT token exchange.
- **AUTH-02**: Merchant admin can sign in via Google OAuth.
- **AUTH-03**: Merchant admin can reset password via email verification link.
- **AUTH-04**: Active session token is automatically refreshed before expiry; invalid/expired sessions (HTTP 401) smoothly redirect to login.
- **AUTH-05**: Role authorization guards dashboard routes to ensure only authenticated `MERCHANT_ADMIN` users have access.

### 2. Merchant Profile & Venue Settings (PROFILE)

- **PROFILE-01**: Merchant can view and update business profile details (Trade Name, Legal Name, PAN/VAT Number, Primary Category, Logo, Cover Image).
- **PROFILE-02**: Merchant can manage payout bank details (Bank Name, Account Holder Name, Account Number, Branch).
- **PROFILE-03**: Merchant can toggle notification preferences (email alerts for daily summary, high-value redemptions).

### 3. Branch Management (BRANCH)

- **BRANCH-01**: Merchant can view a list of all assigned branch locations with status (Active, Inactive, Pending).
- **BRANCH-02**: Merchant can create a new branch with Name, Address, Contact Number, GPS Coordinates (Latitude, Longitude), and Operating Hours.
- **BRANCH-03**: Merchant can edit existing branch details, coordinates, and operating schedules.
- **BRANCH-04**: Merchant can soft-delete or toggle active/inactive status of a branch.
- **BRANCH-05**: Merchant can configure geofence radius settings per branch for location-based redemption verification.

### 4. Offer Management (OFFER)

- **OFFER-01**: Merchant can view all offers segmented by status (Draft, Pending Approval, Active, Paused, Expired).
- **OFFER-02**: Merchant can create new BOGO offers specifying Title, Description, Category, Offer Type (e.g., Buy 1 Main Dish Get 1 Free), Terms & Conditions, and Estimated Value.
- **OFFER-03**: Merchant can configure validity windows (Start Date, End Date, Blackout Dates like public holidays/weekends).
- **OFFER-04**: Merchant can assign offers to specific branches or apply them globally across all merchant branches.
- **OFFER-05**: Merchant can set redemption limits per customer (e.g., max 3 redemptions per subscription cycle).
- **OFFER-06**: Merchant can edit active offers or pause/reactivate them instantly.

### 5. Redemption Audit Ledger (REDEMPTION)

- **REDEMPTION-01**: Merchant can view a real-time ledger of all customer redemptions with timestamp, offer title, customer identifier/masked name, branch location, and verifying staff/PIN ID.
- **REDEMPTION-02**: Merchant can filter redemptions by date range, branch, offer category, and verification status.
- **REDEMPTION-03**: Merchant can search redemption entries by redemption reference code or transaction ID.
- **REDEMPTION-04**: Merchant can export redemption ledger reports to CSV / Excel for accounting reconciliation.
- **REDEMPTION-05**: Merchant can inspect suspicious/flagged redemption attempts (e.g., velocity check alerts, duplicate attempts).

### 6. Analytics & Performance Dashboard (ANALYTICS)

- **ANALYTICS-01**: Overview metrics panel displaying Total Footfall Driven, Estimated Customer Savings, Total Redemptions, and Net Platform GMV impact.
- **ANALYTICS-02**: Time-series charts showing redemption trends over customizable time horizons (Daily, Weekly, Monthly).
- **ANALYTICS-03**: Branch performance comparison breakdown (footfall and redemption volume per branch).
- **ANALYTICS-04**: Top-performing offers leaderboard ranking deals by customer uptake.
- **ANALYTICS-05**: Peak hour heatmap showing day-of-week and time-of-day redemption density to identify off-peak capacity utilization.

---

## Non-Functional & Technical Requirements

### 7. System Architecture & Resilience (INFRA)

- **INFRA-01**: Standardized backend API client conforming to NestJS response envelope (`{ success: boolean, data?: T, errorCode?: string, meta?: any }`).
- **INFRA-02**: Resilient fallback mocking layer allowing UI development and previewing even when backend endpoints are still in progress.
- **INFRA-03**: Consistent data tables leveraging the unified `DataTable` component with server-side pagination, sorting, and debounced search filters.
- **INFRA-04**: Responsive, accessible interface fully supporting light and dark themes via Tailwind CSS and shadcn/ui.
- **INFRA-05**: Strict type safety across all domain entities (Branch, Offer, Redemption, Settlement, Profile) synchronized with backend DTOs.

---

## Out of Scope (v1)

- In-app staff PIN verification terminal (handled via mobile staff app / customer device flow).
- Real-time Push Notification center (bell icon/WebSockets deferred).
- Direct in-app customer chat or messaging.
- Subscription billing processing for end-consumers (managed by consumer mobile app + PSPs).
