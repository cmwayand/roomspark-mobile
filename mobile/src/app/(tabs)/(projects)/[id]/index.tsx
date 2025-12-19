import { ProductList, ProductListSkeleton } from '@/src/components/home/ProductList';
import { SignedIn } from '@clerk/clerk-expo';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import Image from '@/src/components/Image';
import { useNewProjectStore } from '@/src/lib/state/newProjectStore';
import { ImageSkeleton } from '@/src/components/shared/SkeletonView';
import { useProjectFlow } from '@/src/lib/hooks/useProjectFlow';

/** This page serves 2 purposes
 * 1. To display a finished project
 * 2. To generate a new image AND get the related products when the generation finishes
 * Note: The new image generation requires a style to be picked first
 */
export default function ProjectPage() {
  const { id: projectId } = useLocalSearchParams<{
    id: string;
  }>();
  const { imageToUpload } = useNewProjectStore();

  const { project, loading, error, isLoading, startNewProject, fetchExistingProject } =
    useProjectFlow(projectId);

  // Handle focus-based logic with clean React Query pattern
  useFocusEffect(
    useCallback(() => {
      if (projectId === 'newProject') {
        startNewProject(imageToUpload);
      } else {
        fetchExistingProject();
      }
    }, [projectId, startNewProject, fetchExistingProject, imageToUpload])
  );

  const renderImage = () => {
    // Show generated image if available
    if (project.generated.length > 0) {
      return (
        <View style={styles.imageWrapper}>
          <Image source={{ uri: project.generated[0].url }} />
          {loading.generating && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.loadingText}>Generating your design...</Text>
            </View>
          )}
        </View>
      );
    }

    // If generating, show the uploaded image
    if (loading.generating && project.uploads.length > 0) {
      return (
        <View style={styles.imageWrapper}>
          <Image source={{ uri: project.uploads[0].url }} />
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Generating your design...</Text>
          </View>
        </View>
      );
    }

    // If uploading, show the image being uploaded
    if (loading.uploading) {
      return (
        <View style={styles.imageWrapper}>
          <Image source={{ uri: imageToUpload.uri }} />
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Uploading your photo...</Text>
          </View>
        </View>
      );
    }

    return null;
  };

  const renderContent = () => {
    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    if (isLoading && !loading.uploading && !loading.generating && !loading.searching) {
      return (
        <>
          <View style={styles.imageContainer}>
            <ImageSkeleton style={styles.imageWrapper} height={200} />
          </View>
          <ProductListSkeleton />
        </>
      );
    }

    return (
      <>
        <View style={styles.imageContainer}>{renderImage()}</View>
        <Text style={styles.affiliateText}>
          As an Amazon associate we may earn a commission from purchases.
        </Text>

        {/* Show products if available */}
        {project.products.length > 0 && (
          <ProductList products={project.products} showTitle={true} />
        )}
        {loading.searching && (
          <View style={styles.searchingContainer}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.searchingText}>Finding matching products...</Text>
          </View>
        )}
      </>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <SignedIn>{renderContent()}</SignedIn>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 20,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  imageContainer: {
    marginBottom: 20,
    height: 200,
  },
  imageWrapper: {
    position: 'relative',
    marginBottom: 20,
  },
  placeholderContainer: {
    height: 300,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  placeholderText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  searchingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  affiliateText: {
    color: 'grey',
    fontSize: 10.5,
    justifyContent: 'center',
  },
  searchingText: {
    fontSize: 16,
    color: '#666',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    borderRadius: 12,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    padding: 20,
    backgroundColor: '#fee',
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: '#c00',
    fontSize: 16,
    textAlign: 'center',
  },
});
