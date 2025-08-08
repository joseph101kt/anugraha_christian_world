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

  // Synchronize the local state with the URL query parameter whenever the URL changes
  useEffect(() => {
    const query = searchParams.get('query') || '';
    setSearchTerm(query);
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    // Start with the current search parameters to preserve other filters (like tags)
    const newSearchParams = new URLSearchParams(searchParams.toString());

    // Only add the 'query' parameter if the search term is not empty
    if (searchTerm.trim()) {
      newSearchParams.set('query', searchTerm.trim());
    } else {
      // If the search term is empty, remove the 'query' parameter
      newSearchParams.delete('query');
    }

    const targetPath = '/products';
    const queryString = newSearchParams.toString();

    // Redirect to /products if not already there, otherwise update the current page
    if (pathname !== targetPath) {
      router.push(`${targetPath}?${queryString}`);
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
