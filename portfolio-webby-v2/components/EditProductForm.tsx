'use client';

import React, { useState, useRef } from 'react';
import ProductList from '@/components/ProductList';
import ProductForm from '@/components/ProductForm';
import { Product } from '@/lib/types';
import { FaEdit } from 'react-icons/fa';

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

    const handleEditClick = (product: Product) => {
        setSelectedProduct(product);
        formRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSave = async (formData: FormData, slug?: string) => {
        if (!slug) {
            return { success: false, message: 'Cannot save product: slug is missing.' };
        }

        console.log('Attempting to save product...', `Slug: ${slug}`);
        console.log('Sending FormData:');
        for (const [key, value] of formData.entries()) {
            console.log(`- ${key}:`, value);
        }

        try {
            const endpoint = `/api/products/${slug}`;
            console.log(`Sending PUT request to: ${endpoint}`);

            const response = await fetch(endpoint, {
                method: 'PUT',
                body: formData,
            });

            console.log(`Received response with status: ${response.status} ${response.statusText}`);

            if (!response.ok) {
                let errorMessage = 'Failed to update product.';
                const contentType = response.headers.get('content-type');

                if (contentType?.includes('application/json')) {
                    const errorData = await response.json();
                    console.error('Server responded with JSON error:', errorData);
                    errorMessage = errorData.message || errorMessage;
                } else {
                    const textError = await response.text();
                    console.error('Server responded with a non-JSON error:', textError);
                    errorMessage = `Server Error: ${textError.substring(0, 100)}...`;
                }

                return { success: false, message: errorMessage };
            }

            console.log('Product updated successfully!');
            setSelectedProduct(null);

            return { success: true, message: 'Product updated successfully!' };
        } catch (error: unknown) {
            console.error('A network or runtime error occurred:', error);
            const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
            return { success: false, message: `Error: ${message}` };
        }
    };

    const EditButtonWithAction = ({ product }: { product: Product }) => (
        <EditProductButton product={product} onClick={handleEditClick} />
    );

    return (
        <div className="container mx-auto p-4 md:p-8">
            <h1 className="text-3xl md:text-4xl text-center font-bold mb-8">Edit Products</h1>
            <ProductList ActionButton={EditButtonWithAction} />

            <div ref={formRef} className="mt-16 pt-8 border-t border-gray-200">
                {selectedProduct ? (
                    <ProductForm
                        initialProduct={selectedProduct}
                        onSave={(formData) => handleSave(formData, selectedProduct.slug)}
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
