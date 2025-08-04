import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

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
      return NextResponse.json({ error: 'Missing required fields: name, phone, or query' }, { status: 400 });
    }

    // UPDATED: Define the new path to the leads.json file
    const filePath = path.join(process.cwd(), 'data', 'leads.json');

    const fileContents = await fs.readFile(filePath, 'utf-8');
    const leads: Lead[] = JSON.parse(fileContents);

    const newLead: Lead = {
      id: crypto.randomUUID(),
      name,
      phone,
      query,
      timestamp: new Date().toISOString(),
      source_url: req.headers.get('Referer'),
      status: 'New',
    };

    leads.push(newLead);

    await fs.writeFile(filePath, JSON.stringify(leads, null, 2));

    return NextResponse.json({ message: 'Lead saved successfully', lead: newLead }, { status: 200 });

  } catch (error) {
    console.error('Error saving lead:', error);
    return NextResponse.json({ error: 'Failed to save lead.' }, { status: 500 });
  }
}