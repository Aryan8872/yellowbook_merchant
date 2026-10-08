# Phase 3 Research: Branch Management & Geofencing

## Domain Analysis

### Branch Entity Structure
Based on API documentation, the branch entity requires:
- **Core fields:** id, merchantId, name, address, city, phone
- **Location fields:** lat (decimal), lng (decimal)
- **Status field:** isActive (boolean)
- **Metadata:** createdAt (timestamp)

### Operating Hours Data Model
The API doesn't explicitly specify an operating hours field, but the ROADMAP mentions "operating hours schedule builder." Common patterns:
- JSON field with day-of-week keys: `{ "monday": { "open": "09:00", "close": "22:00" }, ... }`
- Or array of schedule objects: `[{ day: 0, open: "09:00", close: "22:00" }, ...]`
- Recommendation: Use day-of-week object structure for easier lookup and validation

### Geofence Radius
Not in current API schema but required by ROADMAP. Options:
- Add as optional field in UpdateBranchDto
- Store as number (meters)
- Default: 500m (typical for retail geofencing)

## Technical Approach

### API Client Layer
Following Phase 1 pattern:
- Create `lib/api/branches.ts` with branch-specific API functions
- Use standardized envelope wrapper from `lib/api/client.ts`
- Implement mock fallbacks for development
- Functions: `getBranches()`, `createBranch()`, `updateBranch()`, `deleteBranch()`

### Data Models
- TypeScript interfaces for Branch, CreateBranchDto, UpdateBranchDto
- Zod schemas for form validation
- Operating hours type definition

### UI Components

#### Branch List Page (`app/(merchant)/merchant/branches/page.tsx`)
- Use existing DataTable component from Phase 1
- Columns: Name, City, Phone, Status (badge), Actions (edit/delete buttons)
- Server-side pagination via API
- Search/filter by name or city
- Active/inactive status toggle

#### Branch Form (Modal or Page)
- Form fields: name, address, city, phone, lat, lng
- Operating hours builder: 7 day rows with time pickers
- Geofence radius input (number field with unit)
- Validation: required fields, coordinate ranges (-90 to 90 for lat, -180 to 180 for lng)
- Submit to API with loading states

#### Operating Hours Builder
- Component with 7 rows (Monday-Sunday)
- Each row: day label, open time picker, close time picker, closed toggle
- "Copy to all days" button for convenience
- Time format: HH:MM (24-hour)

#### Geolocation Picker
- Map integration options:
  - Leaflet (lightweight, no API key required)
  - Google Maps (requires API key, better UX)
  - OpenStreetMap (free, good fallback)
- Recommendation: Start with manual coordinate input + Leaflet for visual confirmation
- Features: click map to set coordinates, search by address, manual lat/lng input
- Validation: coordinate ranges, display current location

### State Management
- Use Zustand store for branch list (similar to profile store from Phase 2)
- Store: `useBranchStore` with actions: fetchBranches, createBranch, updateBranch, deleteBranch
- Persist to localStorage for offline resilience

### Routing
- List page: `/merchant/branches`
- Create: Modal on list page or `/merchant/branches/new`
- Edit: Modal on list page or `/merchant/branches/[id]/edit`
- Recommendation: Use modals for create/edit to maintain context

## Dependencies & Integration Points

### Phase 1 Integration
- API client wrapper from `lib/api/client.ts`
- Auth guards from middleware
- DataTable component from components

### Phase 2 Integration
- Merchant context from profile store
- Similar form patterns from settings page

### External Libraries
- **Leaflet** for map: `npm install leaflet react-leaflet`
- **Date-fns** for time validation: already in project
- **Zod** for validation: already in project

## Implementation Considerations

### Mock Data Strategy
- Create mock branch data in `lib/api/mocks/branches.ts`
- Fallback to mock when API returns 404/500/offline
- Mock should include diverse cities, active/inactive statuses

### Error Handling
- API errors: display toast notifications
- Validation errors: inline form errors
- Network errors: retry with exponential backoff

### Accessibility
- Keyboard navigation for DataTable
- ARIA labels for form fields
- Screen reader support for map interactions

### Performance
- Lazy load map component (only when needed)
- Debounce search input
- Virtual scrolling for large branch lists (if needed)

## Security Considerations

- Merchant ownership guard enforced by API
- Coordinate validation to prevent invalid locations
- Rate limiting for branch creation (API-side)
- CSRF protection on forms (Next.js default)

## Testing Strategy

### Unit Tests
- API client functions with mock responses
- Zod schema validation
- Operating hours builder logic

### Integration Tests
- Branch CRUD flow end-to-end
- Form submission with valid/invalid data
- Map coordinate setting

### Manual Testing
- Create branch with all fields
- Edit branch with partial updates
- Toggle branch status
- Delete branch with confirmation
- Search/filter functionality
- Operating hours copy-to-all
- Map coordinate picker

## Open Questions

1. **Operating hours storage:** Should this be in the branch entity or a separate table? (Assume branch entity for MVP)
2. **Geofence radius:** Is this required or optional? (Assume optional with default)
3. **Map provider:** Leaflet vs Google Maps? (Start with Leaflet, upgrade later if needed)
4. **Branch deletion:** Should we allow deletion or just deactivate? (API supports deletion, implement with confirmation)
