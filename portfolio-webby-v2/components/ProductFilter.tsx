// /components/ProductFilter.tsx
'use client';

import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface ProductFilterProps {
  allTags: string[];
}

export default function ProductFilter({
  allTags,
}: ProductFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  
  const activeTags = searchParams.getAll('tags');
  
  const handleTagClick = (tag: string) => {
    const currentTags = searchParams.getAll('tags');
    const newSearchParams = new URLSearchParams(searchParams.toString());

    if (currentTags.includes(tag)) {
      newSearchParams.delete('tags');
      currentTags.filter(t => t !== tag).forEach(t => newSearchParams.append('tags', t));
    } else {
      newSearchParams.append('tags', tag);
    }
    router.push(`?${newSearchParams.toString()}`);
  };

  const handleAllProductsClick = () => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.delete('tags');
    router.push(`?${newSearchParams.toString()}`);
  };

  return (
    // We are back to a simple vertical flex container
    <div className="flex flex-col gap-2"> 
      {/* The button has a fixed width to prevent resizing */}
      <button
        onClick={() => setShowFilterPanel(!showFilterPanel)}
        className="btn btn-accent font-black rounded-full w-40"
      >
        {activeTags.length > 0 ? `Filters (${activeTags.length})` : 'Filter'}
      </button>

      {/* The filter panel is now a part of the document flow */}
      {showFilterPanel && (
        <div className="bg-accent p-6 rounded-box shadow-xl mb-8">
          <h3 className="text-xl font-semibold mb-4">Choose Filters</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleAllProductsClick}
              className={`btn ${activeTags.length === 0 ? 'btn-primary' : 'btn-ghost'}`}
            >
              All Products
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={`btn ${activeTags.includes(tag) ? 'btn-primary' : 'btn-ghost'}`}
              >
                {tag.charAt(0).toUpperCase() + tag.slice(1).replace(/-/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}