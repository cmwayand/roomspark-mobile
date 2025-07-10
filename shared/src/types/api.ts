import { Product, ProjectImage } from "./objects";
import { Project } from "./objects";

export interface ApiResponse {
  status: "success" | "error";
  error?: string;
}

export interface GetProductsResponse extends ApiResponse {
  products?: Product[];
}

export interface GetProjectsResponse extends ApiResponse {
  projects: Project[];
}

export interface GetProjectDetailsResponse extends ApiResponse {
  project: Project;
  uploads: ProjectImage[];
  generated: ProjectImage[];
  products: Product[];
}

export interface CreateProjectResponse extends ApiResponse {
  project: Project;
}

export interface GenerateImageResponse extends ApiResponse {
  imageUrl?: string;
  imageId?: string;
  blurhash?: string;
}

export interface UploadResponse extends ApiResponse {
  imageId?: string;
  imageUrl?: string;
  blurhash?: string;
}

export interface LikeProductResponse extends ApiResponse {
  productId?: string;
}

export interface GetLikedProductsResponse extends ApiResponse {
  products?: Product[];
}
