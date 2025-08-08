import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

type Product = {
    id: string;
    title: string;
    description?: string;
    price?: number;
    tags?: string; // comma-separated
    // Add other fields if needed
};

export async function GET() {
    try {
        const filePath = path.join(process.cwd(), 'data', 'products.json');
        const data = fs.readFileSync(filePath, 'utf-8');
        const products: Product[] = JSON.parse(data);

        const tagSet = new Set<string>();

        for (const product of products) {
            for (const product of products) {
                const tags: string[] = Array.isArray(product.tags) ? product.tags : [];
                tags.forEach(tag => {
                    if (typeof tag === 'string' && tag.trim()) {
                        tagSet.add(tag.trim());
                    }
                });
            }
        }

        const uniqueTags: string[] = Array.from(tagSet).sort();

        return NextResponse.json({ tags: uniqueTags });
    } catch (error) {
        console.error('Error loading tags:', error);
        return NextResponse.json({ tags: [] }, { status: 500 });
    }
}
