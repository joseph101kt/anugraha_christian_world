'use client'; // This component has interactive elements

import React from 'react';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  description: string;
  tags: string[];
  image_url: string;
}

interface ProductCardProps {
  product: Product;
  onEnquire: (productName: string) => void;
}

export default function ProductCard({ product, onEnquire }: ProductCardProps) {
  return (
    <div
      key={product.id}
      className='border border-gray-300 rounded-xl overflow-hidden shadow-md flex flex-col 
      transition-transform duration-200 ease-in-out bg-accent h-[450px]'
      
      onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-5px)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
    >
      <div className='relative w-full h-[200px]'>
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          style={{ objectFit: 'cover' }}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority
        />
      </div>
      <div style={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontSize: '1.4em', marginBottom: '8px', color: '#333' }}>{product.name}</h2>
        <p
          className='text-sm text-gray-600 leading-tight mb-4 flex-grow overflow-hidden text-ellipsis line-clamp-3'
        >
          {product.description}
        </p>
        <div style={{ marginBottom: '15px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
          {product.tags.map((tag, index) => (
            <span
              key={index}
              className='inline-block bg-secondary text-gray-700 text-xs px-2.5 py-1.5 rounded-full mr-2'
            >
              {tag.replace(/-/g, ' ')}
            </span>
          ))}
        </div>
        <button
          onClick={() => onEnquire(product.name)}
          className='bg-primary text-white py-3 px-5 border-none rounded-lg text-base font-bold   w-full '        >
          Enquire Now
        </button>
      </div>
    </div>
  );
}