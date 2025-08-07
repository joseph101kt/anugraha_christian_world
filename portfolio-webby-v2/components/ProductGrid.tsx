// /components/ProductGrid.tsx

'use client';

import React from 'react';
import ProductCard from "@/components/ProductCard";
import { Product } from '@/lib/types';

interface ProductGridProps {
    products: Product[];
    ActionButton?: React.ComponentType<{ product: Product }>; // Optional prop
}

export default function ProductGrid({ products, ActionButton }: ProductGridProps) {
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
                        ActionButton={ActionButton}
                    />
                ))
            )}
        </div>
    );
}
