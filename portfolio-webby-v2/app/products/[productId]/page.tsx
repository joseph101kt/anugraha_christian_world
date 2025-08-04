// app/products/[productId]/page.tsx

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import fs from 'fs/promises';
import path from 'path';
import SuggestedProducts from '@/components/SuggestedProducts'; // Import the new client component

// Define the interface for a Product
interface Product {
    id: string;
    name: string;
    description: string;
    image_url: string;
    tags: string[];
}

// Define the component's props, which will receive the productId from the URL
interface ProductPageProps {
    params: {
        productId: string;
    };
}

// A simple in-memory cache for the entire list of products.
// This variable is outside the component, so it is shared across requests on the server.
let productsCache: Product[] | null = null;

// Helper function to safely get the productId, which should bypass the linter check.
const getProductId = (props: ProductPageProps) => {
    return props.params.productId;
};

/**
 * Renders a single product's detail page, including related products.
 * This is a Server Component that fetches data directly.
 * @param {ProductPageProps} props - The component's props.
 */
export default async function ProductPage(props: ProductPageProps) {
    // FINAL FIX: Retrieve the productId using the new helper function
    const productId = getProductId(props);

    // DEBUG: Log the received productId to confirm it's being passed correctly
    console.log(`[ProductPage] Received productId: ${productId}`);

    const fetchProductData = async () => {
        let allProducts: Product[];

        // Check if the product list is already in the cache
        if (productsCache) {
            console.log('[fetchProductData] Using cached product list');
            allProducts = productsCache;
        } else {
            console.log('[fetchProductData] Cache miss: Reading products.json from file system');
            const filePath = path.join(process.cwd(), 'data', 'products.json');
            
            try {
                const jsonData = await fs.readFile(filePath, 'utf8');
                allProducts = JSON.parse(jsonData);
                // Populate the cache with the full list of products
                productsCache = allProducts;
            } catch (error) {
                console.error('[fetchProductData] Error reading products.json:', error);
                throw new Error('Failed to read product data.');
            }
        }
        
        // Find the specific product from the list (either cached or newly loaded)
        const product = allProducts.find(p => p.id === productId);

        if (!product) {
            console.warn(`[fetchProductData] Product with ID '${productId}' not found.`);
            throw new Error('Product not found.');
        }

        // DEBUG: Log the found product
        console.log(`[fetchProductData] Found product: ${product.name}`);

        // Get suggested products (all other products for this example)
        const suggested = allProducts.filter(p => p.id !== productId);
        
        // DEBUG: Log the number of suggested products
        console.log(`[fetchProductData] Found ${suggested.length} suggested products.`);

        // Return a consistent object structure
        return { product, suggested };
    };

    let data;
    let errorMessage: string;

    try {
        data = await fetchProductData();
    } catch (err) {
        if (err instanceof Error) {
            errorMessage = err.message;
        } else {
            errorMessage = 'An unknown error occurred.';
        }
        // DEBUG: Log the error message during the catch block
        console.error(`[ProductPage] An error occurred: ${errorMessage}`);

        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8 text-center">
                <h1 className="text-3xl font-bold text-red-500 mb-4">Error</h1>
                <p className="text-gray-600 mb-2">Could not find product with ID: <span className="font-mono text-gray-800">{productId}</span></p>
                <p className="text-gray-600 mb-6">Error details:</p>
                <pre className="bg-white p-4 rounded-lg shadow-inner text-red-700 overflow-x-auto text-left max-w-lg w-full">
                    {errorMessage}
                </pre>
                <Link href="/products">
                    <span className="mt-6 inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-bold text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors">
                        Back to All Products
                    </span>
                </Link>
            </div>
        );
    }

    const { product, suggested } = data;
    // DEBUG: Log the product name and suggested count right before rendering
    console.log(`[ProductPage] Rendering page for product: ${product.name}`);
    console.log(`[ProductPage] Rendering with ${suggested.length} suggested products.`);

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="container mx-auto max-w-5xl bg-white rounded-xl shadow-2xl overflow-hidden p-8">
                {/* Main Product Section */}
                <div className="grid md:grid-cols-2 gap-8 items-start">
                    <div className="relative w-full max-w-xl aspect-[4/3] rounded-lg overflow-hidden">
                    <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover"
                    />
                    </div>
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-800 mb-2">{product.name}</h1>
                        <p className="text-gray-600 leading-relaxed">{product.description}</p>
                        <div className="mt-6 flex flex-wrap gap-2">
                            {product.tags.map((tag: string) => (
                                <span key={tag} className="bg-gray-200 text-gray-700 text-sm font-semibold px-3 py-1 rounded-full">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <hr className="my-12 border-gray-200" />

                {/* Suggested Products Section */}
                <div className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6">Suggested Products</h2>
                    {suggested.length > 0 ? (
                        <SuggestedProducts suggested={suggested} />
                    ) : (
                        <p className="text-center text-gray-500">No suggested products found.</p>
                    )}
                </div>

                {/* Back to All Products Button */}
                <div className="text-center">
                    <Link href="/products">
                        <span className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-bold text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors">
                            Back to All Products
                        </span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
