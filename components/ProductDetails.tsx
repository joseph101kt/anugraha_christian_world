// components/ProductDetails.tsx
import React from 'react';
import fs from 'fs/promises';
import path from 'path';
import { notFound } from 'next/navigation';
import Link from 'next/link';

import { getSuggestedProducts } from '@/utils/getSuggestedProducts';
import { Product } from '@/lib/types';

import ProductImageGallery from './ProductImageGallery';
import EnquireButton from './EnquireButton';
import ProductReviews from './ProductReviews';
import ProductGrid from './ProductGrid';

interface ProductDetailsProps {
  productId: string;
}

async function getProductData(productId: string): Promise<{ product: Product; suggested: Product[] }> {
  const filePath = path.join(process.cwd(), 'data', 'products.json');
  try {
    const jsonData = await fs.readFile(filePath, 'utf8');
    const allProducts: Product[] = JSON.parse(jsonData);
    const product = allProducts.find((p) => p.id === productId);
    if (!product) notFound();
    const suggested = getSuggestedProducts(product, allProducts);
    return { product, suggested };
  } catch (error) {
    console.error('[ProductDetails:getProductData] Failed to read product data:', error);
    notFound();
  }
}

export default async function ProductDetails({ productId }: ProductDetailsProps) {
  const { product, suggested } = await getProductData(productId);

  return (
    <div className="w-full p-4 md:p-6 lg:p-8 rounded-xl shadow-2xl overflow-hidden">
      
      {/* ==== PRIMARY SECTION ==== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b pb-10 mb-10">
        <ProductImageGallery
          name={product.name}
          mainImage={product.main_image}
          secondaryImages={product.secondary_images}
        />

        <div className="w-full">
          <h1 className=" !text-3xl md:!text-4xl lg:!text-5xl font-extrabold mb-2">{product.name}</h1>
          <p className="leading-relaxed mb-4">{product.description}</p>

          {/* Price & Stock */} {/* Price is hidden */}
          <div className="mb-4">
            <p className="text-2xl hidden font-bold text-accent mb-1">
              ${product.price.toFixed(2)}
            </p>
            <p className="text-sm">In Stock: {product.quantity}</p>
          </div>

          {/* Tags */}
          <div className="mt-4 flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className="bg-secondary text-sm font-semibold px-3 py-1 rounded-full"
              >
                {tag.charAt(0).toUpperCase() + tag.slice(1)}
              </span>
            ))}
          </div>

          {/* Material & Size */}
          <div className="mt-6 space-y-2">
            <p>
              <strong className="font-semibold">Material:</strong> {product.material}
            </p>
            <p>
              <strong className="font-semibold">Size:</strong> {product.size}
            </p>
          </div>

          {/* Enquire */}
          <div className="mt-8">
            <EnquireButton product={product} />
          </div>
        </div>
      </div>

      {/* ==== SECONDARY SECTION ==== */}
      {/* Additional Info */}
      {product.additional_info.length > 0 && (
        <div className="mb-16">
          <h2 className="text-3xl font-bold pb-4 border-b mb-6">Additional Information</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {product.additional_info.map((item, index) => (
              <div key={index} className="bg-secondary p-4 rounded-lg shadow-sm">
                <p className="text-sm uppercase tracking-wide font-medium mb-1">{item.title}</p>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      <div className="mb-16">
        <ProductReviews productId={productId} initialReviews={product.reviews} />
      </div>

      {/* Suggested Products */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold pb-4 border-b mb-6">Suggested Products</h2>
        {suggested.length > 0 ? (
          <ProductGrid products={suggested} ActionButton={EnquireButton} />
        ) : (
          <p className="text-center">No suggested products found.</p>
        )}
      </div>

      {/* Back to All Products */}
      <div className="text-center">
        <Link href="/products">
          <span className="inline-flex items-center justify-center px-6 py-3 rounded-lg shadow-sm text-base font-bold bg-primary hover:bg-accent transition-colors">
            Back to All Products
          </span>
        </Link>
      </div>
    </div>
  );
}
