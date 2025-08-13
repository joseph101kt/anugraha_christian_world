// components/AddProductForm.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import ProductForm from './ProductForm';

export default function AddProductForm() {
    const router = useRouter();

    const handleSave = async (formData: FormData) => {


        try {
            const response = await fetch('/api/products', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                return { success: false, message: errorData.message || 'Failed to add product.' };
            }

            router.refresh();
            return { success: true, message: 'Product added successfully!' };
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
            return { success: false, message: `Error: ${message}` };
        }
    };

    return <ProductForm onSave={handleSave} />;
}