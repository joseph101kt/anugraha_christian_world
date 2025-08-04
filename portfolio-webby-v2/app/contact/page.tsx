'use client';

import React, { useEffect, useRef } from 'react';
import ContactForm from '@/components/ContactForm';

/**
 * This page serves as a container for the ContactForm component, providing the
 * overall layout and styling for the contact page.
 */
export default function ContactPage() {
    // Create a ref to hold a reference to the ContactForm component's DOM element
    const contactFormRef = useRef<HTMLDivElement>(null);

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
                <ContactForm />
            </div>
        </div>
    );
}


