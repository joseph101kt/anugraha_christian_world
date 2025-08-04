import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid'; // Don't forget to run 'npm install uuid'

// Import your custom cache functions
import { productsCache, invalidateProductsCache } from '@/lib/cache';

// Define the interface for a Product, matching the schema of your JSON file.
// The `price` field has been removed as it is not present in your data.
interface Product {
    id: string;
    name: string;
    description: string;
    image_url: string;
    tags: string[];
}

// Ensure you have a secure way to manage this password, e.g., environment variables.
const ADMIN_PASSWORD = 'password';

/**
 * Handles GET requests to retrieve the list of all products.
 * Uses a server-side cache for performance. This is the endpoint that
 * client components (like the DeleteProductList) should fetch from
 * to get the current list of products.
 */
export async function GET() {
    let allProducts: Product[];

    // Check if the product list is already in the cache
    if (productsCache.length > 0) {
        console.log('API GET request: Using cached product list');
        allProducts = productsCache;
    } else {
        // If no cache, read from the file system and populate the cache
        console.log('API GET request: Cache miss. Reading products.json');
        try {
            const filePath = path.join(process.cwd(), 'data', 'products.json');
            const jsonData = await fs.readFile(filePath, 'utf8');
            allProducts = JSON.parse(jsonData);
            // Populate the cache
            productsCache.push(...allProducts);
        } catch (error) {
            console.error('Error fetching product data:', error);
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        }
    }

    return NextResponse.json(allProducts);
}

/**
 * Handles POST requests to add a new product.
 * Requires a password for authorization and invalidates the cache after a successful add.
 * This function is updated to correctly handle multipart/form-data, including file uploads.
 */
export async function POST(req: Request) {
    try {
        // Correctly parse multipart/form-data
        const formData = await req.formData();
        const password = formData.get('password');
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const tagsString = formData.get('tags') as string;
        const imageFile = formData.get('image') as File;

        if (password !== ADMIN_PASSWORD) {
            console.error('POST request failed: Incorrect password');
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        if (!name || !description || !imageFile) {
            console.error('POST request failed: Missing required fields');
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        // --- NEW CODE ADDED: Ensure public/images directory exists ---
        const publicImagesPath = path.join(process.cwd(), 'public', 'images');
        await fs.mkdir(publicImagesPath, { recursive: true }); // `recursive: true` prevents an error if the directory already exists
        // --- END OF NEW CODE ---

        // Handle image upload
        const imageFileName = `${uuidv4()}-${imageFile.name}`;
        const imagePath = path.join(publicImagesPath, imageFileName);
        const image_url = `/images/${imageFileName}`;
        
        const fileBuffer = Buffer.from(await imageFile.arrayBuffer());
        await fs.writeFile(imagePath, fileBuffer);

        // Process tags
        const tags = tagsString ? tagsString.split(',').map(tag => tag.trim().toLowerCase()) : [];

        // Read and update the products JSON file
        const filePath = path.join(process.cwd(), 'data', 'products.json');
        const jsonData = await fs.readFile(filePath, 'utf8');
        const products: Product[] = JSON.parse(jsonData);

        const newProduct = {
            id: uuidv4(),
            name,
            description,
            image_url,
            tags,
        };

        products.push(newProduct);

        await fs.writeFile(filePath, JSON.stringify(products, null, 2));

        // Invalidate the in-memory cache and revalidate the Next.js path
        invalidateProductsCache();
        revalidatePath('/products');

        return NextResponse.json({ message: 'Product added successfully!', product: newProduct });
    } catch (error) {
        console.error('Error adding product:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
