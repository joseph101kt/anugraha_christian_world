// components/DeleteProductButton.tsx
'use client';

import React from 'react';
import { Product } from '@/lib/types';

interface DeleteProductButtonProps {
    product: Product;
    onDelete: (productId: string, productName: string) => void;
}

export default function DeleteProductButton({ product, onDelete }: DeleteProductButtonProps) {
    return (
        <button
            onClick={() => onDelete(product.id, product.name)}
            className='btn btn-error w-full'
        >
            Delete Product
        </button>
    );
}