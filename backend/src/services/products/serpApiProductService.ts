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
}
