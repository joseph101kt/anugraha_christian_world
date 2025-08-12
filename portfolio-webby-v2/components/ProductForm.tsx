// components/ProductForm.tsx
'use client';

import React, { useState, FormEvent, useEffect, ChangeEvent, useRef } from 'react';
import Image from 'next/image';
import { FaPlus, FaSpinner, FaCheckCircle, FaTimesCircle, FaTrashAlt, FaEdit } from 'react-icons/fa';
import { AdditionalInfoItem, Product } from '@/lib/types';
import ProductPreview from './ProductPreview';

// Define the props for the reusable ProductForm component.
interface ProductFormProps {
    initialProduct?: Product; // Optional initial data for editing.
    onSave: (formData: FormData, productId?: string) => Promise<{ success: boolean; message: string }>;
}

export default function ProductForm({ initialProduct, onSave }: ProductFormProps) {
    const isEditing = !!initialProduct;
    const formTitle = isEditing ? 'Edit Product' : 'Add New Product';
    const submitButtonText = isEditing ? 'Update Product' : 'Add Product';
    const submitButtonIcon = isEditing ? <FaEdit /> : <FaPlus />;

    // State for all form fields, initialized with `initialProduct` data if available.
    const [productName, setProductName] = useState(initialProduct?.name || '');
    const [productDescription, setProductDescription] = useState(initialProduct?.description || '');
    const [productTags, setProductTags] = useState(initialProduct?.tags.join(',') || '');
    const [price, setPrice] = useState(initialProduct?.price.toString() || '0');
    const [size, setSize] = useState(initialProduct?.size || '');
    const [quantity, setQuantity] = useState(initialProduct?.quantity.toString() || '1');
    const [material, setMaterial] = useState(initialProduct?.material || '');

    // Additional info state.
    const initialAdditionalInfo: AdditionalInfoItem[] = (initialProduct?.additional_info && initialProduct.additional_info.length > 0)
        ? initialProduct.additional_info
        : [{ title: '', description: '' }];
    const [additionalInfo, setAdditionalInfo] = useState<AdditionalInfoItem[]>(initialAdditionalInfo);

    // Image state, including handling for existing images when editing.
    // The `File[]` state tracks newly uploaded files.
    // The `string[]` state tracks all image URLs (both existing and new).
    const [mainImage, setMainImage] = useState<File | null>(null);
    const [previewMainImage, setPreviewMainImage] = useState<string | null>(initialProduct?.main_image || null);
    const [secondaryImages, setSecondaryImages] = useState<File[]>([]);
    const [previewSecondaryImages, setPreviewSecondaryImages] = useState<string[]>(initialProduct?.secondary_images || []);
    
    // Refs for file inputs to clear them after submission.
    const mainImageInputRef = useRef<HTMLInputElement>(null);
    const secondaryImagesInputRef = useRef<HTMLInputElement>(null);

    // Form status state.
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [statusMessage, setStatusMessage] = useState('');

    // Tags functionality state and logic.
    type TagsApiResponse = { tags: string[] };
    const [allTags, setAllTags] = useState<string[]>([]);
    const [tagSearch, setTagSearch] = useState('');

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

    // Clean up object URLs when component unmounts or images change.
    useEffect(() => {
        return () => {
            if (previewMainImage && !initialProduct?.main_image) URL.revokeObjectURL(previewMainImage);
            previewSecondaryImages.forEach(url => {
                if (!initialProduct?.secondary_images.includes(url)) {
                    URL.revokeObjectURL(url);
                }
            });
        };
    }, [previewMainImage, previewSecondaryImages, initialProduct]);

    const handleMainImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file) {
            setMainImage(file);
            setPreviewMainImage(URL.createObjectURL(file));
        } else {
            setMainImage(null);
            setPreviewMainImage(isEditing ? initialProduct?.main_image || null : null);
        }
    };

    const handleSecondaryImagesChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setSecondaryImages(prevFiles => [...prevFiles, ...files]);
        setPreviewSecondaryImages(prevUrls => [...prevUrls, ...files.map(file => URL.createObjectURL(file))]);
    };

    const removeSecondaryImage = (indexToRemove: number) => {
        // Find the URL to be removed
        const urlToRemove = previewSecondaryImages[indexToRemove];

        // Revoke URL only if it's a newly uploaded file (not from initialProduct).
        if (urlToRemove && (!initialProduct?.secondary_images || !initialProduct.secondary_images.includes(urlToRemove))) {
            URL.revokeObjectURL(urlToRemove);
        }
    
        // Update the state
        setPreviewSecondaryImages(prev => prev.filter((_, index) => index !== indexToRemove));
        
        // Filter out the corresponding file from the File[] state
        const originalImagesLength = initialProduct?.secondary_images.length || 0;
        if (indexToRemove >= originalImagesLength) {
            const fileIndex = indexToRemove - originalImagesLength;
            setSecondaryImages(prev => prev.filter((_, index) => index !== fileIndex));
        }
    };

    // Form submission logic.
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setStatus('submitting');
        setStatusMessage(isEditing ? 'Updating product...' : 'Adding product...');
        
        // Basic validation
        const hasMainImage = !!mainImage || (isEditing && !!initialProduct?.main_image);
        if (!productName.trim() || !productDescription.trim() || !size || !material || !hasMainImage) {
            setStatus('error');
            setStatusMessage('Please fill out all required fields and upload a main image.');
            return;
        }

        const formData = new FormData();
        formData.append('name', productName);
        formData.append('description', productDescription);
        formData.append('tags', productTags);

        // Append images. Only include new main image if uploaded.
        if (mainImage) formData.append('main_image', mainImage);
        
        // Append all images (newly uploaded + existing ones for editing)
        // This logic is for when you want to handle the image updates in the API.
        // A more robust approach for editing would be to track deleted images and send those to the API.
        if (isEditing) {
            const existingSecondaryImages = previewSecondaryImages.filter(url => initialProduct?.secondary_images.includes(url));
            formData.append('existing_secondary_images', JSON.stringify(existingSecondaryImages));
        }
        secondaryImages.forEach(file => {
            formData.append('secondary_images', file);
        });

        formData.append('price', price);
        formData.append('size', size);
        formData.append('quantity', quantity);
        formData.append('material', material);
        formData.append('additional_info', JSON.stringify(additionalInfo.filter(item => item.title || item.description)));
        
        try {
            const { success, message } = await onSave(formData, initialProduct?.id);

            if (success) {
                setStatus('success');
                setStatusMessage(message);

                // Reset form on successful add, but not on edit.
                if (!isEditing) {
                    setProductName('');
                    setProductDescription('');
                    setProductTags(productTags);
                    setPrice('0');
                    setQuantity('1');
                    setSize('');
                    setMaterial('');
                    setAdditionalInfo([{ title: "", description: "" }]);
                    setMainImage(null);
                    setPreviewMainImage(null);
                    setSecondaryImages([]);
                    setPreviewSecondaryImages([]);
                    if (mainImageInputRef.current) mainImageInputRef.current.value = '';
                    if (secondaryImagesInputRef.current) secondaryImagesInputRef.current.value = '';
                }
            } else {
                setStatus('error');
                setStatusMessage(message);
            }
        } catch (error: unknown) {
            console.error('Error in form submission:', error);
            const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
            setStatus('error');
            setStatusMessage(`Error: ${message}`);
        }
    };

    // Construct the virtual product object for the live preview
    const virtualProduct: Product = {
        id: initialProduct?.id || 'preview',
        name: productName || 'Product Name Preview',
        description: productDescription || 'This is where the product description will appear.',
        tags: productTags ? productTags.split(',').map(tag => tag.trim()) : [],
        main_image: previewMainImage || '/placeholder-image.jpg',
        secondary_images: previewSecondaryImages.length > 0 ? previewSecondaryImages : [],
        price: parseFloat(price) || 0,
        size: size || 'N/A',
        quantity: parseInt(quantity) || 0,
        material: material || 'N/A',
        additional_info: additionalInfo.filter(item => item.title || item.description),
        reviews: initialProduct?.reviews || []
    };

    return (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full'>
            {/* Left Column: Form */}
            <div className="container mx-auto p-6 max-w-2xl bg-secondary shadow-xl rounded-lg text-text">
                <h1 className="text-3xl font-bold text-center mb-8">{formTitle}</h1>
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
                            ref={mainImageInputRef} className="file-input file-input-bordered bg-secondary border-2 border-accent w-full" required={!isEditing} />
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
                        {status === 'submitting' ? <FaSpinner className="animate-spin" /> : submitButtonIcon}
                        <span>{status === 'submitting' ? 'Submitting...' : submitButtonText}</span>
                    </button>
                </form>
            </div>
            
            {/* Right Column: Preview */}
            <div className="lg:col-span-2 h-fit w-full bg-secondary p-8 shadow-xl rounded-lg text-text">
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