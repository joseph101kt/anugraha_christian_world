// app/api/products/route.ts

import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';
// We've replaced the webp-converter import with sharp
import sharp from 'sharp';

import { Product } from '@/lib/types';
import { getProductsCache, setProductsCache, invalidateProductsCache } from '@/lib/cache';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

function createSeoSlug(name: string): string {
    console.log(`DEBUG: Creating SEO slug for name: "${name}"`);
    const slug = name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    console.log(`DEBUG: Generated slug: "${slug}"`);
    return slug;
}

export async function GET() {
    console.log('--- GET /api/products handler called ---');
    let allProducts: Product[] | null = getProductsCache();

    if (allProducts) {
        console.log('Products found in cache. Returning cached data.');
    } else {
        console.log('Cache miss. Proceeding to read products.json file.');
        try {
            const filePath = path.join(process.cwd(), 'data', 'products.json');
            const jsonData = await fs.readFile(filePath, 'utf8');
            allProducts = JSON.parse(jsonData);
            setProductsCache(allProducts!);
        } catch (error) {
            console.error('An error occurred during file read or JSON parsing!');
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
                console.warn('products.json not found. Returning an empty array.');
                allProducts = [];
                setProductsCache([]);
            } else {
                console.error('Un-handled error details:', error);
                return NextResponse.json({
                    message: 'Internal Server Error',
                    details: 'Failed to read or parse products data.',
                    error: (error as Error).message
                }, { status: 500 });
            }
        }
    }
    console.log(`Returning ${allProducts ? allProducts.length : 0} products.`);
    return NextResponse.json(allProducts || []);
}

export async function POST(req: Request) {
    console.log('--- POST /api/products handler called ---');
    try {
        const formData = await req.formData();
        const password = formData.get('password');
        console.log('DEBUG: Checking password...');
        if (password !== ADMIN_PASSWORD) {
            console.error('POST request failed: Incorrect password');
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        console.log('DEBUG: Password is correct. Processing form data...');

        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const tagsString = formData.get('tags') as string;
        const mainImageFile = formData.get('main_image') as File;
        const priceString = formData.get('price') as string;
        const sizeString = formData.get('size') as string;
        const quantityString = formData.get('quantity') as string;
        const material = formData.get('material') as string;
        // Safely parse additional_info, handling potential parsing errors
        let additionalInfo;
        try {
            additionalInfo = JSON.parse(formData.get('additional_info') as string);
        } catch (parseError) {
            console.error('ERROR: Failed to parse additional_info JSON.', parseError);
            return NextResponse.json({ message: 'Invalid additional_info format.' }, { status: 400 });
        }
        const secondaryImagesFiles = formData.getAll('secondary_images') as File[];
        
        console.log('DEBUG: Form data successfully extracted.');
        console.log(`DEBUG: Received product name: "${name}"`);
        console.log(`DEBUG: Received main image file: "${mainImageFile?.name}"`);

        if (!name || !description || !mainImageFile || !priceString || !sizeString || !quantityString || !material || !additionalInfo) {
            console.error('POST request failed: Missing required fields');
            // Log exactly which field is missing
            const missingFields = {
                name: !name,
                description: !description,
                mainImageFile: !mainImageFile,
                priceString: !priceString,
                sizeString: !sizeString,
                quantityString: !quantityString,
                material: !material,
                additionalInfo: !additionalInfo
            };
            console.error('DEBUG: Missing fields:', missingFields);
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        const publicImagesPath = path.join(process.cwd(), 'public', 'images');
        console.log(`DEBUG: Ensuring directory exists at: "${publicImagesPath}"`);
        await fs.mkdir(publicImagesPath, { recursive: true });
        console.log('DEBUG: Directory check complete.');

        // Refactored to use sharp instead of webp-converter
        const processImage = async (file: File): Promise<string> => {
            console.log(`DEBUG: Starting sharp image processing for file: "${file.name}"`);
            const fileId = uuidv4();
            const seoSlug = createSeoSlug(name);
            const webpFileName = `${seoSlug}-${fileId}.webp`; 
            const webpFilePath = path.join(publicImagesPath, webpFileName);

            try {
                const fileBuffer = Buffer.from(await file.arrayBuffer());

                // Use sharp to convert the image buffer to a WebP file
                await sharp(fileBuffer)
                    .webp({ quality: 80 })
                    .toFile(webpFilePath);

                console.log(`SUCCESS: Image converted and saved to: "${webpFilePath}"`);
                
                return `/images/${webpFileName}`;
            } catch (conversionError) {
                console.error(`--- CRITICAL ERROR: Sharp image conversion failed for file "${file.name}" ---`);
                console.error('Conversion error details:', conversionError);
                throw new Error(`Failed to convert image ${file.name} to WebP. Details: ${(conversionError as Error).message}`);
            }
        };

        try {
            console.log('DEBUG: Processing main image...');
            const main_image = await processImage(mainImageFile);
            console.log(`DEBUG: Main image path received: "${main_image}"`);
            
            console.log('DEBUG: Processing secondary images...');
            const secondary_images: string[] = await Promise.all(
                secondaryImagesFiles.map(file => processImage(file))
            );
            console.log(`DEBUG: Secondary images paths received: "${secondary_images}"`);
    
            const tags = tagsString ? tagsString.split(',').map(tag => tag.trim().toLowerCase()) : [];
            const filePath = path.join(process.cwd(), 'data', 'products.json');
            console.log(`DEBUG: Attempting to read existing products from "${filePath}"`);
            let products: Product[] = [];
            try {
                const jsonData = await fs.readFile(filePath, 'utf8');
                products = JSON.parse(jsonData);
                console.log('DEBUG: Successfully read and parsed existing products.json.');
            } catch (readError) {
                if ((readError as NodeJS.ErrnoException).code !== 'ENOENT') {
                    console.error('ERROR: Unhandled file read error before adding new product:', readError);
                    throw readError;
                }
                console.warn('WARNING: products.json not found, initializing with an empty array.');
            }
            
            const seoSlug = createSeoSlug(name);
            const uniqueId = `${seoSlug}-${uuidv4().substring(0, 8)}`;
            const newProduct: Product = {
                id: uniqueId,
                name,
                description,
                main_image,
                secondary_images,
                tags,
                price: parseFloat(priceString),
                size: sizeString,
                quantity: parseInt(quantityString),
                reviews: [],
                material,
                additional_info: additionalInfo,
            };

            products.push(newProduct);
            console.log(`DEBUG: New product object created. Writing to file...`);
            await fs.writeFile(filePath, JSON.stringify(products, null, 2));
            console.log('DEBUG: Successfully wrote products.json.');

            invalidateProductsCache();
            revalidatePath(`/products/${newProduct.id}`);
            revalidatePath('/products');
            console.log(`SUCCESS: All operations complete. Returning success response.`);

            return NextResponse.json({ message: 'Product added successfully!', product: newProduct });
        } catch (innerError) {
            // This catches the re-thrown error from processImage
            console.error('ERROR: An error occurred during image processing or data persistence.');
            console.error('Error details:', innerError);
            return NextResponse.json({ message: 'Internal server error', details: (innerError as Error).message }, { status: 500 });
        }
    } catch (error) {
        console.error('FATAL CATCH BLOCK: An un-handled error occurred in the POST handler.');
        console.error('Error details:', error);
        return NextResponse.json({ message: 'Internal server error', details: (error as Error).message }, { status: 500 });
    }
}