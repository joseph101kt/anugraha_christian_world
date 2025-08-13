// lib/types.ts

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
  description: string;
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
