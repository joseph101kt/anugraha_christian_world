import { supabase } from "@/lib/supabaseClient";
import { Database } from "@/lib/database.types";
import { Product, Review, AdditionalInfoItem } from "@/lib/types";
import baselineProducts from "@/data/products.json"; // your monthly snapshot
import fs from "fs";
import path from "path";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

const imagesDir = path.join(process.cwd(), "public", "images");

/**
 * Get public URL for an image stored in Supabase bucket
 */
function getImageUrl(bucketPath: string): string {
  const { data } = supabase.storage.from("products").getPublicUrl(bucketPath);
  return data.publicUrl;
}

/**
 * Resolve image URL:
 * - If local file exists in public/images → use that
 * - Else fallback to Supabase public URL
 */
function resolveImage(slug: string | undefined, bucketPath: string | null): string | undefined {
  if (!slug) return undefined;

  // Use local file if it exists
  const localPath = path.join(imagesDir, `${slug}.webp`);
  if (fs.existsSync(localPath)) {
    return `/images/${slug}.webp`;
  }

  // Only call getImageUrl if bucketPath is a relative path, not a full URL
  if (bucketPath && !bucketPath.startsWith("http")) {
    return getImageUrl(bucketPath);
  }

  // bucketPath is already a full URL
  if (bucketPath) {
    return bucketPath;
  }

  return undefined;
}


/**
 * Transform a Supabase row into a Product object
 */
async function transformRow(row: ProductRow): Promise<Product> {
  const slug = row.slug ?? undefined; // convert null → undefined

  const mainImage = resolveImage(slug, row.main_image);

  const secondaryImages = (row.secondary_images ?? [])
    .map((img) => resolveImage(slug, img))
    .filter((i): i is string => !!i);

  return {
    id: row.id,
    uuid: row.uuid,
    name: row.name,
    description: row.description ?? "",
    main_image: mainImage ?? "",
    secondary_images: secondaryImages,
    tags: row.tags ?? [],
    price: Number(row.price) || 0,
    size: row.size ?? "",
    quantity: row.quantity ?? 0,
    reviews: (row.reviews as unknown as Review[]) ?? [],
    material: row.material ?? "",
    additional_info: (row.additional_info as unknown as AdditionalInfoItem[]) ?? [],
    category: row.category ?? "",
    slug: slug ?? "",
  };
}

/**
 * Return cached products from the baseline JSON
 */
export function getCachedProducts(): Product[] {
  return baselineProducts as unknown as Product[];
}

/**
 * Fetch all products directly from Supabase
 */
export async function syncAllProducts(): Promise<Product[]> {
  const { data: rows, error } = await supabase.from("products").select("*");
  if (error || !rows) {
    console.error("[SYNC] Failed to fetch products:", error?.message);
    return [];
  }

  const transformed: Product[] = [];
  for (const row of rows as ProductRow[]) {
    const product = await transformRow(row);
    transformed.push(product);
  }

  return transformed;
}

/**
 * Fetch one product by slug from Supabase
 */
export async function syncProductBySlug(slug: string): Promise<Product | null> {
  const { data: row, error } = await supabase.from("products").select("*").eq("slug", slug).single();
  if (error || !row) {
    console.error("[SYNC] Failed to fetch product:", error?.message);
    return null;
  }

  return await transformRow(row as ProductRow);
}

/**
 * Start background sync (fetch all products)
 */
export function syncInBackground() {
  syncAllProducts().catch((err) => console.error("[SYNC] Background sync failed:", err));
}
