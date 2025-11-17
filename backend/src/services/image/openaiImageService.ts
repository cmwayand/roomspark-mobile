import {
  ImageGenerationRequest,
  ImageGenerationResponse,
  ImageGenerationService,
} from "../../interfaces/imageGeneration";
import { ImageStorageService, ImageType } from "../../interfaces/storage";
import OpenAI from "openai";
import retry from "async-retry";

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

// Optional: type for the structured products we’ll return
type GeneratedProductDescription = string;

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

      const openaiResponse = await retry(
        async () => {
          return await this.openai.images.edit({
            model: "dall-e-2",
            image: imageFile as any,
            prompt: request.prompt,
            n: 1,
            size: "1024x1024",
            response_format: "b64_json",
          });
        },
        {
          retries: 3,
          minTimeout: 1000,
        }
      );

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

      let description: string[] = [];

      try {
        const descriptionResponse = await retry(
          async () => {
            return await this.openai.chat.completions.create({
              model: "gpt-4.1",
              response_format: { type: "json_object" },
              messages: [
                {
                  role: "system",
                  content:
                    "You are an interior designer. Analyze the provided image and generate a list of furniture and decor items. These will be used as keywords for Amazon search.",
                },
                {
                  role: "user",
                  content: [
                    {
                      type: "text",
                      text: `
Return ONLY a JSON object with this shape:
{
  "description": ["Name Category Detailed description..."]
}

Rules:
- Each item must be a SINGLE LINE string.
- Format: "Name Category Description".
- Description should include style, color, material, size cues.
- Include 8–15 products.
- No extra keys or text.
              `.trim(),
                    },
                    {
                      type: "image_url",
                      image_url: {
                        url: `data:image/png;base64,${generatedImageBase64}`,
                      },
                    },
                  ],
                },
              ],
            });
          },
          {
            retries: 3,
            minTimeout: 1000,
          }
        );

        const content =
          descriptionResponse.choices[0]?.message?.content ?? "{}";
        console.log(
          descriptionResponse.choices[0],
          "<-descriptionResponse.choices[0]"
        );

        const parsed = JSON.parse(content) as {
          description?: GeneratedProductDescription[];
        };

        if (parsed.description && Array.isArray(parsed.description)) {
          description = parsed.description;
        }
      } catch (descError) {
        console.error(
          "Failed to generate structured interior product descriptions:",
          descError
        );

        description = [];
      }

      const storedImageUrl = await this.storageService.storeImage(
        generatedImageBuffer,
        userId,
        projectId,
        "openai",
        ImageType.GENERATED,
        description
      );

      return {
        success: true,
        imageUrl: storedImageUrl.url,
        imageId: storedImageUrl.id,
        base64Image: generatedImageBase64,
        description,
      } as unknown as ImageGenerationResponse;
    } catch (error: any) {
      console.error("Error generating image:", error);
      return {
        success: false,
        error:
          error?.message ||
          "An unexpected error occurred while generating image",
      };
    }
  }

  private getFileExtension(contentType: string): string {
    switch (contentType) {
      case "image/jpeg":
      case "image/jpg":
        return "jpg";
      case "image/png":
        return "png";
      case "image/webp":
        return "webp";
      default:
        return "png";
    }
  }
}
