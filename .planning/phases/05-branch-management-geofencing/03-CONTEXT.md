# Phase 3 Context: Branch Management & Geofencing

## Phase Goal

Provide full CRUD control over physical merchant venues, GPS coordinates, operating schedules, and geofence radius limits.

## Dependencies

- Phase 1: API Foundation & Authentication (API client, auth guards)
- Phase 2: Merchant Profile & Venue Settings (merchant context)

## API Endpoints

### Branch Management APIs

#### 2.1 Get Branches for Merchant
- **Endpoint:** `GET /api/v1/merchants/:merchantId/branches`
- **Auth:** JWT (MERCHANT_ADMIN, MERCHANT_STAFF, ADMIN)
- **Guard:** MerchantOwnershipGuard
- **Response Schema:**
```typescript
[
  {
    id: string
    merchantId: string
    name: string
    address: string
    phone: string
    city: string
    lat: number
    lng: number
    isActive: boolean
    createdAt: string
  }
]
```

#### 2.2 Create Branch
- **Endpoint:** `POST /api/v1/merchants/:merchantId/branches`
- **Auth:** JWT (MERCHANT_ADMIN, ADMIN)
- **Guard:** MerchantOwnershipGuard
- **Request DTO:**
```typescript
{
  name: string          // Required
  address: string       // Required
  city: string          // Required
  lat: number           // Required (decimal)
  lng: number           // Required (decimal)
  phone: string         // Required
}
```

#### 2.3 Update Branch
- **Endpoint:** `PUT /api/v1/merchants/branches/:branchId`
- **Auth:** JWT (MERCHANT_ADMIN, ADMIN)
- **Guard:** MerchantOwnershipGuard
- **Request DTO:**
```typescript
{
  name?: string
  address?: string
  city?: string
  lat?: number
  lng?: number
  phone?: string
}
```

#### 2.4 Delete Branch
- **Endpoint:** `DELETE /api/v1/merchants/branches/:branchId`
- **Auth:** JWT (MERCHANT_ADMIN, ADMIN)
- **Guard:** MerchantOwnershipGuard
- **Response:** 204 No Content

## Requirements

From ROADMAP.md:
- [BRANCH-01] Branch listing with search/filtering
- [BRANCH-02] Branch creation with contact details, opening hours, GPS coordinates
- [BRANCH-03] Branch editing, status toggle, geofence radius configuration
- [BRANCH-04] Operating hours schedule builder
- [BRANCH-05] Geolocation picker / coordinate validator
- [INFRA-03] DataTable component with server-side pagination

## Design Decisions

### Data Model
- Branch entity includes: id, merchantId, name, address, city, phone, lat, lng, isActive, createdAt
- Operating hours: JSON field with day-of-week schedule (Mon-Sun, open/close times)
- Geofence radius: number field in meters (default: 500m)

### UI Components
- **Branch List Page:** DataTable with columns (Name, City, Phone, Status, Actions)
- **Branch Form:** Modal or separate page with form fields
- **Operating Hours Builder:** Time picker for each day, copy-to-all feature
- **Geolocation Picker:** Map integration with click-to-set coordinates, manual input fallback

### Technical Approach
- Use existing DataTable component from Phase 1
- API client follows standardized envelope pattern
- Form validation using Zod schemas
- Mock fallbacks for API unavailability

## Success Criteria

1. Merchant can view all branches in a searchable, paginated DataTable with active/inactive indicators
2. Merchant can add a new branch with contact details, opening hours schedule, and GPS lat/lng coordinates
3. Merchant can edit branch info, toggle branch status (active/paused), and configure geofence radius

## Constraints

- Currency: NPR (Nepali Rupee)
- Authentication: Merchant Admin only
- Tech stack: Next.js 16 App Router, React 19, TanStack Table v9, Base UI, Tailwind v4
- API: NestJS backend with standardized response envelope
