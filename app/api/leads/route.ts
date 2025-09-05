// app/api/leads/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import type { Database } from "@/lib/database.types";

type LeadRow = Database["public"]["Tables"]["leads"]["Row"];
type LeadInsert = Database["public"]["Tables"]["leads"]["Insert"];
type LeadStatus = NonNullable<LeadRow["status"]>;

/**
 * GET /api/leads
 * Returns all leads
 */
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("leads")
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

/**
 * POST /api/leads
 * Insert a new lead
 */
export async function POST(req: NextRequest) {
  const body = (await req.json()) as Partial<LeadInsert>;
  const { name, phone, query, source_url, status } = body;

  if (!name || !phone || !query) {
    return NextResponse.json(
      { message: "Name, phone, and query are required" },
      { status: 400 }
    );
  }

  // Optional: validate status
  const allowed: LeadStatus[] = ["New", "Contacted", "Closed"];
  if (status && !allowed.includes(status as LeadStatus)) {
    return NextResponse.json(
      { message: `Invalid status: must be one of ${allowed.join(", ")}` },
      { status: 400 }
    );
  }

  try {
    const { data, error } = await supabase
      .from("leads")
      .insert([{ name, phone, query, source_url, status }])
      .select()
      .single();

    if (error) {
      console.error("❌ Error inserting lead:", error);
      return NextResponse.json(
        { message: "Failed to insert lead" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Lead created successfully",
      lead: data,
    });
  } catch (err) {
    console.error("❌ Unexpected error in POST /api/leads:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
