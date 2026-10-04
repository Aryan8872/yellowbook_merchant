# Plan Summary: 02-01 Merchant Profile Store, Mock Fixtures & General/Legal Profile View

**Status:** Completed
**Date:** 2026-10-05

## What was built:
1. **[lib/merchant/types.ts](file:///e:/flutter/OfferNepal/merchant_web/offernepal_merchant/lib/merchant/types.ts)**:
   - Defined `MerchantProfile`, `BankPayoutDetails`, and `NotificationSettings`.
2. **[lib/merchant/profile-store.ts](file:///e:/flutter/OfferNepal/merchant_web/offernepal_merchant/lib/merchant/profile-store.ts)**:
   - Zustand store with `fetchProfile()`, `updateProfile()`, `updatePayout()`, and `updateNotifications()`.
3. **[lib/api/mocks/merchant.mock.ts](file:///e:/flutter/OfferNepal/merchant_web/offernepal_merchant/lib/api/mocks/merchant.mock.ts)** & **[lib/api/mocks/index.ts](file:///e:/flutter/OfferNepal/merchant_web/offernepal_merchant/lib/api/mocks/index.ts)**:
   - Registered endpoints for `/api/v1/merchant/profile`, `/payout`, `/notifications`.
4. **Settings Tabs**:
   - `components/merchant/settings/general-profile-tab.tsx`: Form for trade name, category, bio, and instant drag-and-drop file uploaders for 1:1 brand logo and 16:9 widescreen cover banner.
   - `components/merchant/settings/legal-tax-tab.tsx`: IRD compliance banner, PAN/VAT input, and verified KYC badge.

## Verification:
- `npx tsc --noEmit` passed with 0 errors.
