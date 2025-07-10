import { QueryClient } from '@tanstack/react-query';
import { focusManager } from '@tanstack/react-query';
import { AppState, Platform } from 'react-native';

// Set up React Query focus manager for React Native
function onAppStateChange(status: string) {
  // React Query already supports in web browser refetch on window focus by default
  if (Platform.OS !== 'web') {
    focusManager.setFocused(status === 'active');
  }
}

// Create a query client with sensible defaults for React Native
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes by default
      staleTime: 5 * 60 * 1000,
      // Keep data in cache for 10 minutes even when not in use
      gcTime: 10 * 60 * 1000,
      // Retry failed requests 3 times
      retry: 3,
      // Refetch on window focus (when navigating back to screen)
      refetchOnWindowFocus: true,
      // Refetch on reconnect
      refetchOnReconnect: true,
      // Don't refetch on mount if data is fresh
      refetchOnMount: false,
    },
    mutations: {
      // Retry failed mutations 1 time
      retry: 1,
    },
  },
});

// Set up focus manager for React Native
AppState.addEventListener('change', onAppStateChange);
