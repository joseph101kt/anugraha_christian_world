// lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

// 🔑 Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ✅ Strongly typed Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
