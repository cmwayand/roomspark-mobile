import {
  ImageGenerationRequest,
  ImageGenerationResponse,
  ImageGenerationService,
} from "../../interfaces/imageGeneration";
import { ImageStorageService, ImageType } from "../../interfaces/storage";
import OpenAI from "openai";

class NodeFileLike {
  constructor(
    private buffer: Buffer,
    public name: string,
    public type: string = "image/png"
  ) {}

  get size(): number {
    return this.buffer.length;
  }

  get lastModified(): number {
    return Date.now();
  }

  async arrayBuffer(): Promise<ArrayBuffer> {
    const arrayBuffer = new ArrayBuffer(this.buffer.length);
    const view = new Uint8Array(arrayBuffer);
    for (let i = 0; i < this.buffer.length; i++) {
      view[i] = this.buffer[i];
    }
    return arrayBuffer;
  }

  async text(): Promise<string> {
    return this.buffer.toString("utf-8");
  }

  stream(): ReadableStream<Uint8Array> {
    const { Readable } = require("stream");
    const readable = Readable.from(this.buffer);

    return new ReadableStream({
      start(controller) {
        readable.on("data", (chunk: Buffer) => {
          controller.enqueue(new Uint8Array(chunk));
        });
        readable.on("end", () => {
          controller.close();
        });
        readable.on("error", (err: Error) => {
          controller.error(err);
        });
      },
    });
  }

  slice(start?: number, end?: number): NodeFileLike {
    const slicedBuffer = this.buffer.slice(start, end);
    return new NodeFileLike(slicedBuffer, this.name, this.type);
  }

  get [Symbol.toStringTag](): string {
    return "File";
  }
}

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

      const response = await fetch(request.imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const contentType = response.headers.get("content-type") || "image/png";
      const extension = this.getFileExtension(contentType);

      const imageFile = new NodeFileLike(
        buffer,
        `image.${extension}`,
        contentType
      );

      const openaiResponse = await this.openai.images.edit({
        model: "dall-e-2",
        image: imageFile as any,
        prompt: request.prompt,
        n: 1,
        size: "1024x1024",
        response_format: "b64_json",
      });

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
      console.error("❌ OpenAI image generation error:", error);
      return {
        success: false,
        error: error.message || "Failed to generate image",
      };
    }
  }

  private getFileExtension(contentType: string): string {
    const extensions: { [key: string]: string } = {
      "image/png": "png",
      "image/jpeg": "jpg",
      "image/jpg": "jpg",
      "image/webp": "webp",
      "image/gif": "gif",
    };

    return extensions[contentType] || "png";
  }
}
