// components/DeleteProductCard.tsx
'use client';

import React from 'react';
import { Product } from '@/lib/types'; 
import ProductCard from './ProductCard';
import DeleteProductButton from './DeleteProductButton';

interface DeleteProductCardProps {
    product: Product;
    onDelete: (productId: string, productName: string) => void;
}

export default function DeleteProductCard({ product, onDelete }: DeleteProductCardProps) {
    return (
        <ProductCard
            product={product}
            ActionButton={() => <DeleteProductButton product={product} onDelete={onDelete} />}
        />
    );
}
