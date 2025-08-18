// api/save-lead

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient'; // Make sure this points to your initialized Supabase client

// Define the structure for a single lead
interface Lead {
  id: string;
  name: string;
  phone: string;
  query: string;
  timestamp: string;
  source_url: string | null;
  status: 'New' | 'Contacted' | 'Closed';
}

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

    const newLead: Omit<Lead, 'id'> = {
      name,
      phone,
      query,
      timestamp: new Date().toISOString(),
      source_url: req.headers.get('referer') || null,
      status: 'New',
    };

    // Insert into Supabase
    const { data, error } = await supabase
      .from('leads')
      .insert([newLead])
      .select(); // Returns the inserted row(s)

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { error: 'Failed to save lead to database' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Lead saved successfully', lead: data?.[0] },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error saving lead:', error);
    return NextResponse.json({ error: 'Failed to save lead.' }, { status: 500 });
  }
}
