// components/my-search-component.jsx
'use client';

import { useSearchParams } from 'next/navigation';

export default function MySearchComponent() {
  const searchParams = useSearchParams();
  // ... your code using searchParams
  return <p>Current search query: {searchParams.get('q')}</p>;
}