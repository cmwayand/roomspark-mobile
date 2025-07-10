# Error Handling and Toast Notifications

This document outlines the standardized error handling and notification system implemented in the RoomSparkApp mobile application.

## Overview

The application uses a centralized toast notification system that provides:

- Consistent error reporting across the app
- Toast notifications for errors, success messages, and informational alerts
- Automatic error handling for API requests
- Custom error message support
- Request timeout handling (5 seconds default)

## Components

The error handling system consists of the following key components:

### 1. Toast Provider

The `ToastProvider` is a React Context provider that manages the display of toast notifications across the app.
It's already set up in the root `_layout.tsx` file, so it's available throughout the app.

### 2. Error Handling Utilities

Several utilities make it easy to handle errors and display notifications:

- `useToast` - Hook for direct toast manipulation
- `useErrorHandler` - Hook for standardized error handling
- `getErrorMessage` - Function to extract meaningful messages from different error types
- `withErrorHandling` - HOC utility to wrap async functions with error handling

## Usage Examples

### Basic Toast Messages

```tsx
import { useToast } from '../utils/ToastContext';

function MyComponent() {
  const toast = useToast();

  const showSuccess = () => {
    toast.showToast({
      message: 'Operation completed successfully!',
      type: 'success',
    });
  };

  const showError = () => {
    toast.showToast({
      message: 'Something went wrong!',
      type: 'error',
    });
  };

  // Other toast types
  const showInfo = () => {
    toast.showToast({
      message: 'Processing your request...',
      type: 'info',
    });
  };

  const showWarning = () => {
    toast.showToast({
      message: 'This action cannot be undone',
      type: 'warning',
    });
  };

  // Custom duration
  const showLongToast = () => {
    toast.showToast({
      message: 'This will stay longer',
      type: 'info',
      duration: 5000, // 5 seconds
    });
  };
}
```

### Error Handling in Try/Catch Blocks

```tsx
import { useErrorHandler } from '../utils/errorHandler';

function MyComponent() {
  const { handleError } = useErrorHandler();

  const doSomethingRisky = async () => {
    try {
      // Your risky code here
      await someAsyncOperation();
    } catch (error) {
      // This will display the error as a toast and log it to console
      handleError(error);

      // You can also provide a custom error message
      // handleError(error, 'Failed to complete the operation');
    }
  };
}
```

### API Error Handling

The `useApiRequest` hook already integrates with the toast system and includes timeout handling:

```tsx
import { useApiRequest } from '../utils/useApiRequest';

function MyComponent() {
  const api = useApiRequest('/api/endpoint');

  const fetchData = async () => {
    try {
      const result = await api.fetch({
        // You can customize error handling per request
        showErrorToast: true, // default is true
        customErrorMessage: 'Failed to load data', // override default error message
        timeout: 10000, // optional: override default 5-second timeout (in milliseconds)
      });

      // Handle successful response
    } catch (error) {
      // Error toast is already displayed by the hook
      // This catch is for any additional error handling
    }
  };
}
```

### High-Order Component Error Handling

For functions that need consistent error handling:

```tsx
import { useErrorHandler, withErrorHandling } from '../utils/errorHandler';

function MyComponent() {
  const errorHandler = useErrorHandler();

  // Original function that might throw
  const riskyFunction = async id => {
    const response = await fetch(`/api/data/${id}`);
    if (!response.ok) throw new Error('API error');
    return response.json();
  };

  // Wrapped function with error handling
  const safeFetchData = withErrorHandling(riskyFunction, errorHandler, 'Failed to fetch data');

  const handleButtonPress = async () => {
    // This will automatically handle any errors and show a toast
    const data = await safeFetchData(123);
    if (data) {
      // Only runs if no error occurred
      console.log('Data loaded successfully');
    }
  };
}
```

## Best Practices

1. **Use the appropriate utility** for your use case:

   - Direct toast control: `useToast`
   - Error handling: `useErrorHandler`
   - API requests: Let `useApiRequest` handle errors automatically

2. **Provide helpful error messages** that tell users:

   - What went wrong
   - What they can do about it (if applicable)

3. **Don't overuse toasts** - only show important information that users need to know

4. **Use appropriate toast types**:

   - `error` - For failures and errors that prevented an operation
   - `success` - For successful completion of user actions
   - `info` - For neutral information
   - `warning` - For important cautions

5. **Consider toast duration** - use longer durations for more important messages

6. **Request timeouts**:
   - All API requests have a default 5-second timeout
   - Override the timeout for specific requests when needed
   - Consider longer timeouts for operations that might take more time (like file uploads)

## Extending the System

To add new error handling capabilities:

1. Update the `ToastContext.tsx` file to add new features
2. Extend the `errorHandler.ts` utilities as needed
3. Document changes in this guide
