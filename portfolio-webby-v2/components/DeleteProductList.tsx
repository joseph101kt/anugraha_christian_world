// app/components/DeleteProductList.tsx
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductFilter from "@/components/ProductFilter";
import { FaSpinner, FaTrashAlt, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import Image from 'next/image';

import { Product } from '@/lib/types';

interface DeleteProductListProps {
    onDelete: (productId: string, productName: string) => Promise<void>;
    password: string;
}

interface DeleteProductCardProps {
    product: Product;
    onDelete: (productId: string, productName: string) => void;
    deleting: boolean;
}

const DeleteProductCard: React.FC<DeleteProductCardProps> = ({ product, onDelete, deleting }) => {
    return (
        <div
            key={product.id}
            className='rounded-xl overflow-hidden shadow-md flex flex-col transition-transform duration-200 ease-in-out bg-secondary h-[450px]'
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-5px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
            <div className='relative w-full h-[200px]'>
                <Image
                    src={product.main_image}
                    alt={product.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority
                />
            </div>
            <div style={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ fontSize: '1.4em', marginBottom: '8px', }}>{product.name}</h2>
                <p className='text-sm leading-tight mb-4 flex-grow overflow-hidden text-ellipsis line-clamp-3'>
                    {product.description}
                </p>
                <div style={{ marginBottom: '15px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    {product.tags.map((tag, index) => (
                        <span key={index} className='inline-block bg-accent text-xs px-2.5 py-1.5 rounded-full mr-2'>
                            {tag.replace(/-/g, ' ')}
                        </span>
                    ))}
                </div>
                <button
                    onClick={() => onDelete(product.id, product.name)}
                    className={`btn btn-error w-full flex items-center gap-2 ${deleting ? 'loading' : ''}`}
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
            </div>
        </div>
    );
};

export default function DeleteProductList({ onDelete, password }: DeleteProductListProps) {
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [statusMessage, setStatusMessage] = useState({ type: '', message: '' });
    const router = useRouter();
    const searchParams = useSearchParams();
    const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

    const handleDeleteWrapper = async (productId: string, productName: string) => {
        setDeletingProductId(productId);
        try {
            await onDelete(productId, productName);
            setAllProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
            setStatusMessage({ type: 'success', message: 'Product deleted successfully!' });
            router.refresh();
        } catch (error: unknown) {
            console.error('Error deleting product:', error);
            const message = error instanceof Error ? error.message : 'An unknown error occurred.';
            setStatusMessage({ type: 'error', message: `Error: ${message}` });
        } finally {
            setDeletingProductId(null);
        }
    };

    useEffect(() => {
        async function fetchProducts() {
            setLoading(true);
            try {
                const response = await fetch('/api/products');
                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }
                const data = await response.json();
                setAllProducts(data);
            } catch (error: unknown) {
                console.error('Error fetching products:', error);
                const message = error instanceof Error ? error.message : 'An unknown error occurred.';
                setStatusMessage({ type: 'error', message: `Failed to fetch products: ${message}` });
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, [router]);

    const allTags = useMemo(() => Array.from(new Set(allProducts.flatMap(product => product.tags))), [allProducts]);
    
    const filteredProducts = useMemo(() => {
        let result = allProducts;
        const searchTerm = searchParams.get('search')?.toLowerCase() || '';
        const activeTags = searchParams.getAll('tags');

        if (searchTerm) {
            result = result.filter(product =>
                product.name.toLowerCase().includes(searchTerm) ||
                product.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
                product.description.toLowerCase().includes(searchTerm)
            );
        } else if (activeTags.length > 0) {
            result = result.filter(product =>
                activeTags.some(tag => product.tags.includes(tag))
            );
        }
        return result;
    }, [allProducts, searchParams]);

    return (
        <div className="container mx-auto p-4 md:p-8">
            <h1 className="text-3xl md:text-4xl text-center font-bold mb-8">Delete Products</h1>
            <div className="flex justify-between items-center mb-6">
                <div className="w-full max-w-sm">
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="input input-bordered bg-secondary border-accent border-2 text-text w-full"
                        value={searchParams.get('search') || ''}
                        onChange={(e) => {
                            const newSearchParams = new URLSearchParams(searchParams.toString());
                            if (e.target.value) {
                                newSearchParams.set('search', e.target.value);
                            } else {
                                newSearchParams.delete('search');
                            }
                            router.push(`?${newSearchParams.toString()}`);
                        }}
                    />
                </div>
                <ProductFilter allTags={allTags} />
            </div>
            {statusMessage.message && (
                <div className={`my-4 p-3 rounded-md flex items-center ${
                    statusMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                    {statusMessage.type === 'success' ? <FaCheckCircle className="mr-2" /> : <FaTimesCircle className="mr-2" />}
                    <span>{statusMessage.message}</span>
                </div>
            )}
            {loading ? (
                <div className="flex justify-center items-center h-48">
                    <FaSpinner className="animate-spin text-4xl text-green-500" />
                </div>
            ) : filteredProducts.length === 0 ? (
                <p className="col-span-full text-center text-lg">
                    {searchParams.get('search')
                        ? `No products found matching your search: "${searchParams.get('search')}".`
                        : `No products found for the selected filters.`
                    }
                </p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => (
                        <DeleteProductCard
                            key={product.id}
                            product={product}
                            onDelete={handleDeleteWrapper}
                            deleting={deletingProductId === product.id}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}