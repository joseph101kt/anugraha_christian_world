// app/api/products/[id]/route.ts
// app/api/products/[id]/route.ts

import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { fileURLToPath } from 'url';
import sharp from 'sharp'; // 👈 Import sharp for image processing
import { Product, AdditionalInfoItem } from '@/lib/types';
import { getProductsCache, setProductsCache, invalidateProductsCache } from '@/lib/cache';
import { v4 as uuidv4 } from 'uuid'; // 👈 Import uuid for unique filenames

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

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
 * Handles GET requests to retrieve a single product and its related products.
 */
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params;
    

    let allProducts: Product[];

    // Check the cache first using the getProductsCache function
    const cachedProducts = getProductsCache();
    if (cachedProducts) {
        allProducts = cachedProducts;
    } else {
        // If no cache, read from the file system and populate the cache
        try {
            const filePath = path.join(process.cwd(), 'data', 'products.json');
            const jsonData = await fs.readFile(filePath, 'utf8');
            allProducts = JSON.parse(jsonData);
            
            // Populate the cache using the setProductsCache function
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
    { params }: { params: { id: string } }
) {
    // SECURITY NOTE: Retrieving the password from the request body is more secure
    // than using search parameters, which can be logged.
    const { password } = await req.json();

    if (!ADMIN_PASSWORD || password !== ADMIN_PASSWORD) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const filePath = path.join(process.cwd(), 'data', 'products.json');

    try {
        const jsonData = await fs.readFile(filePath, 'utf8');
        const products: Product[] = JSON.parse(jsonData);
        
        // Find the product to get its image paths
        const productToDelete = products.find(p => p.id === id);
        if (!productToDelete) {
             return NextResponse.json({ message: 'Product not found' }, { status: 404 });
        }
        
        // 1. Delete the image files from the public directory
        const imagesToDelete = [productToDelete.main_image, ...productToDelete.secondary_images];
        
        await Promise.all(
            imagesToDelete.map(async (imagePath) => {
                if (imagePath) {
                    const fullPath = path.join(process.cwd(), 'public', imagePath);
                    try {
                        await fs.unlink(fullPath);
                        console.log(`Deleted image: ${fullPath}`);
                    } catch (err) {
                        // Ignore the error if the file doesn't exist
                        if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
                            console.error(`Failed to delete image ${fullPath}:`, err);
                        }
                    }
                }
            })
        );

        // 2. Filter the product from the JSON array
        const updatedProducts = products.filter((p: Product) => p.id !== id);

        // 3. Write the updated data back to the file
        await fs.writeFile(filePath, JSON.stringify(updatedProducts, null, 2));

        // Invalidate the in-memory cache and revalidate the Next.js path
        invalidateProductsCache();
        revalidatePath('/products');
        revalidatePath(`/products/${id}`);

        return NextResponse.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}














//  Next.js requires these options for FormData to work
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
    { params }: { params: { id: string } }
) {
    const { id } = params;

    try {
        // Ensure the images directory exists
        const imagesDir = path.join(process.cwd(), 'public', 'images');
        await fs.mkdir(imagesDir, { recursive: true });

        // 1. Parse the FormData from the request
        const formData = await req.formData();
        const password = formData.get('password');

        // 2. Perform authentication
        if (!ADMIN_PASSWORD || password !== ADMIN_PASSWORD) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // 3. Read the existing products and find the one to update
        const filePath = path.join(process.cwd(), 'data', 'products.json');
        const jsonData = await fs.readFile(filePath, 'utf8');
        const products: Product[] = JSON.parse(jsonData);
        const productIndex = products.findIndex(p => p.id === id);

        if (productIndex === -1) {
            return NextResponse.json({ message: 'Product not found' }, { status: 404 });
        }

        const existingProduct = products[productIndex];
        const newProductName = formData.get('name') as string;

        // 4. Process new images
        const newMainImageFile = formData.get('main_image') as File | null;
        const newSecondaryImageFiles = formData.getAll('secondary_images') as File[];
        let mainImagePath = existingProduct.main_image;
        let secondaryImagePaths = [...existingProduct.secondary_images];

        const imagesToDelete: string[] = [];

        // Handle main image update and old image deletion
        if (newMainImageFile && newMainImageFile.size > 0) {
            // Add existing main image to deletion list
            if (existingProduct.main_image.startsWith('/images/')) {
                imagesToDelete.push(existingProduct.main_image);
            }
            // Process and save the new main image
            mainImagePath = await processAndSaveImage(newMainImageFile, newProductName);
        }

        // Handle secondary image updates
        if (newSecondaryImageFiles && newSecondaryImageFiles.some(f => f.size > 0)) {
            // Add existing secondary images to the deletion list
            existingProduct.secondary_images.forEach(imagePath => {
                if (imagePath.startsWith('/images/')) {
                    imagesToDelete.push(imagePath);
                }
            });

            // Process and save all new secondary images
            secondaryImagePaths = await Promise.all(
                newSecondaryImageFiles.map(file => processAndSaveImage(file, newProductName))
            );
        } else if (formData.get('delete_secondary_images') === 'true') {
            // Handle explicit deletion of all secondary images
            existingProduct.secondary_images.forEach(imagePath => {
                if (imagePath.startsWith('/images/')) {
                    imagesToDelete.push(imagePath);
                }
            });
            secondaryImagePaths = [];
        }

        // 5. Construct the updated product object
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
            additional_info: additionalInfo,
            reviews: existingProduct.reviews,
        };

        // 6. Update the product and write to the file
        products[productIndex] = updatedProduct;
        await fs.writeFile(filePath, JSON.stringify(products, null, 2));

        // 7. Clean up old images
        await Promise.all(
            imagesToDelete.map(async (imagePath) => {
                const fullPath = path.join(process.cwd(), 'public', imagePath);
                try { await fs.unlink(fullPath); } catch (err) { console.warn(`Could not delete old image: ${fullPath}`); }
            })
        );

        // 8. Invalidate the cache and revalidate paths
        invalidateProductsCache();
        revalidatePath('/dashboard');
        revalidatePath('/products');
        revalidatePath(`/products/${id}`);

        return NextResponse.json({ message: 'Product updated successfully' });

    } catch (error) {
        console.error('Error updating product:', error);
        return NextResponse.json({ message: 'Internal server error', details: (error as Error).message }, { status: 500 });
    }
}