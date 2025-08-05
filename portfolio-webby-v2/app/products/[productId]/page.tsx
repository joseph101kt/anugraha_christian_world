// app/products/[productId]/page.tsx

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import fs from 'fs/promises';
import path from 'path';
import SuggestedProducts from '@/components/SuggestedProducts';
import EnquireButton from '@/components/EnquireButton';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Product, Review } from '@/lib/types';

interface ProductPageProps {
    params: {
        productId: string;
    };
}

// REMOVED: The custom 'productsCache' variable is no longer needed.

const getProductId = (props: ProductPageProps) => {
    return props.params.productId;
};

// UPDATED: This function now reads the file directly every time.
// Next.js handles the caching of this file read automatically.
async function getProductData(productId: string) {
    const filePath = path.join(process.cwd(), 'data', 'products.json');
    let allProducts: Product[];

    try {
        const jsonData = await fs.readFile(filePath, 'utf8');
        allProducts = JSON.parse(jsonData);
    } catch (error) {
        console.error('[getProductData] Error reading products.json:', error);
        // If the file doesn't exist, treat it as a 404
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            notFound();
        }
        throw new Error('Failed to read product data.');
    }
    
    const product = allProducts.find(p => p.id === productId);
    if (!product) {
        notFound();
    }

    const suggested = allProducts.filter(p => p.id !== productId);
    
    return { product, suggested };
}

// Generate dynamic metadata based on the product data
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata | undefined> {
    const productId = params.productId;
    
    try {
        const { product } = await getProductData(productId);
        return {
            title: product.name,
            description: product.description,
            openGraph: {
                title: product.name,
                description: product.description,
                images: [{ url: product.main_image, width: 800, height: 600, alt: product.name }],
            },
        };
    } catch (error) {
        console.error(`[generateMetadata] Error fetching metadata for product ID '${productId}':`, error);
        return {
            title: 'Product Not Found',
            description: 'The requested product could not be found.',
        };
    }
}


// Helper to parse the additional_info string
function parseAdditionalInfo(info: string) {
  return info.split(',').map(item => {
    const [title, description] = item.split(':');
    return { title: title.trim(), description: description.trim() };
  });
}

/**
 * Renders a single product's detail page, including related products.
 * This is a Server Component that fetches data directly.
 * @param {ProductPageProps} props - The component's props.
 */
export default async function ProductPage(props: ProductPageProps) {
    const productId = getProductId(props);

    const { product, suggested } = await getProductData(productId);

    const additionalInfoParsed = parseAdditionalInfo(product.additional_info);

    return (
        <div className="min-h-screen m-10 p-8">
            <div className="container max-w-screen-xl mx-auto rounded-xl shadow-2xl overflow-hidden p-8">
                {/* Main Product Section */}
                <div className="grid md:grid-cols-2 gap-8 items-start">
                    {/* Image Gallery */}
                    <div>
                        <div className="relative w-full max-w-xl aspect-[4/3] rounded-lg overflow-hidden mb-4">
                            <Image
                                src={product.main_image}
                                alt={product.name}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {product.secondary_images.map((imgUrl, index) => (
                                <div key={index} className="relative w-24 h-16 rounded-md overflow-hidden cursor-pointer border border-gray-300 hover:border-accent transition-colors">
                                    <Image src={imgUrl} alt={`${product.name} secondary image ${index + 1}`} fill className="object-cover" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Product Details */}
                    <div>
                        <h1 className="text-4xl font-extrabold mb-2">{product.name}</h1>
                        <p className="leading-relaxed text-gray-600 mb-4">{product.description}</p>
                        
                        {/* NEW: Price and Quantity */}
                        <div className="mb-4">
                            <p className="text-2xl font-bold text-accent mb-1">${product.price.toFixed(2)}</p>
                            <p className="text-sm text-gray-500">In Stock: {product.quantity}</p>
                        </div>
                        
                        <div className="mt-6 flex flex-wrap gap-2">
                            {product.tags.map((tag: string) => (
                                <span key={tag} className="bg-secondary text-sm font-semibold px-3 py-1 rounded-full">
                                    {tag.charAt(0).toUpperCase() + tag.slice(1)}
                                </span>
                            ))}
                        </div>
                        
                        {/* NEW: Material and Size */}
                        <div className="mt-6 space-y-2">
                            <p><strong className="font-semibold">Material:</strong> {product.material}</p>
                            <p><strong className="font-semibold">Size:</strong> {product.size}</p>
                        </div>

                        {/* New EnquireButton component for client-side interactivity */}
                        <div className="mt-8">
                            <EnquireButton productName={product.name} />
                        </div>
                    </div>
                </div>

                <hr className="my-12 border-gray-200" />
                
                {/* NEW: Additional Info Section */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold mb-4">Additional Information</h2>
                    <ul className="list-disc list-inside space-y-2">
                        {additionalInfoParsed.map((item, index) => (
                            <li key={index}>
                                <strong className="font-semibold">{item.title}:</strong> {item.description}
                            </li>
                        ))}
                    </ul>
                </div>
                
                {/* NEW: Reviews Section */}
                {product.reviews && product.reviews.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
                        <div className="space-y-6">
                            {product.reviews.map((review, index) => (
                                <div key={index} className="bg-gray-100 p-4 rounded-lg shadow-sm">
                                    <div className="flex items-center mb-2">
                                        <span className="text-lg font-semibold mr-2">{review.customer_name}</span>
                                        <div className="flex text-yellow-400">
                                            {Array(review.rating).fill(null).map((_, i) => (
                                                <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                                            ))}
                                    </div>
                                    </div>
                                    <p className="text-gray-700">{review.comment}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <hr className="my-12 border-gray-200" />

                {/* Suggested Products Section */}
                <div className="mb-12">
                    <h2 className="text-3xl font-bold mb-6">Suggested Products</h2>
                    {suggested.length > 0 ? (
                        <SuggestedProducts suggested={suggested} />
                    ) : (
                        <p className="text-center ">No suggested products found.</p>
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