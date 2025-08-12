// components/SerachBar.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export default function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize local state with the current URL query, if any
  const currentSearchTerm = searchParams.get('query') || '';
  const [searchTerm, setSearchTerm] = useState(currentSearchTerm);

  // Keep search input in sync with URL changes
  useEffect(() => {
    const query = searchParams.get('query') || '';
    setSearchTerm(query);
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    // Clone current params so we preserve filters (tags, etc.)
    const newSearchParams = new URLSearchParams(searchParams.toString());

    // Reset pagination so a new search starts on page 1
    newSearchParams.delete('page');

    // Update the 'query' parameter based on search input
    if (searchTerm.trim()) {
      newSearchParams.set('query', searchTerm.trim());
    } else {
      newSearchParams.delete('query');
    }

    const queryString = newSearchParams.toString();

    // Route logic — keep on current path or go to /products
    if (!pathname.startsWith('/dashboard')) {
      router.push(`/products?${queryString}`);
    } else {
      router.push(`${pathname}?${queryString}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="form-control w-full">
      <input
        type="text"
        placeholder="Search products..."
        className="input bg-secondary text-text w-full !rounded-full border-accent border-2"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </form>
  );
}
