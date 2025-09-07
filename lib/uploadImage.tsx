import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ------------------ IMAGE UPLOAD WITH SHARP ------------------
export async function uploadImage(file: File, productSlug: string): Promise<string | null> {
  try {
    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Resize + convert to WebP
    const optimizedBuffer = await sharp(Buffer.from(arrayBuffer))
      .resize({
        width: 1024,   // max width
        height: 1024,  // max height
        fit: "inside", // keep aspect ratio
      })
      .webp({ quality: 60 })
      .toBuffer();

    // Unique path in storage
    const bucketPath = `${productSlug}/${Date.now()}-${file.name}.webp`;

    // Upload to Supabase
    const { error } = await supabase.storage
      .from("products")
      .upload(bucketPath, optimizedBuffer, { cacheControl: "3600", upsert: true });

    if (error) throw error;

    // Return public URL
    const publicUrl = supabase.storage.from("products").getPublicUrl(bucketPath).data.publicUrl;
    return publicUrl || null;
  } catch (err) {
    console.error(`❌ Failed to upload image ${file.name} for product ${productSlug}:`, err);
    return null;
  }
}
