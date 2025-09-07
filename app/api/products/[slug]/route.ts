import { NextResponse, NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/lib/database.types";
import { uploadImage } from "@/lib/uploadImage";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type ProductRow = Database["public"]["Tables"]["products"]["Row"];



// ---------------- GET ----------------
export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let suggested: ProductRow[] = [];
  if (product.tags && product.tags.length > 0) {
    const { data: suggestedData } = await supabase
      .from("products")
      .select("*")
      .neq("slug", slug)
      .overlaps("tags", product.tags)
      .limit(4);

    suggested = suggestedData || [];
  }

  return NextResponse.json({ product, suggested });
}

// ---------------- DELETE ----------------
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const { error } = await supabase.from("products").delete().eq("slug", slug);

  if (error)
    return NextResponse.json(
      { message: "Internal server error", details: error.message },
      { status: 500 }
    );

  revalidatePath("/products");
  revalidatePath(`/products/${slug}`);

  return NextResponse.json({ message: "Deleted successfully" });
}

// ---------------- PUT ----------------
export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    const formData = await req.formData();

    const updates: Partial<ProductRow> = {
      name: (formData.get("name") as string) ?? undefined,
      description: (formData.get("description") as string) ?? undefined,
      size: (formData.get("size") as string) ?? undefined,
      material: (formData.get("material") as string) ?? undefined,
      category: (formData.get("category") as string) ?? undefined,
      price: formData.get("price") ? parseFloat(formData.get("price") as string) : undefined,
      quantity: formData.get("quantity") ? parseInt(formData.get("quantity") as string) : undefined,
      tags: formData.get("tags") ? (formData.get("tags") as string).split(",") : undefined,
      additional_info: formData.get("additional_info")
        ? JSON.parse(formData.get("additional_info") as string)
        : undefined,
    };

    // ---------- MAIN IMAGE ----------
    const mainImage = formData.get("main_image") as File | null;
    if (mainImage) {
      const uploadedMain = await uploadImage(mainImage, slug);
      if (uploadedMain) updates.main_image = uploadedMain;
    }

    // ---------- SECONDARY IMAGES ----------
    const existingSecondaryImages: string[] = formData.get("existing_secondary_images")
      ? JSON.parse(formData.get("existing_secondary_images") as string)
      : [];

    const secondaryFiles = formData.getAll("secondary_images") as File[];
    const uploadedSecondary: string[] = [];

    for (const file of secondaryFiles) {
      const uploadedUrl = await uploadImage(file, slug);
      if (uploadedUrl) uploadedSecondary.push(uploadedUrl);
    }

    updates.secondary_images = [...existingSecondaryImages, ...uploadedSecondary];

    // ---------- UPDATE DB ----------
    const { data: updated, error } = await supabase
      .from("products")
      .update(updates)
      .eq("slug", slug)
      .select()
      .single();

    if (error)
      return NextResponse.json(
        { message: "Internal server error", details: error.message },
        { status: 500 }
      );

    // ---------- REVALIDATE PAGES ----------
    revalidatePath("/dashboard");
    revalidatePath("/products");
    revalidatePath(`/products/${slug}`);

    return NextResponse.json({ message: "Updated successfully", product: updated });
  } catch (err) {
    return NextResponse.json(
      { message: "Internal server error", details: (err as Error).message },
      { status: 500 }
    );
  }
}

export const config = { api: { bodyParser: false } };