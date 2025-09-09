import fs from "fs";
import path from "path";
import { supabase } from "@/lib/supabaseClient";
import { Database } from "@/lib/database.types";
import { Product, Review, AdditionalInfoItem } from "@/lib/types";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

const jsonPath = path.join(process.cwd(), "data", "products.json");
const imagesDir = path.join(process.cwd(), "public", "images");

// Ensure dirs exist
fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
fs.mkdirSync(imagesDir, { recursive: true });

async function downloadImage(bucketPath: string, localName: string): Promise<string | null> {
  const ext = path.extname(bucketPath) || ".webp";
  const fileName = `${localName}${ext}`;
  const fullPath = path.join(imagesDir, fileName);

  // Skip if file exists
  if (fs.existsSync(fullPath)) return `/images/${fileName}`;

  const { data, error } = await supabase.storage.from("products").download(bucketPath);
  if (error || !data) {
    console.warn(`[SYNC] Failed to download ${bucketPath}: ${error?.message}`);
    return null;
  }

  fs.writeFileSync(fullPath, Buffer.from(await data.arrayBuffer()));
  return `/images/${fileName}`;
}

async function transformRow(row: ProductRow): Promise<Product> {
  const id = row.slug || row.uuid;

  // Download main and secondary images in parallel
  const mainImagePath = row.main_image ? await downloadImage(row.main_image, `${id}-${row.uuid}`) : "";

  const secondaryLocal: string[] = [];
  if (Array.isArray(row.secondary_images)) {
    const results = await Promise.all(
      row.secondary_images.map((img, idx) => downloadImage(img, `${id}-secondary-${idx}`))
    );
    for (const r of results) if (r) secondaryLocal.push(r);
  }

  return {
    id: row.id,
    uuid: row.uuid,
    name: row.name,
    description: row.description ?? "",
    main_image: mainImagePath ?? "",
    secondary_images: secondaryLocal,
    tags: row.tags ?? [],
    price: Number(row.price) || 0,
    size: row.size ?? "",
    quantity: row.quantity ?? 0,
    reviews: (row.reviews as unknown as Review[]) ?? [],
    material: row.material ?? "",
    additional_info: (row.additional_info as unknown as AdditionalInfoItem[]) ?? [],
    category: row.category ?? "",
    slug: row.slug ?? "",
  };
}

/**
 * Return cached products immediately, then sync in background
 */
export function getCachedProducts(): Product[] {
  if (fs.existsSync(jsonPath)) {
    try {
      return JSON.parse(fs.readFileSync(jsonPath, "utf-8")) as Product[];
    } catch (err) {
      console.error("[SYNC] Failed to read cached JSON:", err);
    }
  }
  return [];
}

/**
 * Sync all products (updates JSON + local images)
 */
export async function syncAllProducts(): Promise<Product[]> {
  const { data: rows, error } = await supabase.from("products").select("*");
  if (error || !rows) return [];

  let syncedCount = 0;
  const newProducts: string[] = [];
  const transformed: Product[] = [];

  for (const row of rows as ProductRow[]) {
    const product = await transformRow(row);

    // Track if product is new
    if (!fs.existsSync(path.join(imagesDir, `${product.slug || product.uuid}.webp`))) {
      newProducts.push(product.slug ?? product.uuid);
    }

    transformed.push(product);
    syncedCount++;
    console.log(`[SYNC] ${syncedCount}/${rows.length} products processed (${newProducts.join(", ")})`);
  }

  fs.writeFileSync(jsonPath, JSON.stringify(transformed, null, 2));
  console.log(`[SYNC] Complete: ${syncedCount} products synced. New products: ${newProducts.join(", ")}`);
  return transformed;
}

/**
 * Sync one product by slug
 */
export async function syncProductBySlug(slug: string): Promise<Product | null> {
  const { data: row, error } = await supabase.from("products").select("*").eq("slug", slug).single();
  if (error || !row) return null;

  const product = await transformRow(row as ProductRow);

  // Merge into JSON
  let local: Product[] = [];
  if (fs.existsSync(jsonPath)) {
    local = JSON.parse(fs.readFileSync(jsonPath, "utf-8")) as Product[];
  }
  const merged = [...local.filter((p) => p.slug !== product.slug), product];
  fs.writeFileSync(jsonPath, JSON.stringify(merged, null, 2));

  console.log(`[SYNC] Product synced: ${product.slug}`);
  return product;
}

/**
 * Start background sync
 */
export function syncInBackground() {
  syncAllProducts().catch((err) => console.error("[SYNC] Background sync failed:", err));
}
