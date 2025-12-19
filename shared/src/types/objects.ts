export interface Project {
  id: string;
  name: string;
  image: string;
  created_at: string;
}

export interface ProductPrice {
  value: string | number;
  currency: string;
}

export interface Product {
  id: string;
  title: string;
  price?: ProductPrice;
  link: string;
  image: string;
  description?: string;
  liked?: boolean;
  isAffiliate: boolean;
  inStock: boolean;
  source: string;
}

export interface ProjectImage {
  id: string;
  url: string;
  type: 'upload' | 'generated';
  created_at: string;
  source: string;
  blurhash?: string;
}

export enum RoomType {
  MID_CENTURY_MODERN = 'mid_century_modern',
  SCANDINAVIAN = 'scandinavian',
  INDUSTRIAL = 'industrial',
  BOHEMIAN = 'bohemian',
  MODERN_FARMHOUSE = 'modern_farmhouse',
  JAPANDI = 'japandi',
  TRADITIONAL = 'traditional',
  CONTEMPORARY = 'contemporary',
  COASTAL = 'coastal',
  ECLECTIC = 'eclectic',
  TRANSITIONAL = 'transitional',
  GENERIC = 'generic',
}

export enum RoomUsage {
  BEDROOM = 'bedroom',
  LIVING_ROOM = 'living_room',
  OFFICE = 'office',
}
