// app/dashboard/add-product/page.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';

// Replace 'your-secure-password' with a strong, secret password
const ADMIN_PASSWORD = 'password';//Change the password in app/api/route.tsx

export default function AddProductPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productTags, setProductTags] = useState('');
  const [productImage, setProductImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password. Access denied.');
      setPassword('');
    }
  };

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
	// -----------------------------------------------------------
	// This is the crucial line that was missing in your code block
	// It sends the password to the API for the server-side check.
	// -----------------------------------------------------------
	formData.append('password', password);
	formData.append('name', productName);
	formData.append('description', productDescription);
	formData.append('tags', productTags);
	if (productImage) {
			formData.append('image', productImage);
	}

	try {
			// Send the request to the API
			const response = await fetch('/api/products', {
			method: 'POST',
			body: formData,
			});

			if (!response.ok) {
			// Check for a specific 401 Unauthorized error from the API
			if (response.status === 401) {
					alert('Incorrect password or unauthorized access. Please re-authenticate.');
			} else {
					alert('Failed to add product.');
			}
			return;
			}

			const result = await response.json();
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

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-screen bg-base-200">
        <div className="card w-96 bg-base-100 shadow-xl p-8">
          <h2 className="text-2xl font-bold text-center mb-4">Staff Login</h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input input-bordered w-full"
            />
            <button type="submit" className="btn btn-primary w-full">
              Access
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Render the product form if authenticated
  return (
    <div className="container mx-auto p-8 max-w-2xl bg-base-100 shadow-xl rounded-lg">
      <h1 className="text-3xl font-bold text-center mb-8">Add New Product</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-base-content mb-1">Product Name</label>
          <input
            type="text"
            id="name"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="input input-bordered w-full"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-base-content mb-1">Description</label>
          <textarea
            id="description"
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
            className="textarea textarea-bordered w-full"
            rows={4}
            required
          ></textarea>
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-base-content mb-1">Tags (comma-separated)</label>
          <input
            type="text"
            id="tags"
            value={productTags}
            onChange={(e) => setProductTags(e.target.value)}
            className="input input-bordered w-full"
          />
        </div>

        <div>
          <label htmlFor="image" className="block text-sm font-medium text-base-content mb-1">Product Image</label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleImageChange}
            className="file-input file-input-bordered w-full"
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