// components/ProductList.tsx
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductFilter from "@/components/ProductFilter";
import SearchBar from '@/components/SearchBar';
import { FaSpinner } from 'react-icons/fa';

import { Product } from '@/lib/types';
import ProductCard from '@/components/ProductCard'; // Import your existing ProductCard
import Pagination from '@/components/Pagination'; // Assuming you have a Pagination component

interface ProductListProps {
    ActionButton: React.ComponentType<{ product: Product }>;
}

const ITEMS_PER_PAGE = 8;

export default function ProductList({ ActionButton }: ProductListProps) {
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [statusMessage, setStatusMessage] = useState({ type: '', message: '' });
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        async function fetchProducts() {
            setLoading(true);
            try {
                const response = await fetch('/api/products');
                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }
                const data = await response.json();
                setAllProducts(data);
            } catch (error: unknown) {
                console.error('Error fetching products:', error);
                const message = error instanceof Error ? error.message : 'An unknown error occurred.';
                setStatusMessage({ type: 'error', message: `Failed to fetch products: ${message}` });
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, []);

    // Extract all unique tags from products
    const allTags = useMemo(() => 
        Array.from(new Set(allProducts.flatMap(product => product.tags))),
        [allProducts]
    );

    // Enhanced filtering and ranking logic
    const filteredProducts = useMemo(() => {
        let result = allProducts;
        const searchTermRaw = searchParams.get('query')?.toLowerCase() || '';
        const activeTags = searchParams.getAll('tags');

        // Normalize search term: replace '-' with space, split by spaces, filter out empty words
        const normalizedSearchTerm = searchTermRaw.replace(/-/g, ' ');
        const searchWords = normalizedSearchTerm.split(/\s+/).filter(Boolean);

        if (searchWords.length > 0) {
            // Map products to scored objects
            const scoredProducts = allProducts
                .map(product => {
                    let score = 0;
                    const name = product.name.toLowerCase();
                    const description = product.description.toLowerCase();
                    const material = (product.material || '').toLowerCase();
                    const tags = product.tags.map(tag => tag.toLowerCase());

                    for (const word of searchWords) {
                        if (name.includes(word)) score += 3;
                        if (description.includes(word)) score += 2;
                        if (material.includes(word)) score += 2;
                        if (tags.some(tag => tag.includes(word))) score += 1;
                    }

                    return { product, score };
                })
                // Filter out products with no match
                .filter(({ score }) => score > 0)
                // Sort by score descending
                .sort((a, b) => b.score - a.score)
                .map(({ product }) => product);

            result = scoredProducts;
        }

        // Apply tag filters (after scoring)
        if (activeTags.length > 0) {
            result = result.filter(product =>
                activeTags.some(tag => product.tags.includes(tag))
            );
        }

        return result;
    }, [allProducts, searchParams]);

    // Pagination logic
    const currentPage = parseInt(searchParams.get('page') || '1', 10);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="flex justify-between mb-6">
                <ProductFilter allTags={allTags} />
                <div className="w-full m-2 max-w-sm">
                    <SearchBar />
                </div>
            </div>

            {statusMessage.message && (
                <div className={`my-4 p-3 rounded-md flex items-center ${
                    statusMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                    <span>{statusMessage.message}</span>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center h-48">
                    <FaSpinner className="animate-spin text-4xl text-green-500" />
                </div>
            ) : filteredProducts.length === 0 ? (
                <p className="col-span-full text-center text-lg">
                    {searchParams.get('query')
                        ? `No products found matching your search: "${searchParams.get('query')}".`
                        : `No products found for the selected filters.`}
                </p>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {paginatedProducts.map(product => (
                            <ProductCard key={product.id} product={product} ActionButton={ActionButton} />
                        ))}
                    </div>
                    <Pagination totalPages={totalPages} />
                </>
            )}
        </div>
    );
}
