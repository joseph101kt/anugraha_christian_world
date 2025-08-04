'use client';

import React, { useState, FormEvent } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { saveLead } from '@/components/saveLead';

/**
 * A self-contained contact form component that includes its own styling and layout.
 */
export default function ContactForm() {
    // State variables to hold form data and submission status
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

    /**
     * Handles the form submission logic.
     * It prevents the default form action, saves the lead, and opens a new WhatsApp chat.
     * @param e - The form event.
     */
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        
        // Basic validation: ensure all required fields are filled
        if (!name || !phone || !query) {
            setStatus('error');
            return;
        }

        setStatus('sending');

        try {
            // Save the lead data to the server using the existing helper function
            await saveLead({ name, phone, query });
            setStatus('success');
        } catch (error) {
            setStatus('error');
            console.error('Submission error:', error);
            return; // Stop execution if saving the lead fails
        }

        // Create the pre-filled message for WhatsApp
        const message = `Hello, my name is ${name}. My phone number is: ${phone}. I have a question: ${query}`;
        const encodedMessage = encodeURIComponent(message);
        
        // Construct the WhatsApp URL with the pre-filled message
        const whatsappUrl = `https://wa.me/919346851977?text=${encodedMessage}`;
        
        // Open the WhatsApp chat in a new tab
        window.open(whatsappUrl, '_blank');
        
        // Reset the form fields after successful submission
        setName('');
        setPhone('');
        setQuery('');
    };

    return (
        <div className="w-full max-w-lg rounded-xl shadow-2xl p-8 transform transition-transform duration-500 hover:scale-[1.01]">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-extrabold tracking-tight">Contact Us</h1>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Submission Status Message */}
                {status === 'error' && (
                    <p className="text-center text-red-500 font-bold">Please fill out all fields.</p>
                )}

                {/* Name Input Field */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium ">
                        Your Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full px-4 py-2 border border-accent rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 placeholder-gray-400"
                        placeholder="Enter your full name"
                        required
                    />
                </div>

                {/* Phone Number Input Field */}
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium">
                        Phone Number
                    </label>
                    <input
                        type="text"
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="mt-1 block w-full px-4 py-2 border border-accent rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 placeholder-gray-400"
                        placeholder="Enter your Phone number"
                        required
                    />
                </div>

                {/* Query/Message Textarea */}
                <div>
                    <label htmlFor="query" className="block text-sm font-medium">
                        Your Question or Message
                    </label>
                    <textarea
                        id="query"
                        rows={4}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="mt-1 block w-full px-4 py-2 border border-accent rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 placeholder-gray-400"
                        placeholder="Tell us how we can help you"
                        required
                    ></textarea>
                </div>

                {/* Submission Status Message */}
                {status === 'sending' && (
                    <p className="text-center text-green-500">Sending your message...</p>
                )}
                {status === 'success' && (
                    <p className="text-center text-green-600 font-bold">Message sent! Redirecting to WhatsApp...</p>
                )}
                
                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-bold text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                    disabled={status === 'sending'}
                >
                    {status === 'sending' ? (
                        <span>Sending...</span>
                    ) : (
                        <>
                            <FaWhatsapp className="mr-3 h-5 w-5" />
                            <span>Start Chat on WhatsApp</span>
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
