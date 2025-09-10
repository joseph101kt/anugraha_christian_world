// app/api/save-lead/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import type { Database } from '@/lib/database.types'; // ✅ Supabase types

type LeadRow = Database['public']['Tables']['leads']['Row'];
type LeadInsert = Database['public']['Tables']['leads']['Insert'];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, query } = body;

    if (!name || !phone || !query) {
      return NextResponse.json(
        { error: 'Missing required fields: name, phone, or query' },
        { status: 400 }
      );
    }

    const newLead: LeadInsert = {
      name,
      phone,
      query,
      // ✅ these can be optional in DB, but we set them manually
      timestamp: new Date().toISOString(),
      source_url: req.headers.get('referer'),
      status: 'New',
    };

    // Insert into Supabase
    const { data, error } = await supabase
      .from('leads')
      .insert(newLead)
      .select()
      .single<LeadRow>(); // ✅ returns one row with correct typing

    if (error) {
      console.error('❌ Supabase insert error:', error.message);
      return NextResponse.json(
        { error: 'Failed to save lead to database' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Lead saved successfully', lead: data },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error saving lead:', error);
    return NextResponse.json(
      { error: 'Failed to save lead.' },
      { status: 500 }
    );
  }
}
