# Phase 3: Admin Panel & RBAC Implementation - Research

## RBAC Implementation Patterns

### Next.js Middleware vs Route Guards

**Middleware.ts Approach:**
- Pros: Runs on every request, consistent enforcement, edge-compatible
- Cons: Cannot access request body, limited to headers/cookies, no runtime context
- Best for: Simple role checks, route-level protection

**Route-Level Guards Approach:**
- Pros: Full access to request context, can use server components, flexible logic
- Cons: Must implement per route, potential for missed protections
- Best for: Complex permission checks, data-level authorization

**Recommended Hybrid:**
- Use middleware.ts for coarse-grained route protection (admin vs merchant vs public)
- Use route-level guards for fine-grained permission checks (specific actions)
- Centralize permission logic in shared utility functions

### Permission Matrix Design

**Role-Based Permissions:**

```typescript
enum UserRole {
  ADMIN = 'ADMIN',
  MERCHANT_ADMIN = 'MERCHANT_ADMIN',
  MERCHANT_STAFF = 'MERCHANT_STAFF',
  USER = 'USER',
}

type Permission = string;

const PERMISSIONS = {
  // Admin permissions
  'admin.users.read': 'View all users',
  'admin.users.write': 'Create/edit/delete users',
  'admin.merchants.read': 'View all merchants',
  'admin.merchants.write': 'Approve/reject/edit merchants',
  'admin.offers.read': 'View all offers',
  'admin.offers.write': 'Moderate any offer',
  'admin.analytics.read': 'View platform analytics',
  'admin.system.read': 'View system configuration',
  'admin.system.write': 'Edit system configuration',

  // Merchant permissions
  'merchant.profile.read': 'View merchant profile',
  'merchant.profile.write': 'Edit merchant profile',
  'merchant.branches.read': 'View merchant branches',
  'merchant.branches.write': 'Create/edit/delete branches',
  'merchant.offers.read': 'View merchant offers',
  'merchant.offers.write': 'Create/edit/delete offers',
  'merchant.redemptions.read': 'View merchant redemptions',
  'merchant.analytics.read': 'View merchant analytics',

  // Merchant staff permissions
  'staff.offers.read': 'View merchant offers',
  'staff.redemptions.read': 'View merchant redemptions',
  'staff.redemptions.write': 'Verify redemptions',
} as const;

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: Object.values(PERMISSIONS),
  MERCHANT_ADMIN: [
    'merchant.profile.read',
    'merchant.profile.write',
    'merchant.branches.read',
    'merchant.branches.write',
    'merchant.offers.read',
    'merchant.offers.write',
    'merchant.redemptions.read',
    'merchant.analytics.read',
  ],
  MERCHANT_STAFF: [
    'staff.offers.read',
    'staff.redemptions.read',
    'staff.redemptions.write',
  ],
  USER: [],
};
```

### Token Validation Strategy

**Current Implementation:**
- Tokens stored in HttpOnly cookies
- Middleware checks token presence only
- No role validation in middleware

**Recommended Enhancement:**
1. Decode JWT in middleware to extract role
2. Validate role against route requirements
3. Cache decoded claims to avoid repeated decoding
4. Handle token expiration gracefully with redirect to refresh

## shadcn/ui Component Selection

### Admin Dashboard Layout

**Required Components:**
- `Card` - Dashboard stat cards, content containers
- `Table` - User/merchant listing with sorting/filtering
- `Button` - Action buttons (edit, delete, approve)
- `DropdownMenu` - Row actions menu
- `Dialog` - Edit/create modals
- `Form` - Input forms with validation
- `Select` - Role selection, status toggles
- `Switch` - Toggle switches for active/inactive
- `Badge` - Status badges (active, pending, suspended)
- `Tabs` - Tab navigation (users, merchants, analytics)
- `Sidebar` - Navigation sidebar (custom or shadcn Sheet)
- `Avatar` - User avatars
- `Input` - Search inputs, form fields
- `Label` - Form labels
- `Separator` - Visual separators
- `ScrollArea` - Scrollable content areas

### Component Installation

```bash
npx shadcn-ui@latest add card table button dropdown-menu dialog form select switch badge tabs avatar input label separator scroll-area
```

## Admin Panel Architecture

### Route Structure

```
app/
├── (admin)/
│   ├── admin/
│   │   ├── layout.tsx          # Admin layout with sidebar
│   │   ├── page.tsx            # Admin dashboard (overview)
│   │   ├── users/
│   │   │   ├── page.tsx        # User listing
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx    # User details
│   │   ├── merchants/
│   │   │   ├── page.tsx        # Merchant listing
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx    # Merchant details
│   │   └── analytics/
│   │       └── page.tsx        # Analytics dashboard
├── (merchant)/
│   └── merchant/               # Existing merchant routes
└── (public)/
    └── /                       # Public routes
```

### State Management Strategy

**Admin-Specific Stores:**
- `lib/admin/admin-store.ts` - Admin-specific state (current view, filters)
- `lib/admin/users-store.ts` - User management state
- `lib/admin/merchants-store.ts` - Merchant management state
- Reuse existing `lib/auth/auth-store.ts` for authentication

**API Service Layer:**
- `lib/api/admin/users-api.ts` - User API calls
- `lib/api/admin/merchants-api.ts` - Merchant API calls
- `lib/api/admin/analytics-api.ts` - Analytics API calls
- Reuse existing `lib/api/client.ts` for HTTP client

## API Integration Pattern

### Admin API Endpoints (Assumed from Backend)

**User Management:**
- `GET /api/v1/admin/users` - List users (paginated, filterable)
- `GET /api/v1/admin/users/:id` - Get user details
- `PATCH /api/v1/admin/users/:id` - Update user
- `DELETE /api/v1/admin/users/:id` - Deactivate user
- `POST /api/v1/admin/users/:id/activate` - Activate user

**Merchant Management:**
- `GET /api/v1/admin/merchants` - List merchants (paginated, filterable)
- `GET /api/v1/admin/merchants/:id` - Get merchant details
- `PATCH /api/v1/admin/merchants/:id` - Update merchant
- `POST /api/v1/admin/merchants/:id/approve` - Approve merchant
- `POST /api/v1/admin/merchants/:id/reject` - Reject merchant

**Analytics:**
- `GET /api/v1/admin/analytics/overview` - Platform overview stats
- `GET /api/v1/admin/analytics/users` - User growth metrics
- `GET /api/v1/admin/analytics/merchants` - Merchant metrics
- `GET /api/v1/admin/analytics/redemptions` - Redemption metrics

### API Proxy Pattern

**Next.js API Route Proxies:**
```
app/api/admin/
├── users/
│   ├── route.ts                # GET list, POST create
│   └── [id]/
│       └── route.ts            # GET, PATCH, DELETE
├── merchants/
│   ├── route.ts                # GET list
│   └── [id]/
│       └── route.ts            # GET, PATCH, approve/reject
└── analytics/
    └── route.ts                # GET analytics data
```

**Proxy Benefits:**
- Centralized authentication (token validation)
- Request/response transformation
- Error handling standardization
- CORS handling
- Logging/monitoring hook point

## Security Considerations

### Authorization Best Practices

1. **Defense in Depth:**
   - Validate at middleware (route level)
   - Validate at API route (proxy level)
   - Validate at backend (final authority)

2. **Principle of Least Privilege:**
   - Default deny (no access unless explicitly granted)
   - Role-based permissions
   - Resource-level checks (user can only edit their own data unless admin)

3. **Session Security:**
   - Short-lived access tokens (15-30 minutes)
   - Refresh token rotation
   - Secure cookie flags (HttpOnly, Secure, SameSite)
   - Logout invalidates refresh tokens

4. **Audit Logging:**
   - Log all admin actions
   - Include user ID, action, timestamp, IP
   - Store in immutable log

### Common Vulnerabilities to Avoid

1. **Role Escalation:**
   - Never trust client-side role claims
   - Always validate role on server
   - Use signed JWT tokens

2. **IDOR (Insecure Direct Object References):**
   - Validate user owns resource before allowing access
   - Use resource-based permissions
   - Randomize IDs where possible

3. **Session Fixation:**
   - Regenerate session ID on login
   - Use HttpOnly cookies
   - Implement CSRF protection

## Enterprise-Level Next.js Patterns

### Code Organization

**Feature-Based Structure:**
```
lib/
├── admin/
│   ├── components/          # Admin-specific components
│   ├── hooks/              # Admin-specific hooks
│   ├── stores/             # Admin state management
│   ├── utils/              # Admin utilities
│   └── types/              # Admin TypeScript types
├── auth/
│   └── (existing)
├── api/
│   └── (existing)
└── shared/
    ├── components/         # Shared components
    ├── hooks/              # Shared hooks
    └── utils/              # Shared utilities
```

### Type Safety

**Strict TypeScript Configuration:**
- Enable strict mode
- Use discriminated unions for API responses
- Create DTO interfaces matching backend
- Use zod for runtime validation

**Example:**
```typescript
import { z } from 'zod';

const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(['ADMIN', 'MERCHANT_ADMIN', 'MERCHANT_STAFF', 'USER']),
  isActive: z.boolean(),
  createdAt: z.string(),
});

type User = z.infer<typeof UserSchema>;
```

### Error Handling

**Standardized Error Handling:**
- Custom error types (AuthError, NetworkError, ValidationError)
- Error boundary for React components
- Toast notifications for user feedback
- Error logging to monitoring service

## Implementation Sequence

**Plan 03-01: RBAC Middleware**
1. Create permission constants and role matrix
2. Implement permission utility functions
3. Enhance middleware.ts with role validation
4. Add role-based route guards
5. Test unauthorized access scenarios

**Plan 03-02: Admin Dashboard Layout**
1. Install required shadcn components
2. Create admin layout with sidebar
3. Implement navigation structure
4. Add responsive design
5. Integrate with auth state

**Plan 03-03: Admin API Integration**
1. Create admin API service layer
2. Implement Next.js API route proxies
3. Create admin stores (Zustand)
4. Build user management UI
5. Build merchant management UI
6. Connect to analytics endpoints

## Performance Considerations

1. **Middleware Optimization:**
   - Cache decoded JWT claims
   - Skip role checks for public routes
   - Use edge-compatible operations only

2. **Data Fetching:**
   - Implement pagination for large lists
   - Use React Query or SWR for caching
   - Implement optimistic updates

3. **Code Splitting:**
   - Lazy load admin routes
   - Separate admin bundle from merchant bundle
   - Dynamic imports for heavy components

## Testing Strategy

**Unit Tests:**
- Permission utility functions
- Role validation logic
- API service functions

**Integration Tests:**
- Middleware role enforcement
- API route proxy authentication
- Admin route protection

**E2E Tests:**
- Admin login flow
- User management CRUD
- Merchant approval flow
- Unauthorized access prevention

---
*Research completed for Phase 3: Admin Panel & RBAC Implementation*
