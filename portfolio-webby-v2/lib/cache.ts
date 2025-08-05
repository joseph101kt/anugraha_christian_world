// lib/cache.ts

// Import the shared Product interface
import { Product } from './types';

// The cache variable is now internal to this file
let productsCache: Product[] | null = null;

/**
 * Retrieves the current products cache.
 * @returns {Product[] | null} The cached products or null if the cache is empty.
 */
export function getProductsCache(): Product[] | null {
    return productsCache;
}

/**
 * Sets the products cache to a new list of products.
 * @param {Product[]} products The new list of products to cache.
 */
export function setProductsCache(products: Product[]): void {
    productsCache = products;
    console.log('Product cache has been populated.');
}

/**
 * Resets the products cache to an empty array.
 * This should be called whenever product data is modified.
 */
export function invalidateProductsCache(): void {
    productsCache = null;
    console.log('Product cache has been invalidated.');
}