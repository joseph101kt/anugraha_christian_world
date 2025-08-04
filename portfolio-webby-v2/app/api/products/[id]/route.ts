import fs from 'fs/promises';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

interface Product {
  id: string;
  name: string;
  description: string;
  tags: string[];
  image_url: string;
}

const ADMIN_PASSWORD = 'password';  //change the password in app/api/products/id/route.ts, app/api/products/route.ts, app/dashboard/page.tsx

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const password = req.nextUrl.searchParams.get('password');

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;
  const filePath = path.join(process.cwd(), 'data', 'products.json');

  try {
    const jsonData = await fs.readFile(filePath, 'utf8');
    const products: Product[] = JSON.parse(jsonData);

    const productIndex = products.findIndex((p: Product) => p.id === id);

    if (productIndex === -1) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    products.splice(productIndex, 1);

    await fs.writeFile(filePath, JSON.stringify(products, null, 2));

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}