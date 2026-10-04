# Phase 1: API Foundation & Authentication - Research

**Date:** 2026-10-05
**Phase:** 01-api-foundation-authentication
**Status:** Complete

## 1. Domain & Architecture Overview

Phase 1 establishes the communication and security foundation for the OfferNepal Merchant Web Portal. The merchant web application is built on **Next.js 16 (App Router)** and **React 19**, while the backend is an asynchronous **NestJS** microservice deployed at `https://yellow-bookapi-production.up.railway.app`.

### Key Backend Contracts (from Swagger)
- Base URL: `https://yellow-bookapi-production.up.railway.app`
- Global API Prefix: `/api/v1`
- Standard Response Envelope:
  ```ts
  interface ApiResponse<T> {
    success: boolean;
    data?: T;
    errorCode?: string;
    message?: string;
    meta?: Record<string, any>;
  }
  ```
- Authentication Endpoints:
  - `POST /api/v1/auth/login`: `{ email, password }` → `{ accessToken, refreshToken }`
  - `POST /api/v1/auth/refresh`: `{ refreshToken }` → `{ accessToken, refreshToken }`
  - `POST /api/v1/auth/logout`: Revokes active refresh token
  - `GET /api/v1/auth/me`: Bearer Auth → User profile `{ id, email, name, role, phone, ... }`

---

## 2. Technical Findings & Patterns

### 2.1 Next.js 16 Route Handlers for HttpOnly Session Storage
In Next.js 16 App Router, client-side access to JWTs presents an XSS vulnerability. 
- **Pattern**: Route Handlers (`app/api/auth/login/route.ts`, `app/api/auth/refresh/route.ts`, `app/api/auth/logout/route.ts`, `app/api/auth/me/route.ts`) proxy credentials to the NestJS backend and write `accessToken` and `refreshToken` into secure, `HttpOnly`, `SameSite=Lax` cookies.
- **Middleware**: A lightweight Edge `middleware.ts` inspects the presence of the session cookie for `/merchant/*` routes (except `/merchant/auth/*`). If absent or invalid, it redirects to `/merchant/auth/login?returnUrl=...`.

### 2.2 Resilient API Client & Transparent Mock Fallback
Because backend endpoints are being developed in parallel, frontend work must never be blocked by 404s, 500s, or downtime.
- **Client Architecture**: An HTTP client layer (`lib/api/client.ts`) with request interceptors.
- **Fallback Logic**:
  1. Attempt real fetch against `NEXT_PUBLIC_API_URL` (or proxy via Route Handlers).
  2. If network error occurs, or status is 404/500/502/503:
     - Check registry of mock fixtures (`lib/api/mocks/*`).
     - If matching mock fixture exists, log `console.warn('[API Fallback] Using mock for ' + endpoint)` and return mock data wrapped in `{ success: true, data: mockData }`.
     - Otherwise, rethrow standardized `ApiError`.

### 2.3 Split-Screen Branded Auth UI
- **Route**: `app/(merchant)/merchant/auth/login/page.tsx`
- **Design Structure**:
  - Two-column grid (`lg:grid-cols-2 min-h-screen`).
  - **Left side**: Dark gradient background with subtle gold/amber accent highlights, OfferNepal logo, value proposition banner ("Empower your venue with footfall-driven BOGO subscriptions"), and merchant metric testimonials.
  - **Right side**: Centered form container with `Card`, `Input`, `Button`, Google OAuth SSO trigger button, remember me / forgot password actions, and theme switch toggle in top-right corner.

---

## 3. Plan Decomposition Strategy (Standard Granularity: 3 Plans)

Based on standard granularity (3-5 plans per phase), Phase 1 is decomposed into 3 discrete plans:

1. **Plan 01-01: API Envelope Client, DTOs & Resilient Mock Fallback Engine**
   - Core API client (`lib/api/client.ts`) with response envelope validation.
   - Comprehensive TypeScript DTOs for Auth, Users, and standard response envelopes.
   - Mock fixture provider (`lib/api/mocks/`) with transparent fallback mechanism.

2. **Plan 01-02: Next.js Session Management, Route Handlers & Route Middleware**
   - Route Handlers (`app/api/auth/[login|refresh|logout|me]/route.ts`) managing HttpOnly cookies.
   - Auth Context / hooks (`lib/auth/auth-context.tsx`, `useAuth`).
   - Next.js `middleware.ts` guarding `/merchant/*` routes against unauthenticated access.
   - Update sidebar user avatar and logout button in `app/(merchant)/merchant/app-sidebar.tsx`.

3. **Plan 01-03: Branded Split-Screen Login Page & Google OAuth Interface**
   - Split-screen auth layout and styling with OfferNepal brand identity.
   - High-conversion login form with Zod schema validation and error toast notifications.
   - Google OAuth sign-in entry point and "Forgot Password" modal/flow.
