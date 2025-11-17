import { Product } from "@roomspark/shared/src/types/objects";

export interface ProductService {
  getProductsFromImage(imageUrl: string): Promise<Product[]>;
  getProductsByAmazonSearch(
    description: string[],
    projectId: string,
    userId: string
  ): Promise<Product[]>;
}
