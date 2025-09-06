'use client';

import React, { useState } from 'react';
import ProductList from '@/components/ProductList';
import { useRouter } from 'next/navigation';
import { Product } from '@/lib/types';
import { FaTrashAlt, FaSpinner } from 'react-icons/fa';

// Use slug as identifier instead of id
const DeleteProductButton: React.FC<{ product: Product; onClick: (slug: string) => void; deleting: boolean }> = ({ product, onClick, deleting }) => {
    return (
        <button
            onClick={() => onClick(product.slug)}
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
    const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

    const handleDelete = async (slug: string) => {
        setDeletingSlug(slug);

        if (!window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
            setDeletingSlug(null);
            return;
        }

        try {
            const response = await fetch(`/api/products/${slug}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete product.');
            }

            console.log('Product deleted successfully:', slug);
            router.refresh();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'An unknown error occurred.';
            console.error('Error deleting product:', message);
            alert(`Error: ${message}`);
        } finally {
            setDeletingSlug(null);
        }
    };

    const DeleteButtonWithAction = ({ product }: { product: Product }) => (
        <DeleteProductButton
            product={product}
            onClick={handleDelete}
            deleting={deletingSlug === product.slug}
        />
    );

    return (
        <div className="container mx-auto p-4 md:p-8">
            <h1 className="text-3xl md:text-4xl text-center font-bold mb-8">Delete Products</h1>
            <ProductList ActionButton={DeleteButtonWithAction} />
        </div>
    );
}
