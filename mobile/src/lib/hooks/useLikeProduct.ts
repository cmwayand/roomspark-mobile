import { useCallback } from 'react';
import { useApiMutation } from '@/src/lib/api/useApi';
import { LikeProductResponse } from '@roomspark/shared';
import { useToast } from '@/src/lib/utils/ToastContext';

export function useLikeProduct() {
  const { showToast } = useToast();

  const likeProductMutation = useApiMutation<LikeProductResponse>('/api/like-product', {
    method: 'POST',
    showErrorToast: false, // We'll handle errors manually
  });

  const likeProduct = useCallback(
    async (productId: string, liked: boolean) => {
      try {
        console.log('productId', productId, 'liked', liked);

        const result = await likeProductMutation.mutateAsync({ productId, liked });

        if (result?.status === 'success') {
          showToast({
            message: liked ? 'Product liked!' : 'Product unliked!',
            type: 'success',
          });
        } else {
          showToast({
            message: 'Failed to update product',
            type: 'error',
          });
        }

        return result;
      } catch (error) {
        console.error('Error updating product like status:', error);
        showToast({
          message: 'Failed to update product',
          type: 'error',
        });
      }
    },
    [likeProductMutation, showToast]
  );

  return {
    likeProduct,
    loading: likeProductMutation.isLoading,
    error: likeProductMutation.error,
  };
}
