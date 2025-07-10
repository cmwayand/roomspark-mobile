import { Product } from "@roomspark/shared/src/types/objects";

export interface AffiliateConfig {
  amazon: {
    tag: string;
  };
}

export class AffiliateService {
  private config: AffiliateConfig;

  constructor(config: AffiliateConfig) {
    this.config = config;
  }

  public convertProductLinks(products: Product[]): Product[] {
    return products.map((product) => {
      if (product.link && this.isAmazonUrl(product.link)) {
        return {
          ...product,
          link: this.convertAmazonUrl(product.link),
          isAffiliate: true,
        };
      }
      return product;
    });
  }

  private isAmazonUrl(url: string): boolean {
    return url.includes("amazon.com") || url.includes("amzn.to");
  }

  private convertAmazonUrl(url: string): string {
    try {
      const urlObj = new URL(url);

      // If it's already an affiliate link, return as is
      if (urlObj.searchParams.has("tag")) {
        return url;
      }

      // Add the affiliate tag
      urlObj.searchParams.set("tag", this.config.amazon.tag);

      return urlObj.toString();
    } catch (error) {
      console.error("Error converting Amazon URL:", error);
      return url;
    }
  }
}
