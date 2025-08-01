// src/app/products/ProductListClient.tsx
'use client';

import React, { useState, useMemo } from 'react';
import ProductCard from './ProductCard';
import SearchBar from "@/components/SearchBar";

interface Product {
  id: string;
  name: string;
  description: string;
  tags: string[];
  image_url: string;
}

interface ProductListClientProps {
  products: Product[];
  searchTerm: string; // The search term is now a prop
}

export default function ProductListClient({ products, searchTerm }: ProductListClientProps) {
  // State for the tags selected inside the filter panel
  const [activeTags, setActiveTags] = useState<string[]>([]);
  // State to control the visibility of the filter panel
  const [showFilterPanel, setShowFilterPanel] = useState<boolean>(false);

  // Memoize the list of all available tags to prevent re-calculation on every render
  const allTags = useMemo(() => Array.from(new Set(products.flatMap(product => product.tags))), [products]);

  // Combined filtering logic using useMemo for performance
  const filteredProducts = useMemo(() => {
    let result = products;

    // Prioritize search filtering if a search term exists
    if (searchTerm) {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      result = result.filter(product =>
        product.name.toLowerCase().includes(lowercasedSearchTerm) ||
        product.tags.some(tag => tag.toLowerCase().includes(lowercasedSearchTerm)) ||
        product.description.toLowerCase().includes(lowercasedSearchTerm)
      );
    } 
    
    // If no search term, apply tag filtering
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
        ? prevTags.filter(t => t !== tag) // If tag is active, remove it
        : [...prevTags, tag] // If tag is not active, add it
    );
  };
  
  const handleAllProductsClickInPanel = () => {
    setActiveTags([]); // Clear all selections
  };

  const handleApplyFilters = () => {
    // Since filtering is live, this button's only job is to hide the panel.
    setShowFilterPanel(false);  
  };

  const handleEnquireClick = (productName: string) => {
    alert(`Enquiring about: ${productName}.`);
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl md:text-4xl text-center font-bold text-gray-800 mb-8">Our Products</h1>
      <div className="flex justify-between items-center mb-6">
        {/* Search Bar (Right) */}
        <div className="w-full max-w-sm">
          <SearchBar />
        </div>
        
        {/* Filter Button (Left) */}
        <button
          onClick={handleOpenFilters}
          className="btn btn-accent rounded-full"
        >
          {activeTags.length > 0 ? `Filters (${activeTags.length})` : 'Filter'}
        </button>
        

      </div>
      {/* The filter panel with DaisyUI classes */}
      {showFilterPanel && (
        <div className="bg-accent p-6 rounded-box shadow-xl mb-8">
          <h3 className="text-xl font-semibold  mb-4">Choose Filters</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleAllProductsClickInPanel}
              className={`btn ${activeTags.length === 0 ? 'btn-primary' : 'btn-ghost'}`}
              disabled={!!searchTerm}
            >
              All Products
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => handleTagClickInPanel(tag)}
                className={`btn ${activeTags.includes(tag) ? 'btn-primary' : 'btn-ghost'}`}
                disabled={!!searchTerm}
              >
                {tag.charAt(0).toUpperCase() + tag.slice(1).replace(/-/g, ' ')}
              </button>
            ))}
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <button onClick={handleApplyFilters} className="btn btn-primary">
              Apply Filters
            </button>
            <button onClick={() => setShowFilterPanel(false)} className="btn btn-ghost">
              Cancel
            </button>
          </div>
        </div>
      )}



      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.length === 0 ? (
          <p className="col-span-full text-center text-lg">
            {searchTerm 
              ? `No products found matching your search: "${searchTerm}".`
              : `No products found for the selected filters.`
            }
          </p>
        ) : (
          filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEnquire={handleEnquireClick}
            />
          ))
        )}
      </div>
    </div>
  );
}