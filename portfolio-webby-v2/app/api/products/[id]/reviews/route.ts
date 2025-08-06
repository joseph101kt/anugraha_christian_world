// app/api/products/[id]/reviews/route.ts

import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { Product, Review } from '@/lib/types';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'products.json');

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const productId = params.id;

  try {
    const body = await request.json();

    // Validate review structure
    const newReview: Review = {
      customer_name: body.customer_name,
      rating: body.rating,
      comment: body.comment,
    };

    // Read products from file
    const fileData = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    const products: Product[] = JSON.parse(fileData);

    // Find the product
    const productIndex = products.findIndex((p) => p.id === productId);

    if (productIndex === -1) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Append the new review
    products[productIndex].reviews.push(newReview);

    // Save updated data back to file
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(products, null, 2), 'utf-8');

    return NextResponse.json({ message: 'Review added successfully', review: newReview });
  } catch (error) {
    console.error('Error adding review:', error);
    return NextResponse.json({ error: 'Failed to add review' }, { status: 500 });
  }
}
