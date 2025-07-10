import { ImageStorageService, ImageType } from "@/src/interfaces/storage";
import {
  ImageGenerationService,
  ImageGenerationRequest,
  ImageGenerationResponse,
} from "../../interfaces/imageGeneration";

export class MockImageService implements ImageGenerationService {
  private storageService: ImageStorageService;

  constructor(storageService: ImageStorageService) {
    this.storageService = storageService;
  }

  async generateImage(
    request: ImageGenerationRequest,
    userId: string,
    projectId: string
  ): Promise<ImageGenerationResponse> {
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Use a mock generated image URL instead of fetching the input image
    const mockGeneratedImageUrl = "https://i.imgur.com/RS8Epfg.png";

    // Fetch the mock image and store it
    const response = await fetch(mockGeneratedImageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch mock image: ${response.statusText}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    const storedImageUrl = await this.storageService.storeImage(
      buffer,
      userId,
      projectId,
      "mock",
      ImageType.GENERATED
    );

    return {
      success: true,
      imageUrl: storedImageUrl.url,
      imageId: storedImageUrl.id,
    };
  }
}
