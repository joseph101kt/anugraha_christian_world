// components/ContactForm.tsx

'use client';

import React, { useState, FormEvent, useEffect } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { saveLead } from '@/components/saveLead';

/**
 * Contact form component for inquiries.
 * Saves name and phone to localStorage for persistence,
 * and supports optional prefill via initialMessage prop or `contact_message` URL param.
 */
interface ContactFormProps {
    initialMessage?: string;
}

export default function ContactForm({ initialMessage = '' }: ContactFormProps) {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [messageText, setMessageText] = useState(initialMessage);
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

    // Load saved name and phone from localStorage
    useEffect(() => {
        const savedName = localStorage.getItem('contactFormName');
        const savedPhone = localStorage.getItem('contactFormPhone');

        if (savedName) setName(savedName);
        if (savedPhone) setPhone(savedPhone);

        // Optional: prefill from URL param `contact_message`
        const params = new URLSearchParams(window.location.search);
        const prefillMessage = params.get('contact_message');
        if (prefillMessage) setMessageText(prefillMessage);
    }, []);

    // Save name/phone to localStorage
    useEffect(() => {
        localStorage.setItem('contactFormName', name);
    }, [name]);

    useEffect(() => {
        localStorage.setItem('contactFormPhone', phone);
    }, [phone]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!name || !phone || !messageText) {
            setStatus('error');
            return;
        }

        setStatus('sending');

        try {
            await saveLead({ name, phone, query: messageText });
            setStatus('success');
        } catch (error) {
            setStatus('error');
            console.error('Submission error:', error);
            return;
        }

        // Build WhatsApp link with the message
        const message = `Hello, my name is ${name}. My phone number is: ${phone}. I have a question: ${messageText}`;
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/919346851977?text=${encodedMessage}`;

        window.open(whatsappUrl, '_blank');
    };

    return (
        <div className="w-full bg-secondary max-w-lg rounded-xl shadow-2xl p-8 transform transition-transform duration-500 hover:scale-[1.01]">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-extrabold tracking-tight">Contact Us</h1>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                {status === 'error' && (
                    <p className="text-center text-red-500 font-bold">Please fill out all fields.</p>
                )}

                <div>
                    <label htmlFor="name" className="block text-sm font-medium">
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
                        placeholder="Enter your phone number"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="messageText" className="block text-sm font-medium">
                        Your Question or Message
                    </label>
                    <textarea
                        id="messageText"
                        rows={4}
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        className="mt-1 block w-full px-4 py-2 border border-accent rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 placeholder-gray-400"
                        placeholder="Tell us how we can help you"
                        required
                    ></textarea>
                </div>

                {status === 'sending' && (
                    <p className="text-center text-green-500">Sending your message...</p>
                )}
                {status === 'success' && (
                    <p className="text-center text-green-600 font-bold">Message sent! Redirecting to WhatsApp...</p>
                )}

                <button
                    type="submit"
                    className="w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-bold text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                    disabled={status === 'sending'}
                >
                    {status === 'sending' ? (
                        <span>Sending...</span>
                    ) : (
                        <>
                            <FaWhatsapp className="mr-3 h-5 w-auto" />
                            <span>Start Chat on WhatsApp</span>
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
