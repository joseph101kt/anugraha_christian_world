import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

type Product = {
  id: string;
  title: string;
  description?: string;
  price?: number;
  tags?: string[] | string; // Allow array or comma-separated string
};

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'products.json');
    const data = fs.readFileSync(filePath, 'utf-8');
    const products: Product[] = JSON.parse(data);

    const tagSet = new Set<string>();

    for (const product of products) {
      let tagsArray: string[] = [];

      if (Array.isArray(product.tags)) {
        tagsArray = product.tags;
      } else if (typeof product.tags === 'string') {
        tagsArray = product.tags.split(',').map(t => t.trim());
      }

      tagsArray.forEach(tag => {
        if (tag) {
          tagSet.add(tag);
        }
      });
    }

    const uniqueTags: string[] = Array.from(tagSet).sort();

    return NextResponse.json({ tags: uniqueTags });
  } catch (error) {
    console.error('Error loading tags:', error);
    return NextResponse.json({ tags: [] }, { status: 500 });
  }
}
