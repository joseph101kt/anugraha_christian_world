// app/api/sync/route.ts
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { supabase } from "@/lib/supabaseClient";

type ProductRow = {
  uuid: string;
  slug: string | null;
  name: string;
  description: string | null;
  tags: string[] | null;
  main_image: string | null;
  secondary_images: string[] | null;
  size: string | null;
  quantity: number | null;
  price: number;
  material: string | null;
  category: string | null;
  reviews: unknown[] | null;
  additional_info: unknown[] | null;
};

type TransformedProduct = {
  id: string;
  name: string;
  description: string | null;
  main_image: string | null;
  secondary_images: string[];
  tags: string[];
  price: number;
  size: string | null;
  quantity: number;
  reviews: unknown[];
  material: string | null;
  additional_info: unknown[];
  category: string | null;
};

function normalizePath(urlOrPath: string): string {
  const publicPrefix = "/storage/v1/object/public/products/";
  const idx = urlOrPath.indexOf(publicPrefix);
  if (idx !== -1) {
    return urlOrPath.slice(idx + publicPrefix.length);
  }
  return urlOrPath; // already relative
}

export async function GET() {
  try {
    console.log("[SYNC] Starting product sync...");

    const { data: products, error } = await supabase
      .from("products")
      .select("*");

    if (error) throw error;
    if (!products) {
      console.log("[SYNC] No products found in Supabase.");
      return NextResponse.json({ message: "No products found." }, { status: 200 });
    }

    console.log(`[SYNC] Found ${products.length} products in Supabase.`);

    const jsonPath = path.join(process.cwd(), "data", "products.json");
    const imagesDir = path.join(process.cwd(), "public", "images");
    fs.mkdirSync(imagesDir, { recursive: true });

    const transformed: TransformedProduct[] = [];

    for (const product of products as ProductRow[]) {
      const id = product.slug || product.uuid;
      console.log(`[SYNC] Processing product: ${id} (${product.name})`);

      // --- Main image ---
      let mainImagePath: string | null = null;
      if (product.main_image) {
        const normalized = normalizePath(product.main_image);
        console.log(`[SYNC] Downloading main image: ${normalized}`);

        const { data: imgData, error: imgErr } = await supabase.storage
          .from("products")
          .download(normalized);

        if (imgErr) {
          console.error(`[SYNC][ERROR] Failed to download main image (${normalized}):`, imgErr.message);
        } else if (imgData) {
          const ext = path.extname(normalized) || ".webp";
          const fileName = `${id}-${product.uuid}${ext}`;
          mainImagePath = `/images/${fileName}`;
          const fullPath = path.join(imagesDir, fileName);

          fs.writeFileSync(fullPath, Buffer.from(await imgData.arrayBuffer()));
          console.log(`[SYNC] Saved main image to ${fullPath}`);
        }
      }

      // --- Secondary images ---
      const secondaryLocal: string[] = [];
      if (Array.isArray(product.secondary_images)) {
        for (const [idx, img] of product.secondary_images.entries()) {
          const normalized = normalizePath(img);
          console.log(`[SYNC] Downloading secondary image ${idx}: ${normalized}`);

          const { data: imgData, error: imgErr } = await supabase.storage
            .from("products")
            .download(normalized);

          if (imgErr) {
            console.error(`[SYNC][ERROR] Failed to download secondary image (${normalized}):`, imgErr.message);
          } else if (imgData) {
            const ext = path.extname(normalized) || ".webp";
            const fileName = `${id}-secondary-${idx}${ext}`;
            const fullPath = path.join(imagesDir, fileName);
            secondaryLocal.push(`/images/${fileName}`);

            fs.writeFileSync(fullPath, Buffer.from(await imgData.arrayBuffer()));
            console.log(`[SYNC] Saved secondary image to ${fullPath}`);
          }
        }
      }

      // --- Transform product ---
      transformed.push({
        id,
        name: product.name,
        description: product.description,
        main_image: mainImagePath,
        secondary_images: secondaryLocal,
        tags: product.tags ?? [],
        price: Number(product.price) || 0,
        size: product.size,
        quantity: product.quantity ?? 0,
        reviews: product.reviews ?? [],
        material: product.material,
        additional_info: product.additional_info ?? [],
        category: product.category,
      });
    }

    fs.writeFileSync(jsonPath, JSON.stringify(transformed, null, 2));
    console.log("[SYNC] Completed successfully!");

    return NextResponse.json(
      { message: "Sync completed", productsCount: transformed.length },
      { status: 200 }
    );
  } catch (err) {
    console.error("[SYNC][FATAL] Unexpected error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
