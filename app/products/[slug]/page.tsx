import { Metadata } from "next";
import ProductDetails from "@/components/ProductDetails";
import { Product, AdditionalInfoItem, Review } from "@/lib/types";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/lib/database.types";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ProductPageProps {
  params: {
    slug: string;
  };
}

// Parse reviews safely
function parseReviews(data: unknown): Review[] {
  if (!Array.isArray(data)) return [];
  return data
    .filter((r): r is Review => typeof r === "object" && r !== null && "customer_name" in r && "rating" in r && "comment" in r)
    .map(r => ({
      customer_name: (r as Review).customer_name ?? "",
      rating: (r as Review).rating ?? 0,
      comment: (r as Review).comment ?? "",
    }));
}

// Parse additional info safely
function parseAdditionalInfo(data: unknown): AdditionalInfoItem[] {
  if (!Array.isArray(data)) return [];
  return data
    .filter((ai): ai is AdditionalInfoItem => typeof ai === "object" && ai !== null && "title" in ai && "description" in ai)
    .map(ai => ({
      title: (ai as AdditionalInfoItem).title ?? "",
      description: (ai as AdditionalInfoItem).description ?? "",
    }));
}

// Map row to Product
function mapRowToProduct(row: Database["public"]["Tables"]["products"]["Row"]): Product {
  return {
    id: row.uuid,
    uuid: row.uuid,
    name: row.name,
    description: row.description ?? "",
    main_image: row.main_image ?? "",
    secondary_images: row.secondary_images ?? [],
    size: row.size ?? "",
    quantity: row.quantity ?? 0,
    price: Number(row.price),
    material: row.material ?? "",
    category: row.category ?? "",
    tags: row.tags ?? [],
    reviews: parseReviews(row.reviews),
    additional_info: parseAdditionalInfo(row.additional_info),
    slug: row.slug ?? "",
  };
}

// Fetch product by slug
async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) return null;

  return mapRowToProduct(data); 
}

// Generate metadata
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await getProductBySlug(resolvedParams.slug);
  if (!product) {
    return {
      title: "Product Not Found",
      description: "The requested product could not be found.",
    };
  }
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [
        { url: product.main_image, width: 800, height: 600, alt: product.name },
      ],
    },
  };
}

// Page
export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const product = await getProductBySlug(resolvedParams.slug);

  if (!product) {
    return <div className="text-center py-10">Product not found.</div>;
  }

  // Pass the full product to client component
  return (
    <div className="h-full p-2 lg:p-8">
      <ProductDetails product={product} suggested={[]} />
    </div>
  );
}
