import * as Linking from 'expo-linking';

export const createOAuthRedirectUrl = () => {
  return Linking.createURL('oauth-native-callback', {
    scheme: 'roomspark',
  });
};

export const setupDeepLinkHandler = (onDeepLink?: (url: string) => void) => {
  const handleDeepLink = (url: string) => {
    console.log('Deep link received:', url);

    // Check if this is an OAuth callback
    if (url.includes('oauth-native-callback')) {
      console.log('OAuth callback received');
      onDeepLink?.(url);
    }
  };

  // Add deep link listener
  const subscription = Linking.addEventListener('url', ({ url }) => {
    handleDeepLink(url);
  });

  // Check for initial URL when app starts
  Linking.getInitialURL().then(url => {
    if (url) {
      handleDeepLink(url);
    }
  });

  return () => {
    subscription?.remove();
  };
};
