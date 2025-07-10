# API Utilities (React Query Powered)

The API utilities use [TanStack React Query](https://tanstack.com/query/v4/docs/framework/react/overview) for intelligent caching, automatic refetching, and React Native optimization.

## Quick Start - One-Liner API Calls

### Simple GET Request (Auto-caching & Refetching)

```tsx
import { useApiQuery } from '@/src/lib/api/useApiRequest';

function MyComponent() {
  // One-liner: automatic caching, refetching, and loading states
  const { data, isLoading, error } = useApiQuery<UserResponse>('/api/user');

  if (isLoading) return <ActivityIndicator />;
  if (error) return <Text>Error: {error}</Text>;
  return <Text>Hello {data?.user?.name}</Text>;
}
```

### Simple POST/PUT/DELETE (Mutations)

```tsx
import { useApiMutation } from '@/src/lib/api/useApiRequest';

function MyComponent() {
  // One-liner: automatic error handling and loading states
  const createUser = useApiMutation<CreateUserResponse>('/api/user', { method: 'POST' });

  return (
    <Button
      title="Create User"
      onPress={() => createUser.mutate({ name: 'John', email: 'john@example.com' })}
      disabled={createUser.isLoading}
    />
  );
}
```

## Main Hooks

### `useApiQuery` - For GET Requests

Perfect for fetching data with automatic caching and refetching.

```tsx
const { data, isLoading, error, refetch } = useApiQuery<ResponseType>('/api/endpoint', {
  enabled: true, // Auto-fetch on mount (default: true)
  refetchOnFocus: true, // Refetch when navigating back (default: true)
  staleTime: 5 * 60 * 1000, // Data fresh for 5 minutes (default)
  gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes (default)
});
```

**Common Patterns:**

```tsx
// Auto-fetch user data when component mounts
const { data: user } = useApiQuery<UserResponse>('/api/user');

// Conditional query - only fetch when userId exists
const { data: userDetails } = useApiQuery<UserDetailsResponse>(`/api/user/${userId}`, {
  enabled: !!userId,
});

// Fresh data every 30 seconds for real-time features
const { data: notifications } = useApiQuery<NotificationsResponse>('/api/notifications', {
  staleTime: 30 * 1000,
  refetchInterval: 30 * 1000,
});
```

### `useApiMutation` - For POST/PUT/DELETE

Perfect for creating, updating, or deleting data.

```tsx
const mutation = useApiMutation<ResponseType>('/api/endpoint', {
  method: 'POST',
  showErrorToast: true, // Auto-show error toasts (default: true)
});

// Use it
mutation.mutate({ name: 'New Item' });
// Or with async/await
const result = await mutation.mutateAsync({ name: 'New Item' });
```

**Common Patterns:**

```tsx
// Create data with automatic cache invalidation
const createProject = useApiMutation<CreateProjectResponse>('/api/projects', {
  method: 'POST',
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
  },
});

// Update with optimistic updates
const updateUser = useApiMutation<UpdateUserResponse>('/api/user', {
  method: 'PUT',
  onMutate: async newUser => {
    // Cancel ongoing queries
    await queryClient.cancelQueries({ queryKey: ['/api/user'] });

    // Snapshot current value
    const previousUser = queryClient.getQueryData(['/api/user']);

    // Optimistically update
    queryClient.setQueryData(['/api/user'], newUser);

    return { previousUser };
  },
  onError: (err, newUser, context) => {
    // Rollback on error
    queryClient.setQueryData(['/api/user'], context?.previousUser);
  },
});

// Delete with cache removal
const deleteProject = useApiMutation<DeleteProjectResponse>('/api/projects', {
  method: 'DELETE',
  onSuccess: (data, variables) => {
    queryClient.removeQueries({ queryKey: ['/api/projects', variables.id] });
    queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
  },
});
```

## React Navigation Integration

Automatically refetch data when navigating back to screens:

```tsx
import { useFocusRefetch } from '@/src/lib/api/useApiRequest';

function ScreenComponent() {
  const { data } = useApiQuery<DataType>('/api/data');

  // Automatically refetches all active queries when screen comes into focus
  useFocusRefetch();

  return <DataDisplay data={data} />;
}
```

For specific queries only:

```tsx
import { useFocusRefetchQueries } from '@/src/lib/api/useApiRequest';

function ScreenComponent() {
  useFocusRefetchQueries(['/api/user', '/api/projects']); // Only refetch these
}
```

## Advanced Features

### Custom Query Keys for Better Caching

```tsx
// Basic key
const { data } = useApiQuery('/api/user', {
  queryKey: ['user'], // Simple key
});

// Parameterized key
const { data } = useApiQuery(`/api/user/${userId}`, {
  queryKey: ['user', userId], // Unique per user
});

// Complex key with filters
const { data } = useApiQuery('/api/projects', {
  queryKey: ['projects', { status: 'active', limit: 10 }],
});
```

### Conditional Queries

```tsx
// Only run when condition is met
const { data } = useApiQuery('/api/user-profile', {
  enabled: !!userId && isAuthenticated,
});

// Dependent queries
const { data: user } = useApiQuery('/api/user');
const { data: projects } = useApiQuery('/api/projects', {
  enabled: !!user?.id,
  queryKey: ['projects', user?.id],
});
```

### Custom Cache and Refetch Behavior

```tsx
// Real-time data
const { data } = useApiQuery('/api/live-feed', {
  staleTime: 0, // Always considered stale
  refetchInterval: 5000, // Refetch every 5 seconds
});

// Static data
const { data } = useApiQuery('/api/app-config', {
  staleTime: Infinity, // Never goes stale
  gcTime: Infinity, // Never removed from cache
});

// Background sync
const { data } = useApiQuery('/api/user-preferences', {
  staleTime: 10 * 60 * 1000, // Fresh for 10 minutes
  refetchOnMount: false, // Don't refetch on mount
  refetchOnWindowFocus: true, // But refetch on focus
});
```

### Query Invalidation and Updates

```tsx
import { useQueryClient } from '@tanstack/react-query';

function MyComponent() {
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    // Invalidate specific queries
    queryClient.invalidateQueries({ queryKey: ['/api/projects'] });

    // Invalidate all queries matching pattern
    queryClient.invalidateQueries({ queryKey: ['projects'] });

    // Refetch specific query immediately
    queryClient.refetchQueries({ queryKey: ['/api/user'] });
  };

  const handleUpdate = newData => {
    // Update cache directly
    queryClient.setQueryData(['/api/user'], newData);
  };
}
```

## Error Handling

```tsx
// Automatic error toasts (default behavior)
const { data, error } = useApiQuery('/api/data');

// Custom error handling
const { data, error } = useApiQuery('/api/data', {
  showErrorToast: false, // Disable automatic toasts
  customErrorMessage: 'Failed to load data',
});

// Manual error handling
const { data, error, isError } = useApiQuery('/api/data');

if (isError) {
  return <ErrorComponent message={error} />;
}
```

## Loading States

```tsx
function MyComponent() {
  const { data, isLoading, isFetching } = useApiQuery('/api/data');
  const mutation = useApiMutation('/api/create', { method: 'POST' });

  return (
    <View>
      {/* Initial loading */}
      {isLoading && <Text>Loading initial data...</Text>}

      {/* Background refetching */}
      {isFetching && !isLoading && <Text>Updating...</Text>}

      {/* Mutation loading */}
      {mutation.isLoading && <Text>Saving...</Text>}

      <Button
        title="Create Item"
        onPress={() => mutation.mutate({ name: 'New Item' })}
        disabled={mutation.isLoading}
      />
    </View>
  );
}
```

## Benefits of React Query Integration

✅ **Automatic Caching** - Data is cached and reused across components  
✅ **Smart Refetching** - Automatically refetches when data becomes stale  
✅ **Background Updates** - Updates data in background when window regains focus  
✅ **Request Deduplication** - Multiple components requesting same data = single request  
✅ **Optimistic Updates** - UI updates immediately, syncs with server later  
✅ **Error Boundaries** - Better error handling and recovery  
✅ **DevTools** - Powerful debugging with React Query DevTools  
✅ **Offline Support** - Works offline and syncs when connection restored

## Performance Tips

1. **Use appropriate query keys** - More specific keys = better cache control
2. **Set proper staleTime** - Longer for static data, shorter for dynamic data
3. **Use enabled conditionally** - Prevent unnecessary requests
4. **Implement optimistic updates** - Better perceived performance
5. **Invalidate wisely** - Only invalidate what actually changed

The API is designed to be simple for basic use cases while providing powerful features for advanced scenarios!
