export interface ImageGenerationRequest {
  imageUrl: string; // URL of the input image
  prompt: string; // Text description/prompt for image transformation
}

export interface ImageGenerationResponse {
  success: boolean;
  imageUrl?: string; // URL of the generated image
  imageId?: string; // ID of the generated image
  error?: string; // Error message if generation failed
}

export interface ImageGenerationService {
  generateImage(
    request: ImageGenerationRequest,
    userId: string,
    projectId: string
  ): Promise<ImageGenerationResponse>;
}
