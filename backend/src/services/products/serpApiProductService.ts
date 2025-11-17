import { getJson } from "serpapi";
import { ProductService } from "../../interfaces/productService";
import { Product } from "@roomspark/shared/src/types/objects";
import { randomUUID } from "crypto";
interface SerpApiResponse {
  error?: string;
  visual_matches: Array<{
    position: number;
    title: string;
    link: string;
    source: string;
    source_icon: string;
    price?: {
      value: string;
      extracted_value: number;
      currency: string;
    };
    thumbnail: string;
    image: string;
    in_stock: boolean;
  }>;
  productsPageToken: string;
  productsPageLink: string;
}

interface SerpApiAmazonSearchResponse {
  error?: string;
  organic_results?: Array<{
    position: number;
    asin: string;
    variants: {
      options: [
        {
          position: number;
          asin: string;
          title: string;
          link: string;
        },
        {
          position: number;
          asin: string;
          title: string;
          link: string;
        },
        {
          position: number;
          asin: string;
          title: string;
          link: string;
        },
        {
          position: number;
          asin: string;
          title: string;
          link: string;
        }
      ];
    };
    title: string;
    link: string;
    link_clean: string;
    thumbnail: string;
    rating: number;
    reviews: number;
    price: string;
    extracted_price: number;
    delivery: Array<string>;
  }>;
}

export class SerpApiProductService implements ProductService {
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getProductsFromImage(imageUrl: string): Promise<Product[]> {
    const cleanImageUrl = imageUrl.replace("/", "/");
    try {
      const apiParams = {
        api_key: this.apiKey,
        engine: "google_lens",
        url: cleanImageUrl,
        hl: "en",
        country: "us",
        // safe: "active", // This seems to break it for some reason lol
      };
      // First do the google lens search. We need this to get the products page token
      const response = (await getJson(apiParams)) as SerpApiResponse;

      if (response.error) {
        throw new Error("Serpapi returned an error: " + response.error);
      }

      if (!response.visual_matches) {
        throw new Error("Serpapi returned no visual matches");
      }

      const productsPageResponse = (await getJson({
        ...apiParams,
        page_token: response.productsPageToken,
      })) as SerpApiResponse;

      console.log("productsPageResponse: ", productsPageResponse);

      // Transform the response to match our Product interface
      return productsPageResponse.visual_matches.map(
        (match) =>
          ({
            id: randomUUID(),
            title: match.title,
            link: match.link,
            source: match.source,
            // source_icon: match.source_icon,
            // thumbnail: match.thumbnail,
            price: match.price
              ? {
                  value: match.price.extracted_value,
                  currency: match.price.currency,
                }
              : undefined,
            image: match.image,
            description: `${match.source} - ${match.title}`,
            inStock: match.in_stock,
            isAffiliate: false, // Not affiliate links yet
          } as Product)
      );
    } catch (error) {
      console.error("Error getting products from image:", error);
      throw new Error("Failed to get products from image");
    }
  }

  async getProductsByAmazonSearch(
    descriptions: string[],
    projectId: string,
    userId: string
  ): Promise<Product[]> {
    try {
      const results: Product[] = [];

      for (const description of descriptions) {
        const apiParams = {
          engine: "amazon",
          amazon_domain: "amazon.com",
          api_key: this.apiKey,
          k: description,
        };

        const response = (await getJson(
          apiParams
        )) as SerpApiAmazonSearchResponse;

        if (response.error) {
          console.error("SerpApi error:", response.error);
          continue;
        }

        if (!response.organic_results) {
          console.warn("No results for:", description);
          continue;
        }

        const products: Product[] = response.organic_results.map((item) => {
          return {
            id: randomUUID(),
            createdAt: new Date().toISOString(),
            description: description || "product_description",
            title: item.title || "product_name",
            link: item.link || "product_link",
            source: "amazon.com",
            image: item.thumbnail || "product_image",
            inStock: true,
            isAffiliate: false,
            liked: false,
            price: {
              value: item.extracted_price || "",
              currency: item.price ? "USD" : "",
            },
            projectId: projectId,
            userId: userId,
            page: 1,
          };
        });

        results.push(...(products ?? []));
      }

      return results;
    } catch (error) {
      console.error("Error in getProductsByAmazonSearch:", error);
      throw new Error("Failed to fetch products from Amazon search");
    }
  }
}
