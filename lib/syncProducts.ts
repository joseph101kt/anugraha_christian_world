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
  if (fs.existsSync(fullPath)) {
    console.log(`[SYNC] Skipped existing image: ${fileName}`);
    return `/images/${fileName}`;
  }

  const { data, error } = await supabase.storage.from("products").download(bucketPath);
  if (error || !data) {
    console.warn(`[SYNC] Failed to download ${bucketPath}: ${error?.message}`);
    return null;
  }

  fs.writeFileSync(fullPath, Buffer.from(await data.arrayBuffer()));
  return `/images/${fileName}`;
}

async function transformRow(row: ProductRow): Promise<{ product: Product; newFiles: string[] }> {
  const id = row.slug || row.uuid;
  const newFiles: string[] = [];

  // Main image
  let mainImagePath = "";
  if (row.main_image) {
    const pathDownloaded = await downloadImage(row.main_image, `${id}-main`);
    if (pathDownloaded) {
      mainImagePath = pathDownloaded;
      newFiles.push(pathDownloaded);
    }
  }

  // Secondary images
  const secondaryLocal: string[] = [];
  if (Array.isArray(row.secondary_images)) {
    for (const [idx, img] of row.secondary_images.entries()) {
      const imgPath = await downloadImage(img, `${id}-secondary-${idx}`);
      if (imgPath) {
        secondaryLocal.push(imgPath);
        newFiles.push(imgPath);
      }
    }
  }

  const product: Product = {
    id: row.id,
    uuid: row.uuid,
    name: row.name,
    description: row.description ?? "",
    main_image: mainImagePath,
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

  return { product, newFiles };
}

/**
 * Return cached products immediately
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

  const cachedProducts = getCachedProducts();
  const transformed: Product[] = [];
  const newFilesLog: Record<string, string[]> = {};

  for (const row of rows as ProductRow[]) {
    // Check if already cached and images exist
    const cached = cachedProducts.find((p) => p.slug === row.slug);
    if (cached && cached.main_image && cached.secondary_images?.every((img) => fs.existsSync(path.join(imagesDir, path.basename(img))))) {
      transformed.push(cached); // Already up-to-date
      continue;
    }

    const { product, newFiles } = await transformRow(row);
    transformed.push(product);

    if (newFiles.length > 0) {
      newFilesLog[product.slug ?? product.uuid] = newFiles;
    }
  }

  fs.writeFileSync(jsonPath, JSON.stringify(transformed, null, 2));

  console.log(`\n[SYNC] Complete: ${transformed.length} products synced.`);

  const totalNewFiles = Object.values(newFilesLog).reduce((sum, arr) => sum + arr.length, 0);
  if (totalNewFiles > 0) {
    console.log(`[SYNC] New files downloaded: ${totalNewFiles}`);
    Object.entries(newFilesLog).forEach(([slug, files]) => {
      console.log(`- ${slug} (${files.length} new files)`);
      files.forEach((f) => console.log(`   ${f}`));
    });
  } else {
    console.log(`[SYNC] No new files needed downloading.`);
  }

  return transformed;
}

/**
 * Sync one product by slug
 */
export async function syncProductBySlug(slug: string): Promise<Product | null> {
  const { data: row, error } = await supabase.from("products").select("*").eq("slug", slug).single();
  if (error || !row) return null;

  const { product } = await transformRow(row as ProductRow);

  // Merge into JSON
  const local: Product[] = getCachedProducts();
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
