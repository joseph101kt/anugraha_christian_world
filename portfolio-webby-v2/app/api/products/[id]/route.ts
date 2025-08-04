import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';

import { productsCache, invalidateProductsCache } from '@/lib/cache';

interface Product {
    id: string;
    name: string;
    description: string;
    image_url: string;
    tags: string[];
}

const ADMIN_PASSWORD = 'password'; //consider using process.env.ADMIN_PASSWORD for production

/**
 * Handles GET requests to retrieve a single product and its related products.
 * The product ID is passed as a URL parameter.
 * This function now uses a simple in-memory cache for improved performance.
 * @param request - The incoming NextRequest.
 * @param {params} - An object containing the productId from the URL.
 */
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params;

    let allProducts: Product[];

    // Check the cache first
    if (productsCache.length > 0) {
        console.log('API GET request: Using cached product list');
        allProducts = productsCache;
    } else {
        // If no cache, read from the file system and populate the cache
        console.log('API GET request: Cache miss. Reading products.json');
        try {
            const filePath = path.join(process.cwd(), 'data', 'products.json');
            const jsonData = await fs.readFile(filePath, 'utf8');
            allProducts = JSON.parse(jsonData);
            // Populate the cache
            productsCache.push(...allProducts);
        } catch (error) {
            console.error('Error fetching product data:', error);
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        }
    }

    // Find the main product
    const mainProduct = allProducts.find(p => p.id === id);

    if (!mainProduct) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Find suggested products with a similar tag, excluding the main product
    const suggestedProducts = allProducts
        .filter(p => p.id !== mainProduct.id && mainProduct.tags.some(tag => p.tags.includes(tag)))
        .slice(0, 4); // Limit to a maximum of 4 suggested products

    return NextResponse.json({
        product: mainProduct,
        suggested: suggestedProducts,
    });
}

/**
 * Handles DELETE requests to delete a single product.
 * Requires a password for authorization.
 * This function now invalidates the cache after a successful deletion.
 * @param req - The incoming NextRequest.
 * @param {params} - An object containing the product ID from the URL.
 */
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const password = req.nextUrl.searchParams.get('password');

    if (password !== ADMIN_PASSWORD) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const filePath = path.join(process.cwd(), 'data', 'products.json');

    try {
        const jsonData = await fs.readFile(filePath, 'utf8');
        const products: Product[] = JSON.parse(jsonData);

        const productIndex = products.findIndex((p: Product) => p.id === id);

        if (productIndex === -1) {
            return NextResponse.json({ message: 'Product not found' }, { status: 404 });
        }

        products.splice(productIndex, 1);

        await fs.writeFile(filePath, JSON.stringify(products, null, 2));

        // Invalidate the in-memory cache and revalidate the Next.js path
        invalidateProductsCache();
        revalidatePath('/products');

        return NextResponse.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
