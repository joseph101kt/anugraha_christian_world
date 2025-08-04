'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProductFilter from "@/components/ProductFilter";
import { FaSpinner, FaTrashAlt, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import Image from 'next/image';

interface Product {
    id: string;
    name: string;
    description: string;
    tags: string[];
    image_url: string;
}

interface DeleteProductCardProps {
    product: Product;
    onDelete: (productId: string, productName: string) => void;
    deleting: boolean;
}

// This is the self-contained DeleteProductCard component with the corrected styling.
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
                    src={product.image_url}
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


interface DeleteProductListProps {
    password: string;
}

export default function DeleteProductList({ password }: DeleteProductListProps) {
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [activeTags, setActiveTags] = useState<string[]>([]);
    const [showFilterPanel, setShowFilterPanel] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusMessage, setStatusMessage] = useState({ type: '', message: '' });
    const router = useRouter();

    const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

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
        if (searchTerm) {
            const lowercasedSearchTerm = searchTerm.toLowerCase();
            result = result.filter(product =>
                product.name.toLowerCase().includes(lowercasedSearchTerm) ||
                product.tags.some(tag => tag.toLowerCase().includes(lowercasedSearchTerm)) ||
                product.description.toLowerCase().includes(lowercasedSearchTerm)
            );
        } else if (activeTags.length > 0) {
            result = result.filter(product =>
                activeTags.some(tag => product.tags.includes(tag))
            );
        }
        return result;
    }, [searchTerm, activeTags, allProducts]);

    const handleDelete = async (productId: string, productName: string) => {
        if (!window.confirm(`Are you sure you want to delete the product: "${productName}"?`)) {
            return;
        }

        setDeletingProductId(productId);
        setStatusMessage({ type: '', message: '' });

        try {
            const response = await fetch(`/api/products/${productId}?password=${encodeURIComponent(password)}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete product.');
            }

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

    const handleOpenFilters = () => setShowFilterPanel(prev => !prev);
    const handleTagClickInPanel = (tag: string) => setActiveTags(prevTags => prevTags.includes(tag) ? prevTags.filter(t => t !== tag) : [...prevTags, tag]);
    const handleAllProductsClickInPanel = () => setActiveTags([]);
    const handleApplyFilters = () => setShowFilterPanel(false);
    const handleCancelFilters = () => setShowFilterPanel(false);

    return (
        <div className="container mx-auto p-4 md:p-8">
            <h1 className="text-3xl md:text-4xl text-center font-bold mb-8">Delete Products</h1>
            <div className="flex justify-between items-center mb-6">
                <div className="w-full max-w-sm">
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="input input-bordered bg-secondary border-accent border-2 text-text w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <ProductFilter
                    allTags={allTags}
                    activeTags={activeTags}
                    searchTerm={searchTerm}
                    showFilterPanel={showFilterPanel}
                    onOpenFilters={handleOpenFilters}
                    onTagClick={handleTagClickInPanel}
                    onAllProductsClick={handleAllProductsClickInPanel}
                    onApplyFilters={handleApplyFilters}
                    onCancelFilters={handleCancelFilters}
                />
            </div>
            {showFilterPanel && (
                <div className="bg-accent p-6 rounded-box shadow-xl mb-8">
                    <h3 className="text-xl font-semibold mb-4">Choose Filters</h3>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={handleAllProductsClickInPanel}
                            className={`btn ${activeTags.length === 0 ? 'btn-primary' : 'btn-ghost'}`}
                            disabled={!!searchTerm}
                        >
                            All Products
                        </button>
                        {allTags.map(tag => (
                            <button
                                key={tag}
                                onClick={() => handleTagClickInPanel(tag)}
                                className={`btn ${activeTags.includes(tag) ? 'btn-primary' : 'btn-ghost'}`}
                                disabled={!!searchTerm}
                            >
                                {tag.charAt(0).toUpperCase() + tag.slice(1).replace(/-/g, ' ')}
                            </button>
                        ))}
                    </div>
                    <div className="mt-6 flex justify-end gap-2">
                        <button onClick={handleApplyFilters} className="btn btn-primary">
                            Apply Filters
                        </button>
                        <button onClick={handleCancelFilters} className="btn btn-ghost">
                            Cancel
                        </button>
                    </div>
                </div>
            )}
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
                    {searchTerm
                        ? `No products found matching your search: "${searchTerm}".`
                        : `No products found for the selected filters.`
                    }
                </p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => (
                        <DeleteProductCard
                            key={product.id}
                            product={product}
                            onDelete={handleDelete}
                            deleting={deletingProductId === product.id}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
