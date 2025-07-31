import fs from 'fs/promises'; // Use fs/promises for async operations
import path from 'path';
import ProductListClient from './ProductListClient'; // Import the client component

// Define the shape of your product data (must match JSON structure)
interface Product {
  id: string;
  name: string;
  description: string;
  tags: string[];
  image_url: string;
}

// This is a Server Component. Data fetching happens directly here.
export default async function ProductsPage() {
  const filePath = path.join(process.cwd(), 'data', 'products.json');
  let products: Product[] = [];

  try {
    const jsonData = await fs.readFile(filePath, 'utf8');
    products = JSON.parse(jsonData);
  } catch (error) {
    console.error('Error reading products.json:', error);
    // Handle error, e.g., show a message to the user or return empty array
  }

  return (
    // Pass the fetched products to the client component
    <ProductListClient products={products} />
  );
}