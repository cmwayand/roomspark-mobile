import { Product } from "@roomspark/shared/src/types/objects";

export interface ProductProcessorConfig {
  amazonPriority?: boolean;
  titleCleaning?: boolean;
}

export class ProductProcessorService {
  private config: ProductProcessorConfig;

  constructor(config: ProductProcessorConfig = {}) {
    this.config = {
      amazonPriority: true, //TODO will change this to just a list of string so we can prioritize other sites
      titleCleaning: true,
      ...config,
    };
  }

  public processProducts(products: Product[]): Product[] {
    let processedProducts = [...products];

    // Clean titles if enabled
    if (this.config.titleCleaning) {
      processedProducts = this.cleanProductTitles(processedProducts);
    }

    // Sort with Amazon products first if enabled
    if (this.config.amazonPriority) {
      processedProducts = this.sortWithAmazonFirst(processedProducts);
    }

    return processedProducts;
  }

  private cleanProductTitles(products: Product[]): Product[] {
    return products.map((product) => ({
      ...product,
      title: this.cleanTitle(product.title),
    }));
  }

  private cleanTitle(title: string): string {
    return title.replace(/^Amazon\.com:\s*/, "");
  }

  private sortWithAmazonFirst(products: Product[]): Product[] {
    return products.sort((a, b) => {
      const aIsAmazon = this.isAmazonProduct(a);
      const bIsAmazon = this.isAmazonProduct(b);

      // If both or neither are Amazon, maintain original order
      if (aIsAmazon === bIsAmazon) {
        return 0;
      }

      // Amazon products come first
      return aIsAmazon ? -1 : 1;
    });
  }

  private isAmazonProduct(product: Product): boolean {
    return !!(
      product.link &&
      (product.link.includes("amazon.com") || product.link.includes("amzn.to"))
    );
  }
}
