// components/ProductGrid.tsx
'use client';

import React, { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from "@/components/ProductCard";
import Pagination from "@/components/Pagination";
import { Product } from '@/lib/types';

interface ProductGridProps {
    products: Product[];
    ActionButton?: React.ComponentType<{ product: Product }>; // Optional prop
}

const ITEMS_PER_PAGE = 20;

export default function ProductGrid({ products, ActionButton }: ProductGridProps) {
    const searchParams = useSearchParams();
    const pageParam = parseInt(searchParams.get('page') || '1', 10);

    // Calculate pagination data
    const { paginatedProducts, totalPages } = useMemo(() => {
        const startIndex = (pageParam - 1) * ITEMS_PER_PAGE;
        const paginated = products.slice(startIndex, startIndex + ITEMS_PER_PAGE);
        return {
            paginatedProducts: paginated,
            totalPages: Math.ceil(products.length / ITEMS_PER_PAGE),
        };
    }, [products, pageParam]);

    return (
        <Suspense>
        <div className="flex flex-col gap-6">
            {paginatedProducts.length === 0 ? (
                <p className="text-center text-lg">
                    No products found that match the selected criteria.
                </p>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {paginatedProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                ActionButton={ActionButton}
                            />
                        ))}
                    </div>
                    <Pagination totalPages={totalPages} />
                </>
            )}
        </div>
        </Suspense>
    );
}
