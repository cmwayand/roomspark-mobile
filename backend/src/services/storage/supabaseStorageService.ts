import {
  StoredImage,
  ImageStorageService,
  ImageType,
} from "../../interfaces/storage";
import { SupabaseClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

export class SupabaseStorageService implements ImageStorageService {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async storeImage(
    imageBuffer: Uint8Array | Buffer,
    userId: string,
    projectId: string,
    source: string,
    imageType: ImageType,
    description: string[]
  ): Promise<StoredImage> {
    let folderName = "";
    switch (imageType) {
      case ImageType.GENERATED:
        folderName = "generated-images";
        break;
      case ImageType.USER_UPLOADED:
        folderName = "user_uploads";
        break;
      default:
        throw new Error(`Invalid image type: ${imageType}`);
    }

    const guid = uuidv4();
    const uniqueFileName = `${guid}.png`;
    const filePath = `${folderName}/${uniqueFileName}`;

    const { data: storageData, error: storageError } =
      await this.supabase.storage
        .from("user_uploads")
        .upload(filePath, imageBuffer, {
          contentType: "image/png",
        });

    if (storageError) {
      throw new Error(
        `Failed to upload generated image: ${storageError.message}`
      );
    }

    const { data: urlData, error: urlError } = await this.supabase.storage
      .from("user_uploads")
      .createSignedUrl(filePath, 60 * 60 * 24 * 365 * 100); // 100 years expiry

    if (urlError) {
      throw new Error(`Failed to create signed URL: ${urlError.message}`);
    }

    let tableName = "";
    switch (imageType) {
      case ImageType.GENERATED:
        tableName = "user_generated";
        break;
      case ImageType.USER_UPLOADED:
        tableName = "user_uploads";
        break;
      default:
        throw new Error(`Invalid image type: ${imageType}`);
    }

    const { data: imageRecord, error: insertError } = await this.supabase
      .from(tableName)
      .insert([
        {
          user_id: userId,
          project_id: projectId,
          file_path: filePath,
          file_url: urlData.signedUrl,
          file_type: "image/png",
          file_size: imageBuffer.length,
          source: source,
          interior_description: description,
          blur_hash: (imageBuffer as any).blurhash, // Type assertion since we know it's coming from our ImageProcessor
        },
      ])
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to record image: ${insertError.message}`);
    }

    return {
      url: urlData.signedUrl,
      id: imageRecord.id,
      blurhash: (imageBuffer as any).blurhash,
    };
  }

  async storeImageFromUrl(
    imageUrl: string,
    userId: string,
    projectId: string,
    source: string,
    imageType: ImageType,
    description: string[]
  ): Promise<StoredImage> {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const imageBlob = await response.blob();
    const arrayBuffer = await imageBlob.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Use the storeImage method to handle the upload
    return this.storeImage(
      buffer,
      userId,
      projectId,
      source,
      imageType,
      description
    );
  }
}
