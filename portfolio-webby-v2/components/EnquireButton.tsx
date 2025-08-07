'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/lib/types';

interface EnquireButtonProps {
    product: Product;
}

export default function EnquireButton({ product }: EnquireButtonProps) {
    const router = useRouter();

    const handleEnquireClick = () => {
        const queryMessage = `I would like to know more about the product: ${product.name}.`;
        const encodedQuery = encodeURIComponent(queryMessage);
        router.push(`/contact?query=${encodedQuery}`);
    };

    return (
        <button
            onClick={handleEnquireClick}
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-bold bg-accent hover:bg-accent-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors w-full"
        >
            Enquire Now
        </button>
    );
}
