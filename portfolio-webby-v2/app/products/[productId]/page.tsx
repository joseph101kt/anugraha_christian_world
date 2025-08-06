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

import { getSuggestedProducts } from '@/utils/getSuggestedProducts'; 


import { Product, Review } from '@/lib/types';
import ProductReviews from '@/components/ProductReviews';
import ProductImageGallery from '@/components/ProductImageGallery';



interface ProductPageProps {
    params: {
        productId: string;
    };
}


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
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            notFound();
        }
        throw new Error('Failed to read product data.');
    }

    const product = allProducts.find(p => p.id === productId);
    if (!product) {
        notFound();
    }

    // ✅ Use the smart suggestion logic here
    const suggested = getSuggestedProducts(product, allProducts);

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
            <div className="w-full px-8 py-8 rounded-xl shadow-2xl overflow-hidden">
                {/* Main Product Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left: Image Gallery */}
                <ProductImageGallery
                name={product.name}
                mainImage={product.main_image}
                secondaryImages={product.secondary_images}
                />

                {/* Right: Product Details */}
                <div className="w-full">
                    <h1 className="text-4xl font-extrabold mb-2">{product.name}</h1>
                    <p className="leading-relaxed mb-4">{product.description}</p>

                    {/* Price and Quantity */}
                    <div className="mb-4">
                    <p className="text-2xl font-bold text-accent mb-1">${product.price.toFixed(2)}</p>
                    <p className="text-sm">In Stock: {product.quantity}</p>
                    </div>

                    {/* Tags */}
                    <div className="mt-6 flex flex-wrap gap-2">
                    {product.tags.map((tag: string) => (
                        <span key={tag} className="bg-secondary text-sm font-semibold px-3 py-1 rounded-full">
                        {tag.charAt(0).toUpperCase() + tag.slice(1)}
                        </span>
                    ))}
                    </div>

                    {/* Material and Size */}
                    <div className="mt-6 space-y-2">
                    <p><strong className="font-semibold">Material:</strong> {product.material}</p>
                    <p><strong className="font-semibold">Size:</strong> {product.size}</p>
                    </div>

                    {/* CTA Button */}
                    <div className="mt-8">
                    <EnquireButton productName={product.name} />
                    </div>
                </div>
                </div>

                <hr className="my-12 border-gray-200" />
                
                {/* 🔍 Additional Info Section */}
                <div className="mb-16">
                <h2 className="text-3xl font-bold  pb-2">
                    Additional Information
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {additionalInfoParsed.map((item, index) => (
                    <div key={index} className="bg-secondary p-4 rounded-lg shadow-sm">
                        <p className="text-sm  uppercase tracking-wide font-medium mb-1">
                        {item.title}
                        </p>
                        <p className="">{item.description}</p>
                    </div>
                    ))}
                </div>
                </div>

                {/* 🌟 Customer Reviews */}
                <ProductReviews productId={productId} initialReviews={product.reviews} />

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