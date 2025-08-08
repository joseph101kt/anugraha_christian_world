// app/components/DeleteProductList.tsx
'use client';

import React, { useState } from 'react';
import ProductList from '@/components/ProductList';
import { useRouter } from 'next/navigation';
import { Product } from '@/lib/types';
import { FaTrashAlt, FaSpinner } from 'react-icons/fa';

// This is the new action button for deleting. It's designed to work with ProductList.
const DeleteProductButton: React.FC<{ product: Product; onClick: (productId: string) => void; deleting: boolean }> = ({ product, onClick, deleting }) => {
    return (
        <button
            onClick={() => onClick(product.id)}
            className={`btn btn-error w-full flex items-center gap-2 mt-auto ${deleting ? 'loading' : ''}`}
            disabled={deleting}
        >
            {deleting ? (
                <FaSpinner className="animate-spin" />
            ) : (
                <>
                    <FaTrashAlt />
                    <span>Delete Product</span>
                </>
            )}
        </button>
    );
};

export default function DeleteProductList() {
    const router = useRouter();
    const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

    const handleDelete = async (productId: string) => {
        setDeletingProductId(productId);
        
        const password = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
        if (!password) {
            console.error('Environment variable NEXT_PUBLIC_ADMIN_PASSWORD is not set.');
            setDeletingProductId(null);
            alert('Admin password is not set.');
            return;
        }

        if (!window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
            setDeletingProductId(null);
            return;
        }

        try {
            const response = await fetch(`/api/products/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete product.');
            }

            console.log('Product deleted successfully:', productId);
            router.refresh();
            location.reload()
        } catch (error) {
            const message = error instanceof Error ? error.message : 'An unknown error occurred.';
            console.error('Error deleting product:', message);
            alert(`Error: ${message}`);
        } finally {
            setDeletingProductId(null);
        }
    };

    // We're creating a wrapper component to pass the `handleDelete` function and the deleting state to the button
    const DeleteButtonWithAction = ({ product }: { product: Product }) => (
        <DeleteProductButton
            product={product}
            onClick={handleDelete}
            deleting={deletingProductId === product.id}
        />
    );

    return (
        <div className="container mx-auto p-4 md:p-8">
            <h1 className="text-3xl md:text-4xl text-center font-bold mb-8">Delete Products</h1>
            
            {/* This is the reusable product list that renders our new DeleteProductButton */}
            <ProductList ActionButton={DeleteButtonWithAction} />
        </div>
    );
}