'use client';

import React, { useState, FormEvent, useEffect, ChangeEvent, useRef } from 'react';
import Image from 'next/image';
import { FaPlus, FaSpinner, FaCheckCircle, FaTimesCircle, FaTrashAlt } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { AdditionalInfoItem, Product } from '@/lib/types';
import ProductPreview from './ProductPreview';

export default function AddProductForm() {
    const router = useRouter();

    const [productName, setProductName] = useState('');
    const [productDescription, setProductDescription] = useState('');
    const [productTags, setProductTags] = useState('');
    const [price, setPrice] = useState('');
    const [size, setSize] = useState('');
    const [quantity, setQuantity] = useState('');
    const [material, setMaterial] = useState('');

    const [mainImage, setMainImage] = useState<File | null>(null);
    const [previewMainImage, setPreviewMainImage] = useState<string | null>(null);

    const [secondaryImages, setSecondaryImages] = useState<File[]>([]);
    const [previewSecondaryImages, setPreviewSecondaryImages] = useState<string[]>([]);
    
    const mainImageInputRef = useRef<HTMLInputElement>(null);
    const secondaryImagesInputRef = useRef<HTMLInputElement>(null);

    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [statusMessage, setStatusMessage] = useState('');

    type TagsApiResponse = { tags: string[] };
    const [allTags, setAllTags] = useState<string[]>([]);
    const [tagSearch, setTagSearch] = useState('');

    const [additionalInfo, setAdditionalInfo] = useState<AdditionalInfoItem[]>([
        { title: '', description: '' }
    ]);
    
    const { matches, nonMatches } = React.useMemo(() => {
        if (!tagSearch.trim()) return { matches: allTags, nonMatches: [] };
        const searchLower = tagSearch.toLowerCase();
        const matches = allTags.filter(tag => tag.toLowerCase().includes(searchLower)).sort((a, b) => {
            const aIndex = a.toLowerCase().indexOf(searchLower);
            const bIndex = b.toLowerCase().indexOf(searchLower);
            if (aIndex !== bIndex) return aIndex - bIndex;
            return a.length - b.length;
        });
        const nonMatches = allTags.filter(tag => !tag.toLowerCase().includes(searchLower));
        return { matches, nonMatches };
    }, [tagSearch, allTags]);

    const handleTagSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const newTag = tagSearch.trim().toLowerCase();
            if (newTag && !allTags.includes(newTag)) {
                setAllTags(prevTags => [newTag, ...prevTags]);
                setProductTags(prevProductTags => {
                    const tags = prevProductTags.split(',').map(t => t.trim()).filter(Boolean);
                    return [...tags, newTag].join(',');
                });
                setTagSearch('');
            }
        }
    };

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const res = await fetch('/api/tags');
                const data: TagsApiResponse = await res.json();
                setAllTags(data.tags || []);
            } catch (error) {
                console.error('Failed to fetch tags:', error);
            }
        };
        fetchTags();
    }, []);

    const handleAdditionalInfoChange = (
        index: number,
        field: keyof AdditionalInfoItem,
        value: string
    ) => {
        setAdditionalInfo(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const addAdditionalInfoRow = () => {
        setAdditionalInfo(prev => [...prev, { title: '', description: '' }]);
    };

    const removeAdditionalInfoRow = (index: number) => {
        setAdditionalInfo(prev => prev.filter((_, i) => i !== index));
    };

    useEffect(() => {
        return () => {
            if (previewMainImage) URL.revokeObjectURL(previewMainImage);
            previewSecondaryImages.forEach(url => URL.revokeObjectURL(url));
        };
    }, [previewMainImage, previewSecondaryImages]);

    const handleMainImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setMainImage(file);
        if (previewMainImage) URL.revokeObjectURL(previewMainImage);
        setPreviewMainImage(file ? URL.createObjectURL(file) : null);
    };

    const handleSecondaryImagesChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        previewSecondaryImages.forEach(url => URL.revokeObjectURL(url));
        setSecondaryImages(files);
        setPreviewSecondaryImages(files.map(file => URL.createObjectURL(file)));
    };
    
    const removeSecondaryImage = (indexToRemove: number) => {
        setSecondaryImages(prev => prev.filter((_, index) => index !== indexToRemove));
        const newPreviews = previewSecondaryImages.filter((_, index) => index !== indexToRemove);
        setPreviewSecondaryImages(newPreviews);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setStatus('submitting');
        setStatusMessage('Adding product...');
        
        const password = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
        if (!password) {
            setStatus('error');
            setStatusMessage('Admin password is not set in environment variables.');
            return;
        }

        if (
            productName.trim() === '' ||
            productDescription.trim() === '' ||
            !mainImage ||
            price.trim() === '' ||
            size.trim() === '' ||
            quantity.trim() === '' ||
            material.trim() === '' ||
            !additionalInfo.length || additionalInfo.every(item => !item.title.trim() && !item.description.trim())
        ) {
            setStatus('error');
            setStatusMessage('Please fill out all required fields.');
            return;
        }

        const formData = new FormData();
        formData.append('password', password);
        formData.append('name', productName);
        formData.append('description', productDescription);
        formData.append('tags', productTags);
        formData.append('main_image', mainImage);
        secondaryImages.forEach(file => {
            formData.append('secondary_images', file);
        });
        formData.append('price', price);
        formData.append('size', size);
        formData.append('quantity', quantity);
        formData.append('material', material);
        const additionalInfoString = JSON.stringify(additionalInfo);
        formData.append('additional_info', additionalInfoString);

        try {
            const response = await fetch('/api/products', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add product. Check password or server logs.');
            }

            setStatus('success');
            setStatusMessage('Product added successfully!');
            
            setProductName('');
            setProductDescription('');
            setProductTags('');
            setPrice('');
            setQuantity('');
            setSize('');
            setMaterial('');
            setAdditionalInfo([{ title: "", description: "" }]);
            setMainImage(null);
            setPreviewMainImage(null);
            setSecondaryImages([]);
            setPreviewSecondaryImages([]);

            if (mainImageInputRef.current) mainImageInputRef.current.value = '';
            if (secondaryImagesInputRef.current) secondaryImagesInputRef.current.value = '';
            
            router.refresh();
        } catch (error: unknown) {
            console.error('Error adding product:', error);
            const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
            setStatus('error');
            setStatusMessage(`Error: ${message}`);
        }
    };

    // Construct the virtual product object for the preview
    const virtualProduct: Product = {
        id: 'preview', // Use a temporary ID
        name: productName || 'Product Name Preview',
        description: productDescription || 'This is where the product description will appear.',
        tags: productTags ? productTags.split(',').map(tag => tag.trim()) : [],
        main_image: previewMainImage || '/placeholder-image.jpg', // Use a placeholder image if none is selected
        secondary_images: previewSecondaryImages.length > 0 ? previewSecondaryImages : [],
        price: parseFloat(price) || 0,
        size: size || 'N/A',
        quantity: parseInt(quantity) || 0,
        material: material || 'N/A',
        additional_info: additionalInfo.filter(item => item.title || item.description),
        reviews: []
    };

    return (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full'>
            {/* Left Column: Form */}
            <div className="container mx-auto p-6 max-w-2xl bg-secondary shadow-xl rounded-lg text-text">
                <h1 className="text-3xl font-bold text-center mb-8">Add New Product</h1>
                {status !== 'idle' && (
                    <div className={`my-4 p-3 rounded-md flex items-center transition-all duration-300 ${
                        status === 'success' ? 'bg-green-100 text-green-700' :
                        status === 'error' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                    }`}>
                        {status === 'submitting' && <FaSpinner className="animate-spin mr-2" />}
                        {status === 'success' && <FaCheckCircle className="mr-2" />}
                        {status === 'error' && <FaTimesCircle className="mr-2" />}
                        <span>{statusMessage}</span>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-1">Product Name</label>
                        <input type="text" id="name" value={productName} onChange={(e) => setProductName(e.target.value)}
                            className="input input-bordered bg-secondary border-2 border-accent w-full" required />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
                        <textarea id="description" value={productDescription} onChange={(e) => setProductDescription(e.target.value)}
                                className="textarea textarea-bordered bg-secondary border-2 border-accent w-full" rows={4} required></textarea>
                    </div>
                    <div>
                        <label htmlFor="price" className="block text-sm font-medium mb-1">Price ($)</label>
                        <input type="number" id="price" value={price} onChange={(e) => setPrice(e.target.value)}
                            className="input input-bordered bg-secondary border-2 border-accent w-full" min="0" step="0.01" required />
                    </div>
                    <div>
                        <label htmlFor="quantity" className="block text-sm font-medium mb-1">Quantity</label>
                        <input type="number" id="quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)}
                            className="input input-bordered bg-secondary border-2 border-accent w-full" min="0" required />
                    </div>
                    <div>
                        <label htmlFor="size" className="block text-sm font-medium mb-1">Size</label>
                        <input type="text" id="size" value={size} onChange={(e) => setSize(e.target.value)}
                            placeholder="e.g., Small, Medium, Large or 10x15cm" className="input input-bordered bg-secondary border-2 border-accent w-full" required />
                    </div>
                    <div>
                        <label htmlFor="material" className="block text-sm font-medium mb-1">Material</label>
                        <input type="text" id="material" value={material} onChange={(e) => setMaterial(e.target.value)}
                            className="input input-bordered bg-secondary border-2 border-accent w-full" required />
                    </div>

                    <div className="space-y-4">
                        <label className="block text-lg font-medium">Additional Info</label>
                        {additionalInfo.map((item, index) => (
                            <div key={index} className="flex gap-4 items-start">
                                <input
                                    type="text"
                                    placeholder="Title"
                                    className="border p-2 rounded w-1/3"
                                    value={item.title}
                                    onChange={(e) =>
                                        handleAdditionalInfoChange(index, 'title', e.target.value)
                                    }
                                />
                                <textarea
                                    placeholder="Description"
                                    className="border p-2 rounded w-2/3"
                                    value={item.description}
                                    onChange={(e) =>
                                        handleAdditionalInfoChange(index, 'description', e.target.value)
                                    }
                                />
                                <button
                                    type="button"
                                    onClick={() => removeAdditionalInfoRow(index)}
                                    className="text-red-500 font-bold"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addAdditionalInfoRow}
                            className="bg-blue-500 text-white px-4 py-2 rounded"
                        >
                            ➕ Add Info
                        </button>
                    </div>

                    <div className=' border-2 border-accent rounded-sm p-4'>
                        <label className="block text-sm font-medium mb-1">Tags</label>
                        <input
                            type="text"
                            value={tagSearch}
                            onChange={(e) => setTagSearch(e.target.value)}
                            onKeyDown={handleTagSearchKeyDown}
                            placeholder="Search tags..."
                            className="input input-bordered bg-secondary border-2 border-accent w-full mb-3"
                        />

                        <label className="block text-sm font-medium mb-1">Select Tags</label>
                        
                        {tagSearch.trim() && !allTags.includes(tagSearch.trim().toLowerCase()) && (
                            <div className="flex flex-wrap gap-2 pb-3 border-b-2 border-accent mb-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newTag = tagSearch.trim().toLowerCase();
                                        setAllTags(prevTags => [newTag, ...prevTags]);
                                        setProductTags(prevProductTags => {
                                            const tags = prevProductTags.split(',').map(t => t.trim()).filter(Boolean);
                                            return [...tags, newTag].join(',');
                                        });
                                        setTagSearch('');
                                    }}
                                    className="px-3 py-1 rounded-full text-sm font-medium border transition bg-accent border-accent text-white"
                                >
                                    ➕ Add &quot;{tagSearch}&quot;
                                </button>
                            </div>
                        )}

                        {matches.length > 0 && (
                            <div className="flex flex-wrap gap-2 pb-3 border-b-2 border-accent mb-3">
                                {matches.map(tag => {
                                    const selected = productTags.split(',').map(t => t.trim()).includes(tag);
                                    return (
                                        <button
                                            type="button"
                                            key={tag}
                                            onClick={() => {
                                                const tags = productTags.split(',').map(t => t.trim()).filter(Boolean);
                                                if (selected) {
                                                    setProductTags(tags.filter(t => t !== tag).join(','));
                                                } else {
                                                    setProductTags([...tags, tag].join(','));
                                                }
                                            }}
                                            className={`px-3 py-1 rounded-full text-sm font-medium border transition ${
                                                selected ? 'bg-accent border-accent text-white' : 'bg-secondary border-accent hover:bg-primary text-text'
                                            }`}
                                        >
                                            {tag}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        <div className="flex flex-wrap gap-2">
                            {nonMatches.map(tag => {
                                const selected = productTags.split(',').map(t => t.trim()).includes(tag);
                                return (
                                    <button
                                        type="button"
                                        key={tag}
                                        onClick={() => {
                                            const tags = productTags.split(',').map(t => t.trim()).filter(Boolean);
                                            if (selected) {
                                                setProductTags(tags.filter(t => t !== tag).join(','));
                                            } else {
                                                setProductTags([...tags, tag].join(','));
                                            }
                                        }}
                                        className={`px-3 py-1 rounded-full text-sm font-medium border transition ${
                                            selected ? 'bg-accent border-accent text-white' : 'bg-secondary border-accent hover:bg-primary text-text'
                                        }`}
                                    >
                                        {tag}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="main_image" className="block text-sm font-medium mb-1">Main Product Image</label>
                        <input type="file" id="main_image" accept="image/*" onChange={handleMainImageChange}
                            ref={mainImageInputRef} className="file-input file-input-bordered bg-secondary border-2 border-accent w-full" required />
                        {previewMainImage && (
                            <div className="mt-4 w-48 h-48 relative overflow-hidden rounded-lg">
                                <Image src={previewMainImage} alt="Main Product Preview" fill style={{ objectFit: 'cover' }} />
                            </div>
                        )}
                    </div>
                    <div>
                        <label htmlFor="secondary_images" className="block text-sm font-medium mb-1">Secondary Product Images</label>
                        <input type="file" id="secondary_images" multiple accept="image/*" onChange={handleSecondaryImagesChange}
                            ref={secondaryImagesInputRef} className="file-input file-input-bordered bg-secondary border-2 border-accent w-full" />
                        {previewSecondaryImages.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-4">
                                {previewSecondaryImages.map((src, index) => (
                                    <div key={index} className="w-24 h-24 relative overflow-hidden rounded-lg group">
                                        <Image src={src} alt={`Secondary preview ${index + 1}`} fill style={{ objectFit: 'cover' }} />
                                        <button
                                            type="button"
                                            onClick={() => removeSecondaryImage(index)}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            aria-label="Remove image"
                                        >
                                            <FaTrashAlt size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <button type="submit"
                            className={`btn btn-primary w-full flex items-center justify-center gap-2 ${status === 'submitting' ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={status === 'submitting'}>
                        {status === 'submitting' ? <FaSpinner className="animate-spin" /> : <FaPlus />}
                        <span>{status === 'submitting' ? 'Adding Product...' : 'Add Product'}</span>
                    </button>
                </form>
            </div>
            
            {/* Right Column: Preview */}
            <div className="lg:col-span-2 h-fit w-full bg-secondary  p-8 shadow-xl rounded-lg text-text">
                <h2 className="text-2xl font-bold text-center mb-6">Live Preview</h2>
                {previewMainImage ? (
                    <ProductPreview product={virtualProduct} />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-10 border-2 border-dashed border-gray-300 rounded-lg">
                        <FaTimesCircle className="text-5xl mb-4 text-gray-400" />
                        <p>Please upload a main product image to see a preview.</p>
                    </div>
                )}
            </div>
        </div>
    );
}