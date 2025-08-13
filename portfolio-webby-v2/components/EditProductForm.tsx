// app/components/EditProductPage.tsx
'use client';

import React, { useState, useRef } from 'react';
import ProductList from '@/components/ProductList';
import ProductForm from '@/components/ProductForm';
import { Product } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { FaEdit } from 'react-icons/fa';

// This is the new action button for editing. It's designed to work with ProductList.
const EditProductButton: React.FC<{ product: Product; onClick: (product: Product) => void }> = ({ product, onClick }) => {
    return (
        <button
            onClick={() => onClick(product)}
            className="btn btn-warning w-full flex items-center gap-2 mt-auto"
        >
            <FaEdit />
            <span>Edit Product</span>
        </button>
    );
};

export default function EditProductPage() {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const formRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const [refreshKey, setRefreshKey] = useState(0);

    const handleRerender = () => {
        // Increment the key to force a re-render
        setRefreshKey(prevKey => prevKey + 1);
    };

    const handleEditClick = (product: Product) => {
        setSelectedProduct(product);
        // Scroll the view to the form section smoothly
        formRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSave = async (formData: FormData, id?: string) => {
        // --- ADDED DEBUGGING 1: Initial check and logging ---
        console.log('Attempting to save product...', id ? `ID: ${id}` : 'Adding new product');
        


        // --- ADDED DEBUGGING 2: Log FormData content ---
        // You can't directly log a FormData object, so we iterate through it.
        console.log('Sending FormData:');
        for (const [key, value] of formData.entries()) {
            console.log(`- ${key}:`, value);
        }

        try {
            const endpoint = `/api/products/${id}`;
            // --- ADDED DEBUGGING 3: Log the fetch request details ---
            console.log(`Sending PUT request to: ${endpoint}`);

            const response = await fetch(endpoint, {
                method: 'PUT',
                body: formData,
            });
            
            // --- ADDED DEBUGGING 4: Log the raw response status and headers ---
            console.log(`Received response with status: ${response.status} ${response.statusText}`);
            console.log('Response headers:', Object.fromEntries(response.headers.entries()));


            if (!response.ok) {
                // --- ADDED DEBUGGING 5: More detailed error handling for non-JSON responses ---
                let errorMessage = 'Failed to update product.';
                const contentType = response.headers.get('content-type');

                if (contentType && contentType.includes('application/json')) {
                    try {
                        const errorData = await response.json();
                        errorMessage = errorData.message || errorMessage;
                        // --- ADDED DEBUGGING 6: Log the parsed JSON error message ---
                        console.error('Server responded with JSON error:', errorData);
                        router.refresh();
                        handleRerender()
                        location.reload()
                    } catch (jsonError) {
                        // This block catches the 'Unexpected end of JSON input' error.
                        console.error('Failed to parse error response as JSON:', jsonError);
                        errorMessage = 'Server error: Response was not a valid JSON object.';
                    }
                } else {
                    // This handles cases where the server sends back a non-JSON body (e.g., plain text or HTML).
                    const textError = await response.text();
                    console.error('Server responded with a non-JSON error:', textError);
                    errorMessage = `Server Error: ${textError.substring(0, 100)}...`; // Truncate for display.
                }

                return { success: false, message: errorMessage };
            }

            // --- ADDED DEBUGGING 7: Log a successful response status before proceeding ---
            console.log('Product updated successfully!');
            router.refresh();
            setSelectedProduct(null);
            handleRerender()
            location.reload()
            return { success: true, message: 'Product updated successfully!' };
        } catch (error: unknown) {
            // --- ADDED DEBUGGING 8: Catching and logging network/runtime errors ---
            console.error('A network or runtime error occurred during the fetch operation:', error);
            const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
            return { success: false, message: `Error: ${message}` };
        }
    };

    // We're creating a wrapper component to pass the `handleEditClick` function to the button
    const EditButtonWithAction = ({ product }: { product: Product }) => (
        <EditProductButton product={product} onClick={handleEditClick} />
    );

    return (
        <div className="container mx-auto p-4 md:p-8">
            <h1 className="text-3xl md:text-4xl text-center font-bold mb-8">Edit Products</h1>
            
            {/* This is the reusable product list that renders our new EditProductButton */}
            <ProductList ActionButton={EditButtonWithAction} />
            
            <div ref={formRef} className="mt-16 pt-8 border-t border-gray-200">
                {selectedProduct ? (
                    <ProductForm
                        initialProduct={selectedProduct}
                        onSave={handleSave}
                    />
                ) : (
                    <div className="text-center text-gray-500 p-8">
                        Select a product from the list above to edit.
                    </div>
                )}
            </div>
        </div>
    );
}