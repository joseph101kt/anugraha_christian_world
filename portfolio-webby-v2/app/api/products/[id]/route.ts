// app/api/products/[id]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';
import sharp from 'sharp';
import { Product, AdditionalInfoItem } from '@/lib/types';
import { getProductsCache, setProductsCache, invalidateProductsCache } from '@/lib/cache';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@supabase/supabase-js';
import { Database, Json } from '@/lib/database.types';

// --- Supabase client ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// --- Helpers ---
function createSeoSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function processAndSaveImage(file: File, productName: string): Promise<string> {
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const seoSlug = createSeoSlug(productName);
  const fileId = uuidv4();
  
  let bufferToUpload: Buffer;
  let filename: string;
  let contentType: string;

  try {
    const convertedBuffer = await sharp(fileBuffer).webp({ quality: 80 }).toBuffer();
    
    // If successful, use the converted buffer and .webp filename
    bufferToUpload = convertedBuffer;
    filename = `${seoSlug}-${fileId}.webp`;
    contentType = 'image/webp';

  } catch (sharpError) {
    // If sharp fails, use the original buffer and filename
    console.warn('Sharp processing failed, uploading original file instead.');
    bufferToUpload = fileBuffer;
    filename = `${seoSlug}-${fileId}.${file.name.split('.').pop()}`;
    contentType = file.type;
  }

  // Upload the chosen buffer
  const { error } = await supabase.storage
    .from('product-images')
    .upload(filename, bufferToUpload, {
      contentType,
      upsert: true,
    });
  
  if (error) {
    console.error('Supabase image upload failed:', error);
    throw new Error('Failed to upload image file to Supabase.');
  }

  const { data: publicUrlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(filename);
  
  if (!publicUrlData) {
      throw new Error('Failed to get public URL for the uploaded file.');
  }

  return publicUrlData.publicUrl;
}
async function deleteImagesFromSupabase(imageUrls: string[]) {
  await Promise.all(
    imageUrls.map(async (url) => {
      if (!url) return;
      try {
        const pathname = new URL(url).pathname;
        const filename = pathname.split('/').pop();
        if (!filename) return;
        const { error } = await supabase.storage.from('product-images').remove([filename]);
        if (error) console.error(`Failed to delete image ${filename}:`, error);
      } catch (err) {
        console.error('Error deleting image URL:', url, err);
      }
    })
  );
}

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

    await deleteImagesFromSupabase([product.main_image, ...product.secondary_images]);

    const updatedProducts = products.filter((p) => p.id !== id);
    await fs.writeFile(filePath, JSON.stringify(updatedProducts, null, 2));
    invalidateProductsCache();
    revalidatePath('/products');
    revalidatePath(`/products/${id}`);

    // Supabase DB deletion: Change .eq('id', id) to .eq('slug', id) to query the correct column
    const { error: dbError } = await supabase.from('products').delete().eq('slug', id);
    if (dbError) console.error('Supabase deletion failed:', dbError);

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

    // --- Handle images ---
    const newMainFile = formData.get('main_image') as File | null;
    const newSecondaryFiles = formData.getAll('secondary_images') as File[];

    let mainImagePath = existing.main_image;
    let secondaryPaths = [...existing.secondary_images];
    const imagesToDelete: string[] = [];

    if (newMainFile && newMainFile.size > 0) {
      imagesToDelete.push(existing.main_image);
      mainImagePath = await processAndSaveImage(newMainFile, newName);
    }

    if (newSecondaryFiles.length && newSecondaryFiles.some((f) => f.size > 0)) {
      imagesToDelete.push(...existing.secondary_images);
      secondaryPaths = await Promise.all(
        newSecondaryFiles.map((f) => processAndSaveImage(f, newName))
      );
    } else if (formData.get('delete_secondary_images') === 'true') {
      imagesToDelete.push(...existing.secondary_images);
      secondaryPaths = [];
    }

    await deleteImagesFromSupabase(imagesToDelete);

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

    // Supabase update: Change .eq('id', id) to .eq('slug', id) to query the correct column
    const { error: dbError } = await supabase
      .from('products')
      .update({
        name: updated.name,
        description: updated.description,
        main_image: updated.main_image,
        secondary_images: updated.secondary_images,
        tags: updated.tags,
        size: updated.size,
        quantity: updated.quantity,
        price: updated.price,
        material: updated.material,
        category: updated.category,
        additional_info: updated.additional_info as unknown as Json,
      })
      .eq('slug', id); // Key change: update by 'slug'

    if (dbError) console.error('Supabase update failed:', dbError);

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
