'use client';

import React, { useState, useMemo, useEffect } from 'react';
import ProductFilter from "@/components/ProductFilter";
import DeleteProductCard from "./DeleteProductCard";

interface Product {
  id: string;
  name: string;
  description: string;
  tags: string[];
  image_url: string;
}

interface DeleteProductListProps {
  password: string;
}

export default function DeleteProductList({ password }: DeleteProductListProps) {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [showFilterPanel, setShowFilterPanel] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const response = await fetch(`/api/products?password=${encodeURIComponent(password)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setAllProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [password]);

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
    if (window.confirm(`Are you sure you want to delete the product: "${productName}"?`)) {
      try {
        const response = await fetch(`/api/products/${productId}?password=${encodeURIComponent(password)}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          alert('Failed to delete product.');
          return;
        }

        setAllProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
        alert('Product deleted successfully!');
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('An unexpected error occurred.');
      }
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
      {loading ? (
        <p className="text-center">Loading products...</p>
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
            />
          ))}
        </div>
      )}
    </div>
  );
}