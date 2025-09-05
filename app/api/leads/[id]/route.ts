// app/api/leads/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient"; // ✅ server-side Supabase client
import type { Database } from "@/lib/database.types";

type LeadRow = Database["public"]["Tables"]["leads"]["Row"];

// DELETE /api/leads/[id]
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const { error } = await supabase.from("leads").delete().eq("id", id);

    if (error) {
      console.error("❌ Error deleting lead:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }

    return NextResponse.json({ message: "Lead deleted successfully" });
  } catch (err) {
    console.error("❌ Unexpected error deleting lead:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}


// PATCH /api/leads/[id] - update lead status
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const { status } = (await req.json()) as { status?: LeadRow["status"] };
  if (!status) {
    return NextResponse.json({ message: "Status is required" }, { status: 400 });
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
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
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
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
