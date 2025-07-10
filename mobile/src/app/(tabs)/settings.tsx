import { View, Text, StyleSheet } from 'react-native';
import { SignOutButton } from '../../components/SignOutButton';

export default function SettingsPage() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.signOutContainer}>
          <SignOutButton />
        </View>
      </View>
      <View style={styles.content}>{/* Add other settings content here */}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 40, // Add some top padding for status bar
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  signOutContainer: {
    // This ensures the button stays in the top right
  },
  content: {
    flex: 1,
  },
});
