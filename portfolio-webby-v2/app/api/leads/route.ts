// app/api/leads/route.ts
import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

// 🔖 Lead type definition
interface Lead {
  id: string;
  name: string;
  phone: string;
  query: string;
  timestamp: string; // ISO timestamp string
  source_url: string | null;
  status: "New" | "Contacted" | "Closed";
}

// Absolute path to leads.json
const DATA_FILE_PATH = path.join(process.cwd(), "data", "leads.json");

/**
 * GET /api/leads
 * Returns all leads stored in data/leads.json
 */
export async function GET() {
  try {
    // 📂 Try reading the leads file
    const fileData = await fs.readFile(DATA_FILE_PATH, "utf8");

    // 📝 Parse into array of Lead objects
    const leads: Lead[] = JSON.parse(fileData);

    return NextResponse.json(leads);
  } catch (error: unknown) {
    // 🔍 Handle missing file separately
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: string }).code === "ENOENT"
    ) {
      console.warn("⚠️ leads.json not found. Returning empty array.");
      return NextResponse.json([]); // no file → no leads
    }

    // 🚨 Catch-all for unexpected errors
    console.error("❌ Error reading leads data:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
