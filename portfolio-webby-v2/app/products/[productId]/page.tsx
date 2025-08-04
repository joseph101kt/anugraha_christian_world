// app/products/[productId]/page.tsx

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import fs from 'fs/promises';
import path from 'path';

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

/**
 * Renders a single product's detail page, including related products.
 * This is a Server Component that fetches data directly.
 * @param {ProductPageProps} props - The component's props.
 */
export default async function ProductPage({ params }: ProductPageProps) {
    const { productId } = params;

    const fetchProductData = async () => {
        let allProducts: Product[];

        // Check if the product list is already in the cache
        if (productsCache) {
            console.log('Using cached product list');
            allProducts = productsCache;
        } else {
            console.log('Cache miss: Reading products.json from file system');
            const filePath = path.join(process.cwd(), 'data', 'products.json');
            
            try {
                const jsonData = await fs.readFile(filePath, 'utf8');
                allProducts = JSON.parse(jsonData);
                // Populate the cache with the full list of products
                productsCache = allProducts;
            } catch (error) {
                console.error('Error reading products.json:', error);
                throw new Error('Failed to read product data.');
            }
        }
        
        // Find the specific product from the list (either cached or newly loaded)
        const product = allProducts.find(p => p.id === productId);

        if (!product) {
            throw new Error('Product not found.');
        }

        // Get suggested products (all other products for this example)
        const suggested = allProducts.filter(p => p.id !== productId);
        
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

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="container mx-auto max-w-5xl bg-white rounded-xl shadow-2xl overflow-hidden p-8">
                {/* Main Product Section */}
                <div className="grid md:grid-cols-2 gap-8 items-start">
                    <div className="relative overflow-hidden rounded-lg shadow-lg aspect-w-4 aspect-h-3">
                        <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            style={{ objectFit: "cover" }}
                            className="rounded-lg"
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {suggested.map((suggested: Product) => (
                                <Link key={suggested.id} href={`/products/${suggested.id}`}>
                                    <div className="group bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transform hover:scale-[1.03] transition-all duration-300">
                                        <div className="relative w-full h-32">
                                            <Image
                                                src={suggested.image_url}
                                                alt={suggested.name}
                                                fill
                                                style={{ objectFit: "cover" }}
                                            />
                                        </div>
                                        <div className="p-4">
                                            <h3 className="text-md font-bold text-gray-800 truncate group-hover:text-green-600">{suggested.name}</h3>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
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
