import { Redirect } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';

// This is technically redundant, but better safe than sorry
export default function HomeScreen() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return <Redirect href="/(tabs)/(projects)" />;
  }

  return <Redirect href="/landing" />;
}
