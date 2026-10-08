# Phase 4: Branch Management & Geofencing - Research

## Geolocation Options

### Browser Geolocation API
- **Pros**: Native browser API, no external dependencies, free
- **Cons**: Limited accuracy, requires user permission, no map visualization
- **Use Case**: Simple coordinate capture for geofence center point
- **Implementation**: `navigator.geolocation.getCurrentPosition()`

### Leaflet (OpenStreetMap)
- **Pros**: Free, open-source, lightweight, no API key required
- **Cons**: Less polished than Google Maps, limited street view
- **Use Case**: Map visualization with marker placement and geofence circle
- **Implementation**: `react-leaflet` or `leaflet` directly
- **Package**: `leaflet`, `react-leaflet`

### Google Maps
- **Pros**: Best maps, rich features, good documentation
- **Cons**: Requires API key, billing setup, costs for high usage
- **Use Case**: Production-grade map with geofence visualization
- **Implementation**: `@googlemaps/js-api-loader`, `@react-google-maps/api`
- **Package**: `@react-google-maps/api`

**Recommendation**: Start with browser Geolocation API for coordinate capture. Add Leaflet for map visualization if needed. Avoid Google Maps unless required for production.

## Operating Hours UI Patterns

### Weekly Schedule Grid
- **Pattern**: 7-day grid with time inputs for each day
- **Pros**: Visual, easy to understand, shows full week at once
- **Cons**: Can be cluttered on mobile, requires scrolling
- **Example**: Restaurant hours table with rows for each day

### Individual Day Selectors
- **Pattern**: Accordion or tabs for each day with time inputs
- **Pros**: Cleaner on mobile, focused on one day at a time
- **Cons**: Requires clicking to see each day, less overview
- **Example**: Day-by-day settings panel

### Copy Hours Feature
- **Pattern**: "Same as Monday" checkbox for other days
- **Pros**: Reduces data entry for consistent hours
- **Cons**: Adds complexity to UI logic
- **Example**: Restaurant with same hours Mon-Fri

**Recommendation**: Weekly schedule grid with "Copy to all" button for common hours. Mark closed days with a toggle.

## Geofence Visualization

### Numeric Input Only
- **Pattern**: Simple number input for radius in meters
- **Pros**: Simple, no map dependency
- **Cons**: No visual feedback, hard to understand coverage
- **Use Case**: MVP, simple geofencing

### Circle on Map
- **Pattern**: Map with center marker and radius circle
- **Pros**: Visual feedback, intuitive, shows actual coverage
- **Cons**: Requires map component, more complex
- **Use Case**: Production, accurate geofencing

### Distance Calculator
- **Pattern**: Input address, calculate distance from center
- **Pros**: User-friendly, no coordinates needed
- **Cons**: Requires geocoding API, more complex
- **Use Case**: User-friendly branch creation

**Recommendation**: Start with numeric input for MVP. Add Leaflet map visualization for production.

## DataTable Component Options

### Build Custom Table
- **Pros**: Full control, tailored to needs
- **Cons**: More development time, maintenance burden
- **Use Case**: Complex custom requirements

### Extend shadcn Table
- **Pros**: Consistent with design system, less code
- **Cons**: Limited customization, may need workarounds
- **Use Case**: Standard CRUD operations

### Third-party Library
- **Pros**: Feature-rich, battle-tested
- **Cons**: External dependency, learning curve
- **Examples**: TanStack Table, MUI DataGrid
- **Use Case**: Complex filtering, sorting, virtualization

**Recommendation**: Extend shadcn Table component with custom pagination, search, and filter logic. Use TanStack Table core if complexity grows.

## Form Validation

### React Hook Form + Zod
- **Pros**: Type-safe, minimal re-renders, good performance
- **Cons**: Learning curve for Zod schemas
- **Use Case**: Complex forms with validation
- **Implementation**: `react-hook-form`, `@hookform/resolvers`, `zod`

### shadcn Form Component
- **Pros**: Integrated with shadcn design system
- **Cons**: Less flexible, requires React Hook Form anyway
- **Use Case**: Simple forms with shadcn components

### Native HTML Validation
- **Pros**: No dependencies, browser-native
- **Cons**: Limited features, inconsistent across browsers
- **Use Case**: Simple forms, MVP

**Recommendation**: React Hook Form + Zod for type-safe validation. Use shadcn Form components for UI.

## Implementation Sequence

### Plan 04-01: Branch API Client & Listing Table
1. Create Zustand store for branch state management
2. Build DataTable component with pagination, search, filters
3. Implement branch listing page with table
4. Add status badges and action buttons
5. Connect to existing branch API

### Plan 04-02: Branch Creation Modal
1. Create branch creation form with React Hook Form + Zod
2. Implement operating hours schedule builder
3. Add geolocation coordinate capture
4. Create modal/dialog component
5. Connect to createBranch API

### Plan 04-03: Branch Editing & Geofence
1. Create branch edit form (reuse creation form)
2. Implement geofence radius configuration
3. Add branch status toggle
4. Create branch delete confirmation
5. Connect to updateBranch/deleteBranch APIs

## Performance Considerations

### DataTable Performance
- Use virtualization for large datasets (TanStack Table)
- Implement server-side pagination for scalability
- Debounce search inputs to reduce API calls
- Cache branch data in Zustand store with persistence

### Map Performance
- Lazy load map components (code splitting)
- Use marker clustering for many branches
- Debounce map interactions
- Cache map tiles

### Form Performance
- Use React Hook Form to minimize re-renders
- Validate on submit or blur, not on every keystroke
- Use memo for expensive form components

## Testing Strategy

### Unit Tests
- Test branch store actions and selectors
- Test form validation schemas
- Test API client functions
- Test utility functions (geofence calculations, time parsing)

### Integration Tests
- Test branch CRUD flow end-to-end
- Test form submission with API
- Test error handling and loading states
- Test permission checks (merchant can only edit their branches)

### Manual Tests
- Test branch creation with valid data
- Test branch creation with invalid data (validation errors)
- Test branch editing and status toggle
- Test branch deletion with confirmation
- Test search and filter functionality
- Test pagination
- Test geolocation capture
- Test operating hours schedule builder

## Security Considerations

### Input Validation
- Validate all user inputs with Zod schemas
- Sanitize coordinates to prevent injection
- Validate geofence radius ranges (min: 10m, max: 5000m)
- Validate time formats (HH:MM)

### Authorization
- Ensure merchants can only access their own branches
- Validate merchantId in API calls
- Check permissions for branch operations

### Data Privacy
- Don't store unnecessary location data
- Allow users to delete branch data
- Comply with location data regulations

## API Contract Verification

### Branch API Endpoints
- `GET /api/v1/merchants/:merchantId/branches` - List branches
- `POST /api/v1/merchants/:merchantId/branches` - Create branch
- `PUT /api/v1/merchants/branches/:branchId` - Update branch
- `DELETE /api/v1/merchants/branches/:branchId` - Delete branch

### Branch DTO Structure
```typescript
{
  id: string
  merchantId: string
  name: string
  address: string
  city: string
  phone: string
  lat: number
  lng: number
  isActive: boolean
  createdAt: string
  operatingHours?: Record<string, { open: string; close: string; closed?: boolean }>
  geofenceRadius?: number
}
```

### Create Branch DTO Structure
```typescript
{
  name: string
  address: string
  city: string
  lat: number
  lng: number
  phone: string
  operatingHours?: Record<string, { open: string; close: string; closed?: boolean }>
  geofenceRadius?: number
}
```

### Update Branch DTO Structure
```typescript
{
  name?: string
  address?: string
  city?: string
  lat?: number
  lng?: number
  phone?: string
  isActive?: boolean
  operatingHours?: Record<string, { open: string; close: string; closed?: boolean }>
  geofenceRadius?: number
}
```

## Known Backend Limitations

- No bulk branch operations (create/update multiple at once)
- No branch analytics or metrics
- No branch-specific offer targeting (mentioned in Phase 5)
- No branch import/export functionality

## Frontend-Backend Sync

### Coordinate Format
- Backend expects: `lat: number, lng: number` (decimal degrees)
- Frontend geolocation returns: same format
- No conversion needed

### Operating Hours Format
- Backend expects: `Record<string, { open: string; close: string; closed?: boolean }>`
- Keys: 'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'
- Time format: 'HH:MM' (24-hour)
- Frontend must match this format

### Geofence Radius
- Backend expects: number (meters)
- Frontend should validate: min 10m, max 5000m
- Display in meters or km based on user preference
