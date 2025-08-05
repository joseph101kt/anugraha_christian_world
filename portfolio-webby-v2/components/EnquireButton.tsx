// components/EnquireButton

'use client'; // This component requires client-side interactivity

import React from 'react';
import { useRouter } from 'next/navigation';

interface EnquireButtonProps {
    productName: string;
}

/**
 * A client-side component for an "Enquire Now" button.
 * It handles the navigation and query string generation for the contact page.
 */
export default function EnquireButton({ productName }: EnquireButtonProps) {
    const router = useRouter();

    const handleEnquireClick = () => {
        // Construct the message for the query parameter
        const queryMessage = `I would like to know more about the product: ${productName}.`;

        // Encode the message to be safely included in a URL
        const encodedQuery = encodeURIComponent(queryMessage);

        // Programmatically navigate to the contact page with the query
        router.push(`/contact?query=${encodedQuery}`);
    };

    return (
        <button
            onClick={handleEnquireClick}
            className='inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-bold bg-accent hover:bg-accent-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-colors'
        >
            Enquire Now
        </button>
    );
}
