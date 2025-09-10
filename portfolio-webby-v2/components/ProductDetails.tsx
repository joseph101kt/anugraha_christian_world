'use client';

import React from 'react';
import Link from 'next/link';

import ProductImageGallery from './ProductImageGallery';
import EnquireButton from './EnquireButton';
import ProductReviews from './ProductReviews';
import ProductGrid from './ProductGrid';
import { Product } from '@/lib/types';

interface ProductDetailsProps {
  product: Product;
  suggested?: Product[];
}

export default function ProductDetails({ product, suggested = [] }: ProductDetailsProps) {
  console.log('[ProductDetails] Rendering component with product:', product);
  console.log('[ProductDetails] Suggested products:', suggested);

  if (!product) return <p className="text-center py-20 text-red-500">Product not found</p>;

  return (
    <div className="w-full p-4 md:p-6 lg:p-8 rounded-xl shadow-2xl overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b pb-10 mb-10">
        <ProductImageGallery
          name={product.name}
          mainImage={product.main_image}
          secondaryImages={product.secondary_images}
        />

        <div className="w-full">
          <h1 className="!text-3xl md:!text-4xl lg:!text-5xl font-extrabold mb-2">{product.name}</h1>
          <p className="leading-relaxed mb-4">{product.description}</p>

          <div className="mb-4">
            <p className="text-2xl hidden font-bold text-accent mb-1">
              ${product.price?.toFixed(2)}
            </p>
            <p className="text-sm">In Stock: {product.quantity}</p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {product.tags?.map((tag) => (
              <span key={tag} className="bg-secondary text-sm font-semibold px-3 py-1 rounded-full">
                {tag.charAt(0).toUpperCase() + tag.slice(1)}
              </span>
            ))}
          </div>

          <div className="mt-6 space-y-2">
            <p><strong className="font-semibold">Material:</strong> {product.material}</p>
            <p><strong className="font-semibold">Size:</strong> {product.size}</p>
          </div>

          <div className="mt-8">
            <EnquireButton product={product} />
          </div>
        </div>
      </div>

      {product.additional_info?.length > 0 && (
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

      <div className="mb-16">
        <ProductReviews productId={product.slug} initialReviews={product.reviews} />
      </div>

      <div className="mb-12">
        <h2 className="text-3xl font-bold pb-4 border-b mb-6">Suggested Products</h2>
        {suggested.length > 0 ? (
          <ProductGrid products={suggested} ActionButton={EnquireButton} />
        ) : (
          <p className="text-center">No suggested products found.</p>
        )}
      </div>

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



