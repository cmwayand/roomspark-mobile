import {
  ImageGenerationRequest,
  ImageGenerationResponse,
  ImageGenerationService,
} from "../../interfaces/imageGeneration";
import { ImageStorageService, ImageType } from "../../interfaces/storage";

export class SofaBrainImageService implements ImageGenerationService {
  private apiKey: string;
  private apiUrl: string;
  private storageService: ImageStorageService;

  constructor(storageService: ImageStorageService) {
    if (!process.env.SOFABRAIN_API_KEY) {
      throw new Error("SOFABRAIN_API_KEY is not set in environment variables");
    }

    this.apiKey = process.env.SOFABRAIN_API_KEY;
    this.apiUrl = "https://sofabrain.com/api/v1/job";
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

      // TODO use this when we actually use the sofabrain API
      // // Create the job with SofaBrain API
      // const response = await fetch(this.apiUrl, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //     "X-API-KEY": this.apiKey,
      //   },
      //   body: JSON.stringify({
      //     source_url: request.imageUrl,
      //     style: "modern", // Default style, could be made configurable
      //     intensity: 0.6, // Default intensity
      //     room_type: "Living Room", // Default room type, could be made configurable
      //     redesign_type: "auto", // Let the API decide the best approach
      //   }),
      // });

      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.error || "Failed to create SofaBrain job");
      // }

      // const { jobId } = await response.json();

      // // Poll for job completion
      // const generatedImageUrl = await this.pollForJobCompletion(jobId);

      const generatedImageUrl = "https://i.imgur.com/RS8Epfg.png";

      // simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 5000));

      const storedImageUrl = await this.storageService.storeImageFromUrl(
        generatedImageUrl,
        userId,
        projectId,
        "sofabrain",
        ImageType.GENERATED
      );

      return {
        success: true,
        imageUrl: storedImageUrl.url,
        imageId: storedImageUrl.id,
      };
    } catch (error: any) {
      console.error("SofaBrain image generation error:", error);
      return {
        success: false,
        error: error.message || "Failed to generate image",
      };
    }
  }

  private async pollForJobCompletion(jobId: string): Promise<string> {
    const maxAttempts = 30; // 5 minutes total (10 seconds * 30)
    const delayMs = 2000; // 2 seconds between attempts

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const response = await fetch(`${this.apiUrl}/${jobId}`, {
        headers: {
          "X-API-KEY": this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to check job status");
      }

      const jobStatus = await response.json();

      if (jobStatus.status === "completed" && jobStatus.renders?.[0]?.url) {
        return jobStatus.renders[0].url;
      }

      if (jobStatus.status === "failed") {
        throw new Error("Job failed to complete");
      }

      // Wait before next attempt
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    throw new Error("Job timed out");
  }
}
