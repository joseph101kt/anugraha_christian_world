interface Product {
    id: string;
    name: string;
    description: string;
    image_url: string;
    tags: string[];
}

// A simple in-memory cache for the entire list of products.
// It is initialized as an empty array and will be populated on the first read.
export let productsCache: Product[] = [];

/**
 * Resets the products cache to an empty array.
 * This should be called whenever product data is modified (e.g., added, deleted, or updated).
 */
export function invalidateProductsCache() {
    productsCache = [];
    console.log('Product cache has been invalidated.');
}
