'use client'; // This component has interactive elements

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

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
    // Function to handle the enquire button click and stop event propagation
    const handleEnquireClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevents the parent Link from navigating
        onEnquire(product.name);
    };

    return (
        <Link
            href={`/products/${product.id}`}
            className='group block rounded-xl overflow-hidden shadow-md flex flex-col 
             transition-transform duration-200 ease-in-out hover:shadow-xl hover:-translate-y-2 bg-secondary h-[450px]'
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
                <h2 style={{ fontSize: '1.4em', marginBottom: '8px' }}>{product.name}</h2>
                <p
                    className='text-sm leading-tight mb-4 flex-grow overflow-hidden text-ellipsis line-clamp-3'
                >
                    {product.description}
                </p>
                <div style={{ marginBottom: '15px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    {product.tags.map((tag, index) => (
                        <span
                            key={index}
                            className='inline-block bg-secondary text-xs px-2.5 py-1.5 rounded-full mr-2'
                        >
                            {tag.replace(/-/g, ' ')}
                        </span>
                    ))}
                </div>
                <button
                    onClick={handleEnquireClick}
                    className='bg-accent py-3 px-5 border-none rounded-lg text-base font-bold w-full'
                >
                    Enquire Now
                </button>
            </div>
        </Link>
    );
}
