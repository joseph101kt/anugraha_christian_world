// /components/DeleteProductCard.tsx
'use client'; 

import React from 'react';
import Image from 'next/image';

import { Product, Review } from '@/lib/types'; 

interface DeleteProductCardProps {
  product: Product;
  onDelete: (productId: string, productName: string) => void;
}

export default function DeleteProductCard({ product, onDelete }: DeleteProductCardProps) {
  return (
    <div
      key={product.id}
      className='rounded-xl overflow-hidden shadow-md flex flex-col transition-transform duration-200 ease-in-out bg-secondary h-[450px]'
      onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-5px)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
    >
      <div className='relative w-full h-[200px]'>
        <Image
          src={product.main_image} // Updated to use the new field
          alt={product.name}
          fill
          style={{ objectFit: 'cover' }}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority
        />
      </div>
      <div style={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontSize: '1.4em', marginBottom: '8px', }}>{product.name}</h2>
        <p className='text-sm leading-tight mb-4 flex-grow overflow-hidden text-ellipsis line-clamp-3'>
          {product.description}
        </p>
        {/* NEW: Display price and material for better context */}
        <div className="flex justify-between items-center mb-4">
            <span className="font-bold text-lg text-primary">${product.price.toFixed(2)}</span>
            <span className="text-sm text-gray-600">{product.material}</span>
        </div>
        <div style={{ marginBottom: '15px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
          {product.tags.map((tag, index) => (
            <span key={index} className='inline-block bg-accent text-xs px-2.5 py-1.5 rounded-full mr-2'>
              {tag.replace(/-/g, ' ')}
            </span>
          ))}
        </div>
        <button
          onClick={() => onDelete(product.id, product.name)}
          className='btn btn-error w-full'
        >
          Delete Product
        </button>
      </div>
    </div>
  );
}