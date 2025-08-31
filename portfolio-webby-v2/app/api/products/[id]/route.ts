// app/api/products/[id]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { Product, AdditionalInfoItem } from '@/lib/types';
import { getProductsCache, setProductsCache, invalidateProductsCache } from '@/lib/cache';

// --- GET ---
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let allProducts: Product[];
  const cached = getProductsCache();
  if (cached) {
    allProducts = cached;
  } else {
    try {
      const jsonData = await fs.readFile(path.join(process.cwd(), 'data/products.json'), 'utf8');
      allProducts = JSON.parse(jsonData);
      setProductsCache(allProducts);
    } catch (err) {
      console.error(err);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }

  const product = allProducts.find((p) => p.id === id);
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  const suggested = allProducts
    .filter((p) => p.id !== product.id && product.tags.some((t) => p.tags.includes(t)))
    .slice(0, 4);

  return NextResponse.json({ product, suggested });
}

// --- DELETE ---
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const filePath = path.join(process.cwd(), 'data/products.json');

  try {
    const jsonData = await fs.readFile(filePath, 'utf8');
    const products: Product[] = JSON.parse(jsonData);
    const product = products.find((p) => p.id === id);
    if (!product) return NextResponse.json({ message: 'Product not found' }, { status: 404 });

    // Supabase image deletion functions are removed
    // since we're no longer using Supabase Storage.

    const updatedProducts = products.filter((p) => p.id !== id);
    await fs.writeFile(filePath, JSON.stringify(updatedProducts, null, 2));
    invalidateProductsCache();
    revalidatePath('/products');
    revalidatePath(`/products/${id}`);

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// --- PUT ---
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const formData = await req.formData();
    const filePath = path.join(process.cwd(), 'data/products.json');
    const jsonData = await fs.readFile(filePath, 'utf8');
    const products: Product[] = JSON.parse(jsonData);
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return NextResponse.json({ message: 'Product not found' }, { status: 404 });

    const existing = products[index];
    const newName = (formData.get('name') as string) || existing.name;

    // --- Image handling is removed ---
    // The code assumes images are not being updated or managed.
    // mainImagePath and secondaryPaths will remain as existing values.
    const mainImagePath = existing.main_image;
    const secondaryPaths = [...existing.secondary_images];

    // --- Parse additional info ---
    let additionalInfo: AdditionalInfoItem[] = [];
    const additionalStr = formData.get('additional_info') as string;
    if (additionalStr) {
      try {
        additionalInfo = JSON.parse(additionalStr);
      } catch {
        return NextResponse.json({ message: 'Invalid format for additional info.' }, { status: 400 });
      }
    }

    // --- Updated product ---
    const updated: Product = {
      ...existing,
      name: newName,
      description: (formData.get('description') as string) || existing.description,
      tags: ((formData.get('tags') as string) || '').split(',').map((t) => t.trim()) || existing.tags,
      main_image: mainImagePath,
      secondary_images: secondaryPaths,
      size: (formData.get('size') as string) || existing.size,
      quantity: parseInt(formData.get('quantity') as string, 10) || existing.quantity,
      price: parseFloat(formData.get('price') as string) || existing.price,
      material: (formData.get('material') as string) || existing.material,
      category: (formData.get('category') as string) || existing.category,
      additional_info: additionalInfo,
      reviews: existing.reviews,
    };

    products[index] = updated;
    await fs.writeFile(filePath, JSON.stringify(products, null, 2));

    invalidateProductsCache();
    revalidatePath('/dashboard');
    revalidatePath('/products');
    revalidatePath(`/products/${id}`);

    return NextResponse.json({ message: 'Product updated successfully', product: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Internal server error', details: (err as Error).message }, { status: 500 });
  }
}

// --- Config for FormData ---
export const config = { api: { bodyParser: false } };