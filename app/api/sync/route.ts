// app/api/sync/route.ts
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { supabase } from "@/lib/supabaseClient";

// Type for rows in Supabase `products` table
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
  reviews: unknown[] | null; // JSONB from Supabase
  additional_info: unknown[] | null; // JSONB from Supabase
};

// Type for JSON format
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

export async function GET() {
  try {
    // 1. Fetch all products from Supabase
    const { data: products, error } = await supabase
      .from("products")
      .select("*");

    if (error) throw error;
    if (!products) {
      return NextResponse.json(
        { message: "No products found." },
        { status: 200 }
      );
    }

    // Directory paths
    const jsonPath = path.join(process.cwd(), "data", "products.json");
    const imagesDir = path.join(process.cwd(), "public", "images");

    // Ensure images folder exists
    fs.mkdirSync(imagesDir, { recursive: true });

    // Transformed products for JSON
    const transformed: TransformedProduct[] = [];

    for (const product of products as ProductRow[]) {
      const id = product.slug || product.uuid; // prefer slug, fallback to uuid

      // --- Main image ---
      let mainImagePath: string | null = null;
      if (product.main_image) {
        const { data: imgData, error: imgErr } = await supabase.storage
          .from("products")
          .download(product.main_image);

        if (!imgErr && imgData) {
          const ext = path.extname(product.main_image) || ".webp";
          const fileName = `${id}-${product.uuid}${ext}`;
          mainImagePath = `/images/${fileName}`;
          const fullPath = path.join(imagesDir, fileName);

          fs.writeFileSync(fullPath, Buffer.from(await imgData.arrayBuffer()));
        }
      }

      // --- Secondary images ---
      const secondaryLocal: string[] = [];
      if (Array.isArray(product.secondary_images)) {
        for (const [idx, img] of product.secondary_images.entries()) {
          const { data: imgData, error: imgErr } = await supabase.storage
            .from("products")
            .download(img);

          if (!imgErr && imgData) {
            const ext = path.extname(img) || ".webp";
            const fileName = `${id}-secondary-${idx}${ext}`;
            const fullPath = path.join(imagesDir, fileName);
            secondaryLocal.push(`/images/${fileName}`);

            fs.writeFileSync(fullPath, Buffer.from(await imgData.arrayBuffer()));
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

    // 2. Save JSON file
    fs.writeFileSync(jsonPath, JSON.stringify(transformed, null, 2));

    return NextResponse.json(
      { message: "Sync completed", productsCount: transformed.length },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
