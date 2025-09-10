// app/api/tags/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/lib/database.types";

// ✅ Initialize Supabase client with typed database
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // ✅ Fetch only tags
    const { data: products, error } = await supabase
      .from("products")
      .select("tags");

    if (error) {
      console.error("❌ Supabase error fetching tags:", error.message);
      return NextResponse.json({ tags: [] }, { status: 500 });
    }

    const tagSet = new Set<string>();

    for (const product of products ?? []) {
      const tags = product.tags as string[] | string | null; // 👈 Explicit cast

      let tagsArray: string[] = [];

      if (Array.isArray(tags)) {
        tagsArray = tags;
      } else if (typeof tags === "string") {
        tagsArray = tags.split(",").map((t) => t.trim());
      }

      for (const tag of tagsArray) {
        if (tag) tagSet.add(tag);
      }
    }

    const uniqueTags = Array.from(tagSet).sort();

    return NextResponse.json({ tags: uniqueTags });
  } catch (err) {
    console.error("❌ Unexpected error in GET /api/tags:", err);
    return NextResponse.json({ tags: [] }, { status: 500 });
  }
}
