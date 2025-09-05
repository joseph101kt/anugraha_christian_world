// migrateProducts.ts
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import type { Database } from './lib/database.types';
import * as fs from 'fs/promises';
import * as path from 'path';

// Load .env.local explicitly (optional)
import { config } from 'dotenv';
config({ path: path.resolve(process.cwd(), '.env.local') });

// Initialize Supabase client
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Use the Insert type from your Supabase types
type ProductInsert = Database['public']['Tables']['products']['Insert'];

// Path to your local products.json
const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'products.json');

async function migrateProducts() {
  try {
    const fileData = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    const products: Array<Omit<ProductInsert, 'uuid'> & { id: string }> = JSON.parse(fileData);

    // Transform for Supabase insert/upsert
const transformedProducts: ProductInsert[] = products.map(
  ({ id, ...rest }) => ({
    ...rest,
    slug: id,  // map JSON id to slug
    reviews: rest.reviews ?? [],
    additional_info: rest.additional_info ?? [],
    secondary_images: rest.secondary_images ?? [],
    tags: rest.tags ?? [],
  })
);


    // Upsert into Supabase, using slug as unique key
    const { data, error } = await supabase
      .from('products')
      .upsert(transformedProducts, { onConflict: 'slug' })
      .select();

    if (error) {
      console.error('❌ Supabase upsert error:', error);
      process.exit(1);
    } else {
      console.log(`✅ Successfully migrated ${data?.length ?? 0} products.`);
    }
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

// Run the migration
migrateProducts();
