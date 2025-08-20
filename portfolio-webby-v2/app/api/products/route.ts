// app/api/products/route.ts

import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

import { supabase } from '@/lib/supabaseClient'; // ✅ Supabase client
import { Database, Json } from "@/lib/database.types";

import { Product, AdditionalInfoItem } from '@/lib/types';
import {
  getProductsCache,
  setProductsCache,
  invalidateProductsCache,
} from '@/lib/cache';

/**
 * Utility: Create an SEO-friendly slug from product name
 */
function createSeoSlug(name: string): string {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug;
}

/**
 * GET handler → Returns products from local cache or products.json
 */
export async function GET() {
  let allProducts: Product[] | null = getProductsCache();

  if (!allProducts) {
    try {
      const filePath = path.join(process.cwd(), 'data', 'products.json');
      const jsonData = await fs.readFile(filePath, 'utf8');
      allProducts = JSON.parse(jsonData);
      setProductsCache(allProducts!);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        allProducts = [];
        setProductsCache([]);
      } else {
        return NextResponse.json(
          {
            message: 'Internal Server Error',
            details: 'Failed to read or parse products data.',
            error: (error as Error).message,
          },
          { status: 500 }
        );
      }
    }
  }

  return NextResponse.json(allProducts || []);
}

/**
 * Helper → Upload image to local /public/images + Supabase Storage
 */
async function processAndUploadImage(
  file: File,
  productName: string
): Promise<{ localPath: string; supabasePath: string }> {
  const fileId = uuidv4();
  const seoSlug = createSeoSlug(productName);
  const webpFileName = `${seoSlug}-${fileId}.webp`;

  // Paths
  const localPath = path.join(process.cwd(), 'public', 'images', webpFileName);
  const supabasePath = `products/${webpFileName}`;

  // Convert with sharp
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const processedBuffer = await sharp(fileBuffer)
    .webp({ quality: 80 })
    .toBuffer();

  // Save locally
  await fs.mkdir(path.dirname(localPath), { recursive: true });
  await fs.writeFile(localPath, processedBuffer);

  // Upload to Supabase Storage
  const { error } = await supabase.storage
    .from('product-images')
    .upload(supabasePath, processedBuffer, {
      contentType: 'image/webp',
      upsert: false,
    });

  if (error) {
    console.error('Supabase Storage upload failed:', error.message);
    throw error;
  }

  return { localPath: `/images/${webpFileName}`, supabasePath };
}

/**
 * POST handler → Adds new product to BOTH local JSON + Supabase
 */
export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    // Extract fields
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const tagsString = formData.get('tags') as string;
    const mainImageFile = formData.get('main_image') as File;
    const priceString = formData.get('price') as string;
    const sizeString = formData.get('size') as string;
    const quantityString = formData.get('quantity') as string;
    const material = formData.get('material') as string;
    const category = formData.get('category') as string;
    const additionalInfo = JSON.parse(
      (formData.get('additional_info') as string) || '[]'
    );
    const secondaryImagesFiles = formData.getAll('secondary_images') as File[];

    // Process images (both local + supabase)
    const mainImage = await processAndUploadImage(mainImageFile, name);
    const secondaryImages = await Promise.all(
      secondaryImagesFiles.map((file) => processAndUploadImage(file, name))
    );

    // Build product object
    const seoSlug = createSeoSlug(name);
    const uniqueId = `${seoSlug}-${uuidv4().substring(0, 8)}`;
    const newProduct: Product = {
      id: uniqueId,
      name,
      description,
      main_image: mainImage.localPath, // local path for Next.js
      secondary_images: secondaryImages.map((img) => img.localPath),
      tags: tagsString
        ? tagsString.split(',').map((tag) => tag.trim().toLowerCase())
        : [],
      price: parseFloat(priceString),
      size: sizeString,
      quantity: parseInt(quantityString),
      reviews: [],
      material,
      category,
      additional_info: additionalInfo,
    };

    /**
     * 1️⃣ Save locally → products.json
     */
    const filePath = path.join(process.cwd(), 'data', 'products.json');
    let products: Product[] = [];
    try {
      const jsonData = await fs.readFile(filePath, 'utf8');
      products = JSON.parse(jsonData);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err;
    }
    await fs.writeFile(
      filePath,
      JSON.stringify(products.concat(newProduct), null, 2)
    );

    /**
     * 2️⃣ Save remotely → Supabase Postgres
     */
    const { error: dbError } = await supabase.from('products').insert([
      {
        id: uniqueId,
        name,
        description,
        main_image: mainImage.supabasePath, // supabase path
        secondary_images: secondaryImages.map((img) => img.supabasePath),
        tags: newProduct.tags,
        price: newProduct.price,
        size: newProduct.size,
        quantity: newProduct.quantity,
        reviews: [],
        material: newProduct.material,
        category: newProduct.category,
      additional_info: newProduct.additional_info as unknown as Json,
      },
    ]);

    if (dbError) {
      console.error('Supabase DB insert failed:', dbError.message);
      throw dbError;
    }

    // Invalidate cache + revalidate
    invalidateProductsCache();
    revalidatePath(`/products/${newProduct.id}`);
    revalidatePath('/products');

    return NextResponse.json({
      message: 'Product added successfully!',
      product: newProduct,
    });
  } catch (error) {
    console.error('POST /api/products failed:', error);
    return NextResponse.json(
      {
        message: 'Internal server error',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
