import { useClerk } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity } from 'react-native';
import { useErrorHandler } from '../lib/utils/errorHandler';

export const SignOutButton = () => {
  const { signOut } = useClerk();
  const router = useRouter();
  const { handleError } = useErrorHandler();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/landing');
    } catch (err) {
      handleError(err, 'Failed to sign out. Please try again.');
    }
  };

  return (
    <TouchableOpacity
      onPress={handleSignOut}
      style={{ backgroundColor: '#FF3B30', padding: 15, borderRadius: 5 }}
    >
      <Text style={{ color: 'white' }}>Sign out</Text>
    </TouchableOpacity>
  );
};
