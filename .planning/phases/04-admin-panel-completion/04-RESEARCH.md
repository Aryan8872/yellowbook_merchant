# Phase 4: Admin Panel Completion & Testing - Research

## Backend Endpoint Verification

### Expected Admin Endpoints
- `GET /api/v1/admin/users` - List all users with pagination
- `GET /api/v1/admin/users/:id` - Get user by ID
- `PATCH /api/v1/admin/users/:id` - Update user
- `DELETE /api/v1/admin/users/:id` - Delete user
- `POST /api/v1/admin/users/:id/activate` - Activate user
- `GET /api/v1/admin/merchants` - List all merchants with pagination
- `GET /api/v1/admin/merchants/:id` - Get merchant by ID
- `PATCH /api/v1/admin/merchants/:id` - Update merchant
- `POST /api/v1/admin/merchants/:id/approve` - Approve merchant
- `POST /api/v1/admin/merchants/:id/reject` - Reject merchant
- `POST /api/v1/admin/merchants/:id/suspend` - Suspend merchant
- `GET /api/v1/admin/analytics/overview` - Platform overview stats
- `GET /api/v1/admin/analytics/users` - User growth metrics
- `GET /api/v1/admin/analytics/merchants` - Merchant metrics
- `GET /api/v1/admin/analytics/redemptions` - Redemption metrics

### Verification Methods
1. **Code Review**: Check backend source code for admin module
2. **API Testing**: Use curl or Postman to test endpoints
3. **Swagger/OpenAPI**: Check if backend has API documentation
4. **Backend Team**: Ask backend team about endpoint availability

**Recommendation**: Start with code review of backend admin module, then test with API calls if endpoints exist.

## Authentication Flow Testing

### Test Scenarios
1. **Login Flow**:
   - Admin user logs in with email/password
   - Verify JWT tokens are set in cookies
   - Verify user is redirected to `/admin/dashboard`
   - Verify user role is ADMIN

2. **Token Refresh**:
   - Wait for access token to expire
   - Make API request
   - Verify refresh token is used automatically
   - Verify new access token is set
   - Verify no UI disruption to user

3. **Role-Based Redirects**:
   - ADMIN user accessing `/admin/dashboard` - should allow
   - MERCHANT_ADMIN user accessing `/admin/dashboard` - should redirect to `/merchant/dashboard`
   - USER accessing `/admin/dashboard` - should redirect to `/` or login
   - Unauthenticated user accessing `/admin/*` - should redirect to login

4. **Logout Flow**:
   - User clicks logout
   - Verify tokens are cleared
   - Verify redirect to login page
   - Verify user cannot access protected routes

### Testing Tools
- Browser DevTools (Application tab for cookies)
- Network tab for API requests
- Manual testing with different user roles
- Automated testing with Playwright (optional)

## Toast Notification Options

### Sonner (shadcn recommended)
- **Pros**: Integrated with shadcn, beautiful animations, stackable toasts, promise toasts
- **Cons**: Newer library, less documentation
- **Installation**: `npx shadcn@latest add sonner`
- **Usage**: `toast.success()`, `toast.error()`, `toast.promise()`

### react-hot-toast
- **Pros**: Popular, well-documented, feature-rich
- **Cons**: Not integrated with shadcn design system
- **Installation**: `npm install react-hot-toast`
- **Usage**: `toast.success()`, `toast.error()`, `toast.promise()`

### Custom Toast
- **Pros**: Full control, no dependencies
- **Cons**: More development time, maintenance burden
- **Usage**: Build custom toast component with context

**Recommendation**: Use Sonner for shadcn integration and modern features.

## User Edit Dialog Design

### Form Fields
- Name (string, required)
- Email (string, required, read-only)
- Role (select: ADMIN, MERCHANT_ADMIN, MERCHANT_STAFF, USER)
- Phone (string, optional)
- Avatar URL (string, optional)
- Is Active (boolean, toggle)
- Merchant ID (string, optional, for merchant roles)

### Validation Rules
- Name: min 2 chars, max 100 chars
- Email: valid email format
- Phone: valid phone format (if provided)
- Role: must be valid enum value
- Avatar URL: valid URL format (if provided)

### UI Components
- shadcn Dialog for modal
- shadcn Form with React Hook Form
- shadcn Input for text fields
- shadcn Select for role selection
- shadcn Switch for active status
- shadcn Button for submit/cancel
- Sonner toast for success/error

## Merchant Details Page Design

### Information to Display
- **Basic Info**: Business name, legal name, contact email, phone
- **Status**: Approval status (PENDING, APPROVED, REJECTED, SUSPENDED)
- **Branches**: Number of branches, list of branch names
- **Offers**: Number of active offers, recent offers
- **Analytics**: Total redemptions, total savings, revenue
- **Documents**: PAN number, VAT number (if available)
- **Timeline**: Created at, updated at

### Actions
- Approve (if PENDING)
- Reject (if PENDING)
- Suspend (if APPROVED)
- Activate (if SUSPENDED)
- View Branches (link to branches page)
- View Offers (link to offers page)
- Edit Merchant (open edit dialog)

### UI Layout
- Header with merchant name and status badge
- Two-column layout:
  - Left: Basic info, status, documents
  - Right: Analytics, branches, offers
- Action buttons at top or bottom
- Breadcrumb navigation

## Implementation Sequence

### Plan 04-01: Verify Backend Admin Endpoints
1. Review backend admin module source code
2. Check for admin controller and service
3. Verify endpoint routes match frontend expectations
4. Test with curl/Postman if endpoints exist
5. Document any mismatches or missing endpoints
6. Create missing endpoints if needed (or coordinate with backend team)

### Plan 04-02: Test Authentication Flow
1. Create test admin user in backend
2. Test login flow with admin credentials
3. Verify token storage in cookies
4. Test role-based redirects
5. Test token refresh flow
6. Test logout flow
7. Test unauthorized access attempts
8. Document findings and fix any issues

### Plan 04-03: Complete Admin UI Components
1. Install Sonner toast library
2. Create toast provider in layout
3. Create user edit dialog component
4. Create merchant details page
5. Add toast notifications to admin pages
6. Add error handling to admin stores
7. Add loading states to admin pages

### Plan 04-04: Test with Real API Data
1. Start backend server
2. Test admin dashboard with real data
3. Test users page with real data
4. Test merchants page with real data
5. Test user edit dialog with real API
6. Test merchant details page with real API
7. Test merchant dashboard with real analytics
8. Document any issues and fix

## Performance Considerations

### API Calls
- Debounce search inputs to reduce API calls
- Cache admin data in Zustand stores
- Implement optimistic updates for better UX
- Handle loading states gracefully

### Toast Notifications
- Don't show too many toasts at once
- Auto-dismiss after reasonable time
- Stack toasts to avoid overlap
- Use promise toasts for async operations

### Page Load
- Lazy load admin components (code splitting)
- Use skeleton loaders for better perceived performance
- Prefetch data on hover for navigation

## Testing Strategy

### Unit Tests
- Test user edit form validation
- Test merchant details page rendering
- Test toast notification functions
- Test API client functions

### Integration Tests
- Test user edit dialog with API
- Test merchant details page with API
- Test toast notifications with actions
- Test authentication flow end-to-end

### Manual Tests
- Test all authentication scenarios
- Test all admin pages with real data
- Test user edit with different roles
- Test merchant approval/rejection flow
- Test toast notifications for all actions
- Test error handling (API down, network error)

## Security Considerations

### Input Validation
- Validate all form inputs with Zod
- Sanitize user inputs
- Prevent XSS attacks
- Validate role changes (only admins can change roles)

### Authorization
- Verify admin role before allowing admin operations
- Check permissions for each action
- Validate merchant ID matches user's merchant (for merchant operations)
- Prevent privilege escalation

### Data Privacy
- Don't expose sensitive data in toasts
- Clear sensitive data on logout
- Use secure cookies for tokens
- Log security events

## API Contract Verification

### User DTO Structure
```typescript
{
  id: string
  email: string
  name: string | null
  role: 'ADMIN' | 'MERCHANT_ADMIN' | 'MERCHANT_STAFF' | 'USER'
  isVerified: boolean
  isActive: boolean
  phone?: string | null
  avatarUrl?: string | null
  merchantId?: string | null
  createdAt: string
  updatedAt?: string
}
```

### Merchant DTO Structure
```typescript
{
  id: string
  businessName: string
  email: string
  phone?: string
  address?: string
  panNumber?: string
  vatNumber?: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'
  logoUrl?: string
  branchCount: number
  createdAt: string
  updatedAt: string
}
```

### Analytics DTO Structure
```typescript
{
  totalUsers: number
  totalMerchants: number
  activeOffers: number
  totalRedemptions: number
  revenue?: number
}
```

## Known Backend Limitations

- Admin module may not exist yet
- Admin endpoints may need to be created
- No bulk operations for admin
- No admin audit logs
- No admin analytics dashboard in backend

## Frontend-Backend Sync

### Coordinate Format
- Backend expects: decimal degrees
- Frontend uses: decimal degrees
- No conversion needed

### Date Format
- Backend expects: ISO 8601 strings
- Frontend uses: ISO 8601 strings
- No conversion needed

### Status Enums
- Backend uses: 'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'
- Frontend uses: same enum values
- No conversion needed
