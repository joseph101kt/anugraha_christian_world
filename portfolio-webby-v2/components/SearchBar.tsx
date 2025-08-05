// src/app/ui/SearchBar.tsx
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
    const newSearchParams = new URLSearchParams(searchParams.toString());
    
    if (searchTerm) {
      newSearchParams.set('query', searchTerm);
    } else {
      newSearchParams.delete('query');
    }
    
    router.push(`${pathname}?${newSearchParams.toString()}`);
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