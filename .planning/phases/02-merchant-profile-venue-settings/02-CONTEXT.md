# Phase 2: Merchant Profile & Venue Settings - Context

**Gathered:** 2026-10-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver the comprehensive merchant profile and venue configuration hub at `/merchant/settings`. Merchants can view and update their public business identity (Trade Name, Legal Name, Category, Bio, Logo, Cover Banner), legal tax compliance info (PAN/VAT number, Registration details), bank payout information for financial settlements (Nepal Class 'A' bank selector, account numbers, branch), and email notification preferences.

</domain>

<decisions>
## Implementation Decisions

### Settings Navigation & Layout
- **D-01:** Unified tabbed settings interface at `/merchant/settings` organized into 4 cohesive tabs:
  1. **General Profile:** Trade Name, Legal Business Name, Primary Category (Dining, Wellness, Retail, etc.), Bio/Description, Logo & Cover Banner.
  2. **Legal & Tax:** PAN/VAT registration number, Registration Certificate number, Tax verification badge.
  3. **Payout & Settlement:** Bank account information for automated BOGO settlements.
  4. **Notifications:** Email notification preference switches (Daily summary digest, High-value redemption alerts, Settlement credit notifications).

### Bank Settlement Verification & Fields
- **D-02:** Nepal Commercial Bank integration:
  - Curated dropdown of major Nepal Class 'A' commercial banks (Nabil Bank, NIC Asia Bank, Global IME Bank, Everest Bank, Nepal Investment Mega Bank, Sanima Bank, Standard Chartered Nepal, Rastriya Banijya Bank, Siddhartha Bank, etc.).
  - Account Holder Name (validated against business legal name).
  - Account Number and Account Confirmation fields.
  - Branch Name (e.g. "Durbar Marg Branch, Kathmandu").
  - Settlement summary card displaying schedule ("Automated Settlement on 1st & 15th of each month").

### Image Upload Handling for Brand Logo & Cover
- **D-03:** Drag-and-drop file uploaders with instant client-side preview:
  - Brand Logo: 1:1 square aspect ratio dropzone.
  - Cover Banner: 16:9 widescreen hero banner preview.
  - File validation for image formats (PNG, JPEG, WebP) up to 2MB.
  - Optimistic update with fallback mock CDN persistence when backend storage endpoints are in development.

### State & Architecture
- **D-04:** Leverage Zustand store (`lib/merchant/profile-store.ts`) for profile state management, integrated with `apiClient` and mock fallback support.

### the agent's Discretion
- Form schema validation via Zod.
- Toast feedback and saving indicators.
- Skeleton loading states while initial profile loads.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

- `.planning/REQUIREMENTS.md` §2 (PROFILE-01, PROFILE-02, PROFILE-03) — Profile & venue requirements.
- `.planning/ROADMAP.md` Phase 2 — Goals and success criteria.
- `lib/api/client.ts` & `lib/api/types.ts` — Standardized API envelope and fetch client.
- `lib/auth/auth-store.ts` — User and auth context for current merchant.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `components/ui/card.tsx`, `components/ui/input.tsx`, `components/ui/button.tsx` — Core UI elements.
- `lib/constants/sidebar-item.ts` — Add "Settings" (`/merchant/settings`) navigation link.

### Integration Points
- `app/(merchant)/merchant/settings/page.tsx` — New settings page.
- `lib/merchant/profile-store.ts` — Zustand store for merchant profile & payout info.

</code_context>

<specifics>
## Specific Ideas

- Seamless Nepal Class 'A' bank selector.
- Visual status badges for verified PAN/VAT.
- Instant drag-and-drop preview for venue logo and widescreen cover banner.

</specifics>

<deferred>
## Deferred Ideas

- In-app staff PIN verification terminal (handled via mobile app).
- Direct in-app customer chat.
- In-app push notification center.

</deferred>

---

*Phase: 02-merchant-profile-venue-settings*
*Context gathered: 2026-10-05*
