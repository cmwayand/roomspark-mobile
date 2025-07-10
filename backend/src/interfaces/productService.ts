import { Product } from "@roomspark/shared/src/types/objects";

export interface ProductService {
  getProductsFromImage(imageUrl: string): Promise<Product[]>;
}
