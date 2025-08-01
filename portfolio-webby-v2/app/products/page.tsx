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

// Define the props for the Server Component, which will receive searchParams
interface ProductsPageProps {
  searchParams: {
    query?: string;
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const filePath = path.join(process.cwd(), 'data', 'products.json');
  let products: Product[] = [];

  try {
    const jsonData = await fs.readFile(filePath, 'utf8');
    products = JSON.parse(jsonData);
  } catch (error) {
    console.error('Error reading products.json:', error);
  }

  // Extract the query from searchParams
  const searchTerm = searchParams.query || '';

  return (
    // Pass the fetched products AND the searchTerm to the client component
    <ProductListClient products={products} searchTerm={searchTerm} />
  );
}