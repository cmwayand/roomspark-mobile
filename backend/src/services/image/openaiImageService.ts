import {
  ImageGenerationRequest,
  ImageGenerationResponse,
  ImageGenerationService,
} from "../../interfaces/imageGeneration";
import { ImageStorageService, ImageType } from "../../interfaces/storage";
import OpenAI from "openai";

export class OpenAIImageService implements ImageGenerationService {
  private openai: OpenAI;
  private storageService: ImageStorageService;

  constructor(storageService: ImageStorageService) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set in environment variables");
    }

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    this.storageService = storageService;
  }

  async generateImage(
    request: ImageGenerationRequest,
    userId: string,
    projectId: string
  ): Promise<ImageGenerationResponse> {
    try {
      if (!request.imageUrl || !request.prompt) {
        return {
          success: false,
          error: "Both image URL and prompt are required",
        };
      }

      // Fetch the image and create a File object
      const response = await fetch(request.imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      const blob = await response.blob();
      const imageFile = new File([blob], "image.png", {
        type: blob.type || "image/png",
      });

      const openaiResponse = await this.openai.images.edit({
        model: "gpt-image-1",
        image: imageFile,
        prompt: request.prompt,
        n: 1,
        size: "1024x1024",
      });

      // For later
      const usage = openaiResponse.usage;

      if (
        !openaiResponse.data ||
        openaiResponse.data.length === 0 ||
        !openaiResponse.data[0].b64_json
      ) {
        return {
          success: false,
          error: "Failed to generate image from OpenAI",
        };
      }

      const generatedImageBase64 = openaiResponse.data[0].b64_json;
      if (!generatedImageBase64) {
        return {
          success: false,
          error: "Failed to generate image from OpenAI",
        };
      }

      const generatedImageBuffer = Buffer.from(generatedImageBase64, "base64");
      const storedImageUrl = await this.storageService.storeImage(
        generatedImageBuffer,
        userId,
        projectId,
        "openai",
        ImageType.GENERATED
      );

      return {
        success: true,
        imageUrl: storedImageUrl.url,
        imageId: storedImageUrl.id,
      };
    } catch (error: any) {
      console.error("OpenAI image generation error:", error);
      return {
        success: false,
        error: error.message || "Failed to generate image",
      };
    }
  }
}
