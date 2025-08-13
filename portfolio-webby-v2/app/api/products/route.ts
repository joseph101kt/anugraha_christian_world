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
    console.time('POST /api/products total duration'); // measure total time
    try {
        console.time('formData parsing');
        const formData = await req.formData();
        console.timeEnd('formData parsing');

        // Debug all form data keys
        console.log('DEBUG: formData keys received:', [...formData.keys()]);

        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const tagsString = formData.get('tags') as string;
        const mainImageFile = formData.get('main_image') as File;
        const priceString = formData.get('price') as string;
        const sizeString = formData.get('size') as string;
        const quantityString = formData.get('quantity') as string;
        const material = formData.get('material') as string;
        const category = formData.get('category') as string;

        let additionalInfo;
        try {
            const additionalRaw = formData.get('additional_info') as string;
            console.log('DEBUG: Raw additional_info value:', additionalRaw);
            additionalInfo = JSON.parse(additionalRaw);
        } catch (parseError) {
            console.error('ERROR: Failed to parse additional_info JSON:', parseError);
            return NextResponse.json({ message: 'Invalid additional_info format.' }, { status: 400 });
        }

        const secondaryImagesFiles = formData.getAll('secondary_images') as File[];
        console.log(`DEBUG: Secondary images count: ${secondaryImagesFiles.length}`);

        // Missing field check debug
        const missingFields = {
            name: !name,
            description: !description,
            mainImageFile: !mainImageFile,
            priceString: !priceString,
            sizeString: !sizeString,
            quantityString: !quantityString,
            material: !material,
            category: !category,
            additionalInfo: !additionalInfo
        };
        console.log('DEBUG: Missing fields map:', missingFields);

        // Ensure images directory
        const publicImagesPath = path.join(process.cwd(), 'public', 'images');
        console.log(`DEBUG: Creating/ensuring public images path: ${publicImagesPath}`);
        await fs.mkdir(publicImagesPath, { recursive: true });

        const processImage = async (file: File): Promise<string> => {
            console.time(`processImage ${file.name}`);
            const fileId = uuidv4();
            const seoSlug = createSeoSlug(name);
            const webpFileName = `${seoSlug}-${fileId}.webp`;
            const webpFilePath = path.join(publicImagesPath, webpFileName);

            try {
                const fileBuffer = Buffer.from(await file.arrayBuffer());
                await sharp(fileBuffer).webp({ quality: 80 }).toFile(webpFilePath);
                console.log(`SUCCESS: Image saved to ${webpFilePath}`);
                return `/images/${webpFileName}`;
            } catch (err) {
                console.error(`ERROR: Sharp conversion failed for ${file.name}`, err);
                throw err;
            } finally {
                console.timeEnd(`processImage ${file.name}`);
            }
        };

        const main_image = await processImage(mainImageFile);
        const secondary_images = await Promise.all(secondaryImagesFiles.map(file => processImage(file)));

        const tags = tagsString ? tagsString.split(',').map(tag => tag.trim().toLowerCase()) : [];
        const filePath = path.join(process.cwd(), 'data', 'products.json');

        console.log(`DEBUG: Reading existing products from ${filePath}`);
        let products: Product[] = [];
        try {
            const jsonData = await fs.readFile(filePath, 'utf8');
            products = JSON.parse(jsonData);
        } catch (err) {
            if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err;
            console.warn('products.json not found, starting with empty array.');
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
            category,
            additional_info: additionalInfo,
        };

        console.log('DEBUG: Writing new product to products.json:', newProduct);
        await fs.writeFile(filePath, JSON.stringify(products.concat(newProduct), null, 2));

        invalidateProductsCache();
        revalidatePath(`/products/${newProduct.id}`);
        revalidatePath('/products');

        console.timeEnd('POST /api/products total duration');
        return NextResponse.json({ message: 'Product added successfully!', product: newProduct });
    } catch (error) {
        console.error('FATAL: Unhandled error in POST handler:', error);
        return NextResponse.json({ message: 'Internal server error', details: (error as Error).message }, { status: 500 });
    }
}
