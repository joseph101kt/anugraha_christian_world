'use client';

import React, { useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

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
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Categories</h3>
        <button
          onClick={handleClearAll}
          className="btn btn-sm btn-outline"
          aria-label="Clear all filters"
        >
          Clear All
        </button>
      </div>

      {/* Bento grid for md+ screens */}
      <div className="hidden md:grid grid-cols-3 gap-4">
        {categoryTagArray.map(({ category, tags }) => (
          <div key={category} className="border rounded p-4 shadow-sm">
            <h4 className="font-bold mb-2">{category}</h4>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className={`btn btn-sm ${
                    activeTags.includes(tag) ? 'btn-primary' : 'btn-outline'
                  }`}
                >
                  {tag.replace(/-/g, ' ')}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Accordion for small screens */}
      <div className="md:hidden">
        {categoryTagArray.map(({ category, tags }) => (
          <div key={category} className="mb-3 border rounded shadow-sm">
            <button
              className="w-full text-left px-4 py-2 font-semibold flex justify-between items-center"
              onClick={() => setExpandedCategory(prev => (prev === category ? null : category))}
              aria-expanded={expandedCategory === category}
              aria-controls={`panel-${category}`}
            >
              {category}
              <span>{expandedCategory === category ? '-' : '+'}</span>
            </button>
            {expandedCategory === category && (
              <div id={`panel-${category}`} className="p-4 flex flex-wrap gap-2">
                {tags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className={`btn btn-sm ${
                      activeTags.includes(tag) ? 'btn-primary' : 'btn-outline'
                    }`}
                  >
                    {tag.replace(/-/g, ' ')}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
