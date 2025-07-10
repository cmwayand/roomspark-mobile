import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SignedIn } from '@clerk/clerk-expo';
import { useApiQuery, useFocusRefetch } from '@/src/lib/api/useApi';
import { GetLikedProductsResponse } from '@roomspark/shared';
import { ProductList, ProductListSkeleton } from '@/src/components/home/ProductList';
import Colors from '@/src/constants/Colors';

export default function ProductsPage() {
  const { data, isLoading, error } =
    useApiQuery<GetLikedProductsResponse>('/api/get-liked-products');

  useFocusRefetch();

  const likedProducts = data?.products || [];

  const renderContent = () => {
    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    if (isLoading) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>My Liked Products</Text>
          <ProductListSkeleton />
        </View>
      );
    }

    if (likedProducts.length === 0) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>My Liked Products</Text>
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No liked products yet.</Text>
            <Text style={styles.emptyStateSubtext}>
              Like products from your projects to see them here!
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <Text style={styles.title}>My Liked Products</Text>
        <ProductList products={likedProducts} showTitle={false} />
      </View>
    );
  };

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
      <SignedIn>{renderContent()}</SignedIn>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: 20,
  },
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 20,
  },
  errorContainer: {
    padding: 20,
    backgroundColor: '#fee',
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: Colors.status.error,
    fontSize: 16,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
