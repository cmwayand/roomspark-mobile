import { Product, ProductPrice } from '@roomspark/shared/src/types/objects';
import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, FlatList } from 'react-native';
import { Image } from 'expo-image';
import StarIcon from '../icons/StarIcon';
import Colors from '../../constants/Colors';
import { SkeletonView } from '../shared/SkeletonView';
import { useLikeProduct } from '@/src/lib/hooks/useLikeProduct';

interface ProductListProps {
  products: Product[];
  title?: string;
  showTitle?: boolean;
}

// Skeleton Components
const ProductItemSkeleton = React.memo(() => (
  <View style={[styles.productItem, { backgroundColor: Colors.background }]}>
    <SkeletonView width={100} height={100} borderRadius={0} />
    <View style={styles.productInfo}>
      <SkeletonView width="90%" height={16} style={{ marginBottom: 8 }} />
      <SkeletonView width="60%" height={20} />
    </View>
  </View>
));
ProductItemSkeleton.displayName = 'ProductItemSkeleton';

const skeletonData = [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }];

export const ProductListSkeleton = React.memo(() => (
  <View style={styles.container}>
    <FlatList
      data={skeletonData}
      renderItem={() => <ProductItemSkeleton />}
      keyExtractor={item => item.id}
      scrollEnabled={false}
      showsVerticalScrollIndicator={false}
    />
  </View>
));
ProductListSkeleton.displayName = 'ProductListSkeleton';

export const ProductList: React.FC<ProductListProps> = React.memo(
  ({ products, title, showTitle }) => {
    const { likeProduct } = useLikeProduct();

    const formatPrice = useCallback((price?: ProductPrice) => {
      if (!price?.currency || price.value == null) {
        return 'Price not available';
      }

      // Convert string to number if needed
      const numericValue = typeof price.value === 'string' ? parseFloat(price.value) : price.value;

      // Check if the conversion resulted in a valid number
      if (isNaN(numericValue)) {
        return `${price.currency}${price.value}`;
      }

      const formattedValue = numericValue.toLocaleString('en-US');
      return `${price.currency}${formattedValue}`;
    }, []);
    const renderProductItem = useCallback(
      ({ item: product }: { item: Product }) => (
        <TouchableOpacity
          style={styles.productItem}
          onPress={() => Linking.openURL(product.link)}
          activeOpacity={0.7}
        >
          <Image
            source={{ uri: product.image }}
            style={styles.productImage}
            contentFit="cover"
            contentPosition="center"
            transition={200}
            cachePolicy="memory-disk"
            priority="high"
            placeholder={{
              uri: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
            }}
          />
          <View style={styles.productInfo}>
            <Text style={styles.productTitle} numberOfLines={1} ellipsizeMode="tail">
              {product.title}
            </Text>
            {product.source && (
              <Text style={styles.productSource} numberOfLines={1} ellipsizeMode="tail">
                {product.source}
              </Text>
            )}
            <View style={styles.priceContainer}>
              <Text
                style={[
                  styles.productPrice,
                  formatPrice(product.price) === 'Price not available' && styles.priceUnavailable,
                ]}
              >
                {formatPrice(product.price)}
              </Text>
              {product.inStock && <Text style={styles.inStockText}>In stock</Text>}
            </View>
          </View>
          <TouchableOpacity
            style={styles.likeButton}
            onPress={e => {
              e.stopPropagation();
              product.liked = !product.liked;
              likeProduct(product.id, product.liked);
            }}
            activeOpacity={0.7}
          >
            <StarIcon size={20} color={Colors.primary} filled={product.liked} />
          </TouchableOpacity>
        </TouchableOpacity>
      ),
      [formatPrice, likeProduct]
    );

    if (products.length === 0) return null;
    return (
      <View style={styles.container}>
        {showTitle && <Text style={styles.title}>{title || 'Similar Products:'}</Text>}
        <FlatList
          data={products}
          renderItem={renderProductItem}
          keyExtractor={(item, index) => `${item.title}-${index}`}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={10}
          getItemLayout={(data, index) => ({
            length: 115, // productItem height (100) + marginBottom (15)
            offset: 115 * index,
            index,
          })}
        />
      </View>
    );
  }
);
ProductList.displayName = 'ProductList';

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    width: '100%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: Colors.text.primary,
  },
  productItem: {
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 0,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
    height: 100,
  },
  productImage: {
    width: 100,
    height: 100,
    backgroundColor: '#f5f5f5',
  },
  productInfo: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 16,
    paddingRight: 48,
    justifyContent: 'center',
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  productSource: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceUnavailable: {
    fontSize: 14,
    fontWeight: 'normal',
    color: Colors.text.secondary,
  },
  inStockText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4CAF50',
  },
  likeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 8,
  },
});
