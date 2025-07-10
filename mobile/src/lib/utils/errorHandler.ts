import { useToast } from './ToastContext';

interface ErrorDetails {
  title?: string;
  details?: string;
}

/**
 * Helper to extract error message from various error objects
 */
export const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === 'object') {
    // Handle Clerk auth errors
    if ('errors' in error && Array.isArray((error as any).errors)) {
      return (error as any).errors[0]?.message || 'An error occurred';
    }

    // Handle API response errors
    if ('error' in error && typeof (error as any).error === 'string') {
      return (error as any).error;
    }
  }

  return 'An unexpected error occurred';
};

/**
 * Hook to handle errors and display toast messages
 */
export const useErrorHandler = () => {
  const toast = useToast();

  /**
   * Handle error and show toast notification
   */
  const handleError = (error: unknown, customMessage?: string) => {
    const errorMessage = customMessage || getErrorMessage(error);

    console.error('Error occurred:', error);

    toast.showToast({
      message: errorMessage,
      type: 'error',
    });

    return errorMessage;
  };

  return { handleError };
};

/**
 * Wraps an async function with error handling
 * @param fn The async function to wrap
 * @param errorHandler The error handler to use
 * @returns A wrapped function that handles errors
 */
export const withErrorHandling = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  errorHandler: ReturnType<typeof useErrorHandler>,
  customErrorMessage?: string
) => {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args);
    } catch (error) {
      errorHandler.handleError(error, customErrorMessage);
      return null;
    }
  };
};
