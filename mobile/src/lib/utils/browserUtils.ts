import React from 'react';
import * as WebBrowser from 'expo-web-browser';

// Handle any pending authentication sessions
WebBrowser.maybeCompleteAuthSession();

/**
 * Hook to warm up and cool down the WebBrowser to improve performance
 * for authentication flows that use web browser redirects.
 */
export const useWarmUpBrowser = () => {
  React.useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
};
