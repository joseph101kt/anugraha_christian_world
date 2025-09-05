import { NextResponse, NextRequest } from "next/server";
import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import sharp from "sharp";
import { Product, AdditionalInfoItem } from "@/lib/types";
import {
  getProductsCache,
  setProductsCache,
  invalidateProductsCache,
} from "@/lib/cache";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/lib/database.types";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ✅ GET by slug
export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  let allProducts: Product[];
  const cached = getProductsCache();
  if (cached) {
    allProducts = cached;
  } else {
    try {
      const jsonData = await fs.readFile(
        path.join(process.cwd(), "data/products.json"),
        "utf8"
      );
      allProducts = JSON.parse(jsonData) as Product[];
      setProductsCache(allProducts);
    } catch {
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  }

  const product = allProducts.find((p) => p.id === slug);
  if (!product)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const suggested = allProducts
    .filter(
      (p) => p.id !== product.id && product.tags.some((t) => p.tags.includes(t))
    )
    .slice(0, 4);

  return NextResponse.json({ product, suggested });
}

// ✅ DELETE by slug
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  const filePath = path.join(process.cwd(), "data/products.json");

  try {
    const jsonData = await fs.readFile(filePath, "utf8");
    const products: Product[] = JSON.parse(jsonData);
    const product = products.find((p) => p.id === slug);
    if (!product)
      return NextResponse.json({ message: "Not found" }, { status: 404 });

    const updatedProducts = products.filter((p) => p.id !== slug);
    await fs.writeFile(filePath, JSON.stringify(updatedProducts, null, 2));
    invalidateProductsCache();
    revalidatePath("/products");
    revalidatePath(`/products/${slug}`);

    await supabase.from("products").delete().eq("slug", slug);

    return NextResponse.json({ message: "Deleted successfully" });
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// ✅ PUT by slug
export async function PUT(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  try {
    const formData = await req.formData();
    const filePath = path.join(process.cwd(), "data/products.json");
    const jsonData = await fs.readFile(filePath, "utf8");
    const products: Product[] = JSON.parse(jsonData);
    const index = products.findIndex((p) => p.id === slug);
    if (index === -1)
      return NextResponse.json({ message: "Not found" }, { status: 404 });

    const existing = products[index];

    const updated: Product = {
      ...existing,
      name: (formData.get("name") as string) || existing.name,
      description:
        (formData.get("description") as string) || existing.description,
    };

    products[index] = updated;
    await fs.writeFile(filePath, JSON.stringify(products, null, 2));

    await supabase
    .from("products")
    .update({
      ...updated,
      additional_info: updated.additional_info as unknown as Database["public"]["Tables"]["products"]["Row"]["additional_info"],
      reviews: updated.reviews as unknown as Database["public"]["Tables"]["products"]["Row"]["reviews"],
    })
    .eq("slug", slug);

    invalidateProductsCache();
    revalidatePath("/dashboard");
    revalidatePath("/products");
    revalidatePath(`/products/${slug}`);

    return NextResponse.json({
      message: "Updated successfully",
      product: updated,
    });
  } catch (err) {
    return NextResponse.json(
      { message: "Internal server error", details: (err as Error).message },
      { status: 500 }
    );
  }
}

export const config = { api: { bodyParser: false } };
