// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Define the password and the directory where images will be saved
const ADMIN_PASSWORD = 'your-secure-password'; // Make sure this matches the client-side password
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'products');

// Create the upload directory if it doesn't exist
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const submittedPassword = formData.get('password') as string;

    // The crucial server-side password check
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

    // Save the image to the public folder
    const fileName = `${Date.now()}-${imageFile.name}`;
    const filePath = path.join(UPLOAD_DIR, fileName);
    const buffer = Buffer.from(await imageFile.arrayBuffer());

    await fs.promises.writeFile(filePath, buffer);

    // Construct the URL for the saved image
    const imageUrl = `/products/${fileName}`;

    const newProduct = {
      id: Date.now().toString(),
      name,
      description,
      tags,
      image_url: imageUrl,
    };

    console.log('New product added:', newProduct);

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}