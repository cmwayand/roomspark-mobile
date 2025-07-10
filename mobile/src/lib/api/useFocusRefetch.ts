import { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Hook that refetches all queries when the screen comes into focus
 * This ensures data is fresh when navigating back to a screen
 */
export function useFocusRefetch() {
  const queryClient = useQueryClient();

  useFocusEffect(
    useCallback(() => {
      // Refetch all active queries when screen comes into focus
      queryClient.refetchQueries({ type: 'active' });
    }, [queryClient])
  );
}

/**
 * Hook that refetches specific queries when the screen comes into focus
 * @param queryKeys Array of query keys to refetch
 */
export function useFocusRefetchQueries(queryKeys: (string | string[])[]) {
  const queryClient = useQueryClient();

  useFocusEffect(
    useCallback(() => {
      // Refetch specific queries when screen comes into focus
      queryKeys.forEach(queryKey => {
        queryClient.refetchQueries({ queryKey: Array.isArray(queryKey) ? queryKey : [queryKey] });
      });
    }, [queryClient, queryKeys])
  );
}
