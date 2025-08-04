import fs from 'fs/promises';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

interface Lead {
  id: string;
  name: string;
  phone: string;
  query: string;
  timestamp: string;
  source_url: string | null;
  status: 'New' | 'Contacted' | 'Closed';
}

const ADMIN_PASSWORD = 'password';

export async function GET(req: NextRequest) {
  const password = req.nextUrl.searchParams.get('password');
  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const filePath = path.join(process.cwd(), 'data', 'leads.json');

  try {
    const jsonData = await fs.readFile(filePath, 'utf8');
    const leads: Lead[] = JSON.parse(jsonData);
    return NextResponse.json(leads);
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      console.log('leads.json file not found. Returning an empty array.');
      return NextResponse.json([]);
    }
    console.error('Error reading leads data:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}