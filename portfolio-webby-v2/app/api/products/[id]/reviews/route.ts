// app/api/products/[id]/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { Product, Review } from '@/lib/types';
import { revalidatePath } from 'next/cache';

// Path to local JSON
const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'products.json');

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: productSlug } = await context.params;

  try {
    const body = await request.json();

    const newReview: Review = {
      customer_name: body.customer_name,
      rating: body.rating,
      comment: body.comment,
    };

    // --- Update local JSON ---
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

    // --- Revalidate pages ---
    // Note: Since Supabase isn't used, the custom invalidateProductsCache() is removed
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