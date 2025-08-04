import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises'; // Using the promises version
import path from 'path';

// Define the password and file paths
const ADMIN_PASSWORD = 'password'; //change the password in app/api/products/id/route.ts, app/api/products/route.ts, app/dashboard/page.tsx
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'products');
const PRODUCTS_JSON_PATH = path.join(process.cwd(), 'data', 'products.json');

// Define a type for the product data to ensure consistency
interface Product {
  id: string;
  name: string;
  description: string;
  tags: string[];
  image_url: string;
}

// Custom type guard to check if an error is a Node.js file system error
function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error;
}

// Async function to ensure a directory exists, safely.
async function ensureDirectoryExists(dirPath: string) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    if (isNodeError(error) && error.code !== 'EEXIST') {
      console.error(`Error creating directory at ${dirPath}:`, error);
      throw error;
    }
  }
}

export async function GET(req: NextRequest) {
  try {
    const fileContents = await fs.readFile(PRODUCTS_JSON_PATH, 'utf-8');
    const products: Product[] = JSON.parse(fileContents);
    return NextResponse.json(products);
  } catch (error) {
    if (isNodeError(error) && error.code === 'ENOENT') {
      return NextResponse.json([]);
    }
    console.error('Error fetching products:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // Ensure the directories exist before proceeding.
  // This is a robust, one-time check when the API route is called.
  await ensureDirectoryExists(UPLOAD_DIR);
  await ensureDirectoryExists(path.dirname(PRODUCTS_JSON_PATH));

  try {
    const formData = await req.formData();
    const submittedPassword = formData.get('password') as string;

    if (submittedPassword !== ADMIN_PASSWORD) {
      return NextResponse.json({ message: 'Unauthorized: Incorrect password' }, { status: 401 });
    }

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const tags = (formData.get('tags') as string)?.split(',').map(tag => tag.trim()) || [];
    const imageFile = formData.get('image') as File;

    if (!name || !description || !imageFile) {
      return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
    }

    // 1. Save the image to the public folder
    const fileName = `${Date.now()}-${imageFile.name}`;
    const filePath = path.join(UPLOAD_DIR, fileName);
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    await fs.writeFile(filePath, buffer);
    const imageUrl = `/products/${fileName}`;

    // 2. Create the new product object
    const newProduct: Product = {
      id: Date.now().toString(),
      name,
      description,
      tags,
      image_url: imageUrl,
    };

    // 3. Read existing products from the JSON file
    let productsData: Product[] = [];
    try {
      const fileContents = await fs.readFile(PRODUCTS_JSON_PATH, 'utf-8');
      productsData = JSON.parse(fileContents);
    } catch (readError) {
      if (isNodeError(readError) && readError.code !== 'ENOENT') {
        console.error('Error reading products.json:', readError);
      }
    }

    // 4. Add the new product to the data
    productsData.push(newProduct);

    // 5. Write the updated data back to the JSON file
    await fs.writeFile(PRODUCTS_JSON_PATH, JSON.stringify(productsData, null, 2), 'utf-8');

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}