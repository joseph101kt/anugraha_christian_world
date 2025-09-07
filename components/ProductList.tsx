// components/ProductList.tsx
'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductFilter from '@/components/ProductFilter';
import ProductCard from '@/components/ProductCard';
import Pagination from '@/components/Pagination';
import { FaSpinner } from 'react-icons/fa';
import { Product } from '@/lib/types';
import {
    fetchProducts,
    buildCategoryTagArray,
    filterAndScoreProducts,
    CategoryWithTags,
    ITEMS_PER_PAGE as Default_ITEMS_PER_PAGE,
} from '@/utils/products';

interface ProductListProps {
    ActionButton: React.ComponentType<{ product: Product }>;
    ITEMS_PER_PAGE?: number;
}

export default function ProductList({ ActionButton, ITEMS_PER_PAGE = Default_ITEMS_PER_PAGE }: ProductListProps) {
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusMessage, setStatusMessage] = useState({ type: '', message: '' });

    const searchParams = useSearchParams();
    const query = searchParams.get('query') || '';
    const tags = searchParams.getAll('tags');
    const pageParam = parseInt(searchParams.get('page') || '1', 10);

    useEffect(() => {
        setLoading(true);
        fetchProducts()
            .then(setAllProducts)
            .catch((error: unknown) => {
                const message = error instanceof Error ? error.message : 'Unknown error';
                setStatusMessage({ type: 'error', message: `Failed to fetch products: ${message}` });
            })
            .finally(() => setLoading(false));
    }, []);

    const categoryTagArray: CategoryWithTags[] = useMemo(
        () => buildCategoryTagArray(allProducts),
        [allProducts]
    );

    const filteredProducts: Product[] = useMemo(
        () => filterAndScoreProducts(allProducts, query, tags),
        [allProducts, query, tags]
    );

    const currentPage = pageParam;
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

    return (
        <Suspense>
            <div className="container mx-auto p-4 md:p-8">
                <div className="flex justify-between mb-6">
                    <ProductFilter categoryTagArray={categoryTagArray} />
                </div>

                {statusMessage.message && (
                    <div
                        className={`my-4 p-3 rounded-md flex items-center ${
                            statusMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}
                    >
                        <span>{statusMessage.message}</span>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center h-48">
                        <FaSpinner className="animate-spin text-4xl text-green-500" />
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <p className="col-span-full text-center text-lg">
                        {query
                            ? `No products found matching your search: "${query}".`
                            : `No products found for the selected filters.`}
                    </p>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {paginatedProducts.map((product, index) => (
                                <ProductCard key={product.id ?? `${product.name}-${index}`} product={product} ActionButton={ActionButton} />
                            ))}
                        </div>
                        <Pagination totalPages={totalPages} />
                    </>
                )}
            </div>
        </Suspense>
    );
}
