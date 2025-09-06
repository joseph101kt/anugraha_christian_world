// app/api/products/[slug]/reviews/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import type { Database } from "@/lib/database.types";
import { revalidatePath } from "next/cache";

type Review = {
  customer_name: string;
  rating: number;
  comment: string;
};

type Params = { slug: string };

// Runtime type guard
function isParams(params: unknown): params is Params {
  return (
    typeof params === "object" &&
    params !== null &&
    "slug" in params &&
    typeof (params as Record<string, unknown>).slug === "string"
  );
}

export async function POST(
  req: NextRequest,
  context: { params: unknown }
) {
  if (!isParams(context.params)) {
    return NextResponse.json(
      { error: "Invalid params: slug must be a string" },
      { status: 400 }
    );
  }

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
  } catch {
    return NextResponse.json(
      { error: "Failed to add review" },
      { status: 500 }
    );
  }
}
