'use client';

import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';

interface Product {
  id: string;
  name: string;
  description: string;
  tags: string[];
  image_url: string;
}

interface ProductListClientProps {
  products: Product[];
}

export default function ProductListClient({ products }: ProductListClientProps) {
  // State for the visible product list
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  
  // State for the tags selected inside the filter panel, now used for live filtering
  const [activeTags, setActiveTags] = useState<string[]>([]);
  
  // State to control the visibility of the filter panel
  const [showFilterPanel, setShowFilterPanel] = useState<boolean>(false);

  const allTags = Array.from(new Set(products.flatMap(product => product.tags)));

  // This useEffect hook runs whenever the activeTags state changes.
  // This is where the "live" filtering logic is now handled.
  useEffect(() => {
    if (activeTags.length === 0) {
      setFilteredProducts(products); // If no tags are active, show all products
    } else {
      const newFiltered = products.filter(product => 
        activeTags.some(tag => product.tags.includes(tag))
      );
      setFilteredProducts(newFiltered); // Show products that match ANY of the active tags
    }
  }, [activeTags, products]);

  const handleOpenFilters = () => {
    setShowFilterPanel(true);
  };

  const handleTagClickInPanel = (tag: string) => {
    // Toggle the tag in the activeTags array for live filtering and highlighting
    setActiveTags(prevTags => 
      prevTags.includes(tag)
        ? prevTags.filter(t => t !== tag) // If tag is active, remove it
        : [...prevTags, tag] // If tag is not active, add it
    );
  };
  
  const handleAllProductsClickInPanel = () => {
    setActiveTags([]); // Clear all selections
  };

  const handleApplyFilters = () => {
    // Since filtering is live, this button's only job is to hide the panel.
    setShowFilterPanel(false);  
  };

  const handleEnquireClick = (productName: string) => {
    alert(`Enquiring about: ${productName}. You would typically open a contact form or navigate to a contact page here.`);
  };

  return (
    <div className="product-list-container">
      <h1 style={{ textAlign: 'center', marginBottom: '40px', fontSize: '2.5em', color: '#333' }}>Our Products</h1>

      {/* Button to open the filter panel, aligned left */}
      <div style={{ textAlign: 'left', marginBottom: '15px' }}>
        <button
          onClick={handleOpenFilters}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            fontSize: '1em',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#218838')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#28a745')}
        >
          {activeTags.length > 0 ? `Filters (${activeTags.length})` : 'Filter'}
        </button>
      </div>

      {/* The inline, conditionally rendered filter panel */}
      {showFilterPanel && (
        <div style={{ 
          marginBottom: '30px', 
          padding: '20px', 
          border: '1px solid #ddd', 
          borderRadius: '8px', 
          backgroundColor: '#f9f9f9',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        }}>
          <h3 style={{ marginTop: '0', marginBottom: '15px', color: '#555' }}>
            Choose Filters
          </h3>

          {/* All Products and Tag buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            <button
              onClick={handleAllProductsClickInPanel}
              style={{
                padding: '10px 15px',
                border: `1px solid ${activeTags.length === 0 ? '#0070f3' : '#ccc'}`,
                borderRadius: '5px',
                cursor: 'pointer',
                backgroundColor: activeTags.length === 0 ? '#e0f2ff' : '#fff',
                color: activeTags.length === 0 ? '#0070f3' : '#333',
                fontWeight: activeTags.length === 0 ? 'bold' : 'normal',
                transition: 'all 0.2s ease-in-out',
              }}
            >
              All Products
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => handleTagClickInPanel(tag)}
                style={{
                  padding: '10px 15px',
                  border: `1px solid ${activeTags.includes(tag) ? '#0070f3' : '#ccc'}`,
                  borderRadius: '5px',
                  cursor: 'pointer',
                  backgroundColor: activeTags.includes(tag) ? '#e0f2ff' : '#fff',
                  color: activeTags.includes(tag) ? '#0070f3' : '#333',
                  fontWeight: activeTags.includes(tag) ? 'bold' : 'normal',
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                {tag.charAt(0).toUpperCase() + tag.slice(1).replace(/-/g, ' ')}
              </button>
            ))}
          </div>

          {/* Apply and Cancel buttons */}
          <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              onClick={handleApplyFilters}
              style={{
                backgroundColor: '#0070f3',
                color: '#fff',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '5px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'background-color 0.3s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#005bb5')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0070f3')}
            >
              Apply Filters
            </button>
            <button
              onClick={() => setShowFilterPanel(false)}
              style={{
                backgroundColor: '#f0f0f0',
                color: '#333',
                padding: '10px 20px',
                border: '1px solid #ccc',
                borderRadius: '5px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'background-color 0.3s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e0e0e0')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Product Grid */}
      <div className="product-grid">
        {filteredProducts.length === 0 ? (
          <p style={{ gridColumn: '1 / -1', textAlign: 'center', fontSize: '1.2em', color: '#666' }}>No products found for the selected filter.</p>
        ) : (
          filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEnquire={handleEnquireClick}
            />
          ))
        )}
      </div>
      
      {/* Add styled-jsx for mobile responsiveness */}
      <style jsx>{`
        .product-list-container {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 30px;
        }

        @media (max-width: 768px) {
          .product-grid {
            grid-template-columns: 1fr; /* Stack cards on mobile */
            gap: 20px;
          }
        }
      `}</style>
    </div>
  );
}