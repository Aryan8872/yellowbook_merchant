# Phase 3: Admin Panel & RBAC Implementation - Context

## Phase Goal

Implement role-based access control (RBAC) middleware, create admin dashboard UIs using shadcn components, and integrate admin-specific API endpoints to enable platform administration.

## Current State

### Authentication Infrastructure
- JWT-based authentication with HttpOnly cookies (accessToken, refreshToken)
- Auth state management using Zustand (lib/auth/auth-store.ts)
- Next.js API route proxies at `/api/auth/*` to backend
- Middleware protects `/merchant/*` routes but lacks role-based enforcement
- Token refresh mechanism implemented in auth-store

### User Roles (from API)
- `USER` - Regular customer
- `MERCHANT_STAFF` - Merchant staff with limited access
- `MERCHANT_ADMIN` - Merchant administrator with full merchant access
- `ADMIN` - Platform administrator with system-wide access

### Existing Route Structure
- `/merchant/*` - Merchant portal routes (protected by middleware)
- `/admin/*` - Admin routes (directory exists but no RBAC protection)
- `/api/auth/*` - Authentication API proxies

### API Client
- Standardized API client at `lib/api/client.ts`
- Supports token-based authentication via Authorization header
- Mock fallback system for development
- API envelope: `{ success, data, errorCode, message, meta }`

### UI Components
- shadcn/ui components available in project
- Lucide icons for iconography
- Tailwind CSS for styling
- Zustand for state management

## Requirements Scope

### RBAC Requirements
- **RBAC-01**: Implement middleware to enforce role-based access to protected routes
- **RBAC-02**: Define role permissions matrix (ADMIN, MERCHANT_ADMIN, MERCHANT_STAFF)
- **RBAC-03**: Redirect unauthorized users to appropriate login pages based on role

### Admin Panel Requirements
- **ADMIN-01**: Create admin dashboard layout with navigation and sidebar
- **ADMIN-02**: Implement user management UI (list, view, edit, deactivate users)
- **ADMIN-03**: Implement merchant management UI (list, view, approve/reject merchants)

## Dependencies

- Phase 1 (API Foundation & Authentication) - Complete
- Phase 2 (Merchant Profile & Venue Settings) - Complete
- Backend API with admin endpoints (assumed available)

## Constraints

- Must use shadcn/ui components for consistency
- Must follow enterprise-level Next.js patterns
- Must maintain backward compatibility with existing merchant routes
- Must ensure type safety with TypeScript
- Must handle edge cases (expired tokens, role changes, concurrent sessions)

## Success Criteria

1. RBAC middleware enforces role-based access (ADMIN, MERCHANT_ADMIN, MERCHANT_STAFF) to protected routes
2. Admin dashboard displays with shadcn components for user management, merchant management, and system overview
3. Admin API endpoints are connected and properly authenticated with role validation
4. Unauthorized users are redirected to appropriate login pages based on their role

## Technical Decisions Needed

1. RBAC middleware placement (middleware.ts vs route-level guards)
2. Permission storage (centralized config vs inline checks)
3. Admin route structure (nested routes vs separate app directory)
4. State management for admin-specific data (new stores vs existing auth-store)
5. API proxy pattern for admin endpoints (reuse existing client vs dedicated admin client)

## Known Issues

1. Current middleware.ts only checks token presence, not user role
2. No role validation on API route proxies
3. Admin routes exist but have no protection
4. No centralized permission definitions
5. User role not consistently validated across the application

## Integration Points

- Backend API: `/api/v1/admin/*` endpoints (assumed)
- Existing auth-store: May need extension for admin-specific state
- Existing middleware: Will need RBAC enhancement
- Existing API client: Can be reused for admin API calls

## Risk Areas

1. Role escalation vulnerabilities
2. Session hijacking without proper token validation
3. Inconsistent role checks leading to authorization bypass
4. Performance impact of middleware on every request
5. Breaking changes to existing merchant routes

---
*Context generated for Phase 3: Admin Panel & RBAC Implementation*
