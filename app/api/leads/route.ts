// app/api/leads/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

/**
 * GET /api/leads
 * Returns all leads from Supabase (Postgres)
 */
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("leads") // type inferred automatically from Database
      .select("*")
      .order("timestamp", { ascending: false });

    if (error) {
      console.error("❌ Supabase query error:", error.message);
      return NextResponse.json(
        { message: "Failed to fetch leads" },
        { status: 500 }
      );
    }

    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error("❌ Unexpected error in GET /api/leads:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
