import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ListRenderItem,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useApiQuery, useFocusRefetch } from '@/src/lib/api/useApi';
import { GetProjectsResponse } from '@/src/types/api';
import { SignedIn } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/src/constants/Colors';

type Project = NonNullable<GetProjectsResponse['projects']>[0];

/** This page lists all your projects and lets you create a new one */
export default function ProjectListPage() {
  const router = useRouter();

  const { data, isLoading, error } = useApiQuery<GetProjectsResponse>('/api/get-projects');

  useFocusRefetch();

  const projects = data?.projects || [];

  const renderProject: ListRenderItem<Project> = ({ item: project }) => (
    <TouchableOpacity
      style={styles.projectCard}
      onPress={() =>
        router.push({
          pathname: '/(tabs)/(projects)/[id]',
          params: { id: project.id },
        })
      }
    >
      <View style={styles.imageContainer}>
        {project.image ? (
          <Image source={{ uri: project.image }} style={styles.projectImage} resizeMode="cover" />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="image-outline" size={40} color={Colors.text.secondary} />
          </View>
        )}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.projectName}>{project.name}</Text>
      </View>
    </TouchableOpacity>
  );

  const getItemLayout = (_: any, index: number) => ({
    length: 136, // projectCard height (120) + gap (16)
    offset: 136 * index,
    index,
  });

  const renderEmptyComponent = () => {
    if (isLoading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateText}>No projects yet. Create your first one!</Text>
      </View>
    );
  };

  const renderHeader = () => {
    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <SignedIn>
        <FlatList
          data={projects}
          renderItem={renderProject}
          keyExtractor={item => item.id}
          contentContainerStyle={[
            styles.contentContainer,
            projects.length === 0 && { flexGrow: 1 },
          ]}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyComponent}
          getItemLayout={getItemLayout}
          removeClippedSubviews={true}
          maxToRenderPerBatch={8}
          updateCellsBatchingPeriod={50}
          initialNumToRender={6}
          windowSize={10}
          showsVerticalScrollIndicator={false}
        />
      </SignedIn>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  projectCard: {
    height: 120,
    backgroundColor: Colors.background,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    height: 85,
    backgroundColor: '#f5f5f5',
  },
  projectImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 16,
  },
  projectName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
  },
});
