// app/api/products/route.ts

import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';

import { Product } from '@/lib/types';
import { getProductsCache, setProductsCache, invalidateProductsCache } from '@/lib/cache';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;;

// This is the function to create a clean, SEO-friendly slug
function createSeoSlug(name: string): string {
    const slug = name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove all non-word, non-space, non-hyphen characters
        .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with a single hyphen
        .replace(/^-+|-+$/g, ''); // Remove leading or trailing hyphens
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
            console.log(`Reading file from path: ${filePath}`);

            const jsonData = await fs.readFile(filePath, 'utf8');
            console.log('Successfully read file. Attempting to parse JSON data.');

            allProducts = JSON.parse(jsonData);
            console.log('Successfully parsed JSON data. Setting cache.');

            // THIS IS THE ONLY LINE YOU NEED TO CHANGE
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

/**
 * Handles POST requests to add a new product.
 * This version is updated to handle the new `material` and `additional_info` fields.
 */
export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const password = formData.get('password');
        
        if (password !== ADMIN_PASSWORD) {
            console.error('POST request failed: Incorrect password');
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const tagsString = formData.get('tags') as string;
        const mainImageFile = formData.get('main_image') as File;
        const priceString = formData.get('price') as string;
        const sizeString = formData.get('size') as string;
        const quantityString = formData.get('quantity') as string;
        const material = formData.get('material') as string;
        const additionalInfo = JSON.parse(formData.get('additional_info') as string);



        // Extract all secondary image files from the form data
        const secondaryImagesFiles = formData.getAll('secondary_images') as File[];

        if (!name || !description || !mainImageFile || !priceString || !sizeString || !quantityString || !material || !additionalInfo) {
            console.error('POST request failed: Missing required fields');
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        const publicImagesPath = path.join(process.cwd(), 'public', 'images');
        await fs.mkdir(publicImagesPath, { recursive: true });
        
        const mainImageFileName = `${uuidv4()}-${mainImageFile.name}`;
        const mainImagePath = path.join(publicImagesPath, mainImageFileName);
        const main_image = `/images/${mainImageFileName}`;
        
        const mainFileBuffer = Buffer.from(await mainImageFile.arrayBuffer());
        await fs.writeFile(mainImagePath, mainFileBuffer);

        // Process and save all secondary images
        const secondary_images: string[] = [];
        for (const file of secondaryImagesFiles) {
            if (file.name) {
                const secondaryImageFileName = `${uuidv4()}-${file.name}`;
                const secondaryImagePath = path.join(publicImagesPath, secondaryImageFileName);
                const secondaryFileBuffer = Buffer.from(await file.arrayBuffer());
                await fs.writeFile(secondaryImagePath, secondaryFileBuffer);
                secondary_images.push(`/images/${secondaryImageFileName}`);
            }
        }

        const tags = tagsString ? tagsString.split(',').map(tag => tag.trim().toLowerCase()) : [];

        const filePath = path.join(process.cwd(), 'data', 'products.json');
        let products: Product[] = [];
        try {
            const jsonData = await fs.readFile(filePath, 'utf8');
            products = JSON.parse(jsonData);
        } catch (readError) {
            // It's fine if the file doesn't exist yet
            if ((readError as NodeJS.ErrnoException).code !== 'ENOENT') {
                throw readError;
            }
        }
        const seoSlug = createSeoSlug(name);
        const uniqueId = `${seoSlug}-${uuidv4().substring(0, 8)}`;

        const newProduct: Product = {
            id: uniqueId,
            name,
            description,
            main_image,
            secondary_images, // Use the new array of image paths
            tags,
            price: parseFloat(priceString),
            size: sizeString,
            quantity: parseInt(quantityString),
            reviews: [],
            material,
            additional_info: additionalInfo,
        };

        products.push(newProduct);
        await fs.writeFile(filePath, JSON.stringify(products, null, 2));

        invalidateProductsCache();
        revalidatePath(`/products/${newProduct.id}`);
        revalidatePath('/products');

        return NextResponse.json({ message: 'Product added successfully!', product: newProduct });
    } catch (error) {
        console.error('Error adding product:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}