# Phase 4: Branch Management & Geofencing - Context

## Phase Goal
Provide full CRUD control over physical merchant venues, GPS coordinates, operating schedules, and geofence radius limits.

## Current State

### Existing Branch Infrastructure
- **Branch Types**: `lib/types/branch.ts` defines `Branch`, `CreateBranchDto`, `UpdateBranchDto` interfaces
- **Branch API**: `lib/api/branches.ts` provides `getBranches`, `createBranch`, `updateBranch`, `deleteBranch` functions
- **Branch Mocks**: `lib/api/mocks/branch.mock.ts` exists with mock branch data
- **Branch Store**: No Zustand store exists yet for branch state management

### Existing UI Components
- **Dashboard**: Merchant dashboard exists at `app/(merchant)/merchant/dashboard/page.tsx`
- **Stat Cards**: `components/merchant/dashboardStatHeader.tsx` displays stats
- **Graph Components**: `components/merchant/offer/activeDayGraph`, `profitGraph` exist
- **Offer Table**: `components/merchant/offer/offerTable/page` exists (commented out in dashboard)

### Dependencies
- **Phase 1 Complete**: API client, authentication, and route protection are in place
- **Auth Store**: `lib/auth/auth-store.ts` provides `merchantId` for API calls
- **API Client**: `lib/api/client.ts` handles requests with token authentication

## Requirements Scope

### BRANCH-01: Branch Listing
- View all branches in searchable, paginated DataTable
- Display active/inactive status indicators
- Support filtering by city, status, and search by name

### BRANCH-02: Branch Creation
- Add new branch with contact details
- Configure opening hours schedule
- Capture GPS lat/lng coordinates
- Set geofence radius

### BRANCH-03: Branch Editing
- Edit branch information
- Toggle branch status (active/paused)
- Configure geofence radius
- Update operating hours

### BRANCH-04: Operating Hours
- Interactive schedule builder for weekly hours
- Support different hours per day
- Mark closed days

### BRANCH-05: Geofencing
- GPS coordinate picker/validator
- Geofence radius configuration
- Visual feedback for geofence coverage

### INFRA-03: Data Tables
- Reusable DataTable component with pagination
- Search and filter capabilities
- Sort functionality

## Dependencies

### External Dependencies
- **shadcn/ui Components**: Table, Dialog, Form, Input, Select, Switch, Button, Badge
- **Lucide Icons**: MapPin, Clock, Edit, Trash, Plus, Search, Filter
- **React Hook Form**: Form validation and state management
- **Zod**: Schema validation

### Internal Dependencies
- `lib/api/branches.ts` - Branch API functions
- `lib/types/branch.ts` - Branch type definitions
- `lib/auth/auth-store.ts` - Merchant authentication state
- `lib/api/client.ts` - API request client

## Constraints

### Technical Constraints
- Must use existing API client pattern
- Must integrate with existing auth middleware
- Must maintain TypeScript type safety
- Must follow existing component structure

### Business Constraints
- Geofence radius must be validated (min/max limits)
- Operating hours must be valid time ranges
- GPS coordinates must be valid lat/lng ranges
- Branch status changes must be confirmed

## Success Criteria

1. Merchant can view all branches in a searchable, paginated DataTable with active/inactive indicators
2. Merchant can add a new branch with contact details, opening hours schedule, and GPS lat/lng coordinates
3. Merchant can edit branch info, toggle branch status (active/paused), and configure geofence radius

## Technical Decisions Needed

1. **Geolocation Picker**: Use browser Geolocation API or integrate with a map component (Leaflet/Google Maps)?
2. **Operating Hours UI**: Use a weekly schedule grid or individual day selectors?
3. **Geofence Visualization**: Display geofence radius on a map or just numeric input?
4. **DataTable Component**: Build custom or extend shadcn Table component?

## Known Issues

- No existing branch management UI
- No branch state management store
- No geofence visualization component
- No operating hours schedule builder

## Integration Points

- **API**: `lib/api/branches.ts` functions
- **Auth**: `lib/auth/auth-store.ts` for merchantId
- **Types**: `lib/types/branch.ts` for type definitions
- **Navigation**: Merchant dashboard sidebar
- **Mock Data**: `lib/api/mocks/branch.mock.ts` for development

## Risk Areas

1. **Geolocation Accuracy**: Browser geolocation may not be precise enough for geofencing
2. **Operating Hours Complexity**: Different hours per day adds UI complexity
3. **Geofence Validation**: Need to ensure radius is reasonable and coordinates are valid
4. **Map Integration**: If using maps, need to handle API keys and loading performance
