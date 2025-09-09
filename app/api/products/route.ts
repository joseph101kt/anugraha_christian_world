// api/products/route.ts
import { NextResponse, NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { Database, Json } from "@/lib/database.types";
import { uploadImage } from "@/lib/uploadImage";
import { supabase } from "@/lib/supabaseClient";
import { syncAllProducts } from "@/lib/syncProducts";

// -------------------------
// Type-safe error logging
// -------------------------
function logError(
  context: string,
  error: unknown,
  extra?: Record<string, unknown>
) {
  if (error instanceof Error) {
    console.error(`[API ERROR] ${context}:`, error.message, error.stack);
  } else {
    console.error(`[API ERROR] ${context}:`, error);
  }
  if (extra) {
    console.error(`[API ERROR] Extra info:`, extra);
  }
}

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

// -------------------------
// GET all products
// -------------------------
export async function GET(_req: NextRequest) {
  console.log("[GET] Fetching all products with sync");

  try {
    const products = await syncAllProducts();
    return NextResponse.json({ products });
  } catch (err) {
    logError("GET all products failed", err);
    return NextResponse.json(
      { error: "Internal server error", details: (err as Error).message },
      { status: 500 }
    );
  }
}

// ---------------- POST ----------------
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const name = formData.get("name")?.toString();
    if (!name) {
      return NextResponse.json({ message: "Name is required" }, { status: 400 });
    }

    const description = formData.get("description")?.toString() || null;
    const size = formData.get("size")?.toString() || null;
    const material = formData.get("material")?.toString() || null;
    const category = formData.get("category")?.toString() || null;
    const price = formData.get("price")
      ? parseFloat(formData.get("price") as string)
      : undefined;
    const quantity = formData.get("quantity")
      ? parseInt(formData.get("quantity") as string)
      : undefined;
    const tags = formData.get("tags")
      ? (formData.get("tags") as string).split(",")
      : [];
    const additional_info = formData.get("additional_info")
      ? (JSON.parse(formData.get("additional_info") as string) as Json)
      : null;

    // Generate slug if not provided
    const slug =
      formData.get("slug")?.toString() ||
      name.toLowerCase().replace(/\s+/g, "-");

    // ---------- MAIN IMAGE ----------
    let main_image: string | null = null;
    const mainImage = formData.get("main_image") as File | null;
    if (mainImage) {
      main_image = await uploadImage(mainImage, slug);
    }

    // ---------- SECONDARY IMAGES ----------
    const secondaryFiles = formData.getAll("secondary_images") as File[];
    const secondary_images: string[] = [];
    for (const file of secondaryFiles) {
      const uploaded = await uploadImage(file, slug);
      if (uploaded) secondary_images.push(uploaded);
    }

    // ---------- INSERT PRODUCT ----------
    const { data: inserted, error } = await supabase
      .from("products")
      .insert([
        {
          name,
          description,
          size,
          material,
          category,
          price: price ?? 0,
          quantity: quantity ?? 1,
          tags: tags.length > 0 ? tags : null,
          additional_info,
          slug,
          main_image,
          secondary_images: secondary_images.length > 0 ? secondary_images : null,
        },
      ])
      .select()
      .single();

    if (error || !inserted) {
      return NextResponse.json(
        { message: "Insert failed", details: error?.message },
        { status: 500 }
      );
    }

    // ---------- REVALIDATE PAGES ----------
    revalidatePath("/dashboard");
    revalidatePath("/products");

    return NextResponse.json({
      message: "Product added successfully",
      product: inserted,
    });
  } catch (err) {
    return NextResponse.json(
      { message: "Internal server error", details: (err as Error).message },
      { status: 500 }
    );
  }
}

// -------------------------
// Disable body parser for FormData
// -------------------------
export const config = { api: { bodyParser: false } };
