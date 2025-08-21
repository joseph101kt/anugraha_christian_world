// app/api/products/route.ts

import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

import { supabase } from '@/lib/supabaseClient'; // Supabase client
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
 * Helper → Process and upload image to local filesystem and Supabase Storage.
 */
async function processAndUploadImage(
  file: File,
  productName: string
): Promise<{ localPath: string; supabasePath: string }> {
  const fileId = uuidv4();
  const seoSlug = createSeoSlug(productName);

  // Paths will now be dynamic based on success of sharp processing
  let webpFileName = '';
  let localPath = '';
  let supabasePath = '';
  let bufferToUpload: Buffer;
  let contentType = file.type;
  
  try {
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const processedBuffer = await sharp(fileBuffer)
      .webp({ quality: 80 })
      .toBuffer();

    // If sharp is successful, use the processed buffer and webp paths
    webpFileName = `${seoSlug}-${fileId}.webp`;
    localPath = path.join(process.cwd(), 'public', 'images', webpFileName);
    supabasePath = `products/${webpFileName}`;
    bufferToUpload = processedBuffer;
    contentType = 'image/webp';

    // Save the processed image locally
    await fs.mkdir(path.dirname(localPath), { recursive: true });
    await fs.writeFile(localPath, bufferToUpload);

  } catch (sharpError) {
    console.warn('Sharp processing failed. Uploading original file instead.');
    // If sharp fails, use the original file and its properties
    const originalFileName = `${seoSlug}-${fileId}${path.extname(file.name)}`;
    localPath = path.join(process.cwd(), 'public', 'images', originalFileName);
    supabasePath = `products/${originalFileName}`;
    bufferToUpload = Buffer.from(await file.arrayBuffer());
    contentType = file.type;

    // Save the original file locally as a fallback
    await fs.mkdir(path.dirname(localPath), { recursive: true });
    await fs.writeFile(localPath, bufferToUpload);
  }

  // Upload the chosen buffer to Supabase Storage
  const { error } = await supabase.storage
    .from('product-images')
    .upload(supabasePath, bufferToUpload, {
      contentType,
      upsert: false,
    });

  if (error) {
    console.error('Supabase Storage upload failed:', error.message);
    throw new Error(`Supabase Storage upload failed: ${error.message}`);
  }

  // The localPath returned will match the one saved (either processed or original)
  return { localPath: `/images/${path.basename(localPath)}`, supabasePath };
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

    // Build product object
    // Generate a proper UUID for the database's ID column
    const productId = uuidv4();
    const productSlug = createSeoSlug(name);
    
    // Process and upload images
    let mainImage, secondaryImages;
    try {
      mainImage = await processAndUploadImage(mainImageFile, name);
      secondaryImages = await Promise.all(
        secondaryImagesFiles.map((file) => processAndUploadImage(file, name))
      );
    } catch (imageError) {
      console.error('Image processing step failed.', imageError);
      return NextResponse.json({
        message: 'Failed to process images.',
        details: (imageError as Error).message,
      }, { status: 500 });
    }

    const newProduct: Product = {
      id: productSlug, // Store slug as ID for local JSON consistency
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
    try {
      const filePath = path.join(process.cwd(), 'data', 'products.json');
      let products: Product[] = [];
      try {
        const jsonData = await fs.readFile(filePath, 'utf8');
        products = JSON.parse(jsonData);
      } catch (err) {
        if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
          throw err;
        }
      }
      await fs.writeFile(
        filePath,
        JSON.stringify(products.concat(newProduct), null, 2)
      );
    } catch (localFileError) {
      console.error('Failed to save product to local JSON file:', localFileError);
      return NextResponse.json({
        message: 'Failed to save product locally.',
        details: (localFileError as Error).message,
      }, { status: 500 });
    }

    /**
     * 2️⃣ Save remotely → Supabase Postgres
     */
    try {
      const { error: dbError } = await supabase.from('products').insert([
        {
          id: productId, // Use the proper UUID for the ID column
          slug: productSlug, // Use the SEO-friendly slug for the slug column
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
        throw new Error(`Supabase DB insert failed: ${dbError.message}`);
      }
    } catch (dbError) {
      console.error('Database insertion step failed.', dbError);
      return NextResponse.json({
        message: 'Failed to insert product into database.',
        details: (dbError as Error).message,
      }, { status: 500 });
    }

    // Invalidate cache + revalidate using the slug
    invalidateProductsCache();
    revalidatePath(`/products/${productSlug}`);
    revalidatePath('/products');

    return NextResponse.json({
      message: 'Product added successfully!',
      product: newProduct,
    }, { status: 201 });

  } catch (error) {
    console.error('Unhandled error in POST /api/products:', error);
    return NextResponse.json(
      {
        message: 'Internal server error',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
