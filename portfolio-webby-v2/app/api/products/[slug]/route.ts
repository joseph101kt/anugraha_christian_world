import { NextResponse, NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/lib/database.types";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

// ✅ GET by slug (Supabase only)
export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Suggested products: overlap on at least one tag, exclude current
  let suggested: ProductRow[] = [];
  if (product.tags && product.tags.length > 0) {
    const { data: suggestedData } = await supabase
      .from("products")
      .select("*")
      .neq("slug", slug)
      .overlaps("tags", product.tags) // Postgres array overlap
      .limit(4);

    suggested = suggestedData || [];
  }

  return NextResponse.json({ product, suggested });
}

// ✅ DELETE by slug (Supabase only)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  const { error } = await supabase.from("products").delete().eq("slug", slug);

  if (error) {
    return NextResponse.json(
      { message: "Internal server error", details: error.message },
      { status: 500 }
    );
  }

  revalidatePath("/products");
  revalidatePath(`/products/${slug}`);

  return NextResponse.json({ message: "Deleted successfully" });
}

// ✅ PUT by slug (Supabase only)
export async function PUT(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  try {
    const formData = await req.formData();

    const updates: Partial<ProductRow> = {
      name: (formData.get("name") as string) ?? undefined,
      description: (formData.get("description") as string) ?? undefined,
    };

    const { data: updated, error } = await supabase
      .from("products")
      .update(updates)
      .eq("slug", slug)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { message: "Internal server error", details: error.message },
        { status: 500 }
      );
    }

    revalidatePath("/dashboard");
    revalidatePath("/products");
    revalidatePath(`/products/${slug}`);

    return NextResponse.json({
      message: "Updated successfully",
      product: updated,
    });
  } catch (err) {
    return NextResponse.json(
      { message: "Internal server error", details: (err as Error).message },
      { status: 500 }
    );
  }
}

export const config = { api: { bodyParser: false } };
