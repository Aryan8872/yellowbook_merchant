# Phase 1: API Foundation & Authentication - Context

**Gathered:** 2026-10-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish the foundational NestJS HTTP API client with response envelope standardization (`{ success, data, errorCode, meta }`), resilient transparent fallback to mock data when endpoints are offline/incomplete, JWT session management via secure HttpOnly cookies, Google OAuth entry point, authentication route protection guards in Next.js App Router, and a dedicated branded split-screen login/auth experience.

</domain>

<decisions>
## Implementation Decisions

### Auth Session Storage & Refresh Strategy
- **D-01:** Token persistence uses secure HttpOnly cookies managed via Next.js Route Handlers (`/api/auth/login`, `/api/auth/refresh`, `/api/auth/logout`, `/api/auth/me`).
- **D-02:** Next.js middleware and route guards read auth cookies to protect `/merchant/*` routes. Unauthenticated requests are seamlessly redirected to `/login` with `returnUrl`.
- **D-03:** Automatic token refresh on 401: when an authenticated API call encounters an expired access token, the client initiates a token refresh against `/api/v1/auth/refresh` using the refresh token stored in the HttpOnly cookie, transparently retrying the original request.

### Mock Fallback Behavior & Dev Resilience
- **D-04:** Transparent fallback on Network Error, 404, or 500: The API client attempts the real backend API (`https://yellow-bookapi-production.up.railway.app`) first. If an endpoint is missing (404), fails with a server error (500), or cannot be reached, it seamlessly falls back to high-fidelity mock data.
- **D-05:** Fallback requests log a discreet development warning in console (`[API Fallback] Serving mock data for <endpoint>`) to preserve seamless UI testing without halting developer velocity.

### Login & Auth UI Flow & Layout
- **D-06:** Dedicated modern split-screen layout for authentication pages (`app/(merchant)/merchant/auth/login` or `/login`):
  - **Left panel:** OfferNepal branding, BOGO partner value propositions, lifestyle imagery/patterns, and merchant partner testimonials.
  - **Right panel:** Minimalist, high-conversion card featuring Email/Password login inputs, Google OAuth sign-in button, "Forgot password" link, and dark/light mode toggle.
- **D-07:** Post-login redirection sends authenticated `MERCHANT_ADMIN` users directly to `/merchant/dashboard` (or the requested `returnUrl`).

### the agent's Discretion
- Form validation schemas (Zod) and form control wiring (react-hook-form).
- Exact cookie options (`SameSite`, `Secure`, `Path`, `Max-Age`).
- Loading skeletons, micro-animations, and toast alert feedback on invalid credentials.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Backend Auth & API Specifications
- `https://yellow-bookapi-production.up.railway.app/docs#/Auth` — Live NestJS Swagger API specification:
  - `POST /api/v1/auth/login` — Email/password login returning `{ accessToken, refreshToken }`
  - `POST /api/v1/auth/refresh` — Token rotation accepting `{ refreshToken }`
  - `POST /api/v1/auth/logout` — Revoke active session tokens
  - `GET /api/v1/auth/me` — Current authenticated merchant profile and subscription status
- `.planning/REQUIREMENTS.md` §1 (AUTH-01 to AUTH-05) & §7 (INFRA-01, INFRA-02, INFRA-05) — Functional & architectural requirements.
- `.planning/codebase/INTEGRATIONS.md` — Current integration status, font definitions, and environment variables.
- `.planning/codebase/ARCHITECTURE.md` — Route group structure (`app/(merchant)`), layouts, and theme architecture.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `components/ui/button.tsx`, `components/ui/card.tsx`, `components/ui/input.tsx` — Base UI primitives with dark/light mode support.
- `lib/constants/sidebar-item.ts` — Navigation structure; currently shows `merchant@demo.com` placeholder in footer that should reflect live auth state.

### Established Patterns
- Next.js 16 App Router with React 19 and `@base-ui/react` primitives.
- Theme switching with `next-themes` and `ThemeProvider`.

### Integration Points
- `app/(merchant)/merchant/auth/` — Directory reserved for auth pages.
- `proxy` or `middleware.ts` — Route guard intercepting `/merchant/*` routes.
- `app/(merchant)/merchant/app-sidebar.tsx` — User footer profile info and logout button handler.

</code_context>

<specifics>
## Specific Ideas

- Backend base URL: `https://yellow-bookapi-production.up.railway.app`.
- Split-screen auth layout matching modern SaaS aesthetic (Linear / Stripe style).
- Transparent API fallback ensures zero disruption while backend engineers build remaining endpoints.

</specifics>

<deferred>
## Deferred Ideas

- In-app staff PIN verification terminal (handled via mobile app).
- Direct in-app customer chat.
- In-app notification center (bell icon/WebSockets deferred).

</deferred>

---

*Phase: 01-api-foundation-authentication*
*Context gathered: 2026-10-05*
