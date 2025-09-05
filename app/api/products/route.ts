import { NextResponse, NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { Database, Json } from "@/lib/database.types";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ✅ GET by slug
// ✅ GET by slug
export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  // fetch product
  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let suggested: { additional_info: Json | null; category: string | null; created_at: string | null; description: string | null; id: string; main_image: string | null; material: string | null; name: string; price: number; quantity: number | null; reviews: Json | null; secondary_images: string[] | null; size: string | null; slug: string | null; tags: string[] | null; uuid: string; }[] = [];
  if (product.tags && product.tags.length > 0) {
    const { data } = await supabase
      .from("products")
      .select("*")
      .contains("tags", product.tags as string[]) // ✅ cast, guaranteed not null here
      .neq("slug", slug)
      .limit(4);

    suggested = data ?? [];
  }

  return NextResponse.json({ product, suggested });
}


// ✅ DELETE by slug
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

// ✅ PUT by slug
export async function PUT(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  try {
    const formData = await req.formData();

    const updates: Partial<Database["public"]["Tables"]["products"]["Row"]> = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
    };

    const { data: updated, error } = await supabase
      .from("products")
      .update(updates)
      .eq("slug", slug)
      .select("*")
      .single();

    if (error || !updated) {
      return NextResponse.json(
        { message: "Update failed", details: error?.message },
        { status: 400 }
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
