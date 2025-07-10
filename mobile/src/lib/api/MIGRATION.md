# Migration Guide: Old useApiRequest → React Query

This guide shows how to migrate from the old `useApiRequest` hook to the new React Query-powered hooks.

## Quick Migration Reference

| Old Pattern                                                        | New Pattern                                         |
| ------------------------------------------------------------------ | --------------------------------------------------- |
| `useApiRequest('/api/data')` + `api.fetch()`                       | `useApiQuery('/api/data')`                          |
| `useApiRequest('/api/create', { method: 'POST' })` + `api.fetch()` | `useApiMutation('/api/create', { method: 'POST' })` |

## GET Requests (Data Fetching)

### ❌ Old Way

```tsx
function MyComponent() {
  const api = useApiRequest<UserResponse>('/api/user');

  useFocusEffect(
    useCallback(() => {
      if (!api.data && !api.isLoading && !api.error) {
        api.fetch();
      }
    }, [api])
  );

  if (api.isLoading) return <ActivityIndicator />;
  if (api.error) return <Text>Error: {api.error}</Text>;
  return <Text>Hello {api.data?.user?.name}</Text>;
}
```

### ✅ New Way

```tsx
function MyComponent() {
  const { data, isLoading, error } = useApiQuery<UserResponse>('/api/user');

  if (isLoading) return <ActivityIndicator />;
  if (error) return <Text>Error: {error}</Text>;
  return <Text>Hello {data?.user?.name}</Text>;
}
```

**Benefits of the new way:**

- Automatic caching and refetching
- No need for manual `useFocusEffect`
- Cleaner, more declarative code
- One-liner API call

## POST/PUT/DELETE Requests (Mutations)

### ❌ Old Way

```tsx
function MyComponent() {
  const api = useApiRequest<CreateUserResponse>('/api/user', { method: 'POST' });

  const handleCreate = async () => {
    try {
      const result = await api.fetch({
        body: { name: 'John', email: 'john@example.com' },
      });
      // Handle success
    } catch (error) {
      // Error already shown via toast
    }
  };

  return <Button title="Create User" onPress={handleCreate} disabled={api.isLoading} />;
}
```

### ✅ New Way

```tsx
function MyComponent() {
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

**Benefits of the new way:**

- Simpler mutation calls
- Built-in loading states
- Automatic error handling
- No need for try/catch blocks

## Complex Workflows

### ❌ Old Way (Multiple Sequential Requests)

```tsx
function ProjectFlow() {
  const createApi = useApiRequest<CreateProjectResponse>('/api/create-project', { method: 'POST' });
  const uploadApi = useApiRequest<UploadResponse>('/api/upload', { method: 'POST' });
  const [project, setProject] = useState(null);

  const handleFlow = async () => {
    try {
      const projectResult = await createApi.fetch({
        body: { name: 'New Project' },
      });
      setProject(projectResult.project);

      const uploadResult = await uploadApi.fetch({
        body: { projectId: projectResult.project.id, image: imageData },
      });
      // Handle success
    } catch (error) {
      // Handle error
    }
  };

  return (
    <Button
      title="Start Flow"
      onPress={handleFlow}
      disabled={createApi.isLoading || uploadApi.isLoading}
    />
  );
}
```

### ✅ New Way (Modern React Query Pattern)

```tsx
function ProjectFlow() {
  const createProject = useApiMutation<CreateProjectResponse>('/api/create-project', {
    method: 'POST',
  });
  const uploadImage = useApiMutation<UploadResponse>('/api/upload', { method: 'POST' });

  const handleFlow = async () => {
    const project = await createProject.mutateAsync({ name: 'New Project' });
    await uploadImage.mutateAsync({
      projectId: project.project.id,
      image: imageData,
    });
  };

  return (
    <Button
      title="Start Flow"
      onPress={handleFlow}
      disabled={createProject.isLoading || uploadImage.isLoading}
    />
  );
}
```

**Benefits of the new way:**

- Cleaner async/await pattern
- Better error handling
- Automatic loading states
- More predictable state management

## Conditional Fetching

### ❌ Old Way

```tsx
function UserProfile({ userId }: { userId?: string }) {
  const api = useApiRequest<UserResponse>(`/api/user/${userId}`);

  useEffect(() => {
    if (userId) {
      api.fetch();
    }
  }, [userId, api.fetch]);

  if (!userId) return null;
  if (api.isLoading) return <ActivityIndicator />;
  return <UserDisplay user={api.data?.user} />;
}
```

### ✅ New Way

```tsx
function UserProfile({ userId }: { userId?: string }) {
  const { data, isLoading } = useApiQuery<UserResponse>(`/api/user/${userId}`, {
    enabled: !!userId,
    queryKey: ['user', userId],
  });

  if (!userId) return null;
  if (isLoading) return <ActivityIndicator />;
  return <UserDisplay user={data?.user} />;
}
```

**Benefits of the new way:**

- Declarative conditional fetching
- Automatic query key management
- No manual useEffect needed

## Focus Refetching

### ❌ Old Way

```tsx
function ScreenComponent() {
  const api = useApiRequest<DataResponse>('/api/data');

  useFocusEffect(
    useCallback(() => {
      api.fetch();
      return () => {
        api.cancel();
      };
    }, [api.fetch, api.cancel])
  );

  return <DataDisplay data={api.data} />;
}
```

### ✅ New Way

```tsx
function ScreenComponent() {
  const { data } = useApiQuery<DataResponse>('/api/data');

  // Optional: Add this for explicit focus refetching
  useFocusRefetch();

  return <DataDisplay data={data} />;
}
```

**Benefits of the new way:**

- Automatic focus refetching (built-in)
- No manual cancellation needed
- Simpler component logic

## Summary

The migration provides these key improvements:

1. **Less Boilerplate**: Fewer lines of code for the same functionality
2. **Better Performance**: Intelligent caching and request deduplication
3. **Automatic Behaviors**: Focus refetching, error handling, loading states
4. **Type Safety**: Better TypeScript integration
5. **Declarative**: More React-like patterns with less imperative code

The new hooks are designed to be as simple as possible while providing powerful features when needed.
