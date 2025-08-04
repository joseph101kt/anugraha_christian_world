// app/dashboard/components/AddProductForm.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';

// This component now takes the password as a prop from the parent
interface AddProductFormProps {
  password: string;
}

export default function AddProductForm({ password }: AddProductFormProps) {
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productTags, setProductTags] = useState('');
  const [productImage, setProductImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProductImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName || !productDescription || !productImage) {
      alert('Please fill out all required fields.');
      return;
    }

    const formData = new FormData();
    // Re-introducing the password to send to the API route
    formData.append('password', password);
    formData.append('name', productName);
    formData.append('description', productDescription);
    formData.append('tags', productTags);
    if (productImage) {
      formData.append('image', productImage);
    }

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        alert('Failed to add product. Check password or server logs.');
        return;
      }

      // The 'result' variable is no longer needed, so we'll remove it.
      alert('Product added successfully!');
      // Reset form
      setProductName('');
      setProductDescription('');
      setProductTags('');
      setProductImage(null);
      setPreviewImage(null);
    } catch (error) {
      console.error('Error adding product:', error);
      alert('An unexpected error occurred.');
    }
  };

  // Render the product form
  return (
    <div className="container mx-auto p-8 max-w-2xl bg-secondary shadow-xl rounded-lg">
      <h1 className="text-3xl font-bold text-center mb-8">Add New Product</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block bg-secondary text-sm font-medium text-text mb-1">Product Name</label>
          <input
            type="text"
            id="name"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="input input-bordered bg-secondary border-2 border-accent text-text w-full"
            required
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-text mb-1">Description</label>
          <textarea
            id="description"
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
            className="textarea textarea-bordered bg-secondary border-2 border-accent text-text w-full"
            rows={4}
            required
          ></textarea>
        </div>
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-text mb-1">Tags (comma-separated)</label>
          <input
            type="text"
            id="tags"
            value={productTags}
            onChange={(e) => setProductTags(e.target.value)}
            className="input input-bordered bg-secondary border-2 border-accent text-text w-full"
          />
        </div>
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-text mb-1">Product Image</label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleImageChange}
            className="file-input file-input-bordered bg-secondary border-2 border-accent text-text w-full"
            required
          />
          {previewImage && (
            <div className="mt-4 w-48 h-48 relative overflow-hidden rounded-lg">
              <Image src={previewImage} alt="Product Preview" fill style={{ objectFit: 'cover' }} />
            </div>
          )}
        </div>
        <button type="submit" className="btn btn-primary w-full">
          Add Product
        </button>
      </form>
    </div>
  );
}