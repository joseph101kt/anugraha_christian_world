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


    return (
    <section className="p-6 md:p-10">


        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl mx-auto">

            {/* Contact Form */}
            <div className="flex items-center justify-center">
                <div ref={contactFormRef} className="w-full max-w-xl  rounded-xl ">
                <ContactForm initialQuery={initialQuery} />
                </div>
            </div>
            {/* Map Card */}
            <div className="w-full bg-secondary rounded-xl shadow-2xl p-6 transform transition-transform duration-500 hover:scale-[1.01]">
                <h1 className="text-4xl font-bold">Visit Us</h1>
                <div className="w-full h-84 overflow-hidden rounded-lg">
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.516980818246!2d78.51729407497386!3d17.43495298346039!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb9a2b456bcb8b%3A0x19b66be95c80bea9!2sAnugraha%20Christian%20World!5e0!3m2!1sen!2sin!4v1754473278003!5m2!1sen!2sin"
                    width="100%"
                    height="100%"
                    allowFullScreen
                    loading="lazy"
                    style={{ border: 0 }}
                    referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
                </div>

            </div>

        </div>
    </section>
    );

}
