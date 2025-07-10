export enum ImageType {
  GENERATED = "generated",
  USER_UPLOADED = "user_uploaded",
}

export interface StoredImage {
  url: string;
  id: string;
  blurhash?: string;
}

export interface ImageStorageService {
  storeImage(
    imageBuffer: Uint8Array | Buffer,
    userId: string,
    projectId: string,
    source: string,
    imageType: ImageType
  ): Promise<StoredImage>;

  storeImageFromUrl(
    imageUrl: string,
    userId: string,
    projectId: string,
    source: string,
    imageType: ImageType
  ): Promise<StoredImage>;
}
