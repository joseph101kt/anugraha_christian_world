// app/api/products/[id]/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { Product, Review } from '@/lib/types';
import { createClient } from '@supabase/supabase-js';
import { invalidateProductsCache } from '@/lib/cache';
import { revalidatePath } from 'next/cache';

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Path to local JSON
const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'products.json');

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  // Use a more descriptive name, since the URL segment is the slug
  const { id: productSlug } = context.params;

  try {
    const body = await request.json();

    // Validate review structure
    const newReview: Review = {
      customer_name: body.customer_name,
      rating: body.rating,
      comment: body.comment,
    };

    // --- Update local JSON ---
    // The local JSON uses 'id' as the unique slug, which is fine here
    const fileData = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    const products: Product[] = JSON.parse(fileData);
    const productIndex = products.findIndex((p) => p.id === productSlug);

    if (productIndex === -1) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (!Array.isArray(products[productIndex].reviews)) {
      products[productIndex].reviews = [];
    }

    products[productIndex].reviews.push(newReview);
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(products, null, 2), 'utf-8');

    // --- Update Supabase ---
    // Change .eq('id', productId) to .eq('slug', productSlug) to match the database
    const { data: existing, error: fetchError } = await supabase
      .from('products')
      .select('reviews')
      .eq('slug', productSlug) // Key change: query by 'slug'
      .single();

    if (fetchError) {
      console.error('Supabase fetch failed:', fetchError);
    } else {
      const updatedReviews = Array.isArray(existing?.reviews)
        ? [...existing.reviews, newReview]
        : [newReview];

      const { error: updateError } = await supabase
        .from('products')
        .update({ reviews: updatedReviews })
        .eq('slug', productSlug); // Key change: update by 'slug'

      if (updateError) console.error('Supabase update failed:', updateError);
    }

    // --- Invalidate cache + revalidate pages ---
    invalidateProductsCache();
    revalidatePath(`/products/${productSlug}`);
    revalidatePath('/products');

    return NextResponse.json({
      message: 'Review added successfully',
      review: newReview,
    });
  } catch (error) {
    console.error('Error adding review:', error);
    return NextResponse.json({ error: 'Failed to add review' }, { status: 500 });
  }
}
