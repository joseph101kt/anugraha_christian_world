// app/api/leads/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import type { Database } from "@/lib/database.types";

type LeadRow = Database["public"]["Tables"]["leads"]["Row"];
type LeadStatus = NonNullable<LeadRow["status"]>; // "New" | "Contacted" | "Closed"

// Params shape
type Params = { id: string };

// Runtime type guard
function isParams(params: unknown): params is Params {
  return (
    typeof params === "object" &&
    params !== null &&
    "id" in params &&
    typeof (params as Record<string, unknown>).id === "string"
  );
}

// DELETE /api/leads/[id]
export async function DELETE(
  _req: NextRequest,
  context: { params: unknown }
) {
  if (!isParams(context.params)) {
    return NextResponse.json({ message: "Invalid params" }, { status: 400 });
  }

  const { id } = context.params;

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
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/leads/[id] - update lead status
export async function PATCH(
  req: NextRequest,
  context: { params: unknown }
) {
  if (!isParams(context.params)) {
    return NextResponse.json({ message: "Invalid params" }, { status: 400 });
  }

  const { id } = context.params;
  const body = (await req.json()) as { status?: LeadStatus };
  const { status } = body;

  if (!status) {
    return NextResponse.json(
      { message: "Status is required" },
      { status: 400 }
    );
  }

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
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
