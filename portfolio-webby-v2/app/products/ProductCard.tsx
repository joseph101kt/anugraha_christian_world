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
      style={{
        border: '1px solid #ddd',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s ease-in-out',
        backgroundColor: '#fff',
        height: '450px', // Maintain fixed height for consistency
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-5px)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
    >
      <div style={{ position: 'relative', width: '100%', height: '200px' }}>
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
          style={{
            fontSize: '0.9em',
            color: '#555',
            lineHeight: '1.4',
            marginBottom: '15px',
            flexGrow: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3, // Limit description to 3 lines
            WebkitBoxOrient: 'vertical',
          }}
        >
          {product.description}
        </p>
        <div style={{ marginBottom: '15px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
          {product.tags.map((tag, index) => (
            <span
              key={index}
              style={{
                display: 'inline-block',
                backgroundColor: '#e9e9e9',
                color: '#666',
                fontSize: '0.8em',
                padding: '5px 10px',
                borderRadius: '15px',
                marginRight: '8px',
              }}
            >
              {tag.replace(/-/g, ' ')}
            </span>
          ))}
        </div>
        <button
          onClick={() => onEnquire(product.name)}
          style={{
            backgroundColor: '#0070f3',
            color: '#fff',
            padding: '12px 20px',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1em',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease',
            width: '100%',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#005bb5')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0070f3')}
        >
          Enquire Now
        </button>
      </div>
    </div>
  );
}