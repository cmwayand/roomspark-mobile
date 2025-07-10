import { Product } from "@roomspark/shared";

export interface ProductService {
  /**
   * Get products from an image URL
   * @param imageUrl The URL of the image to search for products
   * @returns Promise containing the product matches
   */
  getProductsFromImage(imageUrl: string): Promise<Product[]>;
}
