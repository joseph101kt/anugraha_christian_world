// utils/products.ts
import { Product } from '@/lib/types';

export const ITEMS_PER_PAGE = 20;

/**
 * Fetch all products from API
 */
export async function fetchProducts(): Promise<Product[]> {
    const response = await fetch('/api/products');
    if (!response.ok) {
        throw new Error('Failed to fetch products');
    }

    const data = await response.json();

    // Ensure data is always an array
    if (Array.isArray(data)) return data;
    if ('products' in data && Array.isArray(data.products)) return data.products;

    console.warn('[fetchProducts] API returned non-array data:', data);
    return [];
}

/**
 * Build category -> tags mapping
 */
export interface CategoryWithTags {
    category: string;
    tags: string[];
}

export function buildCategoryTagArray(products: Product[]): CategoryWithTags[] {
    if (!Array.isArray(products)) return [];

    const map: Record<string, Set<string>> = {};

    products.forEach(product => {
        const category = product.category ?? 'Others';
        if (!map[category]) map[category] = new Set();

        if (Array.isArray(product.tags)) {
            product.tags.forEach(tag => {
                if (tag) map[category].add(tag);
            });
        }
    });

    return Object.entries(map).map(([category, tagsSet]) => ({
        category,
        tags: Array.from(tagsSet),
    }));
}

/**
 * Filter and score products based on search query and active tags
 */
export function filterAndScoreProducts(
    products: Product[],
    query: string,
    activeTags: string[]
): Product[] {
    if (!Array.isArray(products) || products.length === 0) return [];

    const normalizedQuery = query.toLowerCase().replace(/-/g, ' ');
    const searchWords = normalizedQuery.split(/\s+/).filter(Boolean);
    const tagsLower = activeTags.map(t => t.toLowerCase());

    if (searchWords.length === 0 && tagsLower.length === 0) return products;

    return products
        .map(product => {
            let score = 0;
            const name = product.name?.toLowerCase() ?? '';
            const description = product.description?.toLowerCase() ?? '';
            const material = (product.material ?? '').toLowerCase();
            const tags = Array.isArray(product.tags) ? product.tags.map(t => t.toLowerCase()) : [];

            // Search term scoring
            for (const word of searchWords) {
                if (name.includes(word)) score += 3;
                if (description.includes(word)) score += 2;
                if (material.includes(word)) score += 2;
                if (tags.some(tag => tag.includes(word))) score += 1;
            }

            // Tag matching scoring
            const matchingTagsCount = tagsLower.filter(tag => tags.includes(tag)).length;
            score += matchingTagsCount * 5;

            return { product, score };
        })
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .map(({ product }) => product);
}
