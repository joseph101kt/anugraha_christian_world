// src/app/products/ProductListClient.tsx
'use client';

import React, { useState, useMemo } from 'react';
import SearchBar from "@/components/SearchBar";
import ProductFilter from "@/components/ProductFilter"; // Import the new filter component
import ProductGrid from "@/components/ProductGrid";     // Import the new grid component

interface Product {
    id: string;
    name: string;
    description: string;
    tags: string[];
    image_url: string;
}

interface ProductListClientProps {
    products: Product[];
    searchTerm: string;
}

export default function ProductListClient({ products, searchTerm }: ProductListClientProps) {
    const [activeTags, setActiveTags] = useState<string[]>([]);
    const [showFilterPanel, setShowFilterPanel] = useState<boolean>(false);

    const allTags = useMemo(() => Array.from(new Set(products.flatMap(product => product.tags))), [products]);

    const filteredProducts = useMemo(() => {
        let result = products;

        if (searchTerm) {
            const lowercasedSearchTerm = searchTerm.toLowerCase();
            result = result.filter(product =>
                product.name.toLowerCase().includes(lowercasedSearchTerm) ||
                product.tags.some(tag => tag.toLowerCase().includes(lowercasedSearchTerm)) ||
                product.description.toLowerCase().includes(lowercasedSearchTerm)
            );
        }
        else if (activeTags.length > 0) {
            result = result.filter(product =>
                activeTags.some(tag => product.tags.includes(tag))
            );
        }

        return result;
    }, [searchTerm, activeTags, products]);

    const handleOpenFilters = () => {
        setShowFilterPanel(prev => !prev);
    };

    const handleTagClickInPanel = (tag: string) => {
        setActiveTags(prevTags =>
            prevTags.includes(tag)
                ? prevTags.filter(t => t !== tag)
                : [...prevTags, tag]
        );
    };

    const handleAllProductsClickInPanel = () => {
        setActiveTags([]);
    };

    const handleApplyFilters = () => {
        setShowFilterPanel(false);
    };

    const handleCancelFilters = () => {
        // Optionally reset filters to previous state, or just close the panel
        setShowFilterPanel(false);
    }

    const handleEnquireClick = (productName: string) => {
        // NOTE: alert() is not visible to the user in this environment.
        // We'll use a console log instead for a better user experience.
        console.log(`Enquiring about: ${productName}.`);
    };

    return (
        <div className="container mx-auto p-4 md:p-8">
            <h1 className="text-3xl md:text-4xl text-center font-bold mb-8">Our Products</h1>
            <div className="flex justify-between items-center mb-6">
                {/* Search Bar */}
                <div className="w-full max-w-sm">
                    <SearchBar />
                </div>

                {/* Filter Button */}
                <ProductFilter
                    allTags={allTags}
                    activeTags={activeTags}
                    searchTerm={searchTerm}
                    showFilterPanel={showFilterPanel}
                    onOpenFilters={handleOpenFilters}
                    onTagClick={handleTagClickInPanel}
                    onAllProductsClick={handleAllProductsClickInPanel}
                    onApplyFilters={handleApplyFilters}
                    onCancelFilters={handleCancelFilters}
                />
            </div>

            {/* Product Grid */}
            <ProductGrid
                products={filteredProducts}
                searchTerm={searchTerm}
                onEnquire={handleEnquireClick}
            />
        </div>
    );
}
