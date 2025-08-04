// src/app/products/page.tsx
import fs from 'fs/promises';
import path from 'path';
import ProductListClient from './ProductListClient';

interface Product {
    id: string;
    name: string;
    description: string;
    tags: string[];
    image_url: string;
}

interface ProductsPageProps {
    searchParams: {
        query?: string;
    };
}

/**
 * Renders the main products page, with a list of products.
 * This is a Server Component, so it fetches the data directly on the server.
 * The use of 'searchParams' automatically opts this page into dynamic rendering.
 * @param {ProductsPageProps} props - The component's props.
 */
export default async function ProductsPage({ searchParams }: ProductsPageProps) {
    let products: Product[] = [];

    const filePath = path.join(process.cwd(), 'data', 'products.json');
    
    try {
        const jsonData = await fs.readFile(filePath, 'utf8');
        products = JSON.parse(jsonData);
    } catch (error) {
        console.error('Error reading products.json:', error);
    }

    const searchTerm = searchParams.query || '';

    return (
        <div className="flex flex-col items-center">
            {/* The debugging timestamp has been removed to prevent hydration errors. */}
            
            {/* Pass the fetched products AND the searchTerm to the client component */}
            <ProductListClient products={products} searchTerm={searchTerm} />
        </div>
    );
}
