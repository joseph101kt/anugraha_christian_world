'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import ProductCard from './ProductCard';

// Define the interface for a Product
interface Product {
    id: string;
    name: string;
    description: string;
    image_url: string;
    tags: string[];
}

interface SuggestedProductsProps {
    suggested: Product[];
}

/**
 * A client component to display a grid of suggested products using the ProductCard component.
 * It handles the `onEnquire` action for each card by navigating to the contact page with a pre-filled query.
 * @param {SuggestedProductsProps} props - The component's props.
 */
export default function SuggestedProducts({ suggested }: SuggestedProductsProps) {
    const router = useRouter();

    /**
     * Handles the "Enquire Now" button click by routing to the contact page.
     * @param {string} productName - The name of the product to include in the query.
     */
    const handleEnquire = (productName: string) => {
        router.push(`/contact?query=I am interested in the ${productName}`);
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {suggested.map((suggestedProduct: Product) => (
                <ProductCard
                    key={suggestedProduct.id}
                    product={suggestedProduct}
                    onEnquire={handleEnquire}
                />
            ))}
        </div>
    );
}
