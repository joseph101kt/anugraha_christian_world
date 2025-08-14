'use client';

import React, { useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import SearchBar from '@/components/SearchBar';

interface CategoryWithTags {
  category: string;
  tags: string[];
}

interface ProductFilterProps {
  categoryTagArray: CategoryWithTags[];
}

export default function ProductFilter({ categoryTagArray }: ProductFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPath = usePathname();

  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const activeTags = searchParams.getAll('tags');

  // Toggle tag selection
  const handleTagClick = (tag: string) => {
    const currentTags = searchParams.getAll('tags');
    const newSearchParams = new URLSearchParams(searchParams.toString());

    if (currentTags.includes(tag)) {
      newSearchParams.delete('tags');
      currentTags.filter(t => t !== tag).forEach(t => newSearchParams.append('tags', t));
    } else {
      newSearchParams.append('tags', tag);
    }

    newSearchParams.delete('page');
    newSearchParams.set('page', '1');

    if (currentPath === '/') {
      router.push(`/products?${newSearchParams.toString()}`);
    } else {
      router.replace(`?${newSearchParams.toString()}`);
    }
  };

  // Clear all filters
  const handleClearAll = () => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.delete('tags');
    newSearchParams.delete('page');
    newSearchParams.set('page', '1');

    if (currentPath === '/') {
      router.push(`/products?${newSearchParams.toString()}`);
    } else {
      router.replace(`?${newSearchParams.toString()}`);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex  flex-wrap justify-between items-center gap-4 mb-4">
        <h3 className="text-xl font-semibold flex-shrink-0">Categories</h3>
        <div className="flex items-center gap-4">
          <div className="w-full m-2 max-w-sm">
            <SearchBar />
          </div>
          <button
            onClick={handleClearAll}
            className="px-3 py-1 w-30 border-2 border-accent bg-secondary rounded-full hover:bg-accent hover:text-white transition-colors"
            aria-label="Clear all filters"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Bento grid for md+ screens */}
      <div className="hidden w-full md:grid grid-cols-3 gap-4">
        {categoryTagArray.map(({ category, tags }) => {
          const sortedTags = [...tags].sort((a, b) =>
            a.localeCompare(b, undefined, { sensitivity: 'base' })
          );
          return (
            <div
              key={category}
              className="rounded-xl p-4 shadow-sm bg-secondary"
            >
              <h4 className="font-bold mb-2">{category}</h4>
              <div className="flex flex-wrap gap-2">
                {sortedTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className={`px-3 py-1 rounded border transition-colors ${
                      activeTags.includes(tag)
                        ? 'bg-accent border-accent text-white hover:bg-accent/90'
                        : 'border-accent hover:bg-accent hover:text-white'
                    }`}
                  >
                    {tag.replace(/-/g, ' ')}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Accordion for small screens */}
      <div className="md:hidden">
        {categoryTagArray.map(({ category, tags }) => {
          const sortedTags = [...tags].sort((a, b) =>
            a.localeCompare(b, undefined, { sensitivity: 'base' })
          );
          return (
            <div
              key={category}
              className="mb-3 border border-primary rounded shadow-sm bg-secondary"
            >
              <button
                className="w-full text-left px-4 py-2 font-semibold flex justify-between items-center"
                onClick={() =>
                  setExpandedCategory(prev =>
                    prev === category ? null : category
                  )
                }
                aria-expanded={expandedCategory === category}
                aria-controls={`panel-${category}`}
              >
                {category}
                <span>{expandedCategory === category ? '-' : '+'}</span>
              </button>
              {expandedCategory === category && (
                <div
                  id={`panel-${category}`}
                  className="p-4 flex flex-wrap gap-2"
                >
                  {sortedTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => handleTagClick(tag)}
                      className={`px-3 py-1 rounded border transition-colors ${
                        activeTags.includes(tag)
                          ? 'bg-accent border-accent text-white hover:bg-accent/90'
                          : 'border-accent hover:bg-accent hover:text-white'
                      }`}
                    >
                      {tag.replace(/-/g, ' ')}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
