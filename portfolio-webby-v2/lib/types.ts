// lib/types.ts
import { Database } from "./database.types";

// Type for a single review
export interface Review {
  customer_name: string;
  rating: number;
  comment: string;
}

// Type for additional info entries
export interface AdditionalInfoItem {
  title: string;
  description: string;
}

// Image variant types
export type ImageVariant = "main" | "thumb" | "secondary";

// Image upload result type
export interface ImageUploadResult {
  bucketPath: string;
  publicUrl: string;
  width: number;
  height: number;
  pixelArea: number;
  filesizeBytes: number;
  variant: ImageVariant;
  originalFilename: string;
  uploadResult: { path: string } | null;
  error?: string;
}

// Product type aligned with Supabase `products` table
export interface Product {
  id: string;                     // maps to uuid
  uuid: string;
  name: string;
  description: string;
  tags: string[];
  main_image: string;
  secondary_images: string[];
  size: string;
  quantity: number;
  price: number;
  material: string;
  category: string;
  reviews: Review[];
  additional_info: AdditionalInfoItem[];
  slug: string;
}