import sharp from "sharp";
import { encode } from "blurhash";

export interface ImageProcessingOptions {
  width?: number;
  format?: "png";
  quality?: number;
}

export class ImageProcessor {
  /**
   * Processes an image buffer to ensure it meets specified requirements
   * @param buffer The input image buffer
   * @param options Processing options
   * @returns Processed image buffer and blurhash
   */
  static async processImage(
    buffer: Buffer,
    options: ImageProcessingOptions = {}
  ): Promise<{ buffer: Buffer; blurhash: string }> {
    const { width = 1024, format = "png", quality = 100 } = options;

    let sharpInstance = sharp(buffer);

    // First convert to RGBA format
    sharpInstance = sharpInstance
      .ensureAlpha()
      .resize(width, width, { fit: "fill" }) //TODO bad, should probably be cover
      .toColourspace("rgba")
      .png({ quality });

    // Generate blurhash
    const { data, info } = await sharpInstance
      .clone()
      .raw()
      .ensureAlpha()
      .toBuffer({ resolveWithObject: true });

    const pixels = new Uint8ClampedArray(data);
    const blurhash = encode(pixels, info.width, info.height, 4, 3);

    return {
      buffer: await sharpInstance.toBuffer(),
      blurhash,
    };
  }

  /**
   * Processes an image from a URL
   * @param imageUrl URL of the image to process
   * @param options Processing options
   * @returns Processed image buffer and blurhash
   */
  static async processImageFromUrl(
    imageUrl: string,
    options: ImageProcessingOptions = {}
  ): Promise<{ buffer: Buffer; blurhash: string }> {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    return this.processImage(buffer, options);
  }
}
