// components/ProductCard.tsx
'use client'; // This component has interactive elements

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Product } from '@/lib/types';

interface ProductCardProps {
    product: Product;
    ActionButton?: React.ComponentType<{ product: Product }>; // Optional button component
}

export default function ProductCard({ product, ActionButton }: ProductCardProps) {
    const router = useRouter();

    const handleEnquireClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        const queryMessage = `I would like to know the cost of the product, ${product.name}.`;
        const encodedQuery = encodeURIComponent(queryMessage);
        router.push(`/contact?query=${encodedQuery}`);
    };

    return (
        <div
            className='group relative rounded-xl overflow-hidden shadow-md flex flex-col 
                transition-transform duration-200 ease-in-out hover:shadow-xl hover:-translate-y-2 
                bg-secondary h-[450px]'
        >
            <Link href={`/products/${product.id}`}></Link>

            <Link href={`/products/${product.id}`} className='relative w-full h-[200px]'>
                <Image
                    src={product.main_image}
                    alt={product.name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority
                />
            </Link>

            <div style={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Link href={`/products/${product.id}`}>
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
                </Link>

                <div className="mt-auto z-10 w-full">
                    {ActionButton ? (
                        // Injected from ProductGrid
                        <ActionButton product={product} />
                    ) : (
                        // Default fallback to Enquire button
                        <button
                            onClick={handleEnquireClick}
                            className='bg-accent py-3 px-5 border-none rounded-lg text-base font-bold w-full'
                        >
                            Enquire Now
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
