// src/components/ProductFilter.tsx
'use client';

import React from 'react';

interface ProductFilterProps {
  allTags: string[];
  activeTags: string[];
  searchTerm: string;
  showFilterPanel: boolean;
  onOpenFilters: () => void;
  onTagClick: (tag: string) => void;
  onAllProductsClick: () => void;
  onApplyFilters: () => void;
  onCancelFilters: () => void;
}

export default function ProductFilter({
  allTags,
  activeTags,
  searchTerm,
  showFilterPanel,
  onOpenFilters,
  onTagClick,
  onAllProductsClick,
  onApplyFilters,
  onCancelFilters,
}: ProductFilterProps) {
  return (
    <>
      {/* Filter Button */}
      <button
        onClick={onOpenFilters}
        className="btn btn-accent rounded-full"
      >
        {activeTags.length > 0 ? `Filters (${activeTags.length})` : 'Filter'}
      </button>

      {/* The filter panel with DaisyUI classes */}
      {showFilterPanel && (
        <div className="bg-accent p-6 rounded-box shadow-xl mb-8">
          <h3 className="text-xl font-semibold mb-4">Choose Filters</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={onAllProductsClick}
              className={`btn ${activeTags.length === 0 ? 'btn-primary' : 'btn-ghost'}`}
              disabled={!!searchTerm}
            >
              All Products
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => onTagClick(tag)}
                className={`btn ${activeTags.includes(tag) ? 'btn-primary' : 'btn-ghost'}`}
                disabled={!!searchTerm}
              >
                {tag.charAt(0).toUpperCase() + tag.slice(1).replace(/-/g, ' ')}
              </button>
            ))}
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <button onClick={onApplyFilters} className="btn btn-primary">
              Apply Filters
            </button>
            <button onClick={onCancelFilters} className="btn btn-ghost">
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}