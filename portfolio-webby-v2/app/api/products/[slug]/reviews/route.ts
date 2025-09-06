// app/api/products/[slug]/reviews/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import type { Database } from "@/lib/database.types";
import { revalidatePath } from "next/cache";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type Review = {
  customer_name: string;
  rating: number;
  comment: string;
};

// Runtime type guard for params
function assertParams(
  params: unknown
): asserts params is { slug: string } {
  if (
    !params ||
    typeof (params as any).slug !== "string" ||
    !(params as any).slug.trim()
  ) {
    throw new Error("Invalid params: slug must be a string");
  }
}

export async function POST(req: NextRequest, context: { params: unknown }) {
  assertParams(context.params); // ✅ runtime check
  const { slug } = context.params;

  try {
    const body = (await req.json()) as Partial<Review>;

    if (!body.customer_name || !body.rating || !body.comment) {
      return NextResponse.json(
        { error: "customer_name, rating, and comment are required" },
        { status: 400 }
      );
    }

    const newReview: Review = {
      customer_name: body.customer_name,
      rating: body.rating,
      comment: body.comment,
    };

    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("reviews")
      .eq("slug", slug)
      .single();

    if (fetchError || !product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const existingReviews = Array.isArray(product.reviews)
      ? (product.reviews as Review[])
      : [];

    const updatedReviews = [...existingReviews, newReview];

    const { error: updateError } = await supabase
      .from("products")
      .update({ reviews: updatedReviews })
      .eq("slug", slug);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update reviews" },
        { status: 500 }
      );
    }

    revalidatePath(`/products/${slug}`);
    revalidatePath("/products");

    return NextResponse.json({
      message: "Review added successfully",
      review: newReview,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to add review" },
      { status: 500 }
    );
  }
}
