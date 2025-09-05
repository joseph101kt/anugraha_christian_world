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
  console.log('GET /api/products called');
  let allProducts: Product[] | null = getProductsCache();

  

  if (!allProducts) {
    try {
      const filePath = path.join(process.cwd(), 'data', 'products.json');
      const jsonData = await fs.readFile(filePath, 'utf8');
      allProducts = JSON.parse(jsonData);
      setProductsCache(allProducts!);
      console.log(`Loaded ${allProducts!.length} products from local JSON`);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        allProducts = [];
        setProductsCache([]);
        console.warn('products.json not found, returning empty array');
      } else {
        console.error('Failed to read products.json:', error);
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

  return NextResponse.json(allProducts ?? []);
}

/**
 * Helper → Process and upload image to local filesystem and Supabase Storage.
 */

async function processAndUploadImage(
  file: File,
  productName: string
): Promise<{ localPath: string; supabasePath: string }> {
  try {
    if (!file) {
      throw new Error("No file provided to processAndUploadImage.");
    }
    if (!productName || productName.trim().length === 0) {
      throw new Error("Invalid product name.");
    }

    const fileId: string = uuidv4();
    const seoSlug: string = createSeoSlug(productName);

    console.log(`[INFO] Processing image: ${file.name} for product: "${productName}"`);
    console.log(`[DEBUG] File type: ${file.type}, File size: ${file.size} bytes`);

    // Step 1: Convert File -> Buffer
    let bufferToUpload: Buffer;
    try {
      bufferToUpload = Buffer.from(await file.arrayBuffer());
      console.log(`[DEBUG] Converted file to buffer. Size: ${bufferToUpload.byteLength} bytes`);
    } catch (err) {
      console.error("[ERROR] Failed converting File to Buffer:", err);
      throw new Error("Could not convert file to buffer.");
    }

    // Step 2: Ensure extension is preserved
    const extension: string = path.extname(file.name) || "";
    if (!extension) {
      console.warn("[WARN] File has no extension. Defaulting to empty string.");
    }
    const finalFileName: string = `${seoSlug}-${fileId}${extension}`;
    console.log(`[DEBUG] Final file name generated: ${finalFileName}`);

    // Step 3: Paths
    const localPath: string = path.join(process.cwd(), "public", "images", finalFileName);
    const supabasePath: string = `products/${finalFileName}`;
    const contentType: string = file.type || "application/octet-stream";

    // Step 4: Save locally
    try {
      await fs.mkdir(path.dirname(localPath), { recursive: true });
      await fs.writeFile(localPath, bufferToUpload);
      console.log(`[INFO] Saved original image locally at: ${localPath}`);
    } catch (err) {
      console.error("[ERROR] Failed saving file locally:", err);
      throw new Error(`Failed to save file locally at ${localPath}`);
    }

    // Step 5: Upload to Supabase
    try {
      const { error } = await supabase.storage
        .from("product-images")
        .upload(supabasePath, bufferToUpload, {
          contentType,
          upsert: false,
        });

      if (error) {
        console.error("[ERROR] Supabase Storage upload failed:", error.message);
        throw new Error(`Supabase upload failed: ${error.message}`);
      }
      console.log(`[INFO] Uploaded image to Supabase at: ${supabasePath}`);
    } catch (err) {
      console.error("[ERROR] Unexpected issue during Supabase upload:", err);
      throw new Error("Supabase upload encountered an unexpected error.");
    }

    // Final return
    const localPublicPath = `/images/${path.basename(localPath)}`;
    console.log(`[SUCCESS] Image processed. Local: ${localPublicPath}, Supabase: ${supabasePath}`);

    return { localPath: localPublicPath, supabasePath };
  } catch (err) {
    console.error("[FATAL] processAndUploadImage failed:", err);
    throw err; // Re-throw so the caller can handle it
  }
}


/**
 * POST handler → Adds new product to BOTH local JSON + Supabase
 */
export async function POST(req: Request) {
  console.log('POST /api/products called');
  try {
    const formData = await req.formData();
    console.log('FormData keys:', Array.from(formData.keys()));

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const tagsString = formData.get('tags') as string;
    const mainImageFile = formData.get('main_image') as File;
    if (!mainImageFile || !(mainImageFile instanceof File)) {
      return NextResponse.json({ message: 'Main image is required' }, { status: 400 });
    }
    const priceString = formData.get('price') as string;
    const sizeString = formData.get('size') as string;
    const quantityString = formData.get('quantity') as string;
    const material = formData.get('material') as string;
    const category = formData.get('category') as string;
let additionalInfo: AdditionalInfoItem[] = [];
try {
  const raw = formData.get('additional_info') as string;
  additionalInfo = raw ? JSON.parse(raw) : [];
} catch (err) {
  return NextResponse.json({ message: 'Invalid additional_info JSON' }, { status: 400 });
}
    const secondaryImagesFiles = formData.getAll('secondary_images') as File[];

    console.log({ name, description, tagsString, mainImageFile, priceString });

    const productId = uuidv4();
    const productSlug = createSeoSlug(name);

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
      id: productSlug,
      name,
      description,
      main_image: mainImage.localPath,
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

    // Save locally
    try {
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
      console.log(`Saved product locally. Total products: ${products.length + 1}`);
    } catch (localFileError) {
      console.error('Failed to save product to local JSON file:', localFileError);
      return NextResponse.json({
        message: 'Failed to save product locally.',
        details: (localFileError as Error).message,
      }, { status: 500 });
    }

    // Save remotely → Supabase Postgres
    try {
      console.log('Inserting product into Supabase DB...');
      const { error: dbError } = await supabase.from('products').insert([
        {
          id: productId,
          slug: productSlug,
          name,
          description,
          main_image: mainImage.supabasePath,
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
      console.log('Inserted product into Supabase DB successfully.');
    } catch (dbError) {
      console.error('Database insertion step failed.', dbError);
      return NextResponse.json({
        message: 'Failed to insert product into database.',
        details: (dbError as Error).message,
      }, { status: 500 });
    }

    invalidateProductsCache();
    revalidatePath(`/products/${productSlug}`);
    revalidatePath('/products');

    return NextResponse.json({
      message: 'Product added successfully!',
      product: newProduct,
    }, { status: 201 });

  } catch (error) {
    console.error('Unhandled error in POST /api/products:', error);
    return NextResponse.json({
      message: 'Internal server error',
      details: error instanceof Error ? error.stack || error.message : String(error),
    }, { status: 500 });
  }
}
