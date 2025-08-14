// app/api/products/[id]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';
import sharp from 'sharp';
import { Product, AdditionalInfoItem } from '@/lib/types';
import { getProductsCache, setProductsCache, invalidateProductsCache } from '@/lib/cache';
import { v4 as uuidv4 } from 'uuid';

function createSeoSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Handles GET requests to retrieve a single product and its related products.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let allProducts: Product[];

  const cachedProducts = getProductsCache();
  if (cachedProducts) {
    allProducts = cachedProducts;
  } else {
    try {
      const filePath = path.join(process.cwd(), 'data', 'products.json');
      const jsonData = await fs.readFile(filePath, 'utf8');
      allProducts = JSON.parse(jsonData);
      setProductsCache(allProducts);
    } catch (error) {
      console.error('Error fetching product data:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }

  const mainProduct = allProducts.find(p => p.id === id);

  if (!mainProduct) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  const suggestedProducts = allProducts
    .filter(p => p.id !== mainProduct.id && mainProduct.tags.some(tag => p.tags.includes(tag)))
    .slice(0, 4);

  return NextResponse.json({
    product: mainProduct,
    suggested: suggestedProducts,
  });
}

/**
 * Handles DELETE requests to delete a single product.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const filePath = path.join(process.cwd(), 'data', 'products.json');

  try {
    const jsonData = await fs.readFile(filePath, 'utf8');
    const products: Product[] = JSON.parse(jsonData);

    const productToDelete = products.find(p => p.id === id);
    if (!productToDelete) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    const imagesToDelete = [productToDelete.main_image, ...productToDelete.secondary_images];

    await Promise.all(
      imagesToDelete.map(async imagePath => {
        if (imagePath) {
          const fullPath = path.join(process.cwd(), 'public', imagePath);
          try {
            await fs.unlink(fullPath);
            console.log(`Deleted image: ${fullPath}`);
          } catch (err) {
            if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
              console.error(`Failed to delete image ${fullPath}:`, err);
            }
          }
        }
      })
    );

    const updatedProducts = products.filter(p => p.id !== id);
    await fs.writeFile(filePath, JSON.stringify(updatedProducts, null, 2));

    invalidateProductsCache();
    revalidatePath('/products');
    revalidatePath(`/products/${id}`);

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// Next.js requires these options for FormData to work
export const config = {
  api: {
    bodyParser: false,
  },
};

const processAndSaveImage = async (file: File, productName: string): Promise<string> => {
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const seoSlug = createSeoSlug(productName);
  const fileId = uuidv4();
  const webpFilename = `${seoSlug}-${fileId}.webp`;
  const uploadPath = path.join(process.cwd(), 'public', 'images', webpFilename);

  try {
    await sharp(fileBuffer)
      .webp({ quality: 80 })
      .toFile(uploadPath);

    return `/images/${webpFilename}`;
  } catch (error) {
    console.error('Sharp image conversion failed:', error);
    throw new Error('Failed to process image file.');
  }
};

/**
 * Handles PUT requests to update a single product.
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const imagesDir = path.join(process.cwd(), 'public', 'images');
    await fs.mkdir(imagesDir, { recursive: true });

    const formData = await req.formData();

    const filePath = path.join(process.cwd(), 'data', 'products.json');
    const jsonData = await fs.readFile(filePath, 'utf8');
    const products: Product[] = JSON.parse(jsonData);
    const productIndex = products.findIndex(p => p.id === id);

    if (productIndex === -1) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    const existingProduct = products[productIndex];
    const newProductName = formData.get('name') as string;

    const newMainImageFile = formData.get('main_image') as File | null;
    const newSecondaryImageFiles = formData.getAll('secondary_images') as File[];
    let mainImagePath = existingProduct.main_image;
    let secondaryImagePaths = [...existingProduct.secondary_images];

    const imagesToDelete: string[] = [];

    if (newMainImageFile && newMainImageFile.size > 0) {
      if (existingProduct.main_image.startsWith('/images/')) {
        imagesToDelete.push(existingProduct.main_image);
      }
      mainImagePath = await processAndSaveImage(newMainImageFile, newProductName);
    }

    if (newSecondaryImageFiles && newSecondaryImageFiles.some(f => f.size > 0)) {
      existingProduct.secondary_images.forEach(imagePath => {
        if (imagePath.startsWith('/images/')) {
          imagesToDelete.push(imagePath);
        }
      });
      secondaryImagePaths = await Promise.all(
        newSecondaryImageFiles.map(file => processAndSaveImage(file, newProductName))
      );
    } else if (formData.get('delete_secondary_images') === 'true') {
      existingProduct.secondary_images.forEach(imagePath => {
        if (imagePath.startsWith('/images/')) {
          imagesToDelete.push(imagePath);
        }
      });
      secondaryImagePaths = [];
    }

    let additionalInfo: AdditionalInfoItem[] = [];
    const additionalInfoString = formData.get('additional_info') as string;
    if (additionalInfoString) {
      try {
        additionalInfo = JSON.parse(additionalInfoString) as AdditionalInfoItem[];
      } catch (jsonError) {
        console.error('Failed to parse additional_info JSON:', jsonError);
        return NextResponse.json({ message: 'Invalid format for additional info.' }, { status: 400 });
      }
    }

    const updatedProduct: Product = {
      ...existingProduct,
      name: newProductName,
      description: formData.get('description') as string,
      tags: (formData.get('tags') as string).split(',').map(tag => tag.trim()),
      main_image: mainImagePath,
      secondary_images: secondaryImagePaths,
      size: formData.get('size') as string,
      quantity: parseInt(formData.get('quantity') as string, 10),
      price: parseFloat(formData.get('price') as string),
      material: formData.get('material') as string,
      category: formData.get('category') as string,
      additional_info: additionalInfo,
      reviews: existingProduct.reviews,
    };

    products[productIndex] = updatedProduct;
    await fs.writeFile(filePath, JSON.stringify(products, null, 2));

    await Promise.all(
      imagesToDelete.map(async imagePath => {
        const fullPath = path.join(process.cwd(), 'public', imagePath);
        try {
          await fs.unlink(fullPath);
        } catch {
          console.warn(`Could not delete old image: ${fullPath}`);
        }
      })
    );

    invalidateProductsCache();
    revalidatePath('/dashboard');
    revalidatePath('/products');
    revalidatePath(`/products/${id}`);

    return NextResponse.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { message: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}
