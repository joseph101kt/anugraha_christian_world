// app/products/page.tsx
import { Suspense } from 'react';
import ProductList from '@/components/ProductList';
import EnquireButton from '@/components/EnquireButton';

export default async function ProductsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <div className='w-full text-center'><h1 className='mx-auto'>Our Products</h1></div>
            <ProductList ActionButton={EnquireButton} />
        </Suspense>
    );
}