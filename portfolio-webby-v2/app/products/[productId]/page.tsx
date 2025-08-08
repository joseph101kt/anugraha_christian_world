// app/products/[productId]/page.tsx

import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import fs from 'fs/promises';
import path from 'path';

import ProductDetails from '@/components/ProductDetails';
import { Product } from '@/lib/types';

interface ProductPageProps {
  params: {
    productId: string;
  };
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

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata | undefined> {
  const product = await getProductMeta(params.productId);
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

// ✅ Make it async and destructure inside
export default async function ProductPage({ params }: ProductPageProps) {
  const { productId } = params;

  return (
    <div className="h-full p-2 lg:p-8">
      <ProductDetails productId={productId} />
    </div>
  );
}
