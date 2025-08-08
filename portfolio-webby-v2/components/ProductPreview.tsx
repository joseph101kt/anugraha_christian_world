import React from 'react';
import { Product } from '@/lib/types';
import ProductImageGallery from './ProductImageGallery';

interface ProductPreviewProps {
    product: Product;
}

export default function ProductPreview({ product }: ProductPreviewProps) {
    return (
        <div className="w-full bg-secondary rounded-xl shadow-2xl overflow-hidden">
            
            {/* ==== PRIMARY SECTION ==== */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b pb-10 mb-10">
                <ProductImageGallery
                    name={product.name}
                    mainImage={product.main_image}
                    secondaryImages={product.secondary_images}
                />

                <div className="w-full">
                    <h1 className="text-4xl font-extrabold mb-2">{product.name}</h1>
                    <p className="leading-relaxed mb-4">{product.description}</p>

                    {/* Price & Stock */}
                    <div className="mb-4">
                        <p className="text-2xl font-bold text-accent mb-1">
                            ${product.price.toFixed(2)}
                        </p>
                        <p className="text-sm">In Stock: {product.quantity}</p>
                    </div>

                    {/* Tags */}
                    <div className="mt-4 flex flex-wrap gap-2">
                        {product.tags.map((tag) => (
                            <span
                                key={tag}
                                className="bg-accent text-sm font-semibold px-3 py-1 rounded-full"
                            >
                                {tag.charAt(0).toUpperCase() + tag.slice(1)}
                            </span>
                        ))}
                    </div>

                    {/* Material & Size */}
                    <div className="mt-6 space-y-2">
                        <p>
                            <strong className="font-semibold">Material:</strong> {product.material}
                        </p>
                        <p>
                            <strong className="font-semibold">Size:</strong> {product.size}
                        </p>
                    </div>

                    {/* Note: The 'EnquireButton' is a dynamic component specific to the details page, so it's not included in the preview. */}
                </div>
            </div>

            {/* ==== SECONDARY SECTION: Additional Info ==== */}
            {product.additional_info.length > 0 && (
                <div className="mb-16">
                    <h2 className="text-3xl font-bold pb-4 border-b mb-6">Additional Information</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {product.additional_info.map((item, index) => (
                            <div key={index} className="bg-secondary p-4 rounded-lg shadow-sm">
                                <p className="text-sm uppercase tracking-wide font-medium mb-1">{item.title}</p>
                                <p>{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {/* Note: Reviews and Suggested Products are dynamic and not part of the 'add product' form, so they are not included in the preview. */}
        </div>
    );
}