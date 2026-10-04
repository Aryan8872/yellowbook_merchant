# Plan Summary: 02-02 Bank Payout Account Settlement Form, Notification Toggles & Sidebar Navigation

**Status:** Completed
**Date:** 2026-10-05

## What was built:
1. **[components/merchant/settings/bank-payout-tab.tsx](file:///e:/flutter/OfferNepal/merchant_web/offernepal_merchant/components/merchant/settings/bank-payout-tab.tsx)**:
   - Curated dropdown with 16 Nepal Class 'A' commercial banks.
   - Account holder, account number confirmation, and branch location inputs.
   - Educational settlement schedule card (bi-weekly 1st & 15th payouts via ACH).
2. **[components/merchant/settings/notifications-tab.tsx](file:///e:/flutter/OfferNepal/merchant_web/offernepal_merchant/components/merchant/settings/notifications-tab.tsx)**:
   - Operational email toggles for daily redemption digests, high-value deal alerts, and settlement transfer receipts.
3. **[app/(merchant)/merchant/settings/page.tsx](file:///e:/flutter/OfferNepal/merchant_web/offernepal_merchant/app/(merchant)/merchant/settings/page.tsx)**:
   - Single-page tabbed settings hub coordinating General, Legal & Tax, Bank Payout, and Notifications tabs.
4. **[lib/constants/sidebar-item.ts](file:///e:/flutter/OfferNepal/merchant_web/offernepal_merchant/lib/constants/sidebar-item.ts)**:
   - Added `Settings` (`/merchant/settings`) and `Redemptions` (`/merchant/redemption`) routes.

## Verification:
- `npx tsc --noEmit` passed with 0 errors.
