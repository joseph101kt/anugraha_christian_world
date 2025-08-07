'use client';

import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export default function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSearchTerm = searchParams.get('query') || '';
  const [searchTerm, setSearchTerm] = useState(currentSearchTerm);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const newSearchParams = new URLSearchParams();

    if (searchTerm.trim()) {
      newSearchParams.set('query', searchTerm.trim());
    }

    const targetPath = '/products';
    const queryString = newSearchParams.toString();

    // Redirect to /products if not already there
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
        className="input bg-secondary text-text w-full !rounded-full"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </form>
  );
}
