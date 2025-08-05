// app/contact/page.tsx

'use client';

import React, { useEffect, useRef } from 'react';
import ContactForm from '@/components/ContactForm';
import { useSearchParams } from 'next/navigation';

/**
 * This page serves as a container for the ContactForm component, providing the
 * overall layout and styling for the contact page. It now reads a 'query'
 * parameter from the URL to pre-fill the contact form.
 */
export default function ContactPage() {
    // Create a ref to hold a reference to the ContactForm component's DOM element
    const contactFormRef = useRef<HTMLDivElement>(null);
    
    // Use the useSearchParams hook to get the URL query parameters
    const searchParams = useSearchParams();
    
    // Get the 'query' value from the URL parameters. If it doesn't exist, it will be null.
    const initialQuery = searchParams.get('query') || '';

    // Use useEffect to scroll to the form when the component mounts
    useEffect(() => {
        // Check if the ref has a value (i.e., the component has been rendered)
        if (contactFormRef.current) {
            // Scroll the element into view. The 'smooth' behavior provides a nice animation.
            contactFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, []); // The empty dependency array ensures this effect runs only once on page load

    return (
        <div className="flex flex-col items-center justify-center min-h-screen ">
            {/* Attach the ref to the div that wraps the ContactForm */}
            <div ref={contactFormRef}>
                {/* Pass the initialQuery from the URL to the ContactForm component */}
                <ContactForm initialQuery={initialQuery} />
            </div>
        </div>
    );
}
