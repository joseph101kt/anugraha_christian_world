// migrateProducts.ts
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';
import * as fs from 'fs/promises';
import * as path from 'path';
import { config } from 'dotenv';
config({ path: path.resolve(process.cwd(), '.env.local') });

// Supabase client
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type ProductInsert = Database['public']['Tables']['products']['Insert'];

// Paths
const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'products.json');
const IMAGES_FOLDER_PATH = path.join(process.cwd(), 'public', 'images');

// Upload image to Supabase and return public URL
async function uploadImage(fileName: string, productSlug: string): Promise<string | null> {
  try {
    // Remove any leading / or /images/ from the filename
    const cleanFileName = fileName.replace(/^\/?images\//, '').replace(/^\//, '');
    const filePath = path.join(IMAGES_FOLDER_PATH, cleanFileName);

    const fileBytes = await fs.readFile(filePath);
    const bucketPath = `${productSlug}/${cleanFileName}`;

    const { error } = await supabase.storage
      .from('products')
      .upload(bucketPath, fileBytes, { cacheControl: '3600', upsert: true });

    if (error) throw error;

    const publicUrl = supabase.storage.from('products').getPublicUrl(bucketPath).data.publicUrl;
    return publicUrl;
  } catch (err) {
    console.error(`❌ Failed to upload image ${fileName} for product ${productSlug}:`, err);
    return null;
  }
}

async function migrateProducts() {
  try {
    const fileData = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    const products: Array<Omit<ProductInsert, 'uuid'> & { id: string }> = JSON.parse(fileData);

    for (const prod of products) {
      const {
        id,
        main_image,
        secondary_images,
        reviews,
        additional_info,
        tags,
        ...rest
      } = prod;

      const slug = id;

      // Upload main image
      let mainImageUrl: string | null = null;
      if (main_image) {
        mainImageUrl = await uploadImage(main_image, slug);
      }

      // Upload secondary images
      const secondaryImageUrls: string[] = [];
      if (secondary_images?.length) {
        for (const img of secondary_images) {
          const url = await uploadImage(img, slug);
          if (url) secondaryImageUrls.push(url);
        }
      }

      const transformed: ProductInsert = {
        ...rest,
        slug,
        main_image: mainImageUrl,
        secondary_images: secondaryImageUrls,
        reviews: reviews ?? [],
        additional_info: additional_info ?? [],
        tags: tags ?? [],
      };

      // Upsert product row
      const { error } = await supabase
        .from('products')
        .upsert(transformed, { onConflict: 'slug' });

      if (error) {
        console.error(`❌ Failed to upsert product ${slug}:`, error);
      } else {
        console.log(`✅ Migrated product ${slug} with images`);
      }
    }

    console.log('🎉 All products migrated successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

migrateProducts();
