// components/ProductList.tsx
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductFilter from "@/components/ProductFilter";
import { FaSpinner } from 'react-icons/fa';

import { Product } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import Pagination from '@/components/Pagination';

interface ProductListProps {
    ActionButton: React.ComponentType<{ product: Product }>;
}

const ITEMS_PER_PAGE = 20;

export default function ProductList({ ActionButton }: ProductListProps) {
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [statusMessage, setStatusMessage] = useState({ type: '', message: '' });
    const searchParams = useSearchParams();
    const router = useRouter();

    // Extract current params once (to be used in effects and memo)
    const query = searchParams.get('query') || '';
    const tags = searchParams.getAll('tags');
    const pageParam = parseInt(searchParams.get('page') || '1', 10);

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




    // Enhanced filtering and ranking logic with combined search and tag scoring
    const filteredProducts = useMemo(() => {
        const activeTags = tags.map(t => t.toLowerCase());
        const searchTermRaw = query.toLowerCase();
        const normalizedSearchTerm = searchTermRaw.replace(/-/g, ' ');
        const searchWords = normalizedSearchTerm.split(/\s+/).filter(Boolean);

        // Show all if no filters/search
        if (searchWords.length === 0 && activeTags.length === 0) {
            return allProducts;
        }

        const scoredProducts = allProducts
            .map(product => {
                let score = 0;
                const name = product.name.toLowerCase();
                const description = product.description.toLowerCase();
                const material = (product.material || '').toLowerCase();
                const tags = product.tags.map(tag => tag.toLowerCase());

                // Search term scoring
                for (const word of searchWords) {
                    if (name.includes(word)) score += 3;
                    if (description.includes(word)) score += 2;
                    if (material.includes(word)) score += 2;
                    if (tags.some(tag => tag.includes(word))) score += 1;
                }

                // Tag matching scoring (5 points per matching tag)
                if (activeTags.length > 0) {
                    const matchingTagsCount = activeTags.filter(tag => tags.includes(tag)).length;
                    score += matchingTagsCount * 5;
                }

                return { product, score };
            })
            // Filter out zero-score products (no match)
            .filter(({ score }) => score > 0)
            // Sort descending by score
            .sort((a, b) => b.score - a.score)
            .map(({ product }) => product);

        return scoredProducts;
    }, [allProducts, query, tags]);


    const category = searchParams.get('category') || '';


    // Pagination logic
    const currentPage = pageParam;
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

    interface CategoryWithTags {
    category: string;
    tags: string[];
    }

function buildCategoryTagArray(products: Product[]): CategoryWithTags[] {
    const map: Record<string, Set<string>> = {};

    products.forEach(product => {
    // Assign a fallback category if undefined
    const category = product.category ?? "Others";

    if (!map[category]) {
        map[category] = new Set();
    }
    product.tags.forEach(tag => map[category].add(tag)); // use 'category' instead of 'product.category'
    });

    return Object.entries(map).map(([category, tagsSet]) => ({
        category,
        tags: Array.from(tagsSet),
    }));
}
    const categoryTagArray = useMemo(() => buildCategoryTagArray(allProducts), [allProducts]);



    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="flex justify-between mb-6">
                <ProductFilter categoryTagArray={categoryTagArray} />

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
                    {query
                        ? `No products found matching your search: "${query}".`
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
