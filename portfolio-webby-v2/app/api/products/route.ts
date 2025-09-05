import { NextResponse, NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { Database, Json } from "@/lib/database.types";

// -------------------------
// Supabase client
// -------------------------
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

// -------------------------
// GET products
// -------------------------
export async function GET(
  _req: NextRequest,
  { params }: { params?: { slug?: string } } = {}
) {
  const slug = params?.slug;
  console.log("[GET] Fetching products", slug ? `slug=${slug}` : "(all)");

  try {
    if (slug) {
      // Fetch single product by slug
      const { data: product, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error) {
        logError("GET product query failed", error, { slug });
        return NextResponse.json({ error: "Database error" }, { status: 500 });
      }

      if (!product) {
        console.warn("[GET] Product not found for slug:", slug);
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      // Suggested products
      let suggested: typeof product[] = [];
      if (product.tags && product.tags.length > 0) {
        try {
          const tags = product.tags.filter(Boolean) as string[];
          const { data, error: suggestedError } = await supabase
            .from("products")
            .select("*")
            .contains("tags", tags)
            .neq("slug", slug)
            .limit(4);

          if (suggestedError) {
            logError("GET suggested products query failed", suggestedError, {
              slug,
              tags,
            });
          }

          suggested = data ?? [];
        } catch (err) {
          logError("Unexpected error fetching suggested products", err, { slug });
        }
      }

      return NextResponse.json({ product, suggested });
    } else {
      // Fetch all products
      const { data: products, error } = await supabase.from("products").select("*");
      if (error) {
        logError("GET all products query failed", error);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
      }

      return NextResponse.json({ products });
    }
  } catch (err) {
    logError("GET endpoint unexpected error", err, { slug });
    return NextResponse.json(
      { error: "Internal server error", details: (err as Error).message },
      { status: 500 }
    );
  }
}

// -------------------------
// DELETE product by slug
// -------------------------
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  console.log("[DELETE] Deleting product with slug:", slug);

  try {
    const { error } = await supabase.from("products").delete().eq("slug", slug);

    if (error) {
      logError("DELETE query failed", error, { slug });
      return NextResponse.json(
        { message: "Internal server error", details: error.message },
        { status: 500 }
      );
    }

    revalidatePath("/products");
    revalidatePath(`/products/${slug}`);

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (err) {
    logError("DELETE endpoint unexpected error", err, { slug });
    return NextResponse.json(
      { message: "Internal server error", details: (err as Error).message },
      { status: 500 }
    );
  }
}

// -------------------------
// PUT (update) product by slug
// -------------------------
export async function PUT(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  console.log("[PUT] Updating product with slug:", slug);

  try {
    const formData = await req.formData();

    const name = formData.get("name")?.toString();
    const description = formData.get("description")?.toString() || null;

    if (!name) {
      console.warn("[PUT] Missing required 'name' field");
      return NextResponse.json({ message: "Name is required" }, { status: 400 });
    }

    const updates: Partial<Database["public"]["Tables"]["products"]["Row"]> = {
      name,
      description,
    };

    console.log("[PUT] Updates object:", updates);

    const { data: updated, error } = await supabase
      .from("products")
      .update(updates)
      .eq("slug", slug)
      .select("*")
      .single();

    if (error) {
      logError("PUT update query failed", error, { slug, updates });
      return NextResponse.json(
        { message: "Update failed", details: error.message },
        { status: 400 }
      );
    }

    if (!updated) {
      console.warn("[PUT] Update returned no data", { slug, updates });
      return NextResponse.json(
        { message: "Update failed, no data returned" },
        { status: 400 }
      );
    }

    revalidatePath("/dashboard");
    revalidatePath("/products");
    revalidatePath(`/products/${slug}`);

    console.log("[PUT] Updated successfully", updated);

    return NextResponse.json({
      message: "Updated successfully",
      product: updated,
    });
  } catch (err) {
    logError("PUT endpoint unexpected error", err, { slug });
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
