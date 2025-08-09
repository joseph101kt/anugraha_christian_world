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

// New Props interface for ProductList
interface ProductListProps {
    ActionButton: React.ComponentType<{ product: Product }>;
}

const ITEMS_PER_PAGE = 8; // Number of products to display per page

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

    const allTags = useMemo(() => Array.from(new Set(allProducts.flatMap(product => product.tags))), [allProducts]);

    const filteredProducts = useMemo(() => {
        let result = allProducts;
        const searchTerm = searchParams.get('query')?.toLowerCase() || '';
        const activeTags = searchParams.getAll('tags');

        if (searchTerm) {
            result = result.filter(product =>
                product.name.toLowerCase().includes(searchTerm) ||
                product.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
                product.description.toLowerCase().includes(searchTerm)
            );
        }
        
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
            <div className="flex justify-between  mb-6">
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
                        : `No products found for the selected filters.`
                    }
                </p>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {paginatedProducts.length > 0 && paginatedProducts.map((product) => (
                        // Make sure the ProductCard component is always rendering something.
                        // If it can return `null` or an empty div, that's a problem.
                        <ProductCard key={product.id} product={product} ActionButton={ActionButton} />
                    ))}
                    </div>
                    <Pagination totalPages={totalPages} />
                </>
            )}
        </div>
    );
}