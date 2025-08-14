// app/products/[productId]/page.tsx

import React, { Suspense } from 'react';
import { Metadata } from 'next';
import fs from 'fs/promises';
import path from 'path';

import ProductDetails from '@/components/ProductDetails';
import { Product } from '@/lib/types';

// ✅ Updated to use Promise type for params
interface ProductPageProps {
  params: Promise<{
    productId: string;
  }>;
}

async function getProductMeta(productId: string): Promise<Product | undefined> {
  const filePath = path.join(process.cwd(), 'data', 'products.json');
  try {
    const jsonData = await fs.readFile(filePath, 'utf8');
    const allProducts: Product[] = JSON.parse(jsonData);
    return allProducts.find(p => p.id === productId);
  } catch {
    return undefined;
  }
}

// ✅ Also updated here to await params
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata | undefined> {
  const { productId } = await params;
  const product = await getProductMeta(productId);

  if (!product) {
    return {
      title: 'Product Not Found',
      description: 'The requested product could not be found.',
    };
  }

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [{ url: product.main_image, width: 800, height: 600, alt: product.name }],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { productId } = await params;

  return (
    <Suspense>
    <div className="h-full p-2 lg:p-8">
      <ProductDetails productId={productId} />
    </div>
    </Suspense>
  );
}
