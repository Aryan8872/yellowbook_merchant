# Phase 4: Admin Panel Completion & Testing - Context

## Phase Goal
Verify backend admin endpoints exist, test authentication flow, complete remaining admin UI components, and test admin panel with real API data.

## Current State

### Completed Admin Panel Infrastructure (Phase 3)
- **RBAC Middleware**: `lib/auth/permissions.ts`, `lib/auth/jwt.ts`, `middleware.ts` with role validation
- **Route Guards**: `lib/auth/route-guards.tsx` with client-side protection
- **Admin Layout**: `app/(admin)/admin/layout.tsx` with sidebar and header
- **Admin Components**: `lib/admin/components/admin-sidebar.tsx`, `admin-header.tsx`
- **Admin Pages**: `app/(admin)/admin/page.tsx` (dashboard), `users/page.tsx`, `merchants/page.tsx`
- **Admin API Layer**: `lib/api/admin/users-api.ts`, `merchants-api.ts`, `analytics-api.ts`
- **Admin Stores**: `lib/admin/stores/users-store.ts`, `merchants-store.ts`, `analytics-store.ts`
- **API Route Proxies**: `app/api/admin/users/route.ts`, `merchants/route.ts`

### Remaining Admin Work
- **User Edit Dialog**: Not implemented (mentioned in Plan 03-03)
- **Merchant Details Page**: `/admin/merchants/[id]/page.tsx` does not exist
- **Toast Notifications**: No success/error feedback in admin pages
- **Backend Endpoint Verification**: Need to check if `/api/v1/admin/*` endpoints exist in backend
- **Authentication Testing**: Need to test login, token refresh, role-based redirects
- **Real API Testing**: Need to test admin panel with actual backend data

### Merchant Dashboard Integration (Recently Completed)
- **Merchant API Layer**: `lib/api/merchant/offers-api.ts`, `redemptions-api.ts`, `analytics-api.ts`
- **Merchant Stores**: `lib/merchant/stores/analytics-store.ts`, `offers-store.ts`
- **Dashboard Integration**: `components/merchant/dashboardStatHeader.tsx`, `dashboardBody.tsx` connected to real API

## Requirements Scope

### High Priority
1. **Verify Backend Admin Endpoints**: Check if `/api/v1/admin/users`, `/api/v1/admin/merchants`, `/api/v1/admin/analytics` exist in backend
2. **Test Authentication Flow**: Verify login, token refresh, role-based redirects work correctly
3. **Test Admin Panel**: Test admin dashboard, users page, merchants page with real API data
4. **Test Merchant Dashboard**: Verify merchant dashboard fetches real analytics data

### Medium Priority
1. **Admin User Edit Dialog**: Create dialog component for editing user details
2. **Admin Merchant Details Page**: Create `/admin/merchants/[id]/page.tsx` for viewing merchant details
3. **Error Handling & Toasts**: Add toast notifications for success/error messages in admin pages

## Dependencies

### External Dependencies
- shadcn/ui components: Dialog, Form, Input, Select, Button, Badge, Toast
- React Hook Form + Zod (for user edit form)
- Sonner or react-hot-toast (for toast notifications)

### Internal Dependencies
- `lib/auth/permissions.ts` - Role definitions and permissions
- `lib/auth/jwt.ts` - JWT utilities
- `lib/auth/auth-store.ts` - Auth state
- `lib/api/admin/*` - Admin API functions
- `lib/admin/stores/*` - Admin state stores
- `app/(admin)/admin/*` - Admin pages

## Constraints

### Technical Constraints
- Must verify backend endpoints before testing
- Must use existing API client pattern
- Must maintain TypeScript type safety
- Must follow existing component structure

### Business Constraints
- Admin operations require ADMIN role
- Merchant operations require MERCHANT_ADMIN/STAFF role
- Role-based redirects must work correctly

## Success Criteria

1. Backend admin endpoints are verified to exist and match frontend expectations
2. Authentication flow (login, token refresh, role-based redirects) works correctly
3. Admin user edit dialog component is implemented
4. Admin merchant details page is created
5. Toast notifications are added for success/error messages in admin pages
6. Admin panel is tested with real API data
7. Merchant dashboard is tested with real analytics data

## Technical Decisions Needed

1. **Backend Endpoint Verification**: Should we check backend code or test with API calls?
2. **Toast Library**: Use Sonner (shadcn recommended) or react-hot-toast?
3. **User Edit Form**: Reuse existing form patterns or create new?
4. **Merchant Details Page**: What information to display? Offers, branches, analytics?

## Known Issues

- Backend admin endpoints may not exist yet
- No toast notification system in place
- User edit dialog not implemented
- Merchant details page not implemented
- No comprehensive testing done yet

## Integration Points

- **Backend API**: `/api/v1/admin/*` endpoints
- **Auth Middleware**: `middleware.ts` for route protection
- **Auth Store**: `lib/auth/auth-store.ts` for authentication state
- **Admin Stores**: `lib/admin/stores/*` for admin state
- **Admin Pages**: `app/(admin)/admin/*` for admin UI

## Risk Areas

1. **Backend Endpoints Missing**: Admin endpoints may not exist in backend, requiring backend development
2. **Authentication Issues**: Token refresh or role-based redirects may have bugs
3. **API Contract Mismatches**: Frontend types may not match backend DTOs
4. **Testing Complexity**: Comprehensive testing may be time-consuming
