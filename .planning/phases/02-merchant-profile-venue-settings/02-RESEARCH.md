# Phase 2: Merchant Profile & Venue Settings - Research

**Date:** 2026-10-05
**Phase:** 02-merchant-profile-venue-settings
**Status:** Complete

## 1. Domain & Scope

Phase 2 focuses on providing the merchant with a comprehensive management console for their business identity, tax documents, bank payout channels, and notification settings:
- **PROFILE-01**: Trade Name, Legal Entity Name, Primary Category (Dining, Wellness, Retail, Entertainment), Bio/About, Logo & Cover Image.
- **PROFILE-02**: Bank payout verification with Nepal Class 'A' banking institutions, Account Holder matching, Account confirmation, Branch name.
- **PROFILE-03**: Email notification settings (Daily redemption digest, High-value alerts, Settlement updates).

---

## 2. Technical Decisions & Data Modeling

### 2.1 Profile & Payout Schema
```ts
export interface MerchantProfile {
  id: string;
  tradeName: string;
  legalName: string;
  category: string;
  bio: string;
  logoUrl?: string;
  coverUrl?: string;
  panNumber: string;
  registrationNumber?: string;
  isTaxVerified: boolean;
  contactEmail: string;
  contactPhone: string;
}

export interface BankPayoutDetails {
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  branchName: string;
  payoutSchedule: string;
  isVerified: boolean;
}

export interface NotificationSettings {
  emailDailyDigest: boolean;
  emailHighValueAlerts: boolean;
  emailSettlementUpdates: boolean;
  marketingUpdates: boolean;
}
```

### 2.2 Nepal Commercial Banks List
Top Class 'A' commercial banks in Nepal:
- Nabil Bank Ltd.
- NIC Asia Bank Ltd.
- Global IME Bank Ltd.
- Nepal Investment Mega Bank (NIMB)
- Everest Bank Ltd.
- Sanima Bank Ltd.
- Siddhartha Bank Ltd.
- Standard Chartered Bank Nepal Ltd.
- Rastriya Banijya Bank (RBB)
- NMB Bank Ltd.
- Prabhu Bank Ltd.
- Kumari Bank Ltd.
- Himalayan Bank Ltd.
- Prime Commercial Bank Ltd.
- Machhapuchchhre Bank Ltd.
- Citizens Bank International Ltd.

---

## 3. Plan Decomposition Strategy (2 Plans)

1. **Plan 02-01: Merchant Profile Store, Mock Fixtures & General/Legal Profile View**
   - Profile state management in Zustand (`lib/merchant/profile-store.ts`).
   - Mock fixtures for profile, tax, bank details, and notification preferences.
   - General Profile tab with drag-and-drop logo & cover image uploaders.
   - Legal & Tax tab with PAN/VAT verification cards.

2. **Plan 02-02: Bank Payout Account Settlement Form, Notification Toggles & Sidebar Navigation**
   - Payout & Settlement tab with Nepal Class 'A' bank selector and schedule indicator.
   - Notifications tab with preference switches.
   - Settings page assembly at `app/(merchant)/merchant/settings/page.tsx`.
   - Add Settings entry to sidebar navigation in `lib/constants/sidebar-item.ts`.
