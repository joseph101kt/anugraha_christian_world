// lib/types.ts

// a interface for a single review
export interface Review {
  customer_name: string;
  rating: number;
  comment: string;
}

//  the Product interface 
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
  additional_info: string;
}