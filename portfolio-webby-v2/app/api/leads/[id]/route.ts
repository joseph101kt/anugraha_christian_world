import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import type { Database } from "@/lib/database.types";

// Define the shape of the dynamic route parameters
type RouteParams = {
  id: string;
};

// Define the shape of a Lead from the database
type LeadRow = Database["public"]["Tables"]["leads"]["Row"];
type LeadStatus = NonNullable<LeadRow["status"]>; // "New" | "Contacted" | "Closed"

// DELETE /api/leads/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: RouteParams } // Corrected type signature
) {
  const { id } = params;

  try {
    const { error } = await supabase.from("leads").delete().eq("id", id);

    if (error) {
      console.error("❌ Error deleting lead:", error);
      return NextResponse.json(
        { message: "Internal server error" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Lead deleted successfully" });
  } catch (err) {
    console.error("❌ Unexpected error deleting lead:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/leads/[id] - update lead status
export async function PATCH(
  req: NextRequest,
  { params }: { params: RouteParams } // Corrected type signature
) {
  const { id } = params;

  const body = (await req.json()) as { status?: LeadStatus };
  const { status } = body;

  if (!status) {
    return NextResponse.json(
      { message: "Status is required" },
      { status: 400 }
    );
  }

  // Optional: Validate status against allowed values
  const allowed: LeadStatus[] = ["New", "Contacted", "Closed"];
  if (!allowed.includes(status)) {
    return NextResponse.json(
      { message: `Invalid status: must be one of ${allowed.join(", ")}` },
      { status: 400 }
    );
  }

  try {
    const { data, error } = await supabase
      .from("leads")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("❌ Error updating lead status:", error);
      return NextResponse.json(
        { message: "Internal server error" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json({ message: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Lead status updated successfully",
      lead: data,
    });
  } catch (err) {
    console.error("❌ Unexpected error updating lead:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
