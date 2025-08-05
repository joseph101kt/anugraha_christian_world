'use client';

import React, { useState, FormEvent, useEffect, ChangeEvent, useRef  } from 'react';
import Image from 'next/image';
import { FaPlus, FaSpinner, FaCheckCircle, FaTimesCircle, FaTrashAlt } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function AddProductForm() {
    const router = useRouter();

    const [productName, setProductName] = useState('');
    const [productDescription, setProductDescription] = useState('');
    const [productTags, setProductTags] = useState('');
    const [price, setPrice] = useState('');
    const [size, setSize] = useState('');
    const [quantity, setQuantity] = useState('');
    const [material, setMaterial] = useState('');
    const [additionalInfo, setAdditionalInfo] = useState('');

    const [mainImage, setMainImage] = useState<File | null>(null);
    const [previewMainImage, setPreviewMainImage] = useState<string | null>(null);

    const [secondaryImages, setSecondaryImages] = useState<File[]>([]);
    const [previewSecondaryImages, setPreviewSecondaryImages] = useState<string[]>([]);
    
    const mainImageInputRef = useRef<HTMLInputElement>(null);
    const secondaryImagesInputRef = useRef<HTMLInputElement>(null);


    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [statusMessage, setStatusMessage] = useState('');

    // Cleanup object URLs to prevent memory leaks
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
        // Cleanup old preview URLs
        previewSecondaryImages.forEach(url => URL.revokeObjectURL(url));
        setSecondaryImages(files);
        setPreviewSecondaryImages(files.map(file => URL.createObjectURL(file)));
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

        if (!productName || !productDescription || !mainImage || !price || !size || !quantity || !material || !additionalInfo) {
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
        formData.append('additional_info', additionalInfo);

        const handleMainImageChange = (e: ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0] || null;
            
            // Cleanup old preview URLs to prevent memory leaks
            if (previewMainImage) {
                URL.revokeObjectURL(previewMainImage);
            }
            
            setMainImage(file);
            setPreviewMainImage(file ? URL.createObjectURL(file) : null);

            // Force clear the input's value so the same file can be selected again
            if (mainImageInputRef.current) {
                mainImageInputRef.current.value = '';
            }
        };

        const handleSecondaryImagesChange = (e: ChangeEvent<HTMLInputElement>) => {
            const files = Array.from(e.target.files || []);
            
            // Cleanup old preview URLs
            previewSecondaryImages.forEach(url => URL.revokeObjectURL(url));

            setSecondaryImages(files);
            setPreviewSecondaryImages(files.map(file => URL.createObjectURL(file)));
            
            // Force clear the input's value for secondary images as well
            if (secondaryImagesInputRef.current) {
                secondaryImagesInputRef.current.value = '';
            }
        };


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
            
            // Reset form fields
            setProductName('');
            setProductDescription('');
            setProductTags('');
            setPrice('');
            setQuantity('');
            setSize('');
            setMaterial('');
            setAdditionalInfo('');
            setMainImage(null);
            setPreviewMainImage(null);
            setSecondaryImages([]);
            setPreviewSecondaryImages([]);

            if (mainImageInputRef.current) {
                mainImageInputRef.current.value = '';
            }
            if (secondaryImagesInputRef.current) {
                secondaryImagesInputRef.current.value = '';
            }
            
            router.refresh();

        } catch (error: unknown) {
            console.error('Error adding product:', error);
            const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
            setStatus('error');
            setStatusMessage(`Error: ${message}`);
        }
    };

    const removeSecondaryImage = (indexToRemove: number) => {
        setSecondaryImages(prev => prev.filter((_, index) => index !== indexToRemove));
        setPreviewSecondaryImages(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    return (
        <div className="container mx-auto p-8 max-w-2xl bg-secondary shadow-xl rounded-lg text-text">
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
                <div>
                    <label htmlFor="additionalInfo" className="block text-sm font-medium mb-1">Additional Information</label>
                    <textarea id="additionalInfo" value={additionalInfo} onChange={(e) => setAdditionalInfo(e.target.value)}
                              className="textarea textarea-bordered bg-secondary border-2 border-accent w-full" rows={3} required></textarea>
                </div>
                <div>
                    <label htmlFor="tags" className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
                    <input type="text" id="tags" value={productTags} onChange={(e) => setProductTags(e.target.value)}
                           className="input input-bordered bg-secondary border-2 border-accent w-full" />
                </div>
                <div>
                    <label htmlFor="main_image" className="block text-sm font-medium mb-1">Main Product Image</label>
                    <input type="file" id="main_image" accept="image/*" onChange={handleMainImageChange}
                           className="file-input file-input-bordered bg-secondary border-2 border-accent w-full" required />
                    {previewMainImage && (
                        <div className="mt-4 w-48 h-48 relative overflow-hidden rounded-lg">
                            <Image src={previewMainImage} alt="Main Product Preview" fill style={{ objectFit: 'cover' }} />
                        </div>
                    )}
                </div>
                <div>
                    <label htmlFor="secondary_images" className="block text-sm font-medium mb-1">Secondary Product Images</label>
                    <input type="file" id="secondary_images" multiple accept="image/*" onChange={handleSecondaryImagesChange}
                           className="file-input file-input-bordered bg-secondary border-2 border-accent w-full" />
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
    );
}