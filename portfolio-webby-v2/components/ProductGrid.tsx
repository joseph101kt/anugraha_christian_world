// src/components/ProductGrid.tsx
'use client';

import React from 'react';
import ProductCard from "@/components/ProductCard";

interface Product {
  id: string;
  name: string;
  description: string;
  tags: string[];
  image_url: string;
}

interface ProductGridProps {
  products: Product[];
  searchTerm: string;
  onEnquire: (productName: string) => void;
}

export default function ProductGrid({ products, searchTerm, onEnquire }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.length === 0 ? (
        <p className="col-span-full text-center text-lg">
          {searchTerm
            ? `No products found matching your search: "${searchTerm}".`
            : `No products found for the selected filters.`
          }
        </p>
      ) : (
        products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onEnquire={onEnquire}
          />
        ))
      )}
    </div>
  );
}