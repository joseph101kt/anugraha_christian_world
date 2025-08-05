// src/app/products/page.tsx
import fs from 'fs/promises';
import path from 'path';
import { Suspense } from 'react';
import ProductListClient from './ProductListClient';
import SearchBar from '@/components/SearchBar';
import ProductFilter from '@/components/ProductFilter';

import { Product, Review } from '@/lib/types'; 



interface ProductsPageProps {
    searchParams: {
        query?: string;
        tags?: string | string[];
    };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
    let products: Product[] = [];
    const filePath = path.join(process.cwd(), 'data', 'products.json');
    
    try {
        const jsonData = await fs.readFile(filePath, 'utf8');
        products = JSON.parse(jsonData);
    } catch (error) {
        console.error('Error reading products.json:', error);
    }

    const allTags = [...new Set(products.flatMap(p => p.tags))];
    const query = searchParams.query?.toLowerCase() || '';
    const activeTags = Array.isArray(searchParams.tags) ? searchParams.tags : (searchParams.tags ? [searchParams.tags] : []);
    
    const filteredProducts = products.filter(product => {
        // --- THIS IS THE UPDATED SEARCH LOGIC ---
        // The search now matches the product name OR any of its tags.
        const matchesSearch = query === '' || 
            product.name.toLowerCase().includes(query) ||
            product.tags.some(tag => tag.toLowerCase().includes(query));

        const matchesTags = activeTags.length === 0 || activeTags.some(tag => product.tags.includes(tag));
        
        return matchesSearch && matchesTags;
    });

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <div className="container mx-auto p-4 md:p-8">
                <div className="flex justify-between  mb-6">

                    <ProductFilter allTags={allTags} />
                    <div className="w-full max-w-sm">
                        <SearchBar />
                    </div>
                </div>
                <ProductListClient products={filteredProducts} />
            </div>
        </Suspense>
    );
}