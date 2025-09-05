// lib/types.ts

import { Database } from "./database.types";

// Type for reading rows
export type Lead = Database["public"]["Tables"]["leads"]["Row"];

// Type for inserting new leads
export type NewLead = Database["public"]["Tables"]["leads"]["Insert"];

// interface for a single review
export interface Review {
  customer_name: string;
  rating: number;
  comment: string;
}

// new interface for additional info entries
export interface AdditionalInfoItem {
  title: string;
  description: string;
}

// the Product interface
export interface Product {
  id: string;
  name: string;
  description?: string | null;
  tags: string[];
  main_image: string;
  secondary_images: string[];
  size: string;
  quantity: number;
  price: number;
  reviews: Review[];
  material: string;
  additional_info: AdditionalInfoItem[]; // now a list of title-description pairs
  category?: string;
}



export type ImageVariant = "main" | "thumb" | `secondary-${number}`;

export interface ImageUploadResult {
  bucketPath: string;
  publicUrl: string;
  width: number;
  height: number;
  pixelArea: number;
  filesizeBytes: number;
  variant: ImageVariant;
  originalFilename: string;
  uploadResult: unknown;
  error?: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string | null;
  tags: string[];
  mainImage?: string | null;
  createdAt: string;
}
