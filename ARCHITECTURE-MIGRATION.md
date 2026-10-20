# TanStack Query Architecture Migration

This document describes the migration from Zustand-based API state management to TanStack Query for server state, following industry best practices.

## Architecture Overview

### Before (Zustand-based)
- Zustand stores managed both server state (API data) and client state
- Manual caching, invalidation, and loading state management
- Duplicate data fetching logic across stores
- Race conditions and stale data issues

### After (TanStack Query-based)
- **TanStack Query**: Server state (API data, caching, invalidation, mutations)
- **Zustand**: Client state only (UI preferences, workflows, cross-page drafts)
- **React Hook Form**: Form state (validation, dirty tracking, temporary edits)
- **React Component State**: Local UI state (dialog visibility, temporary selections)

## Files Created

### Admin Panel
- `lib/admin/hooks/use-users-query.ts` - TanStack Query hooks for users API
- `lib/admin/hooks/use-merchants-query.ts` - TanStack Query hooks for merchants API

### Merchant Panel
- `lib/merchant/hooks/use-branches-query.ts` - TanStack Query hooks for branches API
- `lib/merchant/hooks/use-offers-query.ts` - TanStack Query hooks for offers API

## Files Modified

### Admin Panel
- `app/(admin)/admin/users/page.tsx` - Migrated from Zustand to TanStack Query
- `app/(admin)/admin/merchants/page.tsx` - Migrated from Zustand to TanStack Query

### Merchant Panel
- `app/(merchant)/merchant/branches/page.tsx` - Migrated from Zustand to TanStack Query
- `app/(merchant)/merchant/offers/page.tsx` - Migrated from Zustand to TanStack Query

## Key Benefits

### 1. Automatic Caching
- TanStack Query automatically caches API responses
- Eliminates duplicate network requests
- Configurable stale time and cache time

### 2. Automatic Invalidation
- Mutations automatically invalidate related queries
- Data stays synchronized across components
- No manual cache management needed

### 3. Loading States
- Built-in `isLoading`, `isFetching`, `isError` states
- Optimistic updates support
- Background refetching

### 4. Error Handling
- Centralized error handling in mutation hooks
- Automatic retry logic
- Error boundary integration

### 5. Type Safety
- Full TypeScript support
- Type-safe query keys
- Type-safe mutation parameters

## Query Key Structure

Query keys are hierarchical and follow a consistent pattern:

```typescript
// Users
['admin', 'users']                    // All users queries
['admin', 'users', 'list']            // List queries
['admin', 'users', 'list', params]    // Specific list with params
['admin', 'users', 'detail']         // Detail queries
['admin', 'users', 'detail', id]      // Specific user detail

// Merchants
['admin', 'merchants']                // All merchants queries
['admin', 'merchants', 'list']        // List queries
['admin', 'merchants', 'detail']     // Detail queries

// Branches (merchant-scoped)
['merchant', merchantId, 'branches']   // All branches queries
['merchant', merchantId, 'branches', 'list']
['merchant', merchantId, 'branches', 'detail']

// Offers (merchant-scoped)
['merchant', merchantId, 'offers']     // All offers queries
['merchant', merchantId, 'offers', 'list']
['merchant', merchantId, 'offers', 'detail']
```

## Usage Examples

### Fetching Data
```typescript
import { useUsers } from '@/lib/admin/hooks/use-users-query';

function UsersPage() {
  const { data: usersData, isLoading, error, refetch } = useUsers({
    search: 'john',
    role: 'ADMIN',
  });

  const users = usersData?.data || [];
  const total = usersData?.pagination?.total || 0;

  if (isLoading) return <Spinner />;
  if (error) return <ErrorFallback onRetry={refetch} />;

  return <UserList users={users} />;
}
```

### Mutations
```typescript
import { useCreateUser, useUpdateUser, useDeleteUser } from '@/lib/admin/hooks/use-users-query';

function UserForm() {
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  const handleCreate = async (data: CreateUserDto) => {
    await createUserMutation.mutateAsync(data);
    // Automatically invalidates users list
  };

  const handleUpdate = async (id: string, data: UpdateUserDto) => {
    await updateUserMutation.mutateAsync({ id, data });
    // Automatically invalidates users list and detail
  };

  const handleDelete = async (id: string) => {
    await deleteUserMutation.mutateAsync(id);
    // Automatically invalidates users list
  };

  return (
    <Button onClick={() => handleCreate(formData)} disabled={createUserMutation.isPending}>
      {createUserMutation.isPending ? 'Creating...' : 'Create User'}
    </Button>
  );
}
```

### Conditional Queries
```typescript
import { useUser } from '@/lib/admin/hooks/use-users-query';

function UserDetail({ userId, dialogOpen }) {
  // Only fetch when dialog is open and userId exists
  const { data: user, isLoading } = useUser(userId, dialogOpen);

  if (!dialogOpen) return null;
  if (isLoading) return <Spinner />;

  return <UserForm user={user} />;
}
```

## Migration Pattern

### Step 1: Create Query Hooks
```typescript
// lib/admin/hooks/use-users-query.ts
export const usersKeys = {
  all: ['admin', 'users'] as const,
  lists: () => [...usersKeys.all, 'list'] as const,
  list: (params) => [...usersKeys.lists(), params] as const,
  // ...
};

export function useUsers(params?, options?) {
  return useQuery({
    queryKey: usersKeys.list(params || {}),
    queryFn: () => getUsers(params),
    ...options,
  });
}
```

### Step 2: Create Mutation Hooks
```typescript
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserDto) => createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      toast.success('User created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create user');
    },
  });
}
```

### Step 3: Refactor Component
```typescript
// Before
const { users, loading, fetchUsers, createUser } = useUsersStore();

useEffect(() => {
  fetchUsers({ search, role });
}, [search, role, fetchUsers]);

// After
const { data: usersData, isLoading, refetch } = useUsers({
  search,
  role,
});
const createUserMutation = useCreateUser();

const users = usersData?.data || [];
```

## Remaining Work

### 1. Update Forms with React Hook Form (Medium Priority)
Forms should use React Hook Form for:
- Validation
- Dirty state tracking
- Form reset
- Better UX

Example pattern:
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['ADMIN', 'USER']),
});

function UserEditDialog({ user, open, onOpenChange }) {
  const form = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      role: user?.role || 'USER',
    },
  });

  const updateUserMutation = useUpdateUser();

  const onSubmit = async (data) => {
    await updateUserMutation.mutateAsync({ id: user.id, data });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Form fields */}
      </form>
    </Dialog>
  );
}
```

### 2. Clean Up Zustand Stores (Medium Priority)
Repurpose Zustand stores for client state only:

**Keep in Zustand:**
- UI preferences (theme, sidebar state)
- Multi-step workflows
- Cross-page drafts
- Shared client-side state

**Remove from Zustand:**
- API data fetching
- API mutations
- Server state caching
- Loading/error states for API calls

Example:
```typescript
// Before: Zustand store with API calls
interface UsersState {
  users: User[];
  loading: boolean;
  fetchUsers: () => Promise<void>;
  createUser: (data) => Promise<void>;
}

// After: Zustand store for UI preferences only
interface UsersUIState {
  selectedView: 'list' | 'grid';
  filters: UsersFilters;
  setSelectedView: (view) => void;
  setFilters: (filters) => void;
}

export const useUsersUIStore = create<UsersUIState>((set) => ({
  selectedView: 'list',
  filters: {},
  setSelectedView: (view) => set({ selectedView: view }),
  setFilters: (filters) => set({ filters }),
}));
```

## Best Practices

### 1. Query Key Design
- Include all variables that affect the query result
- Use hierarchical structure for easy invalidation
- Keep keys serializable (no functions or objects)

### 2. Mutation Design
- Always invalidate related queries on success
- Provide clear error messages
- Use optimistic updates for better UX

### 3. Error Handling
- Centralize error handling in hooks
- Show user-friendly error messages via toast
- Provide retry mechanisms

### 4. Loading States
- Use skeleton loaders for initial load
- Show loading indicators for mutations
- Don't block UI during background refetches

### 5. Form Integration
- Keep form state separate from server state
- Initialize form from query data
- Reset form after successful submission
- Use React Hook Form for complex forms

## Testing

TanStack Query makes testing easier:

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUsers } from '@/lib/admin/hooks/use-users-query';

describe('useUsers', () => {
  it('fetches users successfully', async () => {
    const queryClient = new QueryClient();
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );

    const { result } = renderHook(() => useUsers(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toBeDefined();
  });
});
```

## Performance Considerations

1. **Deduplication**: TanStack Query automatically dedupes identical requests
2. **Background Refetching**: Data stays fresh without blocking UI
3. **Pagination**: Use `keepPreviousData` for smooth pagination
4. **Window Focus Refetch**: Automatically refetch when window regains focus
5. **Cache Time**: Configure appropriate cache times for different data types

## Troubleshooting

### Queries Not Refetching
- Check query key structure
- Verify mutation invalidation
- Ensure `refetchOnWindowFocus` is enabled

### Stale Data
- Adjust `staleTime` configuration
- Use `refetchInterval` for real-time data
- Check mutation success callbacks

### Memory Leaks
- Clean up query client on unmount
- Use `gcTime` to control cache duration
- Avoid infinite query key arrays

## Resources

- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [React Query Best Practices](https://tanstack.com/query/latest/docs/react/guides/query-keys)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [React Hook Form](https://react-hook-form.com/)
