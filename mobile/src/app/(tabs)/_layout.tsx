import { Redirect, Stack, Tabs } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/src/constants/Colors';
import ProjectsIcon from '@/src/components/icons/ProjectsIcon';
import ProductsIcon from '@/src/components/icons/ProductsIcon';
import SettingsIcon from '@/src/components/icons/SettingsIcon';
import { useUser } from '@/src/lib/utils/UserContext';
import { useToast } from '@/src/lib/utils/ToastContext';

export default function AppLayout() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const userCtx = useUser();
  const { showToast } = useToast();

  // Everything under (app) requires auth
  if (!isSignedIn) {
    return <Redirect href="/landing" />;
  }

  const handleCreateProject = () => {
    router.push('/(tabs)/(projects)/new');
  };

  const handleOverLimit = () => {
    showToast({ message: 'You have exceeded the limit!!!', type: 'info' });
  };

  return (
    <Tabs
      screenOptions={{
        // Optimize tab navigation performance
        lazy: true,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="(projects)/index"
        options={{
          title: 'Projects',
          headerShown: true,
          headerRight: () => (
            <TouchableOpacity
              onPress={userCtx.isOverLimit ? handleOverLimit : handleCreateProject}
              style={{
                backgroundColor: Colors.primary,
                width: 32,
                height: 32,
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 16,
              }}
            >
              <Ionicons name="add" size={20} color={Colors.background} />
            </TouchableOpacity>
          ),
          tabBarIcon: ({ color, size }) => <ProjectsIcon size={size} color={color} />,
          tabBarActiveTintColor: Colors.primary,
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: 'Products',
          tabBarIcon: ({ color, size }) => <ProductsIcon size={size} color={color} />,
          tabBarActiveTintColor: Colors.primary,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <SettingsIcon size={size} color={color} />,
          tabBarActiveTintColor: Colors.primary,
        }}
      />

      {/* Excluded from the tabs */}
      <Tabs.Screen
        name="(projects)/[id]/index"
        options={{ href: null, headerShown: true, title: 'Project' }}
      />
      <Tabs.Screen
        name="(projects)/new"
        options={{
          href: null,
          title: 'Create new project',
        }}
      />
    </Tabs>
  );
}
