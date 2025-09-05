// migrateProducts.ts
import 'dotenv/config'; // <-- loads .env or .env.local automatically
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types'; // Make sure this path is correct
import fs from 'fs/promises';
import path from 'path';

import { config } from 'dotenv';

config({ path: path.resolve(process.cwd(), '.env.local') });

// IMPORTANT: Use the correct Insert type from your database.types.ts
type ProductInsert = Database['public']['Tables']['products']['Insert'];

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'products.json');

async function migrateProducts() {
  try {
    const fileData = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    const products: Array<ProductInsert & { id: string }> = JSON.parse(fileData);

    // This is the updated section.
    // We destructure the 'id' from the product object to prevent it from
    // being passed to the database's UUID column.
    const transformedProducts: ProductInsert[] = products.map(({ id, ...restOfProduct }) => ({
      ...restOfProduct,
      // Map the text ID from your JSON file to the 'slug' column
      slug: id,
      // reviews is a JSONB column, ensure it's a valid JSON array
      reviews: restOfProduct.reviews ?? [],
      // The uuid field is now correctly omitted,
      // allowing the database to use its default value.
    }));

    const { data, error } = await supabase
      .from('products')
      // Corrected upsert to use 'slug' as the unique conflict key
      .upsert(transformedProducts, { onConflict: 'slug' })
      .select();

    if (error) {
      console.error('❌ Supabase upsert error:', error);
    } else {
      console.log(`✅ Successfully migrated ${data?.length ?? 0} products.`);
    }
  } catch (err) {
    console.error('❌ Migration failed:', err);
  }
}

migrateProducts();
