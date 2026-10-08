# Plan 04-01: Backend Admin Endpoint Verification

## Backend Admin Module Status
**Location**: `E:/flutter/OfferNepal/api/offernepal/src/modules/admin/`
**Status**: ✅ EXISTS

## Verified Endpoints

### Dashboard
- ✅ `GET /admin/dashboard` - Dashboard stats (totalMerchants, pendingMerchants, totalUsers, activeOffers)
- **Frontend Expectation**: `GET /api/v1/admin/analytics/overview`
- **Status**: ✅ MATCH (different path, same data)

### User Management
- ✅ `GET /admin/users` - List users with pagination, search, role, isActive filters
- ✅ `GET /admin/users/:id` - Get user details
- ✅ `POST /admin/users/suspend` - Suspend user (body: { userId, reason })
- ✅ `POST /admin/users/activate` - Activate user (body: { userId, notes })
- ❌ `PATCH /admin/users/:id` - Update user (MISSING)
- ❌ `DELETE /admin/users/:id` - Delete user (MISSING)
- ❌ `POST /admin/users/:id/deactivate` - Deactivate user (MISSING - uses suspend instead)

**Frontend Expectations**:
- `GET /api/v1/admin/users` - ✅ MATCH
- `GET /api/v1/admin/users/:id` - ✅ MATCH
- `PATCH /api/v1/admin/users/:id` - ❌ MISSING
- `DELETE /api/v1/admin/users/:id` - ❌ MISSING
- `POST /api/v1/admin/users/:id/activate` - ⚠️ DIFFERENT (backend uses POST /admin/users/activate with body)
- `POST /api/v1/admin/users/:id/deactivate` - ⚠️ DIFFERENT (backend uses POST /admin/users/suspend with body)

### Merchant Management
- ✅ `GET /admin/merchants` - List merchants with pagination, search, status, sortBy filters
- ❌ `GET /admin/merchants/:id` - Get merchant details (MISSING)
- ❌ `PATCH /admin/merchants/:id` - Update merchant (MISSING)
- ✅ `POST /admin/merchants/approve` - Approve merchant (body: { merchantId, notes })
- ✅ `POST /admin/merchants/reject` - Reject merchant (body: { merchantId, reason })
- ❌ `POST /admin/merchants/:id/suspend` - Suspend merchant (MISSING)

**Frontend Expectations**:
- `GET /api/v1/admin/merchants` - ✅ MATCH
- `GET /api/v1/admin/merchants/:id` - ❌ MISSING
- `PATCH /api/v1/admin/merchants/:id` - ❌ MISSING
- `POST /api/v1/admin/merchants/:id/approve` - ⚠️ DIFFERENT (backend uses POST /admin/merchants/approve with body)
- `POST /api/v1/admin/merchants/:id/reject` - ⚠️ DIFFERENT (backend uses POST /admin/merchants/reject with body)
- `POST /api/v1/admin/merchants/:id/suspend` - ❌ MISSING

### Analytics
- ✅ `GET /admin/dashboard` - Platform overview stats
- ❌ `GET /admin/analytics/users` - User metrics (MISSING)
- ❌ `GET /admin/analytics/merchants` - Merchant metrics (MISSING)
- ❌ `GET /admin/analytics/redemptions` - Redemption metrics (MISSING)

**Frontend Expectations**:
- `GET /api/v1/admin/analytics/overview` - ✅ MATCH (uses /admin/dashboard)
- `GET /api/v1/admin/analytics/users` - ❌ MISSING
- `GET /api/v1/admin/analytics/merchants` - ❌ MISSING
- `GET /api/v1/admin/analytics/redemptions` - ❌ MISSING

### Fraud Flags (Bonus - Not in Frontend)
- ✅ `GET /admin/fraud-flags` - List fraud flags
- ✅ `GET /admin/fraud-flags/:id` - Get fraud flag details
- ✅ `POST /admin/fraud-flags/review` - Review fraud flag

## DTO Structure Comparison

### User DTO (Backend)
```typescript
{
  id: string
  email: string
  name: string | null
  role: UserRole
  isActive: boolean
  createdAt: string
  phone: string | null
  avatarUrl: string | null
  isVerified: boolean
}
```
**Frontend Match**: ✅ MATCHES

### Merchant DTO (Backend)
```typescript
{
  id: string
  name: string
  contactEmail: string
  contactPhone: string | null
  status: MerchantStatus
  branches: Branch[]
  createdAt: string
  // ... other fields
}
```
**Frontend Match**: ⚠️ DIFFERENT (frontend expects businessName, email, phone, etc.)

## Critical Issues

### 1. Missing User Update/Delete Endpoints
**Impact**: Cannot edit or delete users from admin panel
**Frontend Files Affected**:
- `lib/api/admin/users-api.ts` (updateUser, deleteUser functions)
- `lib/admin/stores/users-store.ts` (updateUser, deleteUser actions)
- `app/(admin)/admin/users/page.tsx` (edit/delete buttons)

**Recommendation**: Add backend endpoints or remove frontend functionality

### 2. Missing Merchant Details/Update/Suspend Endpoints
**Impact**: Cannot view merchant details, edit merchants, or suspend merchants
**Frontend Files Affected**:
- `lib/api/admin/merchants-api.ts` (getMerchant, updateMerchant, suspendMerchant)
- `lib/admin/stores/merchants-store.ts` (getMerchant, updateMerchant, suspendMerchant)
- `app/(admin)/admin/merchants/[id]/page.tsx` (merchant details page - not yet created)

**Recommendation**: Add backend endpoints or adjust frontend plans

### 3. Different API Path Patterns
**Impact**: Frontend API calls will fail
**Backend Pattern**: `/admin/*` (without /api/v1 prefix)
**Frontend Pattern**: `/api/v1/admin/*`

**Recommendation**: Update frontend API calls to use `/admin/*` pattern

### 4. Different Action Endpoint Patterns
**Impact**: Frontend API calls will fail
**Backend**: `POST /admin/users/activate` with body `{ userId, notes }`
**Frontend**: `POST /api/v1/admin/users/:id/activate`

**Recommendation**: Update frontend API calls to match backend pattern

### 5. Missing Analytics Endpoints
**Impact**: Admin analytics dashboard will have limited data
**Frontend Files Affected**:
- `lib/api/admin/analytics-api.ts` (getUserMetrics, getMerchantMetrics, getRedemptionMetrics)
- `lib/admin/stores/analytics-store.ts` (fetchOfferMetrics, fetchRedemptionMetrics, fetchBranchMetrics)

**Recommendation**: Use `/admin/dashboard` for overview, remove detailed analytics or add backend endpoints

## Recommendations

### Immediate Actions (Frontend Fixes)
1. **Update API Base Path**: Change all admin API calls from `/api/v1/admin/*` to `/admin/*`
2. **Update Action Endpoints**: Change activate/deactivate to use POST with body instead of URL params
3. **Update Approve/Reject**: Change to use POST with body instead of URL params
4. **Remove Missing Functionality**: Remove user edit/delete, merchant edit/suspend from frontend
5. **Simplify Analytics**: Use only `/admin/dashboard` for overview, remove detailed analytics

### Backend Additions (If Needed)
1. Add `PATCH /admin/users/:id` endpoint for user updates
2. Add `DELETE /admin/users/:id` endpoint for user deletion
3. Add `GET /admin/merchants/:id` endpoint for merchant details
4. Add `PATCH /admin/merchants/:id` endpoint for merchant updates
5. Add `POST /admin/merchants/suspend` endpoint for merchant suspension
6. Add analytics endpoints for detailed metrics

## Next Steps

1. Update frontend API calls to match backend patterns
2. Remove or disable functionality for missing endpoints
3. Test with updated API calls
4. Document any remaining gaps for backend team
