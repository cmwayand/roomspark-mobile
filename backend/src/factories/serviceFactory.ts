import { ImageGenerationService } from "../interfaces/imageGeneration";
import { ImageStorageService } from "../interfaces/storage";
import { ProductService } from "../interfaces/productService";
import { OpenAIImageService } from "../services/image/openaiImageService";
import { SofaBrainImageService } from "../services/image/sofaBrainImageService";
import { MockImageService } from "../services/image/mockImageService";
import { SupabaseStorageService } from "../services/storage/supabaseStorageService";
import { SerpApiProductService } from "../services/products/serpApiProductService";
import { MockProductService } from "../services/products/mockProductService";
import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Factory for creating services with proper dependency injection
 */
export class ServiceFactory {
  private static imageStorageService: ImageStorageService;
  private static imageGenerationService: ImageGenerationService;
  private static productService: ProductService;

  /**
   * Get the configured image storage service
   */
  static getImageStorageService(supabase: SupabaseClient): ImageStorageService {
    if (!this.imageStorageService) {
      // Here we could choose different storage implementations based on config
      this.imageStorageService = new SupabaseStorageService(supabase);
    }
    return this.imageStorageService;
  }

  /**
   * Get the configured image generation service
   */
  static getImageGenerationService(
    supabase: SupabaseClient
  ): ImageGenerationService {
    const storageService = this.getImageStorageService(supabase);
    if (!this.imageGenerationService) {
      // Check if mock mode is enabled
      if (process.env.MOCK_IMAGE_GEN === "true") {
        this.imageGenerationService = new MockImageService(storageService);
      } else {
        // Choose which image generation service to use based on environment or config
        const useOpenAI = process.env.IMAGE_GENERATION_SERVICE === "openai";

        if (useOpenAI) {
          this.imageGenerationService = new OpenAIImageService(storageService);
        } else {
          this.imageGenerationService = new SofaBrainImageService(
            storageService
          );
        }
      }
    }

    return this.imageGenerationService;
  }

  /**
   * Get the configured product service
   */
  static getProductService(): ProductService {
    if (!this.productService) {
      // Check if mock mode is enabled
      if (process.env.MOCK_PRODUCTS === "true") {
        this.productService = new MockProductService();
      } else {
        // Here we could choose different product service implementations based on config
        if (!process.env.SERPAPI_API_KEY) {
          throw new Error(
            "SERPAPI_API_KEY is not set in environment variables"
          );
        }
        this.productService = new SerpApiProductService(
          process.env.SERPAPI_API_KEY
        );
      }
    }
    return this.productService;
  }
}
