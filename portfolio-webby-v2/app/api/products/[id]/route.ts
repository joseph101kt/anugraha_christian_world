// app/api/products/[id]/route.ts

import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';

// Import the shared Product and Review interfaces
import { Product } from '@/lib/types';

// Import the new cache functions
import { getProductsCache, setProductsCache, invalidateProductsCache } from '@/lib/cache';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

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
    const password = req.nextUrl.searchParams.get('password');

    if (!ADMIN_PASSWORD || password !== ADMIN_PASSWORD) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const filePath = path.join(process.cwd(), 'data', 'products.json');

    try {
        const jsonData = await fs.readFile(filePath, 'utf8');
        const products: Product[] = JSON.parse(jsonData);

        const updatedProducts = products.filter((p: Product) => p.id !== id);

        if (updatedProducts.length === products.length) {
             return NextResponse.json({ message: 'Product not found' }, { status: 404 });
        }

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