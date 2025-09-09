// lib/syncProducts.ts
import fs from "fs";
import path from "path";
import { supabase } from "@/lib/supabaseClient";
import { Database } from "@/lib/database.types";
import { Product, Review, AdditionalInfoItem } from "@/lib/types";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

// Paths
const jsonPath = path.join(process.cwd(), "data", "products.json");
const imagesDir = path.join(process.cwd(), "public", "images");

// Ensure dirs exist
fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
fs.mkdirSync(imagesDir, { recursive: true });

/**
 * Download an image from Supabase bucket and save locally.
 */
async function downloadImage(
  bucketPath: string,
  localName: string
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from("products")
    .download(bucketPath);
  if (error || !data) return null;

  const ext = path.extname(bucketPath) || ".webp";
  const fileName = `${localName}${ext}`;
  const fullPath = path.join(imagesDir, fileName);

  fs.writeFileSync(fullPath, Buffer.from(await data.arrayBuffer()));
  return `/images/${fileName}`;
}

/**
 * Transform DB row → strict Product type
 */
async function transformRow(row: ProductRow): Promise<Product> {
  const id = row.slug || row.uuid;

  // Main image
  let mainImagePath: string | null = null;
  if (row.main_image) {
    mainImagePath = await downloadImage(row.main_image, `${id}-${row.uuid}`);
  }

  // Secondary images
  const secondaryLocal: string[] = [];
  if (Array.isArray(row.secondary_images)) {
    for (const [idx, img] of row.secondary_images.entries()) {
      const imgPath = await downloadImage(img, `${id}-secondary-${idx}`);
      if (imgPath) secondaryLocal.push(imgPath);
    }
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
 * Sync all products with local JSON & images.
 */
export async function syncAllProducts(): Promise<Product[]> {
  const { data: rows, error } = await supabase.from("products").select("*");
  if (error || !rows) return [];

  const transformed: Product[] = [];
  for (const row of rows as ProductRow[]) {
    transformed.push(await transformRow(row));
  }

  fs.writeFileSync(jsonPath, JSON.stringify(transformed, null, 2));
  return transformed;
}

/**
 * Sync one product by slug.
 */
export async function syncProductBySlug(slug: string): Promise<Product | null> {
  const { data: row, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !row) return null;
  const product = await transformRow(row as ProductRow);

  // update local JSON (merge)
  let local: Product[] = [];
  if (fs.existsSync(jsonPath)) {
    local = JSON.parse(fs.readFileSync(jsonPath, "utf-8")) as Product[];
  }
  const merged = [
    ...local.filter((p) => p.slug !== product.slug),
    product,
  ];
  fs.writeFileSync(jsonPath, JSON.stringify(merged, null, 2));

  return product;
}
