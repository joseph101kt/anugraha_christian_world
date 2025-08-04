'use client';

import React, { useState, FormEvent } from 'react';
import Image from 'next/image';
import { FaPlus, FaSpinner, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

// This component now takes the password as a prop from the parent
interface AddProductFormProps {
    password: string;
}

export default function AddProductForm({ password }: AddProductFormProps) {
    const [productName, setProductName] = useState('');
    const [productDescription, setProductDescription] = useState('');
    const [productTags, setProductTags] = useState('');
    const [productImage, setProductImage] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [statusMessage, setStatusMessage] = useState('');

    /**
     * Handles the image file selection and creates a preview URL.
     * @param e The change event from the file input.
     */
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setProductImage(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    /**
     * Handles the form submission logic.
     * It sends the product data, including the image file, to the API endpoint.
     * @param e The form event.
     */
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        // Start submission process
        setStatus('submitting');
        setStatusMessage('Adding product...');

        if (!productName || !productDescription || !productImage) {
            setStatus('error');
            setStatusMessage('Please fill out all required fields.');
            return;
        }

        const formData = new FormData();
        // Re-introducing the password to send to the API route
        formData.append('password', password);
        formData.append('name', productName);
        formData.append('description', productDescription);
        formData.append('tags', productTags);
        if (productImage) {
            formData.append('image', productImage);
        }

        try {
            const response = await fetch('/api/products', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                // If the response is not ok, attempt to get an error message from the server.
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add product. Check password or server logs.');
            }

            // The 'result' variable is no longer needed, so we'll remove it.
            setStatus('success');
            setStatusMessage('Product added successfully!');
            // Reset form
            setProductName('');
            setProductDescription('');
            setProductTags('');
            setProductImage(null);
            setPreviewImage(null);
        } catch (error: unknown) {
            console.error('Error adding product:', error);
            const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
            setStatus('error');
            setStatusMessage(`Error: ${message}`);
        }
    };

    // Render the product form
    return (
        <div className="container mx-auto p-8 max-w-2xl bg-secondary shadow-xl rounded-lg">
            <h1 className="text-3xl font-bold text-center mb-8">Add New Product</h1>

            {/* Status Message Display */}
            {status !== 'idle' && (
                <div className={`my-4 p-3 rounded-md flex items-center transition-all duration-300 ${
                    status === 'success' ? 'bg-green-100 text-green-700' :
                    status === 'error' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                }`}>
                    {status === 'submitting' && <FaSpinner className="animate-spin mr-2" />}
                    {status === 'success' && <FaCheckCircle className="mr-2" />}
                    {status === 'error' && <FaTimesCircle className="mr-2" />}
                    <span>{statusMessage}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="name" className="block bg-secondary text-sm font-medium text-text mb-1">Product Name</label>
                    <input
                        type="text"
                        id="name"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        className="input input-bordered bg-secondary border-2 border-accent text-text w-full"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-text mb-1">Description</label>
                    <textarea
                        id="description"
                        value={productDescription}
                        onChange={(e) => setProductDescription(e.target.value)}
                        className="textarea textarea-bordered bg-secondary border-2 border-accent text-text w-full"
                        rows={4}
                        required
                    ></textarea>
                </div>
                <div>
                    <label htmlFor="tags" className="block text-sm font-medium text-text mb-1">Tags (comma-separated)</label>
                    <input
                        type="text"
                        id="tags"
                        value={productTags}
                        onChange={(e) => setProductTags(e.target.value)}
                        className="input input-bordered bg-secondary border-2 border-accent text-text w-full"
                    />
                </div>
                <div>
                    <label htmlFor="image" className="block text-sm font-medium text-text mb-1">Product Image</label>
                    <input
                        type="file"
                        id="image"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="file-input file-input-bordered bg-secondary border-2 border-accent text-text w-full"
                        required
                    />
                    {previewImage && (
                        <div className="mt-4 w-48 h-48 relative overflow-hidden rounded-lg">
                            <Image src={previewImage} alt="Product Preview" fill style={{ objectFit: 'cover' }} />
                        </div>
                    )}
                </div>
                <button
                    type="submit"
                    className={`btn btn-primary w-full flex items-center justify-center gap-2 ${status === 'submitting' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={status === 'submitting'}
                >
                    {status === 'submitting' ? (
                        <FaSpinner className="animate-spin" />
                    ) : (
                        <FaPlus />
                    )}
                    <span>{status === 'submitting' ? 'Adding Product...' : 'Add Product'}</span>
                </button>
            </form>
        </div>
    );
}
