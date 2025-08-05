// src/components/ProductGrid.tsx
'use client';

import React from 'react';
import ProductCard from "@/components/ProductCard";

interface Product {
    id: string;
    name: string;
    description: string;
    tags: string[];
    image_url: string;
}

interface ProductGridProps {
    products: Product[];
    // The onEnquire prop is removed completely.
}

export default function ProductGrid({ products }: ProductGridProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.length === 0 ? (
                <p className="col-span-full text-center text-lg">
                    No products found that match the selected criteria.
                </p>
            ) : (
                products.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        // The onEnquire prop is no longer passed to ProductCard.
                    />
                ))
            )}
        </div>
    );
}