import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-expo';
import { ApiResponse } from '@roomspark/shared';
import { useToast } from '../utils/ToastContext';

type ApiRequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  withAuth?: boolean;
  showErrorToast?: boolean;
  customErrorMessage?: string;
  timeout?: number;
  enabled?: boolean; // Whether the query should auto-execute
  refetchOnFocus?: boolean; // Whether to refetch when navigating back to screen
  staleTime?: number; // How long data is considered fresh (in ms)
  gcTime?: number; // How long data stays in cache (in ms)
};

// Default timeout of 5 seconds
const DEFAULT_TIMEOUT = 5000;

/**
 * Create a fetch function with authentication and error handling
 */
async function createApiFetcher<T extends ApiResponse>(
  endpoint: string,
  options: ApiRequestOptions,
  getToken: () => Promise<string | null>,
  showToast?: (params: { message: string; type: 'error' | 'success' | 'info' }) => void
): Promise<T> {
  const {
    method = 'GET',
    body,
    headers = {},
    withAuth = true,
    showErrorToast = true,
    customErrorMessage,
    timeout = DEFAULT_TIMEOUT,
  } = options;

  // Handle authentication
  const requestHeaders: Record<string, string> = { ...headers };
  if (withAuth) {
    const token = await getToken();
    if (!token) {
      throw new Error('Authentication error: Please sign in again');
    }
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Add content-type for JSON requests
  if (body && !requestHeaders['Content-Type']) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  // Prepare request
  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders,
  };

  if (body) {
    requestOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  // Create abort controller for timeout
  const controller = new AbortController();
  requestOptions.signal = controller.signal;

  // Set up timeout
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);

  try {
    // Make request
    const response = await global.fetch(
      `${process.env.EXPO_PUBLIC_BACKEND_URL}${endpoint}`,
      requestOptions
    );

    // Clear timeout since request completed
    clearTimeout(timeoutId);

    const responseData = await response.json();

    if (!response.ok || responseData.status === 'error') {
      throw new Error(responseData.error || 'Request failed');
    }

    return responseData as T;
  } catch (err: any) {
    clearTimeout(timeoutId);

    // Handle timeout specifically
    if (err.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeout}ms`);
    }

    const errorMessage = err.message || 'An error occurred';

    // Show error toast if enabled and showToast is available
    if (showErrorToast && showToast) {
      showToast({
        message: customErrorMessage || errorMessage,
        type: 'error',
      });
    }

    console.error('API Error:', err);
    throw new Error(errorMessage);
  }
}

/**
 * A hook for making API queries using React Query
 * Provides simple one-liner API calls with automatic caching, refetching, and error handling
 *
 * @param endpoint The API endpoint path (without base URL)
 * @param options Configuration options for the request and query behavior
 * @returns React Query result with data, loading, error state and refetch method
 */
export function useApiQuery<T extends ApiResponse>(
  endpoint: string,
  options: ApiRequestOptions & {
    queryKey?: (string | number)[];
    enabled?: boolean;
  } = {}
) {
  const { getToken } = useAuth();
  const toast = useToast();
  const {
    enabled = true,
    refetchOnFocus = true,
    staleTime = 5 * 60 * 1000, // 5 minutes
    gcTime = 10 * 60 * 1000, // 10 minutes
    queryKey,
    ...requestOptions
  } = options;

  // Create a unique query key
  const finalQueryKey = queryKey || [endpoint, requestOptions];

  const query = useQuery({
    queryKey: finalQueryKey,
    queryFn: () => createApiFetcher<T>(endpoint, requestOptions, getToken, toast?.showToast),
    enabled,
    staleTime,
    gcTime,
    refetchOnWindowFocus: refetchOnFocus,
  });

  return {
    data: query.data || null,
    isLoading: query.isLoading,
    error: query.error?.message || null,
    isError: query.isError,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
}

/**
 * A hook for making API mutations using React Query
 * Perfect for POST, PUT, DELETE operations
 *
 * @param endpoint The API endpoint path (without base URL)
 * @param options Default options for all mutations
 * @returns Mutation object with mutate function and state
 */
export function useApiMutation<T extends ApiResponse, TVariables = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
) {
  const { getToken } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (variables?: TVariables) => {
      const finalOptions = variables ? { ...options, body: variables } : options;
      return createApiFetcher<T>(endpoint, finalOptions, getToken, toast?.showToast);
    },
    onSuccess: data => {
      // Optionally invalidate related queries on success
      // You can customize this behavior by passing onSuccess in options
    },
    onError: error => {
      // Error handling is already done in createApiFetcher
      console.error('Mutation error:', error);
    },
  });

  return {
    data: mutation.data || null,
    isLoading: mutation.isPending,
    error: mutation.error?.message || null,
    isError: mutation.isError,
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    reset: mutation.reset,
  };
}

// Export focus refetch hook for convenience
export { useFocusRefetch, useFocusRefetchQueries } from './useFocusRefetch';
