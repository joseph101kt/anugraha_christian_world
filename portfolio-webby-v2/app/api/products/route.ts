// app/api/products/route.ts

import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { Product, AdditionalInfoItem } from '@/lib/types';
import { getProductsCache, setProductsCache, invalidateProductsCache } from '@/lib/cache';

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
 * Helper → Process and save image to local filesystem
 */
async function processAndSaveImageLocally(
  file: File,
  productName: string
): Promise<string> {
  try {
    if (!file || !(file instanceof File)) {
      throw new Error('Invalid file provided.');
    }
    const fileId: string = uuidv4();
    const seoSlug: string = createSeoSlug(productName);
    let bufferToSave: Buffer;
    let finalFileName: string;
    const extension: string = path.extname(file.name) || '';

    try {
      // Use sharp to convert to a WebP buffer for optimization
      bufferToSave = await sharp(Buffer.from(await file.arrayBuffer()))
        .webp({ quality: 80 })
        .toBuffer();
      finalFileName = `${seoSlug}-${fileId}.webp`;
      console.log(`[INFO] Converted to WebP and will save as: ${finalFileName}`);
    } catch (sharpError) {
      console.warn('[WARN] Sharp conversion failed, falling back to original file:', sharpError);
      bufferToSave = Buffer.from(await file.arrayBuffer());
      finalFileName = `${seoSlug}-${fileId}${extension}`;
    }

    // Path to save the image in the public directory
    const localPath: string = path.join(process.cwd(), 'public', 'images', finalFileName);
    await fs.mkdir(path.dirname(localPath), { recursive: true });
    await fs.writeFile(localPath, bufferToSave);

    // Return the public path
    const localPublicPath = `/images/${finalFileName}`;
    console.log(`[SUCCESS] Image saved locally at: ${localPublicPath}`);
    return localPublicPath;
  } catch (err) {
    console.error('[FATAL] processAndSaveImageLocally failed:', err);
    throw new Error('Failed to process and save image locally.');
  }
}

/**
 * POST handler → Adds new product to local JSON + saves images locally
 */
export async function POST(req: Request) {
  console.log('POST /api/products called');
  try {
    const formData = await req.formData();
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
    const productSlug = createSeoSlug(name);

    let mainImage: string;
    let secondaryImages: string[];
    try {
      mainImage = await processAndSaveImageLocally(mainImageFile, name);
      secondaryImages = await Promise.all(
        secondaryImagesFiles.map((file) => processAndSaveImageLocally(file, name))
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
      main_image: mainImage,
      secondary_images: secondaryImages,
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
    const filePath = path.join(process.cwd(), 'data', 'products.json');
    let products: Product[] = [];
    try {
      const jsonData = await fs.readFile(filePath, 'utf8');
      products = JSON.parse(jsonData);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err;
    }
    await fs.writeFile(filePath, JSON.stringify(products.concat(newProduct), null, 2));
    console.log(`Saved product locally. Total products: ${products.length + 1}`);

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